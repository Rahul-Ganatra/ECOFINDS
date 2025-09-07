const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    age: {
      type: Number,
      min: 0,
      max: 80,
    },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    phoneno: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String, // store image URL or path
      default: "default-profile.png",
    },

    // 📧 Email Verification Fields
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailOtp: {
      type: String, // store hashed OTP
    },
    emailOtpExpires: {
      type: Date, // OTP expiration time
    },

    blogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 🔹 Pre-save: Hash password if modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔹 Compare entered password with hashed one
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 🔹 Generate and set email OTP (hashed) + expiry
userSchema.methods.generateEmailOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailOtp = crypto.createHash("sha256").update(otp).digest("hex");
  this.emailOtpExpires = Date.now() + 10 * 60 * 1000; // 10 min
  return otp; // return plain OTP for sending in email
};

// 🔹 Verify provided OTP
userSchema.methods.verifyEmailOtp = function (enteredOtp) {
  const hashedEnteredOtp = crypto
    .createHash("sha256")
    .update(enteredOtp)
    .digest("hex");
  const isMatch = hashedEnteredOtp === this.emailOtp;
  const notExpired = Date.now() < this.emailOtpExpires;
  return isMatch && notExpired;
};

// 🔹 Mark email as verified & clear OTP
userSchema.methods.markEmailVerified = function () {
  this.isEmailVerified = true;
  this.emailOtp = undefined;
  this.emailOtpExpires = undefined;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
