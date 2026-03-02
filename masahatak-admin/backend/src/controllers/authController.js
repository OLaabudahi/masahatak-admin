const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

// Admin login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const adminsRef = db.collection('admins');
    const snapshot = await adminsRef.where('email', '==', email).get();

    if (snapshot.empty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const adminDoc = snapshot.docs[0];
    const adminData = adminDoc.data();

    // Verify password
    const isMatch = await bcrypt.compare(password, adminData.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: adminDoc.id, email: adminData.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: adminDoc.id,
        email: adminData.email,
        fullName: adminData.fullName,
        role: adminData.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Get current admin profile
exports.getProfile = async (req, res) => {
  try {
    const adminDoc = await db.collection('admins').doc(req.admin.id).get();

    if (!adminDoc.exists) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const adminData = adminDoc.data();
    delete adminData.password; // Don't send password

    res.json({
      success: true,
      admin: {
        id: adminDoc.id,
        ...adminData
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update current admin profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    const adminId = req.admin.id;

    // Check if email is being changed and if it's already in use
    if (email) {
      const adminsRef = db.collection('admins');
      const emailSnapshot = await adminsRef.where('email', '==', email).get();

      if (!emailSnapshot.empty && emailSnapshot.docs[0].id !== adminId) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Update admin profile
    const updateData = {
      updatedAt: new Date()
    };

    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;

    await db.collection('admins').doc(adminId).update(updateData);

    // Get updated admin data
    const adminDoc = await db.collection('admins').doc(adminId).get();
    const adminData = adminDoc.data();
    delete adminData.password;

    // Update localStorage adminData
    const updatedAdmin = {
      id: adminDoc.id,
      email: adminData.email,
      fullName: adminData.fullName,
      role: adminData.role
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      admin: {
        id: adminDoc.id,
        ...adminData
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Change admin password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get admin document
    const adminDoc = await db.collection('admins').doc(adminId).get();

    if (!adminDoc.exists) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const adminData = adminDoc.data();

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, adminData.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.collection('admins').doc(adminId).update({
      password: hashedPassword,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
