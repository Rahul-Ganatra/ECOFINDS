const express = require("express");
const authRouter = express.Router();
const {
  register,
  verifyEmail,
  resendOtp,
  login,
  logout,
  getProfile,
} = require("../controllers/userAuthentication");
const userMiddleware = require("../middleware/userMiddleware");
// const adminMiddleware = require("../middleware/adminMiddleware"); // not needed here now

// 🔹 Register (sends OTP to email)
authRouter.post("/register", register);

// 🔹 Verify Email with OTP
authRouter.post("/verify-email", verifyEmail);

// 🔹 Resend OTP
authRouter.post("/resend-otp", resendOtp);

// 🔹 Login (only works if email verified)
authRouter.post("/login", login);

// 🔹 Log out
authRouter.post("/logout", logout);

// 🔹 Get Profile (protected)
authRouter.get("/profile", userMiddleware, getProfile);

module.exports = authRouter;
