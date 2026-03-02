const { db, auth } = require('../config/firebase');

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { email, fullName, phoneNumber, password } = req.body;

    // Validate required fields
    if (!email || !fullName || !phoneNumber || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUsers = await db.collection('users')
      .where('email', '==', email)
      .get();

    if (!existingUsers.empty) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Try to create user in Firebase Auth, but continue if it fails
    let userId;
    try {
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: fullName
      });
      userId = userRecord.uid;
    } catch (authError) {
      // If Firebase Auth fails, create user only in Firestore with generated ID
      console.log('Firebase Auth creation failed, creating Firestore user only:', authError.code);
      const newUserRef = db.collection('users').doc();
      userId = newUserRef.id;
    }

    // Create user document in Firestore
    await db.collection('users').doc(userId).set({
      email,
      fullName,
      phoneNumber,
      status: 'active',
      role: 'user',
      createdAt: new Date(),
      createdBy: req.admin.id
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: userId,
        email,
        fullName,
        phoneNumber,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all users with pagination
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;

    let query = db.collection('users');

    // Apply filters
    if (status !== 'all') {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    let users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Search filter (client-side for now)
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user =>
        user.fullName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = users.slice(startIndex, endIndex);

    res.json({
      success: true,
      users: paginatedUsers,
      pagination: {
        total: users.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(users.length / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const userDoc = await db.collection('users').doc(id).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's bookings
    const bookingsSnapshot = await db.collection('bookings')
      .where('userId', '==', id)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const bookings = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      user: {
        id: userDoc.id,
        ...userDoc.data()
      },
      recentBookings: bookings
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user status (suspend/activate)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    await db.collection('users').doc(id).update({
      status,
      statusReason: reason || '',
      updatedAt: new Date(),
      updatedBy: req.admin.id
    });

    // Also disable/enable Firebase Auth if suspending (only if user exists in Auth)
    try {
      if (status === 'suspended') {
        await auth.updateUser(id, { disabled: true });
      } else if (status === 'active') {
        await auth.updateUser(id, { disabled: false });
      }
    } catch (authError) {
      // User might not exist in Firebase Auth, only in Firestore
      // This is okay, just log it and continue
      console.log('User not found in Firebase Auth, updating Firestore only:', id);
    }

    res.json({
      success: true,
      message: `User ${status === 'suspended' ? 'suspended' : 'activated'} successfully`
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    console.log('Delete user request:', { id, reason, adminId: req.admin.id });

    // Soft delete - mark as deleted
    const updateData = {
      status: 'deleted',
      statusReason: reason || '',
      deletedAt: new Date(),
      deletedBy: req.admin.id
    };

    console.log('Updating user with:', updateData);

    await db.collection('users').doc(id).update(updateData);

    console.log('User deleted successfully:', id);

    // Disable Firebase Auth (only if user exists in Auth)
    try {
      await auth.updateUser(id, { disabled: true });
    } catch (authError) {
      // User might not exist in Firebase Auth, only in Firestore
      // This is okay, just log it and continue
      console.log('User not found in Firebase Auth, updating Firestore only:', id);
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
