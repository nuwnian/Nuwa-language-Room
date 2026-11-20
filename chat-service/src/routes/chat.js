const express = require('express');
const Joi = require('joi');
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const messageSchema = Joi.object({
  content: Joi.string().min(1).max(5000).required(),
  type: Joi.string().valid('text', 'image', 'audio').default('text'),
});

// Get conversation messages
router.get('/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Verify user has access to this conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', req.user.id)
      .single();

    if (convError || !conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }

    // Get messages with user information
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        user:users(id, first_name, last_name, email)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (messagesError) {
      throw messagesError;
    }

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: messages.length === limit
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// Send a message (REST endpoint, WebSocket is preferred)
router.post('/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { error, value } = messageSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { content, type } = value;

    // Verify user has access to this conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', req.user.id)
      .single();

    if (convError || !conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }

    // Save message to database
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        user_id: req.user.id,
        content,
        type,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (messageError) {
      throw messageError;
    }

    // Update conversation's last message timestamp
    await supabase
      .from('conversations')
      .update({ 
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// Get message corrections
router.get('/:conversationId/corrections', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Verify user has access to this conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', req.user.id)
      .single();

    if (convError || !conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }

    // Get corrections for this conversation
    const { data: corrections, error: correctionsError } = await supabase
      .from('corrections')
      .select(`
        *,
        message:messages(id, content, created_at)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (correctionsError) {
      throw correctionsError;
    }

    res.json({
      success: true,
      data: corrections
    });
  } catch (error) {
    console.error('Get corrections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch corrections'
    });
  }
});

module.exports = router;