const db = require("../config/dbConnection");

// Get all users with pagination
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 7, role, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, email, first_name, last_name, role, created_at, 
             CASE 
               WHEN role = 'student' THEN (SELECT university_name FROM students WHERE user_id = users.id)
               WHEN role = 'company' THEN (SELECT company_name FROM companies WHERE user_id = users.id)
               WHEN role = 'university' THEN (SELECT university_name FROM universities WHERE user_id = users.id)
               ELSE NULL
             END as organization
      FROM users
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (role) {
      query += ` AND role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    if (search) {
      query += ` AND (email ILIKE $${paramCount} OR first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM users WHERE 1=1`;
    const countParams = [];
    let countParamCount = 1;

    if (role) {
      countQuery += ` AND role = $${countParamCount}`;
      countParams.push(role);
      countParamCount++;
    }

    if (search) {
      countQuery += ` AND (email ILIKE $${countParamCount} OR first_name ILIKE $${countParamCount} OR last_name ILIKE $${countParamCount})`;
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
    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'company') as companies,
        (SELECT COUNT(*) FROM users WHERE role = 'university') as universities,
        (SELECT COUNT(*) FROM users WHERE role = 'student') as students,
        (SELECT COUNT(*) FROM mentors) as mentors,
        (SELECT COUNT(*) FROM advisors) as advisors,
        (SELECT COUNT(*) FROM messages) as messages,
        (SELECT COUNT(*) FROM applications) as applications
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

module.exports = {
  getAllUsers,
  getDashboardStats,
  deleteUser,
  updateUserRole,
  getAllMessages
};
