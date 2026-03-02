require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');

// Configuration - Change these values
const ADMIN_EMAIL = 'adasminttt@masahatak.com';
const NEW_PASSWORD = 'admin123';

async function resetAdminPassword() {
  console.log('🔄 Resetting admin password...\n');

  try {
    // Find admin by email
    const adminsRef = db.collection('admins');
    const snapshot = await adminsRef.where('email', '==', ADMIN_EMAIL).get();

    if (snapshot.empty) {
      console.log(`❌ No admin found with email: ${ADMIN_EMAIL}`);
      console.log('\nCreating new admin account instead...\n');

      // Create new admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);

      const newAdmin = {
        email: ADMIN_EMAIL,
        password: hashedPassword,
        fullName: 'Admin',
        role: 'super_admin',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await db.collection('admins').add(newAdmin);

      console.log('✅ New admin account created successfully!');
      console.log('Admin ID:', docRef.id);
      console.log('Email:', ADMIN_EMAIL);
      console.log('Password:', NEW_PASSWORD);
      console.log('\n⚠️  Please change this password after first login!');

      process.exit(0);
      return;
    }

    const adminDoc = snapshot.docs[0];
    const adminData = adminDoc.data();

    console.log('Found admin:');
    console.log('ID:', adminDoc.id);
    console.log('Email:', adminData.email);
    console.log('Name:', adminData.fullName);
    console.log('Role:', adminData.role);
    console.log('\nResetting password...\n');

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);

    // Update password
    await db.collection('admins').doc(adminDoc.id).update({
      password: hashedPassword,
      updatedAt: new Date()
    });

    console.log('✅ Password reset successfully!');
    console.log('\nNew login credentials:');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', NEW_PASSWORD);
    console.log('\n⚠️  Please change this password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();
