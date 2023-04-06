import { randomUUID } from 'crypto';

import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import { https } from 'firebase-functions';

import { auth, db } from '../instances';

const NONCE_MESSAGE = 'Please sign for TheCreator account authentication.';

const toSignMessage = (nonce: string) => `${NONCE_MESSAGE}\n${nonce}`;

export const getNonceToSign = https.onCall(async (data, context) => {
  context.app?.token;
  try {
    const address = data.address;

    if (!address) {
      throw new https.HttpsError('invalid-argument', 'Need address field');
    }
    // Get the user document for that address
    const userDoc: FirebaseFirestore.DocumentSnapshot = await db
      .collection('users')
      .doc(address)
      .get();

    const existingNonce = userDoc.get('nonce');

    if (userDoc.exists && existingNonce) {
      // The user document exists already, so just return the nonce
      return { nonce: toSignMessage(existingNonce) };
    } else {
      // The user document does not exist, create it first
      // Create an Auth user
      const user = await auth
        .getUser(address)
        .then((u) => u)
        .catch(() =>
          auth.createUser({
            uid: address,
          })
        );

      const nonce = randomUUID();

      // Associate the nonce with that user
      await db.collection('users').doc(user.uid).set({
        nonce,
      });

      return { nonce: toSignMessage(nonce) };
    }
  } catch (err) {
    console.log(err);
    throw new https.HttpsError('internal', 'Internal server error');
  }
});

export const verifySignedMessage = https.onCall(async (data) => {
  try {
    if (!data.address || !data.signature) {
      throw new https.HttpsError(
        'invalid-argument',
        'Need address and signature field'
      );
    }
    const address = data.address;
    const sig = data.signature;

    // Get the nonce for this address
    const userDocRef = db.collection('users').doc(address);
    const userDoc = await userDocRef.get();

    const existingNonce = userDoc.get('nonce');

    if (userDoc.exists && existingNonce) {
      const toSign = toSignMessage(existingNonce);
      // Recover the address of the account
      // used to create the given Ethereum signature.
      const recoveredAddress = recoverPersonalSignature({
        data: `0x${toHex(toSign)}`,
        signature: sig,
      });
      // See if that matches the address
      // the user is claiming the signature is from
      if (recoveredAddress === address) {
        // The signature was verified - update the nonce to prevent replay attacks
        // update nonce
        await userDocRef.update({
          nonce: randomUUID(),
        });
        // Create a custom token for the specified address
        const firebaseToken = await auth.createCustomToken(address);
        // Return the token
        return { token: firebaseToken };
      } else {
        // The signature could not be verified
        throw new https.HttpsError(
          'permission-denied',
          'The signature could not be verified'
        );
      }
    } else {
      console.log('user doc does not exist');
      throw new https.HttpsError('internal', 'User document does not exist');
    }
  } catch (err) {
    console.log(err);
    throw new https.HttpsError('internal', 'InternalServer Error');
  }
});

const toHex = (stringToConvert: string) =>
  stringToConvert
    .split('')
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
