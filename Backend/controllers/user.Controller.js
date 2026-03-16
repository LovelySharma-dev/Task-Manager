import userModel from "../models/user.model.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRES = process.env.TOKEN_EXPIRES;

const createToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

// *Register FUNCTION
export async function registerUser(req, res) {
  const { username, email, password } = req.body;

  console.log(req.body);
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: "Invalid email" });
  }
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be atleast 8 characters",
    });
  }
  try {
    if (await userModel.findOne({ email })) {
      return res
        .status(409)
        .json({ success: false, message: "User already Exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await userModel.create({ username, email, password: hashed });
    const token = createToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error!" });
  }
}

// *LOGIN FUNCTION
export async function loginUser(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password required" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error!" });
  }
}
// *GET CURRENT USER
export async function getCurrentUser(req, res) {
  try {
    const user = await userModel.findById(req.user.id).select("username email");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error!" });
  }
}

// *UPDATE USER PROFILE
export async function updateProfile(req, res) {
  const { username, email } = req.body;

  if (!username || !email || !validator.isEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Valid email and name reuired" });
  }

  try {
    const exists = await userModel.findOne({
      email,
      _id: { $ne: req.user.id }, //not equal to ($ne)
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Email already in use by another account!",
      });
    }
    const user = await userModel
      .findByIdAndUpdate(
        req.user.id,
        { username, email },
        { new: true, runValidators: true },
      )
      .select("username email");
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error!" });
  }
}

// *CHANGE PASSWORD FUNCTION
export async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res
      .status(400)
      .json({ success: false, message: "Password Invalid or too Short" });
  }

  try {
    const user = await userModel.findById(req.user.id).select("password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Current password Incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();
    res.json({ success: true, message: "Password changed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error!" });
  }
}
