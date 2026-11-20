const { supabase } = require('../config/supabase');
const axios = require('axios');

const handleConnection = (socket, io) => {
  console.log(`User ${socket.user.email} connected`);
  
  // Join user to their personal room
  socket.join(`user:${socket.user.id}`);

  // Handle joining a conversation room
  socket.on('join_conversation', async (conversationId) => {
    try {
      // Verify user has access to this conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', socket.user.id)
        .single();

      if (error || !conversation) {
        socket.emit('error', { message: 'Conversation not found or access denied' });
        return;
      }

      socket.join(`conversation:${conversationId}`);
      socket.emit('joined_conversation', { conversationId });
    } catch (error) {
      console.error('Error joining conversation:', error);
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  });

  // Handle sending a message
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, content, type = 'text' } = data;

      // Verify user has access to this conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', socket.user.id)
        .single();

      if (convError || !conversation) {
        socket.emit('error', { message: 'Conversation not found or access denied' });
        return;
      }

      // Save message to database
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          user_id: socket.user.id,
          content,
          type,
          created_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (messageError) {
        throw messageError;
      }

      // Add user info to message
      const messageWithUser = {
        ...message,
        user: {
          id: socket.user.id,
          first_name: socket.user.first_name,
          last_name: socket.user.last_name,
          email: socket.user.email
        }
      };

      // Emit to conversation room
      io.to(`conversation:${conversationId}`).emit('new_message', messageWithUser);

      // Update conversation's last message timestamp
      await supabase
        .from('conversations')
        .update({ 
          updated_at: new Date().toISOString(),
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      // Trigger AI analysis if needed (async)
      if (type === 'text' && content.trim().length > 0) {
        triggerAIAnalysis(conversationId, message.id, content, socket.user.learning_language)
          .catch(error => console.error('AI analysis failed:', error));
      }

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
      userId: socket.user.id,
      userName: `${socket.user.first_name} ${socket.user.last_name}`,
      isTyping: true
    });
  });

  socket.on('typing_stop', (data) => {
    socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
      userId: socket.user.id,
      userName: `${socket.user.first_name} ${socket.user.last_name}`,
      isTyping: false
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User ${socket.user.email} disconnected`);
  });
};

// Trigger AI analysis (async function)
const triggerAIAnalysis = async (conversationId, messageId, content, learningLanguage) => {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://ai-service:8001';
    
    // Call AI service for text correction
    const response = await axios.post(`${aiServiceUrl}/api/ai/correct-text`, {
      text: content,
      language: learningLanguage,
      context: 'chat'
    }, {
      timeout: 10000 // 10 second timeout
    });

    if (response.data && response.data.success) {
      const correction = response.data.data;
      
      // Save correction to database if there are corrections
      if (correction.hasCorrections) {
        await supabase
          .from('corrections')
          .insert({
            message_id: messageId,
            conversation_id: conversationId,
            original_text: content,
            corrected_text: correction.correctedText,
            corrections: correction.corrections,
            explanation: correction.explanation,
            confidence: correction.confidence,
            created_at: new Date().toISOString()
          });
      }
    }
  } catch (error) {
    console.error('AI analysis error:', error.message);
    // Don't throw - this should not interrupt the chat flow
  }
};

module.exports = { handleConnection };