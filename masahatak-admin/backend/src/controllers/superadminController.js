const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');

// List all users (super admin view)
exports.listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = db.collection('users');

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(offset)
      .get();

    let users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Client-side search if search term provided
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user =>
        user.fullName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }

    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    // Remove passwords from response
    users = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Suspend user
exports.suspendUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const { reason } = req.body;

    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.collection('users').doc(uid).update({
      status: 'suspended',
      suspendedAt: new Date(),
      suspensionReason: reason,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'User suspended successfully'
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Unsuspend user
exports.unsuspendUser = async (req, res) => {
  try {
    const { uid } = req.params;

    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.collection('users').doc(uid).update({
      status: 'active',
      suspendedAt: null,
      suspensionReason: null,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'User unsuspended successfully'
    });
  } catch (error) {
    console.error('Unsuspend user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new admin
exports.createAdmin = async (req, res) => {
  try {
    const { email, fullName, password, role } = req.body;

    // Check if admin already exists
    const existingAdmin = await db.collection('admins')
      .where('email', '==', email)
      .get();

    if (!existingAdmin.empty) {
      return res.status(400).json({ error: 'Admin with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const adminRef = await db.collection('admins').add({
      email,
      fullName,
      password: hashedPassword,
      role: role || 'admin',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.json({
      success: true,
      adminId: adminRef.id,
      message: 'Admin created successfully'
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove admin
exports.removeAdmin = async (req, res) => {
  try {
    const { uid } = req.params;

    // Prevent removing self
    if (uid === req.admin.id) {
      return res.status(400).json({ error: 'Cannot remove yourself' });
    }

    const adminDoc = await db.collection('admins').doc(uid).get();

    if (!adminDoc.exists) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    await db.collection('admins').doc(uid).delete();

    res.json({
      success: true,
      message: 'Admin removed successfully'
    });
  } catch (error) {
    console.error('Remove admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get audit logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, adminId } = req.query;
    const offset = (page - 1) * limit;

    let query = db.collection('audit_logs');

    if (action) {
      query = query.where('action', '==', action);
    }

    if (adminId) {
      query = query.where('adminId', '==', adminId);
    }

    const snapshot = await query
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit))
      .offset(offset)
      .get();

    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// List all admins
exports.listAdmins = async (req, res) => {
  try {
    const snapshot = await db.collection('admins').orderBy('createdAt', 'desc').get();

    const admins = snapshot.docs.map(doc => {
      const admin = doc.data();
      delete admin.password; // Don't send passwords
      return {
        id: doc.id,
        ...admin
      };
    });

    res.json({
      success: true,
      admins
    });
  } catch (error) {
    console.error('List admins error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const adminDoc = await db.collection('admins').doc(id).get();

    if (!adminDoc.exists) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const admin = adminDoc.data();
    delete admin.password; // Don't send password

    res.json({
      success: true,
      admin: {
        id: adminDoc.id,
        ...admin
      }
    });
  } catch (error) {
    console.error('Get admin by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update admin role
exports.updateAdminRole = async (req, res) => {
  try {
    console.log('=== UPDATE ADMIN ROLE REQUEST ===');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('Current admin:', req.admin);

    const { uid } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['admin', 'super_admin'].includes(role)) {
      console.log('Invalid role provided:', role);
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Prevent changing own role
    if (uid === req.admin.id) {
      console.log('Attempting to change own role - rejected');
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    console.log('Fetching admin document for UID:', uid);
    const adminDoc = await db.collection('admins').doc(uid).get();

    if (!adminDoc.exists) {
      console.log('Admin not found for UID:', uid);
      return res.status(404).json({ error: 'Admin not found' });
    }

    console.log('Current admin data:', adminDoc.data());
    console.log('Updating role to:', role);

    await db.collection('admins').doc(uid).update({
      role,
      updatedAt: new Date()
    });

    console.log('Admin role updated successfully');
    res.json({
      success: true,
      message: 'Admin role updated successfully'
    });
  } catch (error) {
    console.error('Update admin role error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
