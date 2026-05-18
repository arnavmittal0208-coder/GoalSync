const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Simple in-memory cache for user auth (cleared every 2 minutes)
const userCache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check cache first
    const cached = userCache.get(decoded.id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      req.user = cached.data;
      return next();
    }
    
    // Fetch from DB if not cached
    req.user = await User.findById(decoded.id).select('-password').lean();
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (!req.user.isActive) {
      return res.status(401).json({ success: false, message: 'Account deactivated' });
    }
    
    // Cache the user
    userCache.set(decoded.id, { data: req.user, timestamp: Date.now() });
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Role '${req.user.role}' is not authorized to access this resource` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
