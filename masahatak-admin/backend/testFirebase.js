// Quick Firebase Connection Test
// Run this with: node testFirebase.js

require('dotenv').config();

console.log('🔍 Testing Firebase Configuration...\n');

// Check if environment variables are set
console.log('1. Checking environment variables:');
console.log('   ✓ FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Not set');
console.log('   ✓ FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅ Set' : '❌ Not set');
console.log('   ✓ FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ Set' : '❌ Not set');
console.log('');

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
  console.log('❌ ERROR: Firebase credentials are not properly configured!\n');
  console.log('📝 Please follow these steps:\n');
  console.log('1. Go to https://console.firebase.google.com/');
  console.log('2. Select your project');
  console.log('3. Go to Project Settings > Service Accounts');
  console.log('4. Click "Generate New Private Key"');
  console.log('5. Update the .env file with the credentials from the downloaded JSON\n');
  console.log('📖 See FIREBASE-SETUP-GUIDE.md for detailed instructions\n');
  process.exit(1);
}

// Try to initialize Firebase
console.log('2. Testing Firebase connection...');
const admin = require('firebase-admin');

try {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const db = admin.firestore();

  console.log('   ✅ Firebase initialized successfully!\n');

  // Test Firestore connection
  console.log('3. Testing Firestore connection...');
  db.collection('admins').limit(1).get()
    .then(snapshot => {
      console.log('   ✅ Firestore connection successful!\n');

      if (snapshot.empty) {
        console.log('⚠️  WARNING: No admin accounts found in Firestore!');
        console.log('📝 You need to create an admin account before you can login.\n');
        console.log('Run this command to create an admin:');
        console.log('   node createAdmin.js\n');
      } else {
        console.log('✅ Admin accounts found:', snapshot.size);
        snapshot.forEach(doc => {
          const data = doc.data();
          console.log('   - Email:', data.email);
        });
        console.log('');
      }

      console.log('🎉 Firebase setup is complete! You can now start the server with: npm start\n');
      process.exit(0);
    })
    .catch(error => {
      console.log('   ❌ Firestore connection failed:', error.message, '\n');
      console.log('💡 Make sure Firestore is enabled in your Firebase project\n');
      process.exit(1);
    });

} catch (error) {
  console.log('   ❌ Firebase initialization failed!\n');
  console.log('Error:', error.message, '\n');

  if (error.message.includes('private key')) {
    console.log('💡 This is likely a problem with your FIREBASE_PRIVATE_KEY');
    console.log('   Make sure to:');
    console.log('   1. Wrap it in quotes');
    console.log('   2. Include the -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----');
    console.log('   3. Keep all the \\n characters\n');
  }

  console.log('📖 See FIREBASE-SETUP-GUIDE.md for help\n');
  process.exit(1);
}
