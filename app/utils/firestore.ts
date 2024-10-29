import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { Invoice } from '../types/invoice';

export async function saveInvoice(invoice: Invoice, userId: string) {
  try {
    const docRef = await addDoc(collection(db, 'invoices'), {
      ...invoice,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving invoice: ', error);
    throw error;
  }
}

export async function getInvoices(userId: string): Promise<Invoice[]> {
  try {
    const q = query(collection(db, 'invoices'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Invoice));
  } catch (error) {
    console.error('Error fetching invoices: ', error);
    throw error;
  }
}

export async function getInvoice(id: string): Promise<Invoice> {
  try {
    const docRef = doc(db, 'invoices', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Invoice;
    } else {
      throw new Error('Invoice not found');
    }
  } catch (error) {
    console.error('Error fetching invoice: ', error);
    throw error;
  }
}

export async function updateInvoice(id: string, invoice: Partial<Invoice>) {
  try {
    const docRef = doc(db, 'invoices', id);
    await updateDoc(docRef, {
      ...invoice,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating invoice: ', error);
    throw error;
  }
}

export async function deleteInvoice(id: string) {
  try {
    const docRef = doc(db, 'invoices', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting invoice: ', error);
    throw error;
  }
}