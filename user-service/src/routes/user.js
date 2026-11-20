const express = require('express');
const Joi = require('joi');
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  nativeLanguage: Joi.string().min(2).max(20).optional(),
  learningLanguage: Joi.string().min(2).max(20).optional(),
  profilePicture: Joi.string().uri().optional(),
  bio: Joi.string().max(500).optional(),
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { password_hash, ...userProfile } = req.user;
    res.json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const updateData = {};
    if (value.firstName) updateData.first_name = value.firstName;
    if (value.lastName) updateData.last_name = value.lastName;
    if (value.nativeLanguage) updateData.native_language = value.nativeLanguage;
    if (value.learningLanguage) updateData.learning_language = value.learningLanguage;
    if (value.profilePicture) updateData.profile_picture = value.profilePicture;
    if (value.bio) updateData.bio = value.bio;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }

    updateData.updated_at = new Date().toISOString();

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select('id, email, first_name, last_name, native_language, learning_language, profile_picture, bio, created_at, updated_at')
      .single();

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Get conversation count
    const { count: conversationCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id);

    // Get message count
    const { count: messageCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id);

    // Get correction count
    const { count: correctionCount } = await supabase
      .from('corrections')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id);

    // Calculate days since registration
    const registrationDate = new Date(req.user.created_at);
    const today = new Date();
    const daysSinceRegistration = Math.ceil((today - registrationDate) / (1000 * 60 * 60 * 24));

    res.json({
      success: true,
      data: {
        conversationCount: conversationCount || 0,
        messageCount: messageCount || 0,
        correctionCount: correctionCount || 0,
        daysSinceRegistration,
        joinDate: req.user.created_at,
        nativeLanguage: req.user.native_language,
        learningLanguage: req.user.learning_language,
      }
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
});

// Delete user account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    // In a real application, you might want to soft delete or archive data
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.user.id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
});

module.exports = router;