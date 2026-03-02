const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Old Firebase account credentials
const oldServiceAccount = {
  type: "service_account",
  project_id: "masahtak-e4f47",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCp9yD7hgjNNrJ8\nKVyKVqiKl1dxtIAM7j9ztHr+6WXb4tO7yzv5vdvtU6BF32JiSmrSwQPYTaDX17m7\n6P3dUzG3PKfI3LO3f5kE2FRecuaqyOKb3ybqqWQbGmF+nr/Z2RR100T4h1og1YMf\n6ToWV24r3949RB1mngNwzue2KPJVTTClL5J7fgwSv2eyLZnc9OnWVPDsgwmUk6/p\nS3ff4BEu8YJcmRsQfb1aa8TK/LjpYweGhGyJYHQh6ULIQcs02IQlWhIbmp9N4e+U\nJuQdRtHxqxVhmVItnXzny1Z4biNUBdmBg0Tb5wke94IS+RMla8rAUylbIVBAMhYM\nv7GqAQQlAgMBAAECggEAEE8KxqfDU3GiqcBMRWfwTzAbb2kq+lKoGwGf5bLel71J\npNTpAdtCbaDfGaVIKvdKDcQAivJT8zIbe9js9x5DAHqc/OyUgBCJzcm2OsPat1uE\nRwGgGdc8KE+dOEmiThSC3pVxoklWkBz8soSuErO7+hDGoelVyuFxohLwb+245w9T\nfp2fDClYMFRUhVdV4YXSLjaBiBGt1yazP6715P9fL/5NNOznEVBzUFabn9ZK7Ef4\ncq42ia1dOeXM1K+Hj9zW0RBRcIsqwSZTvKV9eXXCMj6cdV/XnKV+sqd3WKGM1t/K\nyLrwrnAYKXWR02OXg/IfMWGs+OTqFW9ktWvPfQzqBwKBgQDau5JKR/AOZdAhiB0c\nvcJz0jqdilctbZwZrIltnhAC8Q7Zg8YRVMk69qAqkVMh9Ha7uqaMipbXC8shQrPL\nLWEStw9ZM+tzm39QZuwDEPXdA7LGndVsHMI//fs3FU04wz6/WBesnRJCWXPSFrIm\nQkvpbHyvHpqbW6kOZDudzJLnywKBgQDG7HrLb7ov17LtwdrIw/BsH08yclg8mWtj\naqYr4nX6muLVqJmOjwFxzzW2aysTPS+uTnnITpTmK05H2ZrF0cE4pTk3mQeZb55o\nbIDVPpUooVKC1RhZvdiOtmP6gC3IFoCRJ2qZ1osRfbwO4V8hgJpET9VSvuG7vO0W\nXKIVf73lzwKBgCAbcHne3Wn/n/GMHVnesPB3Z4tAh1Nvx34tSW8ByK/l2pwrL6PT\nokY5dYFKG73cOKGN4Gy42zNt079qHyIv4xPwMxyQ9nrd1G5k7Tf2AWET7eYhvPZF\nsm3aRknroo42ertznuYDmG6M2ud31WawTJxTBGpgP6mWZtZp+CZNpTLJAoGBAIPv\nVqZVbSzMKF2vJHfiFTTxMyrnUgSnUOV4V8xlgBB96BMDpw05ZiDg6OQbgk9ZVqWK\nYRVsoS9j66CWACRSMZBrbV6lvbeTo4Ho7S4COxXeoYYq5eKnmtlUuUzs9PBvlEgx\n128/L6+jMDbCXcEvtaG3PWqLNda5wJoDSHFv7zhbAoGAOntMNT+eCnjYqeEoIo2Y\nCv3xjNsjL2Jso/+JNvIJy4247hDzZIPBGBv3zhcH/4TaE2ZEQZXyRMlSPkW1i8jQ\nL70vBSUniPCGvNjzEBBAJZzr4dG9AfHUo/wyPBW7i2Abnp806XEItT8WslS1dqrw\nEIyCAW70sgJZmHwHhGK4gRk=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@masahtak-e4f47.iam.gserviceaccount.com"
};

// New Firebase account credentials
const newServiceAccount = {
  type: "service_account",
  project_id: "masahatak-73bf9",
  private_key_id: "3f1afc6f70c12f7c902c7899c52184e0618c5c6e",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC7v8M1h2lEpCna\npFjBlphvxjI+xgGqOlaeDCGo0v8Ovs4nixfGQEliFNa26Ak/p/Bj7xcGQkAyfpu0\n1LHgu13JiLmMrljj2ozLaDmT4wEWUTCpf0dVRLrOmzWjdPnh94IFRmrVD1nNx9Aj\nHkgkyPIw3RDAmc25zK+VcoKE8NS1C7Bw/QnIUs6XW0hk1HzmiryeY76maHh0Itq3\n2I3DYtoJvjHq9FyoDWH73NEHFSaUxyrAR28T5p2tvI49WnDbJ4Yrr7PI9D6CBOEm\n+1jrZ3Hk9/p9oaEXpuKmDwZxx/Y9999i6hSDaJkRuo7+TnYAsII7CHXBWgqyFXJP\nvmbfUCjfAgMBAAECggEAN/5ZgEnpzcRuDRytsdKxlMhV7N3N2lB6y7kPgtOmqOWk\nAywbA4/hsuRHIxaxx2/VJGDGi6HPlp+m3Xf/suf+cSAbQocu0Im6KuHjJiVyCg9d\nxXdFtXsBgaPNi/nTmp5gAyW8r91bqaEZhJe/6WSawpLzr5VPQ0X16crUfUR8E6At\nOgJx5a9rEe8sjcLKU5ykk4QiAqqg+scXk91UNfQklNhBCaAwQUaUnArxNCfYhsx5\n4wn+eFdaLgRkPPZSY8lOqXsFYtMe9nRpoIQ1jMCsm4ne979HYo0e+RkSzhAsNUwn\ndA3VYevcPlrB37RNHZRyYc09rCf5JZdCoyXE4Bmr5QKBgQDrxrZZgdI0yr7ZGbur\nyPpgN7JXC2854LlpB64X2pdoTqLalSuAKxCMyhMFqMHydBKtKjbkIP5BS6Mvgg1t\nVdbPbSvHZau2LSPeXNPzJQk1rRvw+a0Y8w4gCsflAF/IwswGfE/sf1yXGEa8KQgP\nmVDr4conEkgRfc9bKaUjdfCS3QKBgQDL2nJvmPewETNCxM1i6ca2tRK2mz8ww/14\nETh7CjjIbk+YgrM0tTfMxWXlPCpr9gvFVbsFhnssDfqCNw9Hqphbz16d0tlWGeHa\nyKm0hLaWU8OrPl07joRs/1s5RAzTGD1yfNJkUhD+6c6qdB1IRjPp6IeuQjvB7LxV\nPUoO7K046wKBgQDrSmELreyS1oniqjWJV4XVo3+MMlMLVWJymEF6eKCEbYVD0X2Z\n6GAZwEd/bEwwovlIakphGzPhAZSWgpjXtcQrOG1qDeJwaVfUPpsdmKY6NMkfkGrX\n7Sb5fwjBVcBA33UwO7qe7vL9rjJY8DGlL4F8BNXya+IT4pOeDE9KthYg2QKBgQC6\n8DkO88T31d4fNaBvO5h5xjVB9b4N9z0ClTApTOdjjh0562lxRVnFU6Qsgm8YkAqd\nTQ/zci6T6MG4FcvSWbPcRZ8rtcaOea+vVWKi4y0ZT/lYmRkgW4I+/jDmo+vqzQjU\na3j4fHWPflOB5ndP5ukGcLGz8JMiM/lFZa37X7k+PwKBgQDa7cyCMvR2byFSvD8M\nHcWzPURSspsKeK3Mbd1yald7cSSn9JwLsyapKhbuis8PnC3IN15oMmj9m8BxAFk4\nz34lbk7hgZL/eI0fD7RnQvtCgFYYso5SnROdoyT4R0hbkq/cClrQOjwKnZoZc2Lc\nxgUlTTaV5/Q7Y/rUkzYCNv/92g==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@masahatak-73bf9.iam.gserviceaccount.com",
  client_id: "102012340410538936117",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40masahatak-73bf9.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Initialize both Firebase apps
const oldApp = admin.initializeApp({
  credential: admin.credential.cert(oldServiceAccount),
  databaseURL: `https://${oldServiceAccount.project_id}.firebaseio.com`
}, 'oldApp');

const newApp = admin.initializeApp({
  credential: admin.credential.cert(newServiceAccount),
  databaseURL: `https://${newServiceAccount.project_id}.firebaseio.com`
}, 'newApp');

const oldDb = oldApp.firestore();
const newDb = newApp.firestore();

// Collections to migrate
const COLLECTIONS = [
  'users',
  'providers',
  'workspaces',
  'bookings',
  'payments',
  'reviews',
  'admins',
  'notifications',
  'audit_logs',
  'payment_webhooks'
];

// Create backup directory
const backupDir = path.join(__dirname, '..', '..', 'firebase-backup');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Export data from old Firebase
async function exportCollection(collectionName) {
  console.log(`\n📥 Exporting collection: ${collectionName}...`);
  const snapshot = await oldDb.collection(collectionName).get();

  const documents = [];
  snapshot.forEach(doc => {
    documents.push({
      id: doc.id,
      data: doc.data()
    });
  });

  console.log(`   ✓ Found ${documents.length} documents in ${collectionName}`);

  // Save to JSON file as backup
  const backupFile = path.join(backupDir, `${collectionName}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(documents, null, 2));
  console.log(`   ✓ Backed up to ${backupFile}`);

  return documents;
}

// Import data to new Firebase
async function importCollection(collectionName, documents) {
  console.log(`\n📤 Importing collection: ${collectionName}...`);

  if (documents.length === 0) {
    console.log(`   ⚠ No documents to import for ${collectionName}`);
    return;
  }

  const batch = newDb.batch();
  let batchCount = 0;
  let totalImported = 0;

  for (const doc of documents) {
    const docRef = newDb.collection(collectionName).doc(doc.id);
    batch.set(docRef, doc.data);
    batchCount++;

    // Firestore batch limit is 500 operations
    if (batchCount === 500) {
      await batch.commit();
      totalImported += batchCount;
      console.log(`   ✓ Imported ${totalImported}/${documents.length} documents...`);
      batchCount = 0;
    }
  }

  // Commit remaining documents
  if (batchCount > 0) {
    await batch.commit();
    totalImported += batchCount;
  }

  console.log(`   ✓ Successfully imported ${totalImported} documents to ${collectionName}`);
}

// Migrate Firebase Authentication users
async function migrateAuthUsers() {
  console.log('\n👥 Migrating Firebase Authentication users...');

  try {
    const oldAuth = oldApp.auth();
    const newAuth = newApp.auth();

    let nextPageToken;
    let totalUsers = 0;

    do {
      const listUsersResult = await oldAuth.listUsers(1000, nextPageToken);

      for (const userRecord of listUsersResult.users) {
        try {
          // Check if user already exists in new Firebase
          try {
            await newAuth.getUser(userRecord.uid);
            console.log(`   ⚠ User ${userRecord.email || userRecord.uid} already exists, skipping...`);
            continue;
          } catch (error) {
            if (error.code !== 'auth/user-not-found') {
              throw error;
            }
          }

          // Create user in new Firebase
          const userData = {
            uid: userRecord.uid,
            email: userRecord.email,
            emailVerified: userRecord.emailVerified,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
            phoneNumber: userRecord.phoneNumber,
            disabled: userRecord.disabled,
          };

          // Only include password hash if available
          if (userRecord.passwordHash) {
            userData.passwordHash = Buffer.from(userRecord.passwordHash);
            userData.passwordSalt = Buffer.from(userRecord.passwordSalt);
          }

          await newAuth.importUsers([userData]);
          totalUsers++;
          console.log(`   ✓ Migrated user: ${userRecord.email || userRecord.uid}`);
        } catch (error) {
          console.error(`   ✗ Error migrating user ${userRecord.email || userRecord.uid}:`, error.message);
        }
      }

      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log(`   ✓ Successfully migrated ${totalUsers} authentication users`);
  } catch (error) {
    console.error('   ✗ Error migrating authentication users:', error.message);
    console.log('   ⚠ You may need to manually recreate authentication users or have users reset their passwords');
  }
}

// Main migration function
async function migrateFirebaseData() {
  console.log('🚀 Starting Firebase data migration...');
  console.log(`   Old Firebase: ${oldServiceAccount.project_id}`);
  console.log(`   New Firebase: ${newServiceAccount.project_id}`);
  console.log(`   Backup directory: ${backupDir}`);

  try {
    const migrationData = {};

    // Step 1: Export all collections
    console.log('\n========================================');
    console.log('STEP 1: EXPORTING DATA FROM OLD FIREBASE');
    console.log('========================================');

    for (const collectionName of COLLECTIONS) {
      migrationData[collectionName] = await exportCollection(collectionName);
    }

    // Step 2: Import all collections
    console.log('\n========================================');
    console.log('STEP 2: IMPORTING DATA TO NEW FIREBASE');
    console.log('========================================');

    for (const collectionName of COLLECTIONS) {
      await importCollection(collectionName, migrationData[collectionName]);
    }

    // Step 3: Migrate authentication users
    console.log('\n========================================');
    console.log('STEP 3: MIGRATING AUTHENTICATION USERS');
    console.log('========================================');

    await migrateAuthUsers();

    // Generate migration report
    console.log('\n========================================');
    console.log('MIGRATION COMPLETE!');
    console.log('========================================');
    console.log('\n📊 Migration Summary:');

    let totalDocuments = 0;
    for (const collectionName of COLLECTIONS) {
      const count = migrationData[collectionName].length;
      totalDocuments += count;
      console.log(`   ${collectionName}: ${count} documents`);
    }

    console.log(`\n   Total documents migrated: ${totalDocuments}`);
    console.log(`   Backup location: ${backupDir}`);
    console.log('\n✅ Next steps:');
    console.log('   1. Update your .env file with new Firebase credentials');
    console.log('   2. Test your application with the new Firebase account');
    console.log('   3. Verify all data is correct in Firebase Console');
    console.log('   4. Keep the backup files safe until you confirm everything works\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.log('\n📁 Backup files are available in:', backupDir);
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  migrateFirebaseData()
    .then(() => {
      console.log('Migration script completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateFirebaseData, exportCollection, importCollection };
