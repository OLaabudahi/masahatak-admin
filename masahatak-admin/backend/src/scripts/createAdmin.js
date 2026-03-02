require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');

const createAdmin = async () => {
  try {
    const email = 'admin@masahatak.com';
    const password = 'admin123';
    const fullName = 'System Administrator';

    const existingAdmin = await db.collection('admins')
      .where('email', '==', email)
      .get();

    if (!existingAdmin.empty) {
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminData = {
      email,
      password: hashedPassword,
      fullName,
      role: 'super_admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    await db.collection('admins').add(adminData);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();
