const User = require('../models/User');
const Activity = require('../models/Activity');

// Get user analytics data
exports.getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const timeframe = req.query.timeframe || '1month';
    
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate;
    
    switch(timeframe) {
      case '1month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case '6months':
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case '1year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }
    
    // Get user activity within the timeframe
    const activities = await Activity.find({
      userId,
      createdAt: { $gte: startDate }
    });
    
    // Calculate analytics
    const questionsAttempted = activities.length;
    const questionsCorrect = activities.filter(a => a.result.isCorrect).length;
    const completionRate = activities.length > 0 ? 
      Math.round((questionsCorrect / questionsAttempted) * 100) : 0;
    
    // Calculate average score
    let totalScore = 0;
    let scoreCount = 0;
    
    activities.forEach(activity => {
      if (activity.result.score !== undefined) {
        totalScore += activity.result.score;
        scoreCount++;
      }
    });
    
    const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
    
    // Calculate time spent (in minutes)
    const timeSpent = activities.reduce((total, activity) => {
      return total + (activity.result.timeSpent || 0);
    }, 0);
    
    // Convert time from seconds to minutes
    const timeSpentMinutes = Math.round(timeSpent / 60);
    
    // Prepare category data
    const categoryMap = new Map();
    
    activities.forEach(activity => {
      const category = activity.metadata?.category || 'Uncategorized';
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          name: category,
          completion: 0,
          correct: 0,
          incorrect: 0,
          total: 0
        });
      }
      
      const categoryData = categoryMap.get(category);
      categoryData.total += 1;
      
      if (activity.result.isCorrect) {
        categoryData.correct += 1;
      } else {
        categoryData.incorrect += 1;
      }
    });
    
    // Calculate completion percentages
    categoryMap.forEach(category => {
      category.completion = Math.round((category.total / questionsAttempted) * 100) || 0;
      category.correct = Math.round((category.correct / category.total) * 100) || 0;
      category.incorrect = Math.round((category.incorrect / category.total) * 100) || 0;
    });
    
    const categoryData = Array.from(categoryMap.values());
    
    // Prepare time data (scores over time)
    const timeData = [];
    const dateMap = new Map();
    
    activities.forEach(activity => {
      const date = new Date(activity.createdAt).toLocaleDateString();
      
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          score: 0,
          questions: 0,
          timeSpent: 0
        });
      }
      
      const dateData = dateMap.get(date);
      dateData.questions += 1;
      dateData.timeSpent += (activity.result.timeSpent || 0) / 60; // Convert to minutes
      
      if (activity.result.score !== undefined) {
        dateData.score = (dateData.score * (dateData.questions - 1) + activity.result.score) / dateData.questions;
      } else if (activity.result.isCorrect !== undefined) {
        const score = activity.result.isCorrect ? 100 : 0;
        dateData.score = (dateData.score * (dateData.questions - 1) + score) / dateData.questions;
      }
    });
    
    // Sort time data by date
    Array.from(dateMap.values()).forEach(data => {
      data.score = Math.round(data.score);
      data.timeSpent = Math.round(data.timeSpent);
      timeData.push(data);
    });
    
    timeData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Return analytics data
    res.json({
      completionRate,
      questionsAttempted,
      questionsCorrect,
      averageScore,
      timeSpent: timeSpentMinutes,
      categoryData,
      timeData
    });
    
  } catch (error) {
    console.error('Error getting user analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user activity history
exports.getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;
    
    // Get user activity sorted by date (newest first)
    const activities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    // Format activities for frontend
    const formattedActivities = activities.map(activity => {
      return {
        id: activity._id,
        type: activity.type,
        title: activity.metadata?.title || `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} Activity`,
        date: activity.createdAt,
        score: activity.result.score || (activity.result.isCorrect ? 100 : 0),
        correct: activity.result.isCorrect ? 1 : 0,
        total: 1,
        category: activity.metadata?.category || 'General'
      };
    });
    
    res.json(formattedActivities);
    
  } catch (error) {
    console.error('Error getting user activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Log user activity
exports.logActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, itemId, result, metadata } = req.body;
    
    // Create new activity
    const activity = new Activity({
      userId,
      type,
      itemId,
      result,
      metadata
    });
    
    await activity.save();
    
    res.status(201).json({
      success: true,
      activityId: activity._id
    });
    
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get student analytics data (alias for getUserAnalytics with student-specific formatting)
exports.getStudentAnalytics = async (req, res) => {
  try {
    // If userId is 'current', use the logged-in user's ID
    const userId = req.params.userId === 'current' ? req.user.id : req.params.userId;
    console.log(`Getting student analytics for user ID: ${userId} (from ${req.params.userId})`);
    
    if (!userId) {
      console.error('No user ID provided and no authenticated user');
      return res.status(400).json({ 
        message: 'User ID is required',
        details: 'Please provide a valid user ID or use "current" for the authenticated user'
      });
    }
    
    const timeframe = req.query.timeframe || '1month';
    
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate;
    
    switch(timeframe) {
      case '1month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case '6months':
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case '1year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }
    
    // Get user activity within the timeframe
    const activities = await Activity.find({
      userId,
      createdAt: { $gte: startDate }
    });
    
    console.log(`Found ${activities.length} activities for user ${userId} since ${startDate}`);
    
    // Calculate analytics
    const questionsAttempted = activities.length;
    const questionsCorrect = activities.filter(a => a.result.isCorrect).length;
    const completionRate = activities.length > 0 ? 
      Math.round((questionsCorrect / questionsAttempted) * 100) : 0;
    
    // Calculate average score
    let totalScore = 0;
    let scoreCount = 0;
    
    activities.forEach(activity => {
      if (activity.result.score !== undefined) {
        totalScore += activity.result.score;
        scoreCount++;
      }
    });
    
    const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
    
    // Calculate time spent (in minutes)
    const timeSpent = activities.reduce((total, activity) => {
      return total + (activity.result.timeSpent || 0);
    }, 0);
    
    // Convert time from seconds to minutes
    const timeSpentMinutes = Math.round(timeSpent / 60);
    
    // Prepare category data
    const categoryMap = new Map();
    
    activities.forEach(activity => {
      const category = activity.metadata?.category || 'Uncategorized';
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          name: category,
          completion: 0,
          correct: 0,
          incorrect: 0,
          total: 0
        });
      }
      
      const categoryData = categoryMap.get(category);
      categoryData.total += 1;
      
      if (activity.result.isCorrect) {
        categoryData.correct += 1;
      } else {
        categoryData.incorrect += 1;
      }
    });
    
    // Calculate completion percentages
    categoryMap.forEach(category => {
      category.completion = Math.round((category.total / questionsAttempted) * 100) || 0;
      category.correct = Math.round((category.correct / category.total) * 100) || 0;
      category.incorrect = Math.round((category.incorrect / category.total) * 100) || 0;
    });
    
    const categoryData = Array.from(categoryMap.values());
    
    // Get recent activity for the student
    const recentActivities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Format activities for frontend
    const recentActivity = recentActivities.map(activity => {
      return {
        id: activity._id,
        type: activity.type,
        title: activity.metadata?.title || `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} Activity`,
        date: activity.createdAt,
        score: activity.result.score || (activity.result.isCorrect ? 100 : 0),
        category: activity.metadata?.category || 'General'
      };
    });
    
    // Return student analytics data
    const response = {
      stats: {
        completionRate,
        questionsAttempted,
        questionsCorrect,
        averageScore,
        timeSpent: timeSpentMinutes
      },
      categoryData,
      recentActivity
    };
    
    console.log(`Successfully generated analytics for student ${userId}`);
    res.json(response);
    
  } catch (error) {
    console.error('Error getting student analytics:', error);
    res.status(500).json({ 
      message: 'Server error',
      details: error.message
    });
  }
};

// Get progress data for a user
exports.getProgressData = async (req, res) => {
  try {
    // If userId is 'current', use the logged-in user's ID
    const userId = req.params.userId === 'current' ? req.user.id : req.params.userId;
    const category = req.query.category;
    const timeframe = req.query.timeframe || '1month';
    
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate;
    
    switch(timeframe) {
      case '1month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case '6months':
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case '1year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }
    
    // Build query
    const query = {
      userId,
      createdAt: { $gte: startDate }
    };
    
    // Add category filter if provided
    if (category) {
      query['metadata.category'] = category;
    }
    
    // Get user activity within the timeframe
    const activities = await Activity.find(query).sort({ createdAt: 1 });
    
    // Prepare time data (scores over time)
    const timeData = [];
    const dateMap = new Map();
    
    activities.forEach(activity => {
      const date = new Date(activity.createdAt).toLocaleDateString();
      
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          score: 0,
          questions: 0,
          timeSpent: 0
        });
      }
      
      const dateData = dateMap.get(date);
      dateData.questions += 1;
      dateData.timeSpent += (activity.result.timeSpent || 0) / 60; // Convert to minutes
      
      if (activity.result.score !== undefined) {
        dateData.score = (dateData.score * (dateData.questions - 1) + activity.result.score) / dateData.questions;
      } else if (activity.result.isCorrect !== undefined) {
        const score = activity.result.isCorrect ? 100 : 0;
        dateData.score = (dateData.score * (dateData.questions - 1) + score) / dateData.questions;
      }
    });
    
    // Format time data
    Array.from(dateMap.values()).forEach(data => {
      data.score = Math.round(data.score);
      data.timeSpent = Math.round(data.timeSpent);
      timeData.push(data);
    });
    
    timeData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Return progress data
    res.json({
      timeData,
      category: category || 'All Categories'
    });
    
  } catch (error) {
    console.error('Error getting progress data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get performance by category
exports.getPerformanceByCategory = async (req, res) => {
  try {
    // If userId is 'current', use the logged-in user's ID
    const userId = req.params.userId === 'current' ? req.user.id : req.params.userId;
    const timeframe = req.query.timeframe || '1month';
    
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate;
    
    switch(timeframe) {
      case '1month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case '6months':
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case '1year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }
    
    // Get user activity within the timeframe
    const activities = await Activity.find({
      userId,
      createdAt: { $gte: startDate }
    });
    
    // Prepare category data
    const categoryMap = new Map();
    
    activities.forEach(activity => {
      const category = activity.metadata?.category || 'Uncategorized';
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          name: category,
          score: 0,
          total: 0,
          correct: 0,
          incorrect: 0,
          timeSpent: 0
        });
      }
      
      const categoryData = categoryMap.get(category);
      categoryData.total += 1;
      categoryData.timeSpent += (activity.result.timeSpent || 0) / 60; // Convert to minutes
      
      if (activity.result.isCorrect !== undefined) {
        if (activity.result.isCorrect) {
          categoryData.correct += 1;
        } else {
          categoryData.incorrect += 1;
        }
      }
      
      if (activity.result.score !== undefined) {
        categoryData.score = (categoryData.score * (categoryData.total - 1) + activity.result.score) / categoryData.total;
      } else if (activity.result.isCorrect !== undefined) {
        const score = activity.result.isCorrect ? 100 : 0;
        categoryData.score = (categoryData.score * (categoryData.total - 1) + score) / categoryData.total;
      }
    });
    
    // Format category data
    const performanceData = Array.from(categoryMap.values()).map(category => {
      return {
        name: category.name,
        score: Math.round(category.score),
        total: category.total,
        correct: category.correct,
        incorrect: category.incorrect,
        timeSpent: Math.round(category.timeSpent)
      };
    });
    
    // Sort by score (highest first)
    performanceData.sort((a, b) => b.score - a.score);
    
    // Return performance data
    res.json(performanceData);
    
  } catch (error) {
    console.error('Error getting performance by category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to get recent activity for a user
async function getRecentActivityForUser(userId, limit = 10) {
  try {
    // Get user activity sorted by date (newest first)
    const activities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    // Format activities for frontend
    return activities.map(activity => {
      return {
        id: activity._id,
        type: activity.type,
        title: activity.metadata?.title || `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} Activity`,
        date: activity.createdAt,
        score: activity.result.score || (activity.result.isCorrect ? 100 : 0),
        correct: activity.result.isCorrect ? 1 : 0,
        total: 1,
        category: activity.metadata?.category || 'General'
      };
    });
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
} 