const db = require("../config/dbConnection");

// Create a new internship post
exports.createPost = async (req, res) => {
  try {
    const companyId = req.user.id;
    const {
      company_name, title, department, location, work_type,
      duration, stipend, description, requirements,
      skills_required, positions_available, deadline
    } = req.body;

    if (!title || !description || !company_name) {
      return res.status(400).json({ message: "title, description and company_name are required" });
    }

    const result = await db.query(
      `INSERT INTO public.internship_posts
        (company_id, company_name, title, department, location, work_type,
         duration, stipend, description, requirements, skills_required,
         positions_available, deadline)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [companyId, company_name, title, department, location, work_type || 'on-site',
       duration, stipend, description, requirements, skills_required,
       positions_available || 1, deadline || null]
    );

    res.status(201).json({ success: true, post: result.rows[0] });
  } catch (err) {
    console.error("CREATE POST ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all active posts (for university dashboard)
exports.getAllActivePosts = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM public.internship_posts
       WHERE status = 'active'
       ORDER BY created_at DESC`
    );
    res.json({ success: true, posts: result.rows });
  } catch (err) {
    console.error("GET ALL POSTS ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get posts for the logged-in company
exports.getCompanyPosts = async (req, res) => {
  try {
    const companyId = req.user.id;
    const result = await db.query(
      `SELECT * FROM public.internship_posts
       WHERE company_id = $1
       ORDER BY created_at DESC`,
      [companyId]
    );
    res.json({ success: true, posts: result.rows });
  } catch (err) {
    console.error("GET COMPANY POSTS ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Close / delete a post
exports.closePost = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
      `UPDATE public.internship_posts SET status = 'closed'
       WHERE id = $1 AND company_id = $2 RETURNING *`,
      [id, companyId]
    );

    if (!result.rows[0]) return res.status(404).json({ message: "Post not found" });
    res.json({ success: true, post: result.rows[0] });
  } catch (err) {
    console.error("CLOSE POST ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
