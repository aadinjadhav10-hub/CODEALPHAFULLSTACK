const express = require("express");
const { posts } = require("../models");
const { v4: uuid } = require("uuid");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Create post (protected)
router.post("/", authMiddleware, (req, res) => {
  const { content } = req.body;
  const { userId, username } = req.user;

  const newPost = {
    id: uuid(),
    userId,
    username,
    content,
    likes: 0,
    createdAt: new Date()
  };

  posts.push(newPost);
  res.status(201).json(newPost);
});

// Get all posts (protected)
router.get("/", authMiddleware, (req, res) => {
  res.json(posts);
});

// Like a post (protected)
router.post("/like", authMiddleware, (req, res) => {
  const { postId } = req.body;

  const post = posts.find(p => p.id === postId);
  if (!post) return res.status(404).json({ error: "Post not found" });

  post.likes++;

  res.json({ message: "Liked!", post });
});

// DELETE a post (protected) - NEW!
router.delete("/:postId", authMiddleware, (req, res) => {
  const { postId } = req.params;
  const { userId } = req.user;

  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex === -1) {
    return res.status(404).json({ error: "Post not found" });
  }

  // Check if user owns the post
  if (posts[postIndex].userId !== userId) {
    return res.status(403).json({ error: "You can only delete your own posts" });
  }

  posts.splice(postIndex, 1);
  res.json({ message: "Post deleted successfully" });
});

module.exports = router;
