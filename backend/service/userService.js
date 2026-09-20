// src/services/auth.service.js
const { v4: uuidv4 } = require("uuid");
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateToken } = require("../utils/token");
const User = require("../models/userModel");
const crypto = require("crypto");

// Generate random password
const generateRandomPassword = () => crypto.randomBytes(6).toString("hex");

// Generate email based on role
const generateEmail = (firstName, lastName, role) => {
  switch (role) {
    case "admin":
        return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@admin.com`;
    case "student":
      return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@university.com`;
    case "university":
      return `${firstName.toLowerCase()}University@gmail.com`;
    case "company":
      return `${firstName.toLowerCase()}@company.com`;
    default:
      return `${firstName.toLowerCase()}@example.com`;
  }
};

exports.registerUser = async ({ firstName, lastName, role }) => {
  const email = generateEmail(firstName, lastName, role);
  const tempPassword = generateRandomPassword();
  const hashedPassword = await hashPassword(tempPassword);
  const user = await User.createUser({
    id: uuidv4(),
    email,
    hashedPassword,
    role,
  });
  return { email: user.email, password: tempPassword };
};

exports.loginUser = async (email, password) => {
  const user = await User.findByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const valid = await comparePassword(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  // First login check
  if (user.first_login) return { firstLogin: true, userId: user.id };

  const token = generateToken(user);
  return { token, role: user.role };
};

exports.changePassword = async (userId, newPassword) => {
  const hashed = await hashPassword(newPassword);
  await User.updatePassword(userId, hashed);
};

exports.changeEmail = async (userId, newEmail) => {
  await User.updateEmail(userId, newEmail);
};
