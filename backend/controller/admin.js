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
    // Build stats object with safe queries
    const statsResult = {
      total_users: 0,
      companies: 0,
      universities: 0,
      students: 0,
      mentors: 0,
      advisors: 0,
      applications: 0,
      messages: 0
    };

    // Query each table separately with error handling
    try {
      const usersResult = await db.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE role = 'company') as companies,
          COUNT(*) FILTER (WHERE role = 'university') as universities,
          COUNT(*) FILTER (WHERE role = 'student') as students
        FROM users
      `);
      Object.assign(statsResult, usersResult.rows[0]);
    } catch (err) {
      console.error('Error fetching user stats:', err.message);
    }

    // Mentors table
    try {
      const mentorsResult = await db.query('SELECT COUNT(*) as mentors FROM mentors');
      statsResult.mentors = mentorsResult.rows[0].mentors;
    } catch (err) {
      console.log('Mentors table not available');
    }

    // Advisors table
    try {
      const advisorsResult = await db.query('SELECT COUNT(*) as advisors FROM advisors');
      statsResult.advisors = advisorsResult.rows[0].advisors;
    } catch (err) {
      console.log('Advisors table not available');
    }

    // Applications table
    try {
      const applicationsResult = await db.query('SELECT COUNT(*) as applications FROM universityapplications');
      statsResult.applications = applicationsResult.rows[0].applications;
    } catch (err) {
      console.log('Applications table not available');
    }

    // Messages table
    try {
      const messagesResult = await db.query('SELECT COUNT(*) as messages FROM messages');
      statsResult.messages = messagesResult.rows[0].messages;
    } catch (err) {
      console.log('Messages table not available');
    }

    res.status(200).json({
      success: true,
      stats: statsResult
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

    const targetUser = userCheck.rows[0];

    // SECURITY: Prevent admins from deleting other admins
    if (targetUser.role === 'admin') {
      console.log(`[SECURITY BLOCK] ${req.user.email} attempted to delete admin user ${userId} at ${new Date().toISOString()}`);
      return res.status(403).json({
        success: false,
        message: "Cannot delete admin users. Admin accounts are protected for system security."
      });
    }

    // SECURITY: Prevent admin from deleting themselves
    if (userId === req.user.id) {
      console.log(`[SECURITY BLOCK] ${req.user.email} attempted to delete their own account at ${new Date().toISOString()}`);
      return res.status(403).json({
        success: false,
        message: "Cannot delete your own account. Please contact another administrator."
      });
    }

    // Log the deletion attempt
    console.log(`[ADMIN ACTION] ${req.user.email} is deleting user ${targetUser.email} (${targetUser.role}) at ${new Date().toISOString()}`);

    // Delete user (cascade will handle related records)
    await db.query("DELETE FROM users WHERE id = $1", [userId]);

    // Log successful deletion
    console.log(`[ADMIN ACTION] User ${targetUser.email} successfully deleted by ${req.user.email}`);

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

    // Check if target user exists and get their current role
    const userCheck = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const targetUser = userCheck.rows[0];

    // SECURITY: Prevent changing admin roles
    if (targetUser.role === 'admin' || role === 'admin') {
      console.log(`[SECURITY BLOCK] ${req.user.email} attempted to change role involving admin for user ${userId} at ${new Date().toISOString()}`);
      return res.status(403).json({
        success: false,
        message: "Cannot modify admin roles. Admin role assignments are protected for system security."
      });
    }

    // SECURITY: Prevent changing own role
    if (userId === req.user.id) {
      console.log(`[SECURITY BLOCK] ${req.user.email} attempted to change their own role at ${new Date().toISOString()}`);
      return res.status(403).json({
        success: false,
        message: "Cannot change your own role. Please contact another administrator."
      });
    }

    // Perform the role update
    const result = await db.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING *",
      [role, userId]
    );

    // Log activity
    console.log(`[ADMIN ACTION] ${req.user.email} changed role of user ${targetUser.email} from ${targetUser.role} to ${role} at ${new Date().toISOString()}`);

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

    // Check if user exists and get their role
    const userCheck = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const targetUser = userCheck.rows[0];

    // SECURITY: Prevent suspending admin accounts
    if (targetUser.role === 'admin') {
      console.log(`[SECURITY BLOCK] ${req.user.email} attempted to change status of admin user ${userId} at ${new Date().toISOString()}`);
      return res.status(403).json({
        success: false,
        message: "Cannot modify admin account status. Admin accounts are protected for system security."
      });
    }

    // SECURITY: Prevent changing own status
    if (userId === req.user.id) {
      console.log(`[SECURITY BLOCK] ${req.user.email} attempted to change their own status at ${new Date().toISOString()}`);
      return res.status(403).json({
        success: false,
        message: "Cannot change your own account status."
      });
    }

    // Update status
    const result = await db.query(
      "UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [status, userId]
    );

    // Log activity
    console.log(`[ADMIN ACTION] ${req.user.email} ${status === 'suspended' ? 'suspended' : 'activated'} user ${targetUser.email} at ${new Date().toISOString()}`);

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

// Get advanced analytics
const getAdvancedAnalytics = async (req, res) => {
  try {
    const analytics = {
      applicationMetrics: {},
      topCompanies: [],
      topUniversities: [],
      growthTrends: {},
      successRates: {},
      platformHealth: {}
    };

    // 1. Application Success Metrics
    try {
      const appMetrics = await db.query(`
        SELECT 
          COUNT(*) as total_applications,
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
          COUNT(*) FILTER (WHERE status = 'under_review') as under_review,
          ROUND(
            (COUNT(*) FILTER (WHERE status = 'accepted')::numeric / 
            NULLIF(COUNT(*), 0) * 100), 2
          ) as acceptance_rate,
          ROUND(
            (COUNT(*) FILTER (WHERE status = 'rejected')::numeric / 
            NULLIF(COUNT(*), 0) * 100), 2
          ) as rejection_rate,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as applications_this_week,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as applications_this_month
        FROM universityapplications
      `);
      analytics.applicationMetrics = appMetrics.rows[0];
    } catch (err) {
      console.log('Application metrics not available:', err.message);
    }

    // 2. Top Performing Companies (most applications received)
    try {
      const topCompanies = await db.query(`
        SELECT 
          u.organization_name as company_name,
          u.email,
          COUNT(ca.id) as total_applications,
          COUNT(*) FILTER (WHERE ca.status = 'accepted') as accepted_applications,
          COUNT(*) FILTER (WHERE ca.status = 'pending') as pending_applications,
          ROUND(
            (COUNT(*) FILTER (WHERE ca.status = 'accepted')::numeric / 
            NULLIF(COUNT(ca.id), 0) * 100), 2
          ) as acceptance_rate
        FROM users u
        LEFT JOIN companyapplications ca ON ca.company_id = u.id
        WHERE u.role = 'company'
        GROUP BY u.id, u.organization_name, u.email
        HAVING COUNT(ca.id) > 0
        ORDER BY total_applications DESC
        LIMIT 10
      `);
      analytics.topCompanies = topCompanies.rows;
    } catch (err) {
      console.log('Top companies not available:', err.message);
    }

    // 3. Most Active Universities (most applications sent)
    try {
      const topUniversities = await db.query(`
        SELECT 
          u.organization_name as university_name,
          u.email,
          COUNT(ua.id) as total_applications,
          COUNT(*) FILTER (WHERE ua.status = 'accepted') as accepted_applications,
          COUNT(*) FILTER (WHERE ua.status = 'pending') as pending_applications,
          ROUND(
            (COUNT(*) FILTER (WHERE ua.status = 'accepted')::numeric / 
            NULLIF(COUNT(ua.id), 0) * 100), 2
          ) as success_rate
        FROM users u
        LEFT JOIN universityapplications ua ON ua.university_id = u.id
        WHERE u.role = 'university'
        GROUP BY u.id, u.organization_name, u.email
        HAVING COUNT(ua.id) > 0
        ORDER BY total_applications DESC
        LIMIT 10
      `);
      analytics.topUniversities = topUniversities.rows;
    } catch (err) {
      console.log('Top universities not available:', err.message);
    }

    // 4. Growth Trends (last 30 days)
    try {
      const growthTrends = await db.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) FILTER (WHERE role = 'company') as companies_registered,
          COUNT(*) FILTER (WHERE role = 'university') as universities_registered,
          COUNT(*) FILTER (WHERE role = 'student') as students_registered,
          COUNT(*) as total_registered
        FROM users
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `);
      analytics.growthTrends = {
        daily: growthTrends.rows,
        summary: {
          total_new_users_30d: growthTrends.rows.reduce((sum, row) => sum + parseInt(row.total_registered), 0),
          avg_daily_registrations: Math.round(
            growthTrends.rows.reduce((sum, row) => sum + parseInt(row.total_registered), 0) / 
            Math.max(growthTrends.rows.length, 1)
          )
        }
      };
    } catch (err) {
      console.log('Growth trends not available:', err.message);
    }

    // 5. Application Trends (last 30 days)
    try {
      const applicationTrends = await db.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as applications_count,
          COUNT(*) FILTER (WHERE status = 'accepted') as accepted_count,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count
        FROM universityapplications
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `);
      analytics.applicationTrends = applicationTrends.rows;
    } catch (err) {
      console.log('Application trends not available:', err.message);
    }

    // 6. Platform Health Metrics
    try {
      const healthMetrics = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
          (SELECT COUNT(*) FROM users WHERE status = 'suspended') as suspended_users,
          (SELECT COUNT(*) FROM users WHERE email_verified = true) as verified_users,
          (SELECT COUNT(*) FROM users WHERE email_verified = false) as unverified_users,
          (SELECT COUNT(*) FROM messages WHERE created_at >= NOW() - INTERVAL '24 hours') as messages_24h,
          (SELECT COUNT(*) FROM universityapplications WHERE created_at >= NOW() - INTERVAL '24 hours') as applications_24h
      `);
      analytics.platformHealth = healthMetrics.rows[0];
    } catch (err) {
      console.log('Platform health metrics not available:', err.message);
    }

    // 7. Department Distribution (applications by department)
    try {
      const departmentStats = await db.query(`
        SELECT 
          department,
          COUNT(*) as application_count,
          COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          ROUND(
            (COUNT(*) FILTER (WHERE status = 'accepted')::numeric / 
            NULLIF(COUNT(*), 0) * 100), 2
          ) as acceptance_rate
        FROM universityapplications
        WHERE department IS NOT NULL
        GROUP BY department
        ORDER BY application_count DESC
        LIMIT 10
      `);
      analytics.departmentDistribution = departmentStats.rows;
    } catch (err) {
      console.log('Department stats not available:', err.message);
    }

    // 8. Response Time Analytics
    try {
      const responseTimeStats = await db.query(`
        SELECT 
          AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600)::numeric(10,2) as avg_response_hours,
          MIN(EXTRACT(EPOCH FROM (updated_at - created_at))/3600)::numeric(10,2) as min_response_hours,
          MAX(EXTRACT(EPOCH FROM (updated_at - created_at))/3600)::numeric(10,2) as max_response_hours,
          COUNT(*) FILTER (
            WHERE updated_at - created_at <= INTERVAL '24 hours'
          ) as responded_within_24h,
          COUNT(*) as total_responded
        FROM universityapplications
        WHERE status != 'pending' AND updated_at IS NOT NULL
      `);
      analytics.responseTimeMetrics = responseTimeStats.rows[0];
    } catch (err) {
      console.log('Response time metrics not available:', err.message);
    }

    res.status(200).json({
      success: true,
      analytics: analytics
    });

  } catch (error) {
    console.error("Error fetching advanced analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch advanced analytics",
      error: error.message
    });
  }
};

// Get all universities (simplified for admin view)
const getAllUniversities = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, email, organization_name, status, created_at 
      FROM users 
      WHERE role = 'university' 
      ORDER BY created_at DESC
    `);
    
    res.status(200).json({
      success: true,
      universities: result.rows
    });
  } catch (error) {
    console.error("Error fetching universities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch universities",
      error: error.message
    });
  }
};

// Get all companies (simplified for admin view)
const getAllCompanies = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, email, organization_name, status, created_at 
      FROM users 
      WHERE role = 'company' 
      ORDER BY created_at DESC
    `);
    
    res.status(200).json({
      success: true,
      companies: result.rows
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch companies",
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
  getAdvancedAnalytics,
  getAllUniversities,
  getAllCompaniesnalytics,
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
