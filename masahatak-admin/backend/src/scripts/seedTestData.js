require('dotenv').config();
const { db } = require('../config/firebase');

// Sample data generators
const generateBookings = async (users, workspaces) => {
  const bookingStatuses = ['confirmed', 'completed', 'cancelled', 'pending'];
  const bookings = [];

  for (let i = 0; i < 20; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const workspace = workspaces[Math.floor(Math.random() * workspaces.length)];
    const status = bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 60) - 30); // Random date +/- 30 days
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + Math.floor(Math.random() * 8) + 1); // 1-8 hours duration

    const hours = (endDate - startDate) / (1000 * 60 * 60);
    const totalAmount = hours * (workspace.pricePerHour || 50);

    const booking = {
      userId: user.id,
      workspaceId: workspace.id,
      status,
      startDate,
      endDate,
      hours,
      totalAmount,
      numberOfPeople: Math.floor(Math.random() * 10) + 1,
      purpose: ['Meeting', 'Workshop', 'Training', 'Event', 'Conference'][Math.floor(Math.random() * 5)],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
      updatedAt: new Date()
    };

    if (status === 'cancelled') {
      booking.cancellationReason = 'User requested cancellation';
      booking.cancelledAt = new Date();
    }

    bookings.push(booking);
  }

  return bookings;
};

const generatePayments = async (bookings) => {
  const paymentStatuses = ['completed', 'pending', 'failed', 'refunded'];
  const paymentMethods = ['credit_card', 'debit_card', 'paypal', 'stripe'];
  const payments = [];

  for (const booking of bookings) {
    // Only create payments for confirmed or completed bookings
    if (booking.status === 'confirmed' || booking.status === 'completed' || booking.status === 'cancelled') {
      const status = booking.status === 'cancelled' ? 'refunded' :
                     paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];

      const payment = {
        bookingId: booking.id,
        userId: booking.userId,
        amount: booking.totalAmount,
        status,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`,
        createdAt: booking.createdAt,
        updatedAt: new Date()
      };

      if (status === 'completed') {
        payment.paidAt = new Date(booking.createdAt.getTime() + 1000 * 60 * 5); // Paid 5 min after booking
      }

      if (status === 'refunded') {
        payment.refundedAt = booking.cancelledAt || new Date();
        payment.refundAmount = booking.totalAmount;
      }

      payments.push(payment);
    }
  }

  return payments;
};

const generateReviews = async (users, workspaces, bookings) => {
  const reviews = [];
  const reviewComments = [
    'Great workspace! Very comfortable and well-equipped.',
    'Perfect location and amenities. Highly recommend!',
    'Good value for money. Will book again.',
    'Clean and professional environment.',
    'The workspace exceeded my expectations.',
    'Average experience. Could be better.',
    'Excellent facilities and friendly staff.',
    'Very satisfied with the booking.',
    'Nice space but a bit noisy.',
    'Wonderful atmosphere for productive work.'
  ];

  // Only create reviews for completed bookings
  const completedBookings = bookings.filter(b => b.status === 'completed');

  for (let i = 0; i < Math.min(15, completedBookings.length); i++) {
    const booking = completedBookings[i];
    const rating = Math.floor(Math.random() * 3) + 3; // 3-5 stars

    const review = {
      userId: booking.userId,
      workspaceId: booking.workspaceId,
      bookingId: booking.id,
      rating,
      comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
      createdAt: new Date(booking.endDate.getTime() + 1000 * 60 * 60 * 24), // 1 day after booking end
      updatedAt: new Date()
    };

    reviews.push(review);
  }

  return reviews;
};

const generateNotifications = async (users, admins) => {
  const notifications = [];
  const notificationTypes = [
    { type: 'booking_confirmed', title: 'Booking Confirmed', message: 'Your booking has been confirmed' },
    { type: 'booking_cancelled', title: 'Booking Cancelled', message: 'A booking has been cancelled' },
    { type: 'payment_received', title: 'Payment Received', message: 'Payment has been received successfully' },
    { type: 'new_review', title: 'New Review', message: 'A new review has been posted' },
    { type: 'workspace_approved', title: 'Workspace Approved', message: 'Your workspace has been approved' },
    { type: 'new_user', title: 'New User', message: 'A new user has registered' }
  ];

  // Generate notifications for each user
  for (const user of users.slice(0, 5)) {
    for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
      const notif = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];

      notifications.push({
        userId: user.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        read: Math.random() > 0.5,
        createdAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000), // Random date in last 15 days
        updatedAt: new Date()
      });
    }
  }

  // Generate admin notifications
  for (const admin of admins.slice(0, 2)) {
    for (let i = 0; i < Math.floor(Math.random() * 5) + 2; i++) {
      const notif = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];

      notifications.push({
        adminId: admin.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        read: Math.random() > 0.3,
        createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000), // Random date in last 10 days
        updatedAt: new Date()
      });
    }
  }

  return notifications;
};

// Main seed function
const seedTestData = async () => {
  try {
    console.log('🌱 Starting to seed test data...\n');

    // Fetch existing users, workspaces, and admins
    console.log('📥 Fetching existing data...');
    const [usersSnapshot, workspacesSnapshot, adminsSnapshot] = await Promise.all([
      db.collection('users').where('status', '==', 'active').limit(10).get(),
      db.collection('workspaces').where('status', '==', 'active').limit(10).get(),
      db.collection('admins').limit(5).get()
    ]);

    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const workspaces = workspacesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const admins = adminsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (users.length === 0 || workspaces.length === 0) {
      console.error('❌ Need at least some users and workspaces to generate test data');
      console.log('Please ensure you have users and workspaces in your database first.');
      return;
    }

    console.log(`✅ Found ${users.length} users, ${workspaces.length} workspaces, ${admins.length} admins\n`);

    // Generate bookings
    console.log('📝 Generating bookings...');
    const bookingsData = await generateBookings(users, workspaces);
    const bookingRefs = [];

    for (const booking of bookingsData) {
      const ref = await db.collection('bookings').add(booking);
      bookingRefs.push({ id: ref.id, ...booking });
    }
    console.log(`✅ Created ${bookingRefs.length} bookings\n`);

    // Generate payments
    console.log('💳 Generating payments...');
    const paymentsData = await generatePayments(bookingRefs);

    for (const payment of paymentsData) {
      await db.collection('payments').add(payment);
    }
    console.log(`✅ Created ${paymentsData.length} payments\n`);

    // Generate reviews
    console.log('⭐ Generating reviews...');
    const reviewsData = await generateReviews(users, workspaces, bookingRefs);

    for (const review of reviewsData) {
      await db.collection('reviews').add(review);
    }
    console.log(`✅ Created ${reviewsData.length} reviews\n`);

    // Generate notifications
    console.log('🔔 Generating notifications...');
    const notificationsData = await generateNotifications(users, admins);

    for (const notification of notificationsData) {
      await db.collection('notifications').add(notification);
    }
    console.log(`✅ Created ${notificationsData.length} notifications\n`);

    console.log('🎉 Test data seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`- Bookings: ${bookingRefs.length}`);
    console.log(`- Payments: ${paymentsData.length}`);
    console.log(`- Reviews: ${reviewsData.length}`);
    console.log(`- Notifications: ${notificationsData.length}`);

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  } finally {
    process.exit(0);
  }
};

// Run the seed function
seedTestData();
