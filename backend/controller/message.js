const messageModel = require("../models/message");

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { receiver_id, receiver_email, receiver_name, receiver_role, subject, message } = req.body;
    const sender = req.user; // From auth middleware
    
    console.log('=== SEND MESSAGE REQUEST ===');
    console.log('Sender:', sender);
    console.log('Receiver:', { receiver_id, receiver_email, receiver_name, receiver_role });
    
    if (!receiver_id || !receiver_email || !receiver_name || !receiver_role || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        required: ["receiver_id", "receiver_email", "receiver_name", "receiver_role", "message"]
      });
    }
    
    const messageData = {
      sender_id: sender.id,
      sender_email: sender.email,
      sender_name: sender.name || sender.first_name || sender.email.split('@')[0],
      sender_role: sender.role,
      receiver_id,
      receiver_email,
      receiver_name,
      receiver_role,
      subject: subject || "No Subject",
      message
    };
    
    console.log('Message data:', messageData);
    
    const newMessage = await messageModel.sendMessage(messageData);
    
    console.log('Message sent successfully:', newMessage.id);
    
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage
    });
  } catch (error) {
    console.error("=== ERROR SENDING MESSAGE ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message
    });
  }
};

// Get all conversations
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const conversations = await messageModel.getConversations(userId);
    
    res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message
    });
  }
};

// Get messages with a specific user
const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;
    
    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: "Other user ID is required"
      });
    }
    
    const messages = await messageModel.getMessagesBetweenUsers(userId, otherUserId);
    
    // Mark messages as read
    await messageModel.markAllAsRead(userId, otherUserId);
    
    res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message
    });
  }
};

// Mark message as read
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;
    
    const message = await messageModel.markAsRead(messageId, userId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found or you don't have permission"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Message marked as read",
      data: message
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark message as read",
      error: error.message
    });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await messageModel.getUnreadCount(userId);
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
      error: error.message
    });
  }
};

// Search messages
const searchMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }
    
    const messages = await messageModel.searchMessages(userId, q);
    
    res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error("Error searching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search messages",
      error: error.message
    });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;
    
    const message = await messageModel.deleteMessage(messageId, userId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found or you don't have permission"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Message deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: error.message
    });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  getUnreadCount,
  searchMessages,
  deleteMessage
};
