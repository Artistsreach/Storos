import { db, auth } from '../lib/firebaseClient';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query } from 'firebase/firestore';

export class Task {
  constructor(data) {
    this.id = data.id;
    this.description = data.description;
    this.schedule = data.schedule;
    this.scheduled_time = data.scheduled_time;
    this.recurring_pattern = data.recurring_pattern;
    this.tags = data.tags || [];
    this.images = data.images || [];
    this.return_value = data.return_value;
    this.status = data.status || 'pending';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.userId = data.userId;
  }

  static async create(taskData) {
    const userId = auth.currentUser.uid;
    if (!userId) throw new Error("User not authenticated.");

    const tasksCollectionRef = collection(db, "users", userId, "tasks");
    const docRef = await addDoc(tasksCollectionRef, {
      ...taskData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return new Task({ ...taskData, id: docRef.id, userId });
  }

  static async getAll() {
    const userId = auth.currentUser.uid;
    if (!userId) throw new Error("User not authenticated.");

    const tasksCollectionRef = collection(db, "users", userId, "tasks");
    const q = query(tasksCollectionRef);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => new Task({ ...doc.data(), id: doc.id }));
  }

  static async update(id, updates) {
    const userId = auth.currentUser.uid;
    if (!userId) throw new Error("User not authenticated.");

    const taskDocRef = doc(db, "users", userId, "tasks", id);
    await updateDoc(taskDocRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return new Task({ id, ...updates });
  }

  static async delete(id) {
    const userId = auth.currentUser.uid;
    if (!userId) throw new Error("User not authenticated.");

    const taskDocRef = doc(db, "users", userId, "tasks", id);
    await deleteDoc(taskDocRef);
    return true;
  }
}
