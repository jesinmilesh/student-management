/**
 * Database Seed Script for Student Management System
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Student = require('./models/Student');

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Refreshing demo student data...');
    await Student.deleteMany({});
    await User.deleteMany({ email: { $in: ['admin@example.com', 'user@example.com'] } });

    console.log('[Seed] Creating demo accounts...');
    await User.create([
      {
        name: 'Administrator',
        email: 'admin@example.com',
        password: 'Password@123',
        role: 'admin'
      },
      {
        name: 'Regular User',
        email: 'user@example.com',
        password: 'Password@123',
        role: 'user'
      }
    ]);

    console.log('[Seed] Creating sample students...');
    await Student.create([
      {
        studentId: 'STU101',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0101',
        department: 'Computer Science',
        year: 3
      },
      {
        studentId: 'STU102',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0102',
        department: 'Information Technology',
        year: 2
      },
      {
        studentId: 'STU103',
        name: 'Michael Brown',
        email: 'michael.b@example.com',
        phone: '+1-555-0103',
        department: 'Electronics',
        year: 4
      },
      {
        studentId: 'STU104',
        name: 'Emily Davis',
        email: 'emily.d@example.com',
        phone: '+1-555-0104',
        department: 'Mechanical',
        year: 1
      },
      {
        studentId: 'STU105',
        name: 'David Wilson',
        email: 'david.w@example.com',
        phone: '+1-555-0105',
        department: 'Civil',
        year: 3
      }
    ]);

    console.log('=============================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY!');
    console.log(' Demo Accounts:');
    console.log('   Admin: admin@example.com | Pass: Password@123 (or admin123)');
    console.log('   User:  user@example.com  | Pass: Password@123 (or user123)');
    console.log('=============================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
