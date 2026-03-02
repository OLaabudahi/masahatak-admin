// Quick Database Initialization - No Firebase Auth Required
// This creates data directly in Firestore without Firebase Authentication

require('dotenv').config();
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');

console.log('🔧 Quick Database Initialization...\n');

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
  process.exit(1);
}

const db = admin.firestore();

async function quickInit() {
  try {
    console.log('📋 Creating database collections...\n');

    // 1. Create Admin Account
    console.log('👤 Creating admin account...');
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const existingAdmin = await db.collection('admins')
      .where('email', '==', 'admin@masahatak.com')
      .limit(1)
      .get();

    if (existingAdmin.empty) {
      await db.collection('admins').add({
        email: 'admin@masahatak.com',
        fullName: 'Admin User',
        password: hashedPassword,
        role: 'admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('   ✅ Admin account created');
    } else {
      console.log('   ⏭️  Admin account already exists');
    }

    // 2. Create Sample Users (without Firebase Auth)
    console.log('\n👥 Creating sample users...');
    const users = [
      { email: 'john.doe@example.com', fullName: 'John Doe', phoneNumber: '+1234567890' },
      { email: 'jane.smith@example.com', fullName: 'Jane Smith', phoneNumber: '+1234567891' },
      { email: 'bob.wilson@example.com', fullName: 'Bob Wilson', phoneNumber: '+1234567892' }
    ];

    for (const user of users) {
      const existing = await db.collection('users').where('email', '==', user.email).limit(1).get();
      if (existing.empty) {
        await db.collection('users').add({
          ...user,
          status: 'active',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          stats: {
            totalBookings: 0,
            completedBookings: 0,
            cancelledBookings: 0,
            totalSpent: 0
          }
        });
        console.log(`   ✅ Created user: ${user.fullName}`);
      } else {
        console.log(`   ⏭️  User ${user.fullName} already exists`);
      }
    }

    // 3. Create Sample Providers
    console.log('\n🏢 Creating sample providers...');
    const providers = [
      {
        email: 'provider1@masahatak.com',
        businessName: 'Modern Workspace Co.',
        ownerName: 'Sarah Johnson',
        phoneNumber: '+1234567893'
      },
      {
        email: 'provider2@masahatak.com',
        businessName: 'Creative Hub Spaces',
        ownerName: 'Michael Chen',
        phoneNumber: '+1234567894'
      },
      {
        email: 'provider3@masahatak.com',
        businessName: 'Tech Haven',
        ownerName: 'Emily Rodriguez',
        phoneNumber: '+1234567895'
      }
    ];

    const providerIds = [];
    for (const provider of providers) {
      const existing = await db.collection('providers').where('email', '==', provider.email).limit(1).get();
      if (existing.empty) {
        const docRef = await db.collection('providers').add({
          ...provider,
          address: {
            street: '123 Business Ave',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            zipCode: '10001'
          },
          status: 'active',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          stats: {
            totalWorkspaces: 0,
            activeWorkspaces: 0,
            totalBookings: 0,
            totalRevenue: 0,
            averageRating: 0
          }
        });
        providerIds.push(docRef.id);
        console.log(`   ✅ Created provider: ${provider.businessName}`);
      } else {
        providerIds.push(existing.docs[0].id);
        console.log(`   ⏭️  Provider ${provider.businessName} already exists`);
      }
    }

    // 4. Create Sample Workspaces
    console.log('\n🏢 Creating sample workspaces...');
    const workspaces = [
      {
        spaceName: 'Modern Conference Room A',
        description: 'A spacious modern conference room perfect for team meetings.',
        spaceType: 'meeting_room',
        capacity: 12,
        pricePerHour: 50,
        amenities: ['WiFi', 'Projector', 'Whiteboard', 'Coffee', 'AC']
      },
      {
        spaceName: 'Creative Studio Space',
        description: 'Bright and inspiring studio space for creative work.',
        spaceType: 'office',
        capacity: 8,
        pricePerHour: 40,
        amenities: ['WiFi', 'Natural Light', 'Coffee', 'Parking']
      },
      {
        spaceName: 'Executive Office Suite',
        description: 'Premium private office space with city views.',
        spaceType: 'office',
        capacity: 4,
        pricePerHour: 60,
        amenities: ['WiFi', 'Private Bathroom', 'Coffee', 'AC']
      },
      {
        spaceName: 'Collaborative Desk Space',
        description: 'Open desk in vibrant coworking environment.',
        spaceType: 'desk',
        capacity: 1,
        pricePerHour: 15,
        amenities: ['WiFi', 'Coffee', 'Community Events']
      },
      {
        spaceName: 'Event Hall',
        description: 'Large event space for workshops and seminars.',
        spaceType: 'event_space',
        capacity: 50,
        pricePerHour: 150,
        amenities: ['WiFi', 'Sound System', 'Projector', 'Stage']
      }
    ];

    for (let i = 0; i < workspaces.length; i++) {
      const workspace = workspaces[i];
      const providerId = providerIds[i % providerIds.length];

      await db.collection('workspaces').add({
        ownerId: providerId,
        ...workspace,
        location: {
          address: `${100 + i} Main St`,
          city: 'New York',
          state: 'NY',
          country: 'USA',
          zipCode: `${10000 + i}`,
          latitude: 40.7128 + (i * 0.01),
          longitude: -74.0060 + (i * 0.01)
        },
        availability: {
          monday: { start: '09:00', end: '18:00', available: true },
          tuesday: { start: '09:00', end: '18:00', available: true },
          wednesday: { start: '09:00', end: '18:00', available: true },
          thursday: { start: '09:00', end: '18:00', available: true },
          friday: { start: '09:00', end: '18:00', available: true },
          saturday: { start: '10:00', end: '16:00', available: false },
          sunday: { start: '10:00', end: '16:00', available: false }
        },
        status: i === 4 ? 'pending' : 'active', // Last one pending for testing
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        stats: {
          totalBookings: 0,
          totalRevenue: 0,
          averageRating: 0,
          reviewCount: 0,
          viewCount: 0
        }
      });
      console.log(`   ✅ Created workspace: ${workspace.spaceName}`);
    }

    console.log('\n🎉 Database initialization completed successfully!\n');
    console.log('📊 Summary:');
    console.log('   • Admins: 1');
    console.log('   • Users: 3');
    console.log('   • Providers: 3');
    console.log('   • Workspaces: 5\n');

    console.log('🔑 Login Credentials:\n');
    console.log('Admin Panel:');
    console.log('  Email: admin@masahatak.com');
    console.log('  Password: Admin@123\n');

    console.log('✅ You can now start the backend server with: npm start\n');

    process.exit(0);
  } catch (error) {
    console.log('\n❌ Error:', error.message);
    console.log(error);
    process.exit(1);
  }
}

quickInit();
