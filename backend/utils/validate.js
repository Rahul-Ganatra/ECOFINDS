// Basic validation utility
const validate = (data) => {
  if (!data) {
    throw new Error("Data is required");
  }

  const { name, emailId, password } = data;

  if (!name || name.trim().length === 0) {
    throw new Error("First name is required");
  }

  if (!emailId || !emailId.includes("@")) {
    throw new Error("Valid email is required");
  }

  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  return true;
};

module.exports = validate;
