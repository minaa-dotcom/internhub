
const db = require("../config/dbConnection");

exports.createCompanyApplication = async (universityApp) => {
  const result = await db.query(
    `INSERT INTO companyapplications (
      application_id,
      university_id,
      first_name,
      last_name,
      department,
      academic_year,
      email,
      github_link,
      linkedin_link,
      cv_url,
      resume_url,
      status
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
    ) RETURNING *`,
    [
      universityApp.id,
      universityApp.university_id,
      universityApp.first_name,
      universityApp.last_name,
      universityApp.department,
      universityApp.academic_year,
      universityApp.email,
      universityApp.github_link,
      universityApp.linkedin_link,
      universityApp.cv_url,
      universityApp.resume_url,
      universityApp.status
    ]
  );

  return result.rows[0];
};
