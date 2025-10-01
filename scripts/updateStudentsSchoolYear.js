import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CURRENT_SCHOOL_YEAR = '2025-2026';

async function updateAllStudents() {
  try {
    console.log('🚀 Début de la mise à jour des élèves...');
    console.log(`📅 Année scolaire cible: ${CURRENT_SCHOOL_YEAR}`);

    const studentsRef = collection(db, 'students');
    const snapshot = await getDocs(studentsRef);

    console.log(`📊 Nombre total d'élèves trouvés: ${snapshot.size}`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const docSnapshot of snapshot.docs) {
      try {
        const studentRef = doc(db, 'students', docSnapshot.id);
        const studentData = docSnapshot.data();

        await updateDoc(studentRef, {
          schoolYear: CURRENT_SCHOOL_YEAR,
          updatedAt: new Date()
        });

        updatedCount++;
        console.log(`✅ Élève mis à jour: ${studentData.firstName} ${studentData.lastName} (ID: ${docSnapshot.id})`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Erreur lors de la mise à jour de l'élève ${docSnapshot.id}:`, error);
      }
    }

    console.log('\n📈 RÉSUMÉ DE LA MISE À JOUR:');
    console.log(`✅ Élèves mis à jour avec succès: ${updatedCount}`);
    console.log(`❌ Erreurs rencontrées: ${errorCount}`);
    console.log(`📊 Total traité: ${snapshot.size}`);
    console.log(`\n🎉 Mise à jour terminée!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur fatale lors de la mise à jour:', error);
    process.exit(1);
  }
}

updateAllStudents();
