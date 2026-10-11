const db = require("../config/dbConnection");

exports.createUser = async ({ id, email, password, role, organization_name, verification_token, verification_token_expires }) => {
  const result = await db.query(
    `INSERT INTO users (id, email, password, role, organization_name, first_login, is_active, email_verified, verification_token, verification_token_expires)
     VALUES ($1, $2, $3, $4, $5, true, true, false, $6, $7)
     RETURNING id, email, role, organization_name, first_login, is_active, email_verified`,
    [id, email, password, role, organization_name || null, verification_token, verification_token_expires]
  );
  return result.rows[0];
}

exports.findByEmail = async (email) => {
  const result = await db.query(
    "SELECT * FROM users WHERE email=$1 AND is_active=true",
    [email]
  );
  return result.rows[0];
};

exports.findByVerificationToken = async (token) => {
  const result = await db.query(
    "SELECT * FROM users WHERE verification_token=$1 AND is_active=true",
    [token]
  );
  return result.rows[0];
};

exports.verifyEmail = async (userId) => {
  await db.query(
    "UPDATE users SET email_verified=true, verification_token=NULL, verification_token_expires=NULL, updated_at=NOW() WHERE id=$1",
    [userId]
  );
};

exports.updateVerificationToken = async (userId, token, expires) => {
  await db.query(
    "UPDATE users SET verification_token=$1, verification_token_expires=$2, updated_at=NOW() WHERE id=$3",
    [token, expires, userId]
  );
};

exports.updatePassword = async (id, password) => {
  await db.query(
    "UPDATE users SET password=$1, first_login=false, updated_at=NOW() WHERE id=$2",
    [password, id]
  );
};
