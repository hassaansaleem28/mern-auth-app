import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";
import transporter from "../config/nodemailer.js";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplates.js";

export async function register(req, res) {
  const { email, password, name } = req.body;
  if (!email || !name || !password)
    return res.json({ success: false, message: "Missing Details" });
  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser)
      return res.json({ success: false, message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new UserModel({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: none,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const emailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Hassaan's Website",
      text: `Welcome to our website. Your account has been created with email id : ${email}`,
    };
    await transporter.sendMail(emailOptions);

    return res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({
      success: false,
      message: "Email and Password are required!",
    });
  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "Invalid Email!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({ success: false, message: "Invalid Password!" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: none,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: "Logged In Successfully!" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: none,
    });
    return res.json({ success: true, message: "Logged Out" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
}

export async function sendVerifyOtp(req, res) {
  try {
    const { userId } = req.body;
    const user = await UserModel.findById(userId);
    if (user.isAccountVerified)
      return res.json({ success: true, message: "Email already Verified" });

    const OTP = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyotp = OTP;
    user.verifyotpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const emailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Email Verification OTP",
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", OTP).replace(
        "{{email}}",
        user.email
      ),
    };
    await transporter.sendMail(emailOptions);

    return res.json({
      success: true,
      message: "Verification OTP sent on email!",
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
}
export async function verifyEmail(req, res) {
  const { userId } = req.body;
  const OTP = req.headers["x-otp"];

  if (!userId || !OTP)
    return res.json({ success: false, message: "Missing Details." });
  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });
    if (user.verifyotp === "" || user.verifyotp !== OTP)
      return res.json({ success: "false", message: "Invalid OTP" });
    if (user.verifyotpExpireAt < Date.now())
      return res.json({ success: false, message: "OTP expired!" });

    user.isAccountVerified = true;
    user.verifyotp = "";
    user.verifyotpExpireAt = 0;
    await user.save();
    return res.json({
      success: true,
      message: "Email Verified Successfully!",
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
}

export async function isAuthenticated(req, res) {
  try {
    return res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
}

export async function sendResetOtp(req, res) {
  const { email } = req.body;
  if (!email)
    return res.json({ success: false, message: "Email is required!" });
  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const OTP = String(Math.floor(100000 + Math.random() * 900000));
    user.resetotp = OTP;
    user.resetotpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const emailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", OTP).replace(
        "{{email}}",
        user.email
      ),
    };
    await transporter.sendMail(emailOptions);

    return res.json({
      success: true,
      message: "OTP sent to your email!",
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
}
export async function resetPassword(req, res) {
  const { email, OTP, newPassword } = req.body;
  if (!email || !OTP || !newPassword)
    return res.json({
      success: false,
      message: "OTP, Email and New Password is required!",
    });
  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });
    if (user.resetotp === "" || user.resetotp !== OTP)
      return res.json({ succes: false, message: "Invalid OTP" });
    if (user.resetotpExpireAt < Date.now())
      return res.json({ succes: false, message: "OTP expired!" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetotp = "";
    user.resetotpExpireAt = 0;

    await user.save();
    return res.json({
      success: true,
      message: "Password has been reset successfully!",
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
}
