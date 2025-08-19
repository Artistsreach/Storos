import { db } from '../lib/firebaseClient';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export class Lead {
  constructor(data) {
    this.id = data.id;
    this.companyName = data.companyName;
    this.niche = data.niche;
    this.city = data.city;
    this.phoneNumber = data.phoneNumber;
    this.email = data.email;
    this.created_at = data.created_at;
  }

  static async create(leadData) {
    const leadsCollectionRef = collection(db, "leads");
    const docRef = await addDoc(leadsCollectionRef, {
      ...leadData,
      createdAt: serverTimestamp(),
    });
    return new Lead({ ...leadData, id: docRef.id });
  }
}
