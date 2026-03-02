require('dotenv').config();
const { db } = require('../config/firebase');

async function addTestData() {
  try {
    console.log('Starting to add test data...');

    // Create test users
    const testUsers = [
      {
        fullName: 'Ahmed Mohamed',
        email: 'ahmed.mohamed@example.com',
        phone: '+201234567890',
        status: 'active',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        fullName: 'Sara Ali',
        email: 'sara.ali@example.com',
        phone: '+201234567891',
        status: 'active',
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10')
      },
      {
        fullName: 'Omar Hassan',
        email: 'omar.hassan@example.com',
        phone: '+201234567892',
        status: 'active',
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date('2024-03-05')
      }
    ];

    const userIds = [];
    for (const user of testUsers) {
      const userRef = await db.collection('users').add(user);
      userIds.push(userRef.id);
      console.log(`Created user: ${user.fullName} (ID: ${userRef.id})`);
    }

    // Create test workspaces
    const testWorkspaces = [
      {
        spaceName: 'Downtown Creative Hub',
        description: 'Modern coworking space in the heart of downtown',
        location: 'Cairo, Egypt',
        address: '123 Tahrir Street, Cairo',
        spaceType: 'Coworking Space',
        capacity: 20,
        pricePerHour: 50,
        amenities: ['WiFi', 'Coffee', 'Printing', 'Meeting Rooms', 'Parking'],
        status: 'active',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      },
      {
        spaceName: 'Tech Valley Office',
        description: 'Premium office space for tech startups',
        location: 'New Cairo, Egypt',
        address: '456 Innovation Street, New Cairo',
        spaceType: 'Private Office',
        capacity: 10,
        pricePerHour: 100,
        amenities: ['WiFi', 'Conference Room', 'Kitchen', 'Air Conditioning'],
        status: 'active',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      },
      {
        spaceName: 'Meeting Room Plus',
        description: 'Professional meeting rooms for rent',
        location: 'Alexandria, Egypt',
        address: '789 Corniche Road, Alexandria',
        spaceType: 'Meeting Room',
        capacity: 8,
        pricePerHour: 75,
        amenities: ['Projector', 'Whiteboard', 'Video Conferencing', 'WiFi'],
        status: 'active',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01')
      }
    ];

    const workspaceIds = [];
    for (const workspace of testWorkspaces) {
      const workspaceRef = await db.collection('workspaces').add(workspace);
      workspaceIds.push(workspaceRef.id);
      console.log(`Created workspace: ${workspace.spaceName} (ID: ${workspaceRef.id})`);
    }

    // Create test bookings
    const testBookings = [
      {
        userId: userIds[0],
        workspaceId: workspaceIds[0],
        startDate: new Date('2025-01-10T09:00:00'),
        endDate: new Date('2025-01-10T17:00:00'),
        hours: 8,
        totalPrice: 400,
        status: 'confirmed',
        createdAt: new Date('2025-01-05'),
        updatedAt: new Date('2025-01-05')
      },
      {
        userId: userIds[1],
        workspaceId: workspaceIds[1],
        startDate: new Date('2025-01-15T10:00:00'),
        endDate: new Date('2025-01-15T14:00:00'),
        hours: 4,
        totalPrice: 400,
        status: 'confirmed',
        createdAt: new Date('2025-01-08'),
        updatedAt: new Date('2025-01-08')
      },
      {
        userId: userIds[2],
        workspaceId: workspaceIds[2],
        startDate: new Date('2025-01-20T13:00:00'),
        endDate: new Date('2025-01-20T16:00:00'),
        hours: 3,
        totalPrice: 225,
        status: 'pending',
        createdAt: new Date('2025-01-18'),
        updatedAt: new Date('2025-01-18')
      },
      {
        userId: userIds[0],
        workspaceId: workspaceIds[1],
        startDate: new Date('2024-12-20T09:00:00'),
        endDate: new Date('2024-12-20T18:00:00'),
        hours: 9,
        totalPrice: 900,
        status: 'completed',
        createdAt: new Date('2024-12-15'),
        updatedAt: new Date('2024-12-20')
      },
      {
        userId: userIds[1],
        workspaceId: workspaceIds[0],
        startDate: new Date('2024-12-25T10:00:00'),
        endDate: new Date('2024-12-25T15:00:00'),
        hours: 5,
        totalPrice: 250,
        status: 'cancelled',
        cancellationReason: 'User requested cancellation',
        createdAt: new Date('2024-12-20'),
        updatedAt: new Date('2024-12-23')
      }
    ];

    const bookingIds = [];
    for (const booking of testBookings) {
      const bookingRef = await db.collection('bookings').add(booking);
      bookingIds.push(bookingRef.id);
      console.log(`Created booking for user ${booking.userId} (ID: ${bookingRef.id})`);
    }

    // Create test payments
    const testPayments = [
      {
        bookingId: bookingIds[0],
        userId: userIds[0],
        amount: 400,
        currency: 'EGP',
        status: 'completed',
        paymentMethod: 'credit_card',
        transactionId: 'TXN_001_2025',
        createdAt: new Date('2025-01-05'),
        updatedAt: new Date('2025-01-05'),
        completedAt: new Date('2025-01-05')
      },
      {
        bookingId: bookingIds[1],
        userId: userIds[1],
        amount: 400,
        currency: 'EGP',
        status: 'completed',
        paymentMethod: 'debit_card',
        transactionId: 'TXN_002_2025',
        createdAt: new Date('2025-01-08'),
        updatedAt: new Date('2025-01-08'),
        completedAt: new Date('2025-01-08')
      },
      {
        bookingId: bookingIds[2],
        userId: userIds[2],
        amount: 225,
        currency: 'EGP',
        status: 'pending',
        paymentMethod: 'cash',
        createdAt: new Date('2025-01-18'),
        updatedAt: new Date('2025-01-18')
      },
      {
        bookingId: bookingIds[3],
        userId: userIds[0],
        amount: 900,
        currency: 'EGP',
        status: 'completed',
        paymentMethod: 'credit_card',
        transactionId: 'TXN_003_2024',
        createdAt: new Date('2024-12-15'),
        updatedAt: new Date('2024-12-15'),
        completedAt: new Date('2024-12-15')
      },
      {
        bookingId: bookingIds[4],
        userId: userIds[1],
        amount: 250,
        currency: 'EGP',
        status: 'refunded',
        paymentMethod: 'credit_card',
        transactionId: 'TXN_004_2024',
        refundTransactionId: 'REFUND_001_2024',
        createdAt: new Date('2024-12-20'),
        updatedAt: new Date('2024-12-23'),
        refundedAt: new Date('2024-12-23')
      }
    ];

    for (const payment of testPayments) {
      const paymentRef = await db.collection('payments').add(payment);
      console.log(`Created payment for booking ${payment.bookingId} (ID: ${paymentRef.id})`);
    }

    // Create test reviews
    const testReviews = [
      {
        userId: userIds[0],
        workspaceId: workspaceIds[0],
        bookingId: bookingIds[0],
        rating: 5,
        comment: 'Excellent workspace! Very clean and professional environment. The WiFi is super fast and the staff is very helpful.',
        status: 'approved',
        createdAt: new Date('2025-01-06'),
        updatedAt: new Date('2025-01-06')
      },
      {
        userId: userIds[1],
        workspaceId: workspaceIds[1],
        bookingId: bookingIds[1],
        rating: 4,
        comment: 'Great office space with modern amenities. A bit pricey but worth it for the quality.',
        status: 'approved',
        createdAt: new Date('2025-01-09'),
        updatedAt: new Date('2025-01-09')
      },
      {
        userId: userIds[0],
        workspaceId: workspaceIds[1],
        bookingId: bookingIds[3],
        rating: 5,
        comment: 'Perfect for our team meetings. The location is convenient and the facilities are top-notch.',
        status: 'approved',
        createdAt: new Date('2024-12-21'),
        updatedAt: new Date('2024-12-21')
      },
      {
        userId: userIds[2],
        workspaceId: workspaceIds[2],
        rating: 3,
        comment: 'Decent meeting room but could use better air conditioning. Otherwise it was fine.',
        status: 'pending',
        createdAt: new Date('2025-01-19'),
        updatedAt: new Date('2025-01-19')
      },
      {
        userId: userIds[1],
        workspaceId: workspaceIds[0],
        rating: 2,
        comment: 'Very disappointed. The space was not as clean as advertised and the WiFi kept disconnecting.',
        status: 'flagged',
        flagged: true,
        flagReason: 'Review under investigation',
        createdAt: new Date('2024-12-26'),
        updatedAt: new Date('2024-12-27')
      }
    ];

    for (const review of testReviews) {
      const reviewRef = await db.collection('reviews').add(review);
      console.log(`Created review by user ${review.userId} (ID: ${reviewRef.id})`);
    }

    console.log('\n✅ Test data added successfully!');
    console.log(`Created ${userIds.length} users`);
    console.log(`Created ${workspaceIds.length} workspaces`);
    console.log(`Created ${bookingIds.length} bookings`);
    console.log(`Created ${testPayments.length} payments`);
    console.log(`Created ${testReviews.length} reviews`);

  } catch (error) {
    console.error('Error adding test data:', error);
  }
}

addTestData();
