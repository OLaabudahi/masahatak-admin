require('dotenv').config();
const { db } = require('../config/firebase');

async function checkAdmins() {
  console.log('🔍 Checking admin accounts in Firebase...\n');

  try {
    const adminsSnapshot = await db.collection('admins').get();

    if (adminsSnapshot.empty) {
      console.log('❌ No admin accounts found in the database.\n');
      return;
    }

    console.log(`✅ Found ${adminsSnapshot.size} admin account(s):\n`);

    adminsSnapshot.forEach((doc) => {
      const admin = doc.data();
      console.log('Admin ID:', doc.id);
      console.log('Email:', admin.email);
      console.log('Full Name:', admin.fullName || 'N/A');
      console.log('Role:', admin.role || 'N/A');
      console.log('Created At:', admin.createdAt ? new Date(admin.createdAt._seconds * 1000).toLocaleString() : 'N/A');
      console.log('Password Hash:', admin.password ? 'Yes (hashed)' : 'No');
      console.log('---');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking admins:', error.message);
    process.exit(1);
  }
}

checkAdmins();
