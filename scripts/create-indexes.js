/**
 * Script to create MongoDB indexes for better performance
 * Run with: node scripts/create-indexes.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Define indexes
const createIndexes = async () => {
  try {
    console.log('Creating indexes...');
    
    // User indexes
    const User = mongoose.connection.collection('users');
    await User.createIndex({ email: 1 }, { unique: true });
    await User.createIndex({ username: 1 }, { unique: true });
    await User.createIndex({ role: 1 });
    await User.createIndex({ 'resetPassword.token': 1 });
    console.log('✅ User indexes created');
    
    // Question indexes
    const Question = mongoose.connection.collection('questions');
    await Question.createIndex({ category: 1 });
    await Question.createIndex({ subcategory: 1 });
    await Question.createIndex({ difficulty: 1 });
    await Question.createIndex({ tags: 1 });
    await Question.createIndex({ category: 1, subcategory: 1, difficulty: 1 });
    console.log('✅ Question indexes created');
    
    // Exam indexes
    const Exam = mongoose.connection.collection('exams');
    await Exam.createIndex({ creator: 1 });
    await Exam.createIndex({ difficulty: 1 });
    await Exam.createIndex({ createdAt: -1 });
    console.log('✅ Exam indexes created');
    
    // Attempt indexes
    const Attempt = mongoose.connection.collection('attempts');
    await Attempt.createIndex({ user: 1 });
    await Attempt.createIndex({ question: 1 });
    await Attempt.createIndex({ user: 1, question: 1 });
    await Attempt.createIndex({ createdAt: -1 });
    console.log('✅ Attempt indexes created');
    
    // Classroom indexes
    const Classroom = mongoose.connection.collection('classrooms');
    await Classroom.createIndex({ teacher: 1 });
    await Classroom.createIndex({ 'students': 1 });
    console.log('✅ Classroom indexes created');
    
    // Product indexes
    const Product = mongoose.connection.collection('products');
    await Product.createIndex({ category: 1 });
    await Product.createIndex({ featured: 1 });
    await Product.createIndex({ price: 1 });
    await Product.createIndex({ createdAt: -1 });
    console.log('✅ Product indexes created');
    
    // Purchase indexes
    const Purchase = mongoose.connection.collection('purchases');
    await Purchase.createIndex({ user: 1 });
    await Purchase.createIndex({ product: 1 });
    await Purchase.createIndex({ createdAt: -1 });
    await Purchase.createIndex({ 'paymentDetails.paymentId': 1 });
    console.log('✅ Purchase indexes created');
    
    console.log('All indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
};

// Run the function
createIndexes(); 