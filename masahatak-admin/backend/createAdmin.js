// Script to create admin account in Firestore
// Run this with: node createAdmin.js

require('dotenv').config();
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');

console.log('🔧 Creating Admin Account...\n');

// Initialize Firebase
try {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('✅ Firebase initialized\n');
} catch (error) {
  console.log('❌ Failed to initialize Firebase:', error.message);
  console.log('\n📖 Please check your .env file and ensure Firebase credentials are correct');
  console.log('See FIREBASE-SETUP-GUIDE.md for help\n');
  process.exit(1);
}

const db = admin.firestore();

async function createAdmin() {
  try {
    // Get admin credentials from .env or use defaults
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@masahatak.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    console.log('📝 Admin Details:');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    console.log('');

    // Check if admin already exists
    const existingAdmin = await db.collection('admins')
      .where('email', '==', adminEmail)
      .limit(1)
      .get();

    if (!existingAdmin.empty) {
      console.log('⚠️  Admin account already exists with email:', adminEmail);
      console.log('');
      console.log('Options:');
      console.log('1. Use the existing account to login');
      console.log('2. Delete the existing account from Firestore and run this script again');
      console.log('3. Change ADMIN_EMAIL in .env and run this script again\n');
      process.exit(0);
    }

    // Hash the password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log('✅ Password hashed\n');

    // Create admin account
    console.log('💾 Creating admin account in Firestore...');
    const docRef = await db.collection('admins').add({
      email: adminEmail,
      fullName: 'Admin User',
      password: hashedPassword,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Admin account created successfully!\n');
    console.log('📋 Account Details:');
    console.log('   Document ID:', docRef.id);
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    console.log('   Role: admin\n');

    console.log('🎉 You can now login to the admin panel with these credentials!\n');
    console.log('Next steps:');
    console.log('1. Start the backend server: npm start');
    console.log('2. Start the frontend server: cd ../frontend && npm start');
    console.log('3. Open http://localhost:3000 and login\n');

    process.exit(0);
  } catch (error) {
    console.log('❌ Error creating admin account:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('- Make sure Firestore is enabled in Firebase Console');
    console.log('- Check that you have write permissions to Firestore');
    console.log('- Verify your Firebase credentials are correct\n');
    process.exit(1);
  }
}

createAdmin();
