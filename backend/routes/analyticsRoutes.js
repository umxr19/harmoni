const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

// Get user analytics data
router.get('/user', auth, analyticsController.getUserAnalytics);

// Get user activity history
router.get('/activity/:userId', auth, analyticsController.getUserActivity);

// Log user activity
router.post('/log-activity', auth, analyticsController.logActivity);

// Add a specific route for current user analytics - MUST come BEFORE the parameterized route
router.get('/student/current', auth, (req, res) => {
    console.log('Received request for current student analytics');
    // Pass the request to the getStudentAnalytics controller with the current user's ID
    req.params.userId = req.user.id;
    analyticsController.getStudentAnalytics(req, res);
});

// New routes to match frontend API calls - MUST come AFTER the /current route
router.get('/student/:userId', auth, analyticsController.getStudentAnalytics);

router.get('/progress/:userId', auth, analyticsController.getProgressData);
router.get('/performance/:userId/by-category', auth, analyticsController.getPerformanceByCategory);

module.exports = router; 