// backend/routes/users.js
const express = require("express");
const authMiddleware = require("../middleware/auth");
const { users, followers } = require("../models");

const router = express.Router();

// Get all users
router.get("/", authMiddleware, (req, res) => {
    const safeUsers = users.map(u => ({
        id: u.id,
        username: u.username
    }));
    res.json(safeUsers);
});

// Follow a user
router.post("/follow", authMiddleware, (req, res) => {
    const { targetUserId } = req.body;
    const currentUserId = req.user.userId;

    if (!targetUserId) {
        return res.status(400).json({ error: "targetUserId is required" });
    }

    if (targetUserId === currentUserId) {
        return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const exists = followers.find(
        f => f.followerId === currentUserId && f.followingId === targetUserId
    );
    if (exists) {
        return res.status(400).json({ error: "Already following this user" });
    }

    followers.push({ followerId: currentUserId, followingId: targetUserId });
    res.json({ message: "Followed successfully" });
});

// Unfollow a user
router.post("/unfollow", authMiddleware, (req, res) => {
    const { targetUserId } = req.body;
    const currentUserId = req.user.userId;

    if (!targetUserId) {
        return res.status(400).json({ error: "targetUserId is required" });
    }

    const index = followers.findIndex(
        f => f.followerId === currentUserId && f.followingId === targetUserId
    );

    if (index === -1) {
        return res.status(400).json({ error: "You are not following this user" });
    }

    followers.splice(index, 1);
    res.json({ message: "Unfollowed successfully" });
});

// List users I follow
router.get("/following", authMiddleware, (req, res) => {
    const currentUserId = req.user.userId;
    const followingIds = followers.filter(f => f.followerId === currentUserId).map(f => f.followingId);
    const followingUsers = users.filter(u => followingIds.includes(u.id)).map(u => ({ id: u.id, username: u.username }));
    res.json(followingUsers);
});

module.exports = router;
