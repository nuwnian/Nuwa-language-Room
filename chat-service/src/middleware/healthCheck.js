const { supabase } = require('../config/supabase');

const healthCheck = async (req, res) => {
  try {
    // Check database connection
    const { data, error } = await supabase
      .from('conversations')
      .select('count', { count: 'exact' })
      .limit(1);

    if (error) {
      throw error;
    }

    res.status(200).json({
      service: 'chat-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      database: 'connected',
      uptime: Math.floor(process.uptime()),
      socketConnections: req.app?.io?.engine?.clientsCount || 0
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      service: 'chat-service',
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: 'disconnected'
    });
  }
};

module.exports = { healthCheck };