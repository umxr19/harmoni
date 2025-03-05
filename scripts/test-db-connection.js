#!/usr/bin/env node

// Load environment variables
require('dotenv').config();

const mongoose = require('mongoose');
const chalk = require('chalk');

async function testDatabaseConnection() {
  try {
    // Get MongoDB URI from environment variables
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error(chalk.red('Error: MONGODB_URI environment variable is not defined'));
      process.exit(1);
    }
    
    console.log(chalk.yellow('Attempting to connect to MongoDB...'));
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Check connection state
    if (mongoose.connection.readyState === 1) {
      console.log(chalk.green('✓ Successfully connected to MongoDB'));
      
      // Get database information
      const dbName = mongoose.connection.db.databaseName;
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      console.log(chalk.green(`✓ Connected to database: ${dbName}`));
      console.log(chalk.green(`✓ Found ${collections.length} collections`));
      
      // Close the connection
      await mongoose.connection.close();
      console.log(chalk.yellow('Connection closed'));
      
      process.exit(0);
    } else {
      console.error(chalk.red(`✗ Failed to connect to MongoDB. Connection state: ${mongoose.connection.readyState}`));
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('✗ Error connecting to MongoDB:'), error.message);
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection(); 