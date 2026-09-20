const { v4: uuidv4 } = require("uuid");
const Application = require("../models/application");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_FILE_TYPES = ["application/pdf"];
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const validateFile = (file, fieldName) => {
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    throw new Error(`${fieldName} must be a PDF file`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`${fieldName} must be less than 2MB`);
  }
};

const saveFile = async (file, prefix) => {
  const extension = path.extname(file.name);
  const fileName = `${prefix}_${uuidv4()}${extension}`;
  const filePath = path.join(uploadDir, fileName);
  await file.mv(filePath);
  return `/uploads/${fileName}`;
};

exports.applyInternship = async (req, res) => {
  let cvUrl;
  let resumeUrl;

  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const universityId = req.user.id;

    const {
      first_name,
      last_name,
      department,
      academic_year,
      email,
      github_link,
      linkedin_link,
      company_id
    } = req.body;

    const requiredFields = {
      first_name,
      last_name,
      email,
      company_id,
      department,
      academic_year,
      github_link,
      linkedin_link
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`
      });
    }

    if (!req.files || !req.files.cv || !req.files.resume) {
      return res.status(400).json({
        message: "Both CV and Resume files are required"
      });
    }

    validateFile(req.files.cv, "CV");
    validateFile(req.files.resume, "Resume");

    cvUrl = await saveFile(req.files.cv, "cv");
    resumeUrl = await saveFile(req.files.resume, "resume");

    const applicationId = uuidv4();
    const timestamp = new Date();

    // Create in universityapplications table
    await Application.createApplication({
      id: uuidv4(),
      application_id: applicationId,
      university_id: universityId,
      company_id,
      first_name,
      last_name,
      department,
      academic_year,
      email,
      github_link,
      linkedin_link,
      cv_url: cvUrl,
      resume_url: resumeUrl,
      status: "pending",
      created_at: timestamp
    });

    // Also create in companyapplications table
    await Application.createCompanyApplication({
      id: uuidv4(),
      application_id: applicationId,
      university_id: universityId,
      company_id,
      first_name,
      last_name,
      department,
      academic_year,
      email,
      github_link,
      linkedin_link,
      cv_url: cvUrl,
      resume_url: resumeUrl,
      status: "pending",
      created_at: timestamp
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application_id: applicationId,
      cv_url: cvUrl,
      resume_url: resumeUrl
    });

  } catch (err) {

    if (cvUrl) {
      const cvPath = path.join(uploadDir, path.basename(cvUrl));
      if (fs.existsSync(cvPath)) fs.unlinkSync(cvPath);
    }

    if (resumeUrl) {
      const resumePath = path.join(uploadDir, path.basename(resumeUrl));
      if (fs.existsSync(resumePath)) fs.unlinkSync(resumePath);
    }

    console.error("APPLICATION SUBMISSION ERROR:", err);
    res.status(500).json({
      message: "Server error during application submission",
      error: err.message
    });
  }
};

exports.getUniversityApplications = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const applications = await Application.getApplicationsByUniversity(
      req.user.id,
      { limit, offset, status }
    );

    const total = await Application.getApplicationsCountByUniversity(
      req.user.id,
      status
    );

    res.json({
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error("UNIVERSITY APPLICATIONS ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getCompanyApplications = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const applications = await Application.getApplicationsByCompany(
      req.user.id,
      { limit, offset, status }
    );

    const total = await Application.getApplicationsCountByCompany(
      req.user.id,
      status
    );

    res.json({
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error("COMPANY APPLICATIONS ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.reviewApplication = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { status, feedback } = req.body;
    const applicationId = req.params.id;

    const validStatuses = ["accepted", "rejected", "under_review", "pending", "withdrawn"];
    const normalizedStatus = status?.toLowerCase();

    if (!normalizedStatus || !validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: " + validStatuses.join(", ")
      });
    }

    const application = await Application.getApplicationById(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Allow any company to review any application (removed company_id check)

    const updatedApplication = await Application.updateStatus(
      applicationId,
      normalizedStatus,
      feedback,
      req.user.id
    );

    res.json({
      message: `Application ${normalizedStatus}`,
      application: updatedApplication
    });

  } catch (err) {
    console.error("REVIEW APPLICATION ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const applicationId = req.params.id;
    const application = await Application.getApplicationById(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (
      application.university_id !== req.user.id &&
      application.company_id !== req.user.id
    ) {
      return res.status(403).json({
        message: "You don't have permission to view this application"
      });
    }

    res.json(application);

  } catch (err) {
    console.error("GET APPLICATION ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.withdrawApplication = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const applicationId = req.params.id;
    const application = await Application.getApplicationById(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.university_id !== req.user.id) {
      return res.status(403).json({
        message: "You don't have permission to withdraw this application"
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        message: "Can only withdraw applications with 'pending' status"
      });
    }

    await Application.updateStatus(
      applicationId,
      "withdrawn",
      "Application withdrawn by university",
      req.user.id
    );

    res.json({ message: "Application withdrawn successfully" });

  } catch (err) {
    console.error("WITHDRAW APPLICATION ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getCompanyStats = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const stats = await Application.getCompanyStats(req.user.id);
    res.json(stats);

  } catch (err) {
    console.error("GET COMPANY STATS ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};