const express = require('express');
const Joi = require('joi');
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const createConversationSchema = Joi.object({
  title: Joi.string().min(1).max(100).optional(),
  language: Joi.string().min(2).max(10).default('en'),
});

// Get user's conversations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        message_count:messages(count)
      `)
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: conversations.length === limit
        }
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

// Create new conversation
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = createConversationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { title, language } = value;
    
    const { data: conversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        user_id: req.user.id,
        title: title || `Conversation ${new Date().toLocaleDateString()}`,
        language,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (createError) {
      throw createError;
    }

    res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation'
    });
  }
});

// Get specific conversation
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: conversation, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages(
          id,
          content,
          type,
          created_at,
          user:users(id, first_name, last_name)
        )
      `)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation'
    });
  }
});

// Update conversation
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, language } = req.body;

    if (!title && !language) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (title or language) is required'
      });
    }

    const updateData = { updated_at: new Date().toISOString() };
    if (title) updateData.title = title;
    if (language) updateData.language = language;

    const { data: conversation, error } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('*')
      .single();

    if (error || !conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update conversation'
    });
  }
});

// Delete conversation
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete conversation'
    });
  }
});

module.exports = router;