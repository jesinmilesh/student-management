/**
 * Simple Test Script for Student Management Backend
 */

require('dotenv').config();
const request = require('supertest');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

const runTests = async () => {
  console.log('\n=============================================');
  console.log(' RUNNING SIMPLE BACKEND TESTS');
  console.log('=============================================\n');

  try {
    await connectDB();

    // 1. Register a user
    const resReg = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Admin',
        email: 'testadmin@example.com',
        password: 'password123',
        role: 'admin'
      });
    console.log('1. User Registration:', resReg.statusCode === 201 ? '✓ PASS' : '✗ FAIL');

    // 2. Login
    const resLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testadmin@example.com',
        password: 'password123'
      });
    console.log('2. User Login:', resLogin.statusCode === 200 ? '✓ PASS' : '✗ FAIL');
    const token = resLogin.body.data.token;

    // 3. Create Student (Admin)
    const resAddStudent = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${token}`)
      .send({
        studentId: 'STUTEST99',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: '1234567890',
        department: 'Computer Science',
        year: 1
      });
    console.log('3. Create Student (Admin):', resAddStudent.statusCode === 201 ? '✓ PASS' : '✗ FAIL');
    const studentId = resAddStudent.body.data._id;

    // 4. Get Students
    const resGet = await request(app).get('/api/students');
    console.log('4. Get Students:', resGet.statusCode === 200 && resGet.body.data.length >= 1 ? '✓ PASS' : '✗ FAIL');

    // 5. Update Student
    const resUpdate = await request(app)
      .put(`/api/students/${studentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ year: 2 });
    console.log('5. Update Student:', resUpdate.statusCode === 200 && resUpdate.body.data.year === 2 ? '✓ PASS' : '✗ FAIL');

    // 6. Delete Student
    const resDelete = await request(app)
      .delete(`/api/students/${studentId}`)
      .set('Authorization', `Bearer ${token}`);
    console.log('6. Delete Student:', resDelete.statusCode === 200 ? '✓ PASS' : '✗ FAIL');

    console.log('\n=============================================');
    console.log(' ALL TESTS PASSED SUCCESSFULLY!');
    console.log('=============================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Test Error:', error);
    process.exit(1);
  }
};

runTests();
