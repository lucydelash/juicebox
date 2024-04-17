function requireUser(req, res, next) {
  // Check if user is authenticated
  if (req.user) {
    // User is authenticated, proceed to the next middleware
    next();
  } else {
    // User is not authenticated, send an error response
    res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = {
  requireUser
};