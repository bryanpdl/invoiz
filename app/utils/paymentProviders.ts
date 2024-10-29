import { db } from '../firebase/config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export async function connectStripe(userId: string) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    stripeConnected: true,
    paypalEmail: null // Ensure PayPal is disconnected when connecting Stripe
  });
}

export async function connectPayPal(userId: string, paypalEmail: string) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    paypalEmail: paypalEmail,
    stripeAccountId: null // Ensure Stripe is disconnected when connecting PayPal
  });
}

export async function disconnectPaymentProvider(userId: string) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    stripeAccountId: null,
    paypalEmail: null
  });
}

export async function getConnectedPaymentProvider(userId: string) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();
  
  if (userData?.stripeConnected) {
    return { provider: 'Stripe', accountId: 'Connected' };
  } else if (userData?.paypalEmail) {
    return { provider: 'PayPal', accountId: userData.paypalEmail };
  }
  
  return null;
}
