const express = require('express');
const postsRouter = express.Router();

const { requireUser } = require('./utils');

const { 
  createPost,
  getAllPosts,
  updatePost,
  getPostById,
} = require('../db');

postsRouter.get('/', async (req, res, next) => {
  try {
    const allPosts = await getAllPosts();

    const posts = allPosts.filter(post => {
      // the post is active, or belongs to the current user
      return post.active || (req.user && post.authorId === req.user.id);
    });

    res.send({ posts });
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
});

postsRouter.post('/', requireUser, async (req, res, next) => {
  const { title, content = "" } = req.body;

  try {
    const postData = {
      authorId: req.user.id,
      title,
      content
    };

    const post = await createPost(postData);

    if (post) {
      res.send(post);
    } else {
      next({
        status: 500,
        name: 'PostCreationError',
        message: 'There was an error creating your post. Please try again.'
      });
    }
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
});

postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.authorId === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost });
    } else {
      next({
        status: 403,
        name: 'UnauthorizedUserError',
        message: 'You cannot update a post that is not yours'
      });
    }
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
});

postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
  res.send({ message: 'under construction' }); // Placeholder response
});

module.exports = postsRouter;