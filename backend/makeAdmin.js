require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/studyhub');
    
    // Update all users to be admins for convenience, or you could filter by email
    const result = await User.updateMany({}, { $set: { role: 'admin' } });
    
    console.log(`Successfully updated ${result.modifiedCount} user(s) to admin role.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating user:', error);
    process.exit(1);
  }
}

makeAdmin();
