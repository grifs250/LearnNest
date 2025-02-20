import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: '.env.local' });

interface FirebaseSubject {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Initialize Firebase Admin
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateSubjects() {
  const firestore = getFirestore();
  
  try {
    // Get all subjects from Firebase
    const subjectsSnapshot = await firestore.collection('subjects').get();
    const subjects = subjectsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseSubject[];

    console.log(`Found ${subjects.length} subjects to migrate`);

    // Insert subjects into Supabase
    for (const subject of subjects) {
      const { error } = await supabase
        .from('subjects')
        .insert({
          id: uuidv4(),
          name: subject.name,
          slug: createSlug(subject.name),
          description: subject.description,
          parent_id: subject.parentId || null,
          is_active: subject.isActive ?? true,
          created_at: subject.createdAt || new Date().toISOString(),
          updated_at: subject.updatedAt || new Date().toISOString()
        });

      if (error) {
        console.error(`Error inserting subject ${subject.id}:`, error);
      } else {
        console.log(`Migrated subject: ${subject.name}`);
      }
    }

    console.log('Subject migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateSubjects(); 