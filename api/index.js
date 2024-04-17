const express = require('express');
const apiRouter = express.Router();

const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');
const { JWT_SECRET } = process.env;

apiRouter.use('/api', async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');

  if (!auth) {
    next(); // Proceed without setting req.user
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      const { id } = jwt.verify(token, JWT_SECRET);

      if (id) {
        req.user = await getUserById(id);
        next(); // Proceed with authenticated user
      } else {
        next({
          status: 401,
          name: 'AuthorizationHeaderError',
          message: 'Authorization token malformed',
        });
      }
    } catch ({ name, message }) {
      next({ status: 401, name, message }); // Unauthorized due to token verification failure
    }
  } else {
    next({
      status: 401,
      name: 'AuthorizationHeaderError',
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

// Logging middleware to log user information
apiRouter.use('/api', (req, res, next) => {
  if (req.user) {
    console.log('User is set:', { id: req.user.id, username: req.user.username }); // Logging only necessary and safe information
  }

  next();
});

// Import and mount users router
const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);

// Import and mount posts router
const postsRouter = require('./posts');
apiRouter.use('/posts', postsRouter);

// Import and mount tags router
const tagsRouter = require('./tags');
apiRouter.use('/tags', tagsRouter);

// Error handling middleware
apiRouter.use((error, req, res, next) => {
  console.error('Error:', error);
  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';
  res.status(status).json({ error: { status, message } });
});

module.exports = apiRouter;