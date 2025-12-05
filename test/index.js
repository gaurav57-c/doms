// File: functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// Rate limit: max 5 friend requests per hour
exports.rateLimitFriendRequests = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');

  const userId = context.auth.uid;
  const oneHourAgo = new Date(Date.now() - 3600000);

  const recentRequests = await db.collection('users').doc(userId)
    .collection('sentRequests')
    .where('timestamp', '>', oneHourAgo)
    .get();

  if (recentRequests.size >= 5) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit: max 5 requests per hour');
  }

  return { allowed: true };
});

// Rate limit: max 3 matches created per hour
exports.rateLimitMatchCreation = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');

  const userId = context.auth.uid;
  const oneHourAgo = new Date(Date.now() - 3600000);

  const recentMatches = await db.collection('rooms')
    .where('creatorId', '==', userId)
    .where('createdAt', '>', oneHourAgo)
    .get();

  if (recentMatches.size >= 3) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit: max 3 matches per hour');
  }

  return { allowed: true };
});

// Flag suspicious accounts (too many wins, instant leaves, same IP, etc.)
exports.detectCheating = functions.firestore
  .document('matches/{matchId}')
  .onWrite(async (change, context) => {
    const match = change.after.data();
    if (!match || match.status !== 'completed') return;

    const creatorId = match.creatorId;
    const opponentId = match.opponentId;

    // Check creator's win rate
    const creatorMatches = await db.collection('matches')
      .where('creatorId', '==', creatorId)
      .where('status', '==', 'completed')
      .limit(10)
      .get();

    const creatorWins = creatorMatches.docs.filter(d => d.data().result === 'win').length;
    const creatorWinRate = creatorWins / Math.max(creatorMatches.size, 1);

    // Flag if > 95% win rate (suspicious)
    if (creatorWinRate > 0.95 && creatorMatches.size > 5) {
      await db.collection('users').doc(creatorId).update({
        cheatFlag: true,
        cheatReason: 'Unusual win rate',
        lastFlagged: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Check for instant leaves (forfeits)
    const creatorForfeit = creatorMatches.docs.filter(d => d.data().forfeitedBy === creatorId).length;
    if (creatorForfeit > 5) {
      await db.collection('users').doc(creatorId).update({
        cheatFlag: true,
        cheatReason: 'Multiple forfeits',
        lastFlagged: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

// Notify when a match is found
exports.notifyMatchFound = functions.firestore
  .document('rooms/{roomId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // When opponent joins
    if (!before.opponent && after.opponent) {
      const opponentId = after.opponent.id;
      const opponentDoc = await db.collection('users').doc(opponentId).get();
      const fcmToken = opponentDoc.data().fcmToken;

      if (fcmToken) {
        await admin.messaging().send({
          token: fcmToken,
          notification: {
            title: '⚔️ Match Found!',
            body: `${after.creatorName} accepted your challenge!`
          }
        });
      }
    }
  });