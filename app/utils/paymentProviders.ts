import { db } from '../firebase/config';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

export async function connectStripe(userId: string) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    // Create the user document if it doesn't exist
    await setDoc(userRef, {
      stripeConnected: true,
      paypalEmail: null,
      createdAt: new Date()
    });
  } else {
    await updateDoc(userRef, {
      stripeConnected: true,
      paypalEmail: null
    });
  }
}

export async function connectPayPal(userId: string, paypalEmail: string) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    // Create the user document if it doesn't exist
    await setDoc(userRef, {
      stripeConnected: false,
      paypalEmail: paypalEmail,
      createdAt: new Date()
    });
  } else {
    await updateDoc(userRef, {
      paypalEmail: paypalEmail,
      stripeConnected: false
    });
  }
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
