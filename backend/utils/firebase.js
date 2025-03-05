const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
// In production, use environment variables or a service account key file
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

const bucket = admin.storage().bucket();

/**
 * Generate a signed URL for a file in Firebase Storage
 * @param {string} filePath - Path to the file in Firebase Storage
 * @param {number} expirationMinutes - URL expiration time in minutes
 * @returns {Promise<string>} - Signed URL
 */
const getSignedUrl = async (filePath, expirationMinutes = 60) => {
  try {
    const file = bucket.file(filePath);
    
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error(`File ${filePath} does not exist in Firebase Storage`);
    }
    
    // Generate signed URL
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expirationMinutes * 60 * 1000
    });
    
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

/**
 * Upload a file to Firebase Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} destination - Destination path in Firebase Storage
 * @param {Object} metadata - File metadata
 * @returns {Promise<string>} - File path in Firebase Storage
 */
const uploadFile = async (fileBuffer, destination, metadata = {}) => {
  try {
    const file = bucket.file(destination);
    
    await file.save(fileBuffer, {
      metadata: {
        contentType: metadata.contentType || 'application/pdf',
        ...metadata
      }
    });
    
    return destination;
  } catch (error) {
    console.error('Error uploading file to Firebase:', error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage
 * @param {string} filePath - Path to the file in Firebase Storage
 * @returns {Promise<void>}
 */
const deleteFile = async (filePath) => {
  try {
    const file = bucket.file(filePath);
    await file.delete();
  } catch (error) {
    console.error('Error deleting file from Firebase:', error);
    throw error;
  }
};

module.exports = {
  admin,
  bucket,
  getSignedUrl,
  uploadFile,
  deleteFile
}; 