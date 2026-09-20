const bcrypt = require("bcrypt");

// Hash a password
exports.hashPassword = async (password) => {
  if (!password) {
    throw new Error("Password is required for hashing");
  }
  return bcrypt.hash(password, 12);
};

// Compare password
exports.comparePassword = async (password, hash) => {
  if (!password || !hash) {
    return false;
  }
  return bcrypt.compare(password, hash);
};
