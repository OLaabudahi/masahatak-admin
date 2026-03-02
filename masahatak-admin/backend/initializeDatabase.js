// Database Initialization Script for Masahatak
// This script creates the database structure and adds sample data

require('dotenv').config();
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');

console.log('🔧 Initializing Masahatak Database...\n');

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
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

// Sample data
const sampleData = {
  admins: [
    {
      email: 'admin@masahatak.com',
      fullName: 'Admin User',
      password: 'Admin@123',
      role: 'admin'
    }
  ],

  users: [
    {
      email: 'john.doe@example.com',
      fullName: 'John Doe',
      phoneNumber: '+1234567890',
      status: 'active'
    },
    {
      email: 'jane.smith@example.com',
      fullName: 'Jane Smith',
      phoneNumber: '+1234567891',
      status: 'active'
    },
    {
      email: 'bob.wilson@example.com',
      fullName: 'Bob Wilson',
      phoneNumber: '+1234567892',
      status: 'active'
    }
  ],

  providers: [
    {
      email: 'provider1@masahatak.com',
      businessName: 'Modern Workspace Co.',
      ownerName: 'Sarah Johnson',
      phoneNumber: '+1234567893',
      address: {
        street: '123 Business Ave',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001'
      },
      status: 'active'
    },
    {
      email: 'provider2@masahatak.com',
      businessName: 'Creative Hub Spaces',
      ownerName: 'Michael Chen',
      phoneNumber: '+1234567894',
      address: {
        street: '456 Innovation Blvd',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zipCode: '94102'
      },
      status: 'active'
    },
    {
      email: 'provider3@masahatak.com',
      businessName: 'Tech Haven',
      ownerName: 'Emily Rodriguez',
      phoneNumber: '+1234567895',
      address: {
        street: '789 Startup Lane',
        city: 'Austin',
        state: 'TX',
        country: 'USA',
        zipCode: '73301'
      },
      status: 'pending'
    }
  ],

  workspaces: [
    {
      spaceName: 'Modern Conference Room A',
      description: 'A spacious modern conference room perfect for team meetings and presentations.',
      spaceType: 'meeting_room',
      capacity: 12,
      pricePerHour: 50,
      pricePerDay: 300,
      amenities: ['WiFi', 'Projector', 'Whiteboard', 'Coffee', 'AC'],
      status: 'active'
    },
    {
      spaceName: 'Creative Studio Space',
      description: 'Bright and inspiring studio space ideal for creative work and brainstorming sessions.',
      spaceType: 'office',
      capacity: 8,
      pricePerHour: 40,
      pricePerDay: 250,
      amenities: ['WiFi', 'Natural Light', 'Coffee', 'Parking'],
      status: 'active'
    },
    {
      spaceName: 'Executive Office Suite',
      description: 'Premium private office space with city views, perfect for focused work.',
      spaceType: 'office',
      capacity: 4,
      pricePerHour: 60,
      pricePerDay: 400,
      pricePerMonth: 8000,
      amenities: ['WiFi', 'Private Bathroom', 'Coffee', 'Parking', 'AC', 'Reception'],
      status: 'active'
    },
    {
      spaceName: 'Collaborative Desk Space',
      description: 'Open desk space in a vibrant coworking environment.',
      spaceType: 'desk',
      capacity: 1,
      pricePerHour: 15,
      pricePerDay: 80,
      pricePerMonth: 1500,
      amenities: ['WiFi', 'Coffee', 'Community Events'],
      status: 'active'
    },
    {
      spaceName: 'Event Hall',
      description: 'Large event space perfect for workshops, seminars, and corporate events.',
      spaceType: 'event_space',
      capacity: 50,
      pricePerHour: 150,
      pricePerDay: 1200,
      amenities: ['WiFi', 'Sound System', 'Projector', 'Stage', 'Catering Kitchen', 'Parking'],
      status: 'pending'
    }
  ]
};

async function initializeDatabase() {
  try {
    console.log('📋 Starting database initialization...\n');

    // 1. Create Admins
    console.log('👤 Creating admin accounts...');
    for (const adminData of sampleData.admins) {
      // Check if already exists
      const existingAdmin = await db.collection('admins')
        .where('email', '==', adminData.email)
        .limit(1)
        .get();

      if (!existingAdmin.empty) {
        console.log(`   ⏭️  Admin ${adminData.email} already exists, skipping...`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      await db.collection('admins').add({
        email: adminData.email,
        fullName: adminData.fullName,
        password: hashedPassword,
        role: adminData.role,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`   ✅ Created admin: ${adminData.email}`);
    }

    // 2. Create Users with Firebase Auth
    console.log('\n👥 Creating user accounts...');
    const userIds = [];
    for (const userData of sampleData.users) {
      try {
        // Create Firebase Auth user
        let userRecord;
        try {
          userRecord = await auth.getUserByEmail(userData.email);
          console.log(`   ⏭️  User ${userData.email} already exists in Auth, using existing...`);
        } catch (error) {
          userRecord = await auth.createUser({
            email: userData.email,
            password: 'User@123',
            displayName: userData.fullName
          });
          console.log(`   ✅ Created Auth user: ${userData.email}`);
        }

        // Create Firestore user document
        const existingUser = await db.collection('users').doc(userRecord.uid).get();
        if (!existingUser.exists) {
          await db.collection('users').doc(userRecord.uid).set({
            email: userData.email,
            fullName: userData.fullName,
            phoneNumber: userData.phoneNumber,
            status: userData.status,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            stats: {
              totalBookings: 0,
              completedBookings: 0,
              cancelledBookings: 0,
              totalSpent: 0
            }
          });
          console.log(`   ✅ Created Firestore user: ${userData.email}`);
        }

        userIds.push(userRecord.uid);
      } catch (error) {
        console.log(`   ❌ Error creating user ${userData.email}:`, error.message);
      }
    }

    // 3. Create Providers with Firebase Auth
    console.log('\n🏢 Creating provider accounts...');
    const providerIds = [];
    for (const providerData of sampleData.providers) {
      try {
        // Create Firebase Auth provider
        let providerRecord;
        try {
          providerRecord = await auth.getUserByEmail(providerData.email);
          console.log(`   ⏭️  Provider ${providerData.email} already exists in Auth, using existing...`);
        } catch (error) {
          providerRecord = await auth.createUser({
            email: providerData.email,
            password: 'Provider@123',
            displayName: providerData.businessName
          });
          console.log(`   ✅ Created Auth provider: ${providerData.email}`);
        }

        // Create Firestore provider document
        const existingProvider = await db.collection('providers').doc(providerRecord.uid).get();
        if (!existingProvider.exists) {
          await db.collection('providers').doc(providerRecord.uid).set({
            email: providerData.email,
            businessName: providerData.businessName,
            ownerName: providerData.ownerName,
            phoneNumber: providerData.phoneNumber,
            address: providerData.address,
            status: providerData.status,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            stats: {
              totalWorkspaces: 0,
              activeWorkspaces: 0,
              totalBookings: 0,
              totalRevenue: 0,
              averageRating: 0
            }
          });
          console.log(`   ✅ Created Firestore provider: ${providerData.businessName}`);
        }

        providerIds.push({ id: providerRecord.uid, status: providerData.status });
      } catch (error) {
        console.log(`   ❌ Error creating provider ${providerData.email}:`, error.message);
      }
    }

    // 4. Create Workspaces
    console.log('\n🏢 Creating workspace listings...');
    const workspaceIds = [];
    for (let i = 0; i < sampleData.workspaces.length; i++) {
      const workspaceData = sampleData.workspaces[i];
      const provider = providerIds[i % providerIds.length]; // Distribute workspaces among providers

      const cities = ['New York', 'San Francisco', 'Austin', 'Boston', 'Seattle'];
      const city = cities[i % cities.length];

      const workspaceRef = await db.collection('workspaces').add({
        ownerId: provider.id,
        spaceName: workspaceData.spaceName,
        description: workspaceData.description,
        spaceType: workspaceData.spaceType,
        capacity: workspaceData.capacity,
        pricePerHour: workspaceData.pricePerHour,
        pricePerDay: workspaceData.pricePerDay,
        pricePerMonth: workspaceData.pricePerMonth || null,
        amenities: workspaceData.amenities,
        location: {
          address: `${100 + i} Main St`,
          city: city,
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
        rules: ['No smoking', 'No pets'],
        status: workspaceData.status,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        stats: {
          totalBookings: 0,
          totalRevenue: 0,
          averageRating: 0,
          reviewCount: 0,
          viewCount: 0
        }
      });

      workspaceIds.push({ id: workspaceRef.id, pricePerHour: workspaceData.pricePerHour, providerId: provider.id });
      console.log(`   ✅ Created workspace: ${workspaceData.spaceName}`);
    }

    // 5. Create Sample Bookings
    console.log('\n📅 Creating sample bookings...');
    const statuses = ['confirmed', 'completed', 'pending'];
    for (let i = 0; i < 10; i++) {
      const user = userIds[i % userIds.length];
      const workspace = workspaceIds[i % workspaceIds.length];
      const status = statuses[i % statuses.length];

      const startDate = new Date();
      startDate.setDate(startDate.getDate() + i - 5); // Some past, some future
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 4); // 4 hour booking

      const duration = 4;
      const totalAmount = workspace.pricePerHour * duration;
      const platformFee = totalAmount * 0.1;
      const providerAmount = totalAmount - platformFee;

      await db.collection('bookings').add({
        userId: user,
        workspaceId: workspace.id,
        providerId: workspace.providerId,
        startDate: admin.firestore.Timestamp.fromDate(startDate),
        endDate: admin.firestore.Timestamp.fromDate(endDate),
        duration: duration,
        pricePerHour: workspace.pricePerHour,
        totalAmount: totalAmount,
        platformFee: platformFee,
        providerAmount: providerAmount,
        paymentPlan: 'hourly',
        status: status,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`   ✅ Created booking ${i + 1}/10 (${status})`);
    }

    // 6. Create Sample Reviews
    console.log('\n⭐ Creating sample reviews...');
    const reviewComments = [
      'Great space! Very clean and well-maintained.',
      'Perfect for our team meeting. Highly recommend!',
      'Good value for money. Would book again.',
      'Excellent amenities and friendly staff.',
      'Nice location, easy to access.'
    ];

    for (let i = 0; i < 5; i++) {
      const user = userIds[i % userIds.length];
      const workspace = workspaceIds[i % workspaceIds.length];

      await db.collection('reviews').add({
        userId: user,
        workspaceId: workspace.id,
        bookingId: 'booking_' + i, // Placeholder
        rating: 4 + (i % 2), // 4 or 5 stars
        comment: reviewComments[i],
        flagged: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`   ✅ Created review ${i + 1}/5`);
    }

    console.log('\n🎉 Database initialization completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • Admins: ${sampleData.admins.length}`);
    console.log(`   • Users: ${sampleData.users.length}`);
    console.log(`   • Providers: ${sampleData.providers.length}`);
    console.log(`   • Workspaces: ${sampleData.workspaces.length}`);
    console.log(`   • Bookings: 10`);
    console.log(`   • Reviews: 5\n`);

    console.log('🔑 Login Credentials:\n');
    console.log('Admin Panel:');
    console.log('  Email: admin@masahatak.com');
    console.log('  Password: Admin@123\n');
    console.log('Sample Users (password for all: User@123):');
    sampleData.users.forEach(user => console.log(`  - ${user.email}`));
    console.log('\nSample Providers (password for all: Provider@123):');
    sampleData.providers.forEach(provider => console.log(`  - ${provider.email}`));
    console.log('');

    process.exit(0);
  } catch (error) {
    console.log('\n❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();
