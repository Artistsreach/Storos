import { db } from './firebaseClient';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

export const migrateTemplatesToPublic = async () => {
  console.log('Starting template migration...');
  try {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    let migratedCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const savedTemplatesRef = collection(db, 'users', userDoc.id, 'saved_templates');
      const savedTemplatesSnapshot = await getDocs(savedTemplatesRef);

      for (const templateDoc of savedTemplatesSnapshot.docs) {
        const templateData = templateDoc.data();
        const publicTemplateRef = doc(db, 'public_templates', templateDoc.id);
        
        // Check if the public template already exists
        const publicTemplateDoc = await getDoc(publicTemplateRef);
        if (!publicTemplateDoc.exists()) {
          await setDoc(publicTemplateRef, {
            ...templateData,
            userId: userDoc.id, // Ensure userId is included
          });
          migratedCount++;
        }
      }
    }
    console.log(`Migration complete. Migrated ${migratedCount} templates.`);
    alert(`Migration complete. Migrated ${migratedCount} templates.`);
  } catch (error) {
    console.error('Error migrating templates:', error);
    alert('Error migrating templates. See console for details.');
  }
};
