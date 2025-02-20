import { adminDb } from '../lib/firebase/admin';
import { supabaseAdmin } from '../lib/supabase/server';

async function migrateUsers() {
  console.log('Migrating users...');
  const usersSnapshot = await adminDb.collection('users').get();
  
  for (const doc of usersSnapshot.docs) {
    const userData = doc.data();
    try {
      // Create user in Supabase Auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        email_confirm: userData.emailVerified,
        password: 'TEMP_PASSWORD_' + Math.random().toString(36).slice(2),
        user_metadata: {
          displayName: userData.displayName,
        },
      });

      if (authError) throw authError;

      // Create profile in Supabase DB
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email: userData.email,
          display_name: userData.displayName,
          role: userData.role || 'student',
          description: userData.description,
          education: userData.education,
          experience: userData.experience,
          subjects: userData.subjects,
          preferences: userData.preferences,
        });

      if (profileError) throw profileError;
      console.log(`Migrated user: ${userData.email}`);
    } catch (error) {
      console.error(`Failed to migrate user ${userData.email}:`, error);
    }
  }
}

async function migrateLessons() {
  console.log('Migrating lessons...');
  const lessonsSnapshot = await adminDb.collection('lessons').get();
  
  for (const doc of lessonsSnapshot.docs) {
    const lessonData = doc.data();
    try {
      const { error } = await supabaseAdmin
        .from('lessons')
        .insert({
          id: doc.id,
          subject: lessonData.subject,
          subject_id: lessonData.subjectId,
          description: lessonData.description,
          teacher_id: lessonData.teacherId,
          teacher_name: lessonData.teacherName,
          lesson_length: lessonData.lessonLength,
          category: lessonData.category,
          price: lessonData.price,
        });

      if (error) throw error;
      console.log(`Migrated lesson: ${doc.id}`);
    } catch (error) {
      console.error(`Failed to migrate lesson ${doc.id}:`, error);
    }
  }
}

async function migrateBookings() {
  console.log('Migrating bookings...');
  const bookingsSnapshot = await adminDb.collection('bookings').get();
  
  for (const doc of bookingsSnapshot.docs) {
    const bookingData = doc.data();
    try {
      const { error } = await supabaseAdmin
        .from('bookings')
        .insert({
          id: doc.id,
          lesson_id: bookingData.lessonId,
          student_id: bookingData.studentId,
          student_name: bookingData.studentName,
          teacher_id: bookingData.teacherId,
          teacher_name: bookingData.teacherName,
          subject: bookingData.subject,
          time_slot: bookingData.timeSlot,
          status: bookingData.status,
          lesson_length: bookingData.lessonLength,
          price: bookingData.price,
          category: bookingData.category,
          subject_id: bookingData.subjectId,
        });

      if (error) throw error;
      console.log(`Migrated booking: ${doc.id}`);
    } catch (error) {
      console.error(`Failed to migrate booking ${doc.id}:`, error);
    }
  }
}

async function migrateWorkHours() {
  console.log('Migrating work hours...');
  const workHoursSnapshot = await adminDb.collection('workHours').get();
  
  for (const doc of workHoursSnapshot.docs) {
    const workHoursData = doc.data();
    try {
      const { error } = await supabaseAdmin
        .from('work_hours')
        .insert({
          id: doc.id,
          teacher_id: workHoursData.teacherId,
          day_of_week: workHoursData.dayOfWeek,
          enabled: workHoursData.enabled,
          time_slots: workHoursData.timeSlots,
        });

      if (error) throw error;
      console.log(`Migrated work hours: ${doc.id}`);
    } catch (error) {
      console.error(`Failed to migrate work hours ${doc.id}:`, error);
    }
  }
}

async function migrate() {
  try {
    await migrateUsers();
    await migrateLessons();
    await migrateBookings();
    await migrateWorkHours();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration
migrate(); 