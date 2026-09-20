const express = require("express");
const router = express.Router();
const messageController = require("../controller/message");
const { protect } = require("../middleware/authmidlleware");

// All routes require authentication
router.use(protect);

// Send a message
router.post("/", messageController.sendMessage);

// Get all conversations
router.get("/conversations", messageController.getConversations);

// Get unread count
router.get("/unread/count", messageController.getUnreadCount);

// Search messages
router.get("/search", messageController.searchMessages);

// Get messages with a specific user
router.get("/:otherUserId", messageController.getMessages);

// Mark message as read
router.put("/:messageId/read", messageController.markAsRead);

// Delete message
router.delete("/:messageId", messageController.deleteMessage);

module.exports = router;
