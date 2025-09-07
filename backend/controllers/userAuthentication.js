const User = require("../models/user");
const validate = require("../utils/validate");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/emailService");

// ✅ Register with OTP sending
const register = async (req, res) => {
  try {
    validate(req.body);
    const {
      name,
      emailId,
      password,
      image,
      phoneno,
      city,
      state,
      country,
      bio,
    } = req.body;

    // Create new user instance
    const user = new User({
      name,
      emailId,
      password, // will be hashed by pre-save hook
      image,
      phoneno,
      city,
      state,
      country,
      bio,
      role: "user",
    });

    // Generate OTP and set on user
    const otp = user.generateEmailOtp();
    await user.save();

    // Send OTP email
    await sendEmail(
      emailId,
      "Verify your email",
      `Your OTP code is ${otp}. It expires in 10 minutes.`,
      `<p>Your OTP code is <b>${otp}</b>. It expires in 10 minutes.</p>`
    );

    res.status(201).send({
      message: "User Registered Successfully. Please verify your email.",
      userId: user._id,
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};

// ✅ Verify Email OTP
const verifyEmail = async (req, res) => {
  try {
    const { emailId, otp } = req.body;
    if (!emailId || !otp) {
      return res.status(400).send({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ emailId });
    if (!user) return res.status(404).send({ message: "User not found" });

    if (user.isEmailVerified) {
      return res.status(400).send({ message: "Email already verified" });
    }

    const isValid = user.verifyEmailOtp(otp);
    if (!isValid) {
      return res.status(400).send({ message: "Invalid or expired OTP" });
    }

    user.markEmailVerified();
    await user.save();

    res.send({ message: "Email verified successfully", user });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

// ✅ Resend OTP
const resendOtp = async (req, res) => {
  try {
    const { emailId } = req.body;
    if (!emailId) return res.status(400).send({ message: "Email is required" });

    const user = await User.findOne({ emailId });
    if (!user) return res.status(404).send({ message: "User not found" });

    if (user.isEmailVerified) {
      return res.status(400).send({ message: "Email already verified" });
    }

    const otp = user.generateEmailOtp();
    await user.save();

    await sendEmail(
      emailId,
      "Your new OTP code",
      `Your new OTP code is ${otp}. It expires in 10 minutes.`,
      `<p>Your new OTP code is <b>${otp}</b>. It expires in 10 minutes.</p>`
    );

    res.send({ message: "New OTP sent successfully" });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

// ✅ Login (unchanged, except you may want to block unverified emails)
const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!emailId || !password) throw new Error("Invalid Credentials");

    const user = await User.findOne({ emailId });
    if (!user) throw new Error("Invalid Credentials");

    // Optional: block login until verified
    if (!user.isEmailVerified) {
      return res
        .status(403)
        .send({ message: "Please verify your email first" });
    }

    const match = await user.comparePassword(password);
    if (!match) throw new Error("Invalid Credentials");

    const token = jwt.sign(
      { _id: user._id, emailId: emailId },
      process.env.JWT_KEY,
      { expiresIn: "24h" }
    );

    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    res.status(200).send({
      message: "Logged In Successfully",
      user: userResponse,
      token: token,
    });
  } catch (err) {
    res.status(401).send("Error: " + err.message);
  }
};

const logout = async (req, res) => {
  try {
    res.status(200).send({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports = {
  register,
  verifyEmail,
  resendOtp,
  login,
  logout,
  getProfile,
};
