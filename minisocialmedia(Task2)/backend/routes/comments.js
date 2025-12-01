const express = require("express");
const { comments } = require("../models");
const { v4: uuid } = require("uuid");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Add comment (protected)
router.post("/", authMiddleware, (req, res) => {
  const { postId, text } = req.body;
  const { userId, username } = req.user;

  const newComment = {
    id: uuid(),
    postId,
    userId,
    username,
    text,
    createdAt: new Date()
  };

  comments.push(newComment);

  res.status(201).json(newComment);
});

// Get comments by postId (protected)
router.get("/", authMiddleware, (req, res) => {
  const { postId } = req.query;
  
  if (postId) {
    const postComments = comments.filter(c => c.postId === postId);
    return res.json(postComments);
  }
  
  res.json(comments);
});

module.exports = router;
