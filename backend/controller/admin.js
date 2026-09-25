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
        (SELECT COUNT(*) FROM universityapplications) as applications
    `);

    // Note: messages table removed from query as it doesn't exist in schema
    // You can add it back when messages feature is implemented

    res.status(200).json({
      success: true,
      stats: {
        ...stats.rows[0],
        messages: 0 // Default to 0 until messages table is created
      }
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
    const { page = 1, limit = 7 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(`
      SELECT * FROM messages 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await db.query("SELECT COUNT(*) FROM messages");
    const total = parseInt(countResult.rows[0].count);

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
