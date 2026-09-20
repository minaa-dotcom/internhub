const jwt = require("jsonwebtoken");

// Generate JWT
exports.generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Verify JWT
exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
