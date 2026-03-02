require('dotenv').config();
const { admin, db, auth } = require('../config/firebase');

async function testFirebaseConnection() {
  console.log('🔍 Testing Firebase connection...\n');

  try {
    // Test 1: Check Firebase Admin initialization
    console.log('1. Testing Firebase Admin SDK initialization...');
    const app = admin.app();
    console.log(`   ✓ Firebase app name: ${app.name}`);
    console.log(`   ✓ Project ID: ${process.env.FIREBASE_PROJECT_ID}`);

    // Test 2: Test Firestore connection
    console.log('\n2. Testing Firestore database connection...');
    const testDoc = await db.collection('_connection_test').doc('test').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      message: 'Connection test successful'
    });
    console.log('   ✓ Firestore write test: SUCCESS');

    const readTest = await db.collection('_connection_test').doc('test').get();
    if (readTest.exists) {
      console.log('   ✓ Firestore read test: SUCCESS');
      console.log(`   ✓ Data: ${JSON.stringify(readTest.data())}`);
    }

    // Clean up test document
    await db.collection('_connection_test').doc('test').delete();
    console.log('   ✓ Firestore delete test: SUCCESS');

    // Test 3: Test Firebase Authentication
    console.log('\n3. Testing Firebase Authentication...');
    try {
      const usersList = await auth.listUsers(1);
      console.log(`   ✓ Firebase Auth connection: SUCCESS`);
      console.log(`   ✓ Total users can be accessed`);
    } catch (authError) {
      console.log(`   ⚠ Firebase Auth warning: ${authError.message}`);
    }

    // Test 4: Check existing collections
    console.log('\n4. Checking existing collections...');
    const collections = await db.listCollections();
    console.log(`   ✓ Found ${collections.length} collections:`);
    collections.forEach(col => {
      console.log(`      - ${col.id}`);
    });

    // Test 5: Count documents in main collections
    console.log('\n5. Checking document counts in main collections...');
    const mainCollections = ['users', 'providers', 'workspaces', 'bookings', 'payments', 'reviews', 'admins'];

    for (const collectionName of mainCollections) {
      try {
        const snapshot = await db.collection(collectionName).limit(1).get();
        const countSnapshot = await db.collection(collectionName).count().get();
        const count = countSnapshot.data().count;
        console.log(`   ${collectionName}: ${count} documents`);
      } catch (error) {
        console.log(`   ${collectionName}: 0 documents (collection may not exist yet)`);
      }
    }

    console.log('\n✅ All Firebase connection tests passed!');
    console.log('\n📊 Summary:');
    console.log(`   Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
    console.log(`   Client Email: ${process.env.FIREBASE_CLIENT_EMAIL}`);
    console.log('   Status: Connected and operational');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Firebase connection test failed:');
    console.error('   Error:', error.message);
    console.error('\nPlease check:');
    console.error('   1. Your .env file has correct Firebase credentials');
    console.error('   2. The service account has proper permissions');
    console.error('   3. Firestore and Authentication are enabled in Firebase Console');
    process.exit(1);
  }
}

// Run the test
testFirebaseConnection();
