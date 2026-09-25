const db = require("../config/dbConnection");

// Get all users with pagination
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 7, role, search } = req.query;
    const offset = (page - 1) * limit;

    // Simple query without joins - just get user data
    let query = `
      SELECT 
        u.id, 
        u.email, 
        u.role, 
        u.status,
        u.organization_name,
        u.created_at
      FROM users u
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (role) {
      query += ` AND u.role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    if (search) {
      query += ` AND (u.email ILIKE $${paramCount} OR u.organization_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM users u WHERE 1=1`;
    const countParams = [];
    let countParamCount = 1;

    if (role) {
      countQuery += ` AND u.role = $${countParamCount}`;
      countParams.push(role);
      countParamCount++;
    }

    if (search) {
      countQuery += ` AND (u.email ILIKE $${countParamCount} OR u.organization_name ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message
    });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    // Query with error handling for tables that might not exist
    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'company') as companies,
        (SELECT COUNT(*) FROM users WHERE role = 'university') as universities,
        (SELECT COUNT(*) FROM users WHERE role = 'student') as students,
        (SELECT COUNT(*) FROM mentors) as mentors,
        (SELECT COUNT(*) FROM advisors) as advisors,
        (SELECT COUNT(*) FROM universityapplications) as applications,
        (SELECT COUNT(*) FROM messages) as messages
    `);

    res.status(200).json({
      success: true,
      stats: stats.rows[0]
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
      error: error.message
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const userCheck = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Delete user (cascade will handle related records)
    await db.query("DELETE FROM users WHERE id = $1", [userId]);

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ['student', 'company', 'university', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    const result = await db.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING *",
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Log activity
    console.log(`[ADMIN ACTION] ${req.user.email} changed role of user ${userId} to ${role} at ${new Date().toISOString()}`);

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error: error.message
    });
  }
};

// Toggle user status (activate/deactivate)
const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // 'active' or 'suspended'

    const validStatuses = ['active', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'active' or 'suspended'"
      });
    }

    // Check if user exists
    const userCheck = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update status
    const result = await db.query(
      "UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [status, userId]
    );

    // Log activity
    console.log(`[ADMIN ACTION] ${req.user.email} ${status === 'suspended' ? 'suspended' : 'activated'} user ${userId} at ${new Date().toISOString()}`);

    res.status(200).json({
      success: true,
      message: `User ${status === 'suspended' ? 'suspended' : 'activated'} successfully`,
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message
    });
  }
};

// Reset user password (generates temporary password)
const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const bcrypt = require('bcrypt');

    // Check if user exists
    const userCheck = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update password
    await db.query(
      "UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2",
      [hashedPassword, userId]
    );

    // Log activity
    console.log(`[ADMIN ACTION] ${req.user.email} reset password for user ${userId} at ${new Date().toISOString()}`);

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
      tempPassword: tempPassword, // In production, send via email instead
      note: "Please inform the user to change this password immediately"
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message
    });
  }
};

// Get all messages (admin view)
const getAllMessages = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, role_filter } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        m.*,
        CASE 
          WHEN m.is_read = TRUE THEN 'read'
          ELSE 'unread'
        END as read_status
      FROM messages m
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Filter by read status
    if (status === 'unread') {
      query += ` AND m.is_read = FALSE`;
    } else if (status === 'read') {
      query += ` AND m.is_read = TRUE`;
    }

    // Filter by role
    if (role_filter) {
      query += ` AND (m.sender_role = $${paramCount} OR m.receiver_role = $${paramCount})`;
      params.push(role_filter);
      paramCount++;
    }

    // Search by subject, message, or user names/emails
    if (search) {
      query += ` AND (
        m.subject ILIKE $${paramCount} OR 
        m.message ILIKE $${paramCount} OR 
        m.sender_name ILIKE $${paramCount} OR 
        m.sender_email ILIKE $${paramCount} OR 
        m.receiver_name ILIKE $${paramCount} OR 
        m.receiver_email ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY m.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM messages m WHERE 1=1`;
    const countParams = [];
    let countParamCount = 1;

    if (status === 'unread') {
      countQuery += ` AND m.is_read = FALSE`;
    } else if (status === 'read') {
      countQuery += ` AND m.is_read = TRUE`;
    }

    if (role_filter) {
      countQuery += ` AND (m.sender_role = $${countParamCount} OR m.receiver_role = $${countParamCount})`;
      countParams.push(role_filter);
      countParamCount++;
    }

    if (search) {
      countQuery += ` AND (
        m.subject ILIKE $${countParamCount} OR 
        m.message ILIKE $${countParamCount} OR 
        m.sender_name ILIKE $${countParamCount} OR 
        m.sender_email ILIKE $${countParamCount} OR 
        m.receiver_name ILIKE $${countParamCount} OR 
        m.receiver_email ILIKE $${countParamCount}
      )`;
      countParams.push(`%${search}%`);
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    // Log admin action
    console.log(`[ADMIN ACTION] ${req.user.email} accessed messages list at ${new Date().toISOString()}`);

    res.status(200).json({
      success: true,
      messages: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
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

// Get message statistics
const getMessageStats = async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(*) FILTER (WHERE is_read = FALSE) as unread_messages,
        COUNT(*) FILTER (WHERE is_read = TRUE) as read_messages,
        COUNT(DISTINCT sender_id) as unique_senders,
        COUNT(DISTINCT receiver_id) as unique_receivers,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24h,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7days,
        COUNT(*) FILTER (WHERE sender_role = 'company') as from_companies,
        COUNT(*) FILTER (WHERE sender_role = 'university') as from_universities,
        COUNT(*) FILTER (WHERE sender_role = 'student') as from_students
      FROM messages
    `);

    res.status(200).json({
      success: true,
      stats: stats.rows[0]
    });
  } catch (error) {
    console.error("Error fetching message stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch message statistics",
      error: error.message
    });
  }
};

// Delete message (admin)
const deleteMessageAdmin = async (req, res) => {
  try {
    const { messageId } = req.params;

    // Check if message exists
    const messageCheck = await db.query("SELECT * FROM messages WHERE id = $1", [messageId]);
    if (messageCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    // Delete message
    await db.query("DELETE FROM messages WHERE id = $1", [messageId]);

    // Log action
    console.log(`[ADMIN ACTION] ${req.user.email} deleted message ${messageId} at ${new Date().toISOString()}`);

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

// Get conversation between two users (admin view)
const getConversationAdmin = async (req, res) => {
  try {
    const { user1Id, user2Id } = req.params;

    const messages = await db.query(`
      SELECT *
      FROM messages
      WHERE 
        (sender_id = $1 AND receiver_id = $2) OR
        (sender_id = $2 AND receiver_id = $1)
      ORDER BY created_at ASC
    `, [user1Id, user2Id]);

    res.status(200).json({
      success: true,
      messages: messages.rows
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversation",
      error: error.message
    });
  }
};

// Get recent activities
const getRecentActivities = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    
    const activities = [];

    // Get recent user registrations - simplified query
    const recentUsers = await db.query(`
      SELECT 
        u.id, 
        u.email, 
        u.role, 
        u.organization_name,
        u.created_at
      FROM users u
      WHERE u.created_at >= NOW() - INTERVAL '7 days'
      ORDER BY u.created_at DESC
      LIMIT 10
    `);

    recentUsers.rows.forEach(user => {
      const orgName = user.organization_name || user.email.split('@')[0];
      activities.push({
        type: 'user_registration',
        icon: user.role === 'company' ? 'building' : user.role === 'university' ? 'university' : 'user',
        color: user.role === 'company' ? 'green' : user.role === 'university' ? 'blue' : 'purple',
        title: `New ${user.role} registered`,
        description: orgName,
        timestamp: user.created_at
      });
    });

    // Try to get applications if table exists
    try {
      const recentApplications = await db.query(`
        SELECT 
          ua.id,
          ua.created_at,
          ua.status
        FROM universityapplications ua
        WHERE ua.created_at >= NOW() - INTERVAL '7 days'
        ORDER BY ua.created_at DESC
        LIMIT 5
      `);

      recentApplications.rows.forEach(app => {
        activities.push({
          type: 'application',
          icon: 'file',
          color: 'yellow',
          title: 'New internship application',
          description: `Application submitted`,
          timestamp: app.created_at
        });
      });
    } catch (appError) {
      console.log('Applications table not available:', appError.message);
    }

    // Try to get mentor assignments if table exists
    try {
      const recentMentors = await db.query(`
        SELECT 
          m.id,
          m.created_at
        FROM mentors m
        WHERE m.created_at >= NOW() - INTERVAL '7 days'
        ORDER BY m.created_at DESC
        LIMIT 3
      `);

      recentMentors.rows.forEach(mentor => {
        activities.push({
          type: 'mentor_assignment',
          icon: 'users',
          color: 'indigo',
          title: 'Mentor assigned',
          description: `New mentor assignment`,
          timestamp: mentor.created_at
        });
      });
    } catch (mentorError) {
      console.log('Mentors table not available:', mentorError.message);
    }

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Return limited activities
    res.status(200).json({
      success: true,
      activities: activities.slice(0, parseInt(limit))
    });

  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent activities",
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getDashboardStats,
  deleteUser,
  updateUserRole,
  toggleUserStatus,
  resetUserPassword,
  getAllMessages,
  getMessageStats,
  deleteMessageAdmin,
  getConversationAdmin,
  getRecentActivities,
  // University management
  getAllUniversities: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          u.id, 
          u.email, 
          u.organization_name,
          u.status,
          u.created_at,
          (SELECT COUNT(*) FROM universityapplications WHERE university_id = u.id) as applications_count
        FROM users u
        WHERE u.role = 'university'
      `;
      
      const params = [];
      let paramCount = 1;

      if (status) {
        query += ` AND u.status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      if (search) {
        query += ` AND (u.email ILIKE $${paramCount} OR u.organization_name ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        paramCount++;
      }

      query += ` ORDER BY u.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      // Get total count
      let countQuery = `SELECT COUNT(*) FROM users u WHERE u.role = 'university'`;
      const countParams = [];
      let countParamCount = 1;

      if (status) {
        countQuery += ` AND u.status = $${countParamCount}`;
        countParams.push(status);
        countParamCount++;
      }

      if (search) {
        countQuery += ` AND (u.email ILIKE $${countParamCount} OR u.organization_name ILIKE $${countParamCount})`;
        countParams.push(`%${search}%`);
      }

      const countResult = await db.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      // Log activity
      console.log(`[ADMIN ACTION] ${req.user.email} accessed universities list at ${new Date().toISOString()}`);

      res.status(200).json({
        success: true,
        universities: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching universities:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch universities",
        error: error.message
      });
    }
  },

  // Company management
  getAllCompanies: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          u.id, 
          u.email, 
          u.organization_name,
          u.status,
          u.created_at,
          COALESCE((SELECT COUNT(*) FROM internship_posts WHERE company_id = u.id), 0) as internship_posts_count,
          COALESCE((SELECT COUNT(*) FROM internship_posts WHERE company_id = u.id AND status = 'open'), 0) as active_posts_count,
          COALESCE((SELECT COUNT(*) FROM mentors WHERE company_id = u.id), 0) as mentors_count,
          COALESCE((SELECT COUNT(*) FROM companyapplications WHERE company_id = u.id), 0) as applications_count,
          COALESCE((SELECT COUNT(*) FROM companyapplications WHERE company_id = u.id AND status = 'pending'), 0) as pending_applications
        FROM users u
        WHERE u.role = 'company'
      `;
      
      const params = [];
      let paramCount = 1;

      if (status) {
        query += ` AND u.status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      if (search) {
        query += ` AND (u.email ILIKE $${paramCount} OR u.organization_name ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        paramCount++;
      }

      query += ` ORDER BY u.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      // Get total count
      let countQuery = `SELECT COUNT(*) FROM users u WHERE u.role = 'company'`;
      const countParams = [];
      let countParamCount = 1;

      if (status) {
        countQuery += ` AND u.status = $${countParamCount}`;
        countParams.push(status);
        countParamCount++;
      }

      if (search) {
        countQuery += ` AND (u.email ILIKE $${countParamCount} OR u.organization_name ILIKE $${countParamCount})`;
        countParams.push(`%${search}%`);
      }

      const countResult = await db.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      // Log activity
      console.log(`[ADMIN ACTION] ${req.user.email} accessed companies list at ${new Date().toISOString()}`);

      res.status(200).json({
        success: true,
        companies: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch companies",
        error: error.message
      });
    }
  }
};
