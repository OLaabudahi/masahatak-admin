const { db } = require('../config/firebase');

// Get payment details
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const paymentDoc = await db.collection('payments').doc(paymentId).get();

    if (!paymentDoc.exists) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      success: true,
      payment: {
        id: paymentDoc.id,
        ...paymentDoc.data()
      }
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Get booking details
    const bookingDoc = await db.collection('bookings').doc(bookingId).get();

    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingDoc.data();

    // Create payment intent record
    const paymentRef = await db.collection('payments').add({
      bookingId,
      userId: booking.userId,
      providerId: booking.providerId,
      amount: booking.totalPrice,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.json({
      success: true,
      paymentId: paymentRef.id,
      message: 'Payment intent created successfully'
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Payment webhook (for payment provider callbacks)
exports.paymentWebhook = async (req, res) => {
  try {
    const { provider } = req.params;
    const webhookData = req.body;

    // Log webhook data
    await db.collection('payment_webhooks').add({
      provider,
      data: webhookData,
      receivedAt: new Date()
    });

    // Process webhook based on provider
    // This is a placeholder - implement actual webhook processing based on your payment provider

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// List all payments (admin)
exports.listPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = db.collection('payments');

    if (status) {
      query = query.where('status', '==', status);
    }

    // Get all documents without orderBy to avoid index requirement
    const snapshot = await query.get();

    // Convert to array and sort in memory
    let payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort by createdAt in descending order
    payments.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    // Apply pagination in memory
    const total = payments.length;
    const startIndex = offset;
    const endIndex = startIndex + parseInt(limit);
    const paginatedPayments = payments.slice(startIndex, endIndex);

    res.json({
      success: true,
      payments: paginatedPayments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('List payments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
