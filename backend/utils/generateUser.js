
const crypto = require("crypto");

function generateEmail(firstName, lastName, role) {
  switch (role) {
    case "admin":
      return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@admin.com`;
    case "student":
      return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@university.com`;
    case "university":
      return `${firstName.toLowerCase()}University@gmail.com`;
    case "company":
      return `${firstName.toLowerCase()}@company.com`;
  }
}

function generatePassword() {
  return crypto.randomBytes(6).toString("hex"); // random 12-char password
}

module.exports = { generateEmail, generatePassword };
