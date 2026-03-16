import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET;

export default async function authMiddleware(req, res, next) {
  // GRAB THE BEARED TOKEN FROM AUTH HEADER

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Not Authorized, token missing" });
  }

  const token = authHeader.split(" ")[1];

  // *VERIFY & ATTACH USER OBJECT

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "USer not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("JWT Verification failed", error);
    return res
      .status(401)
      .json({ success: false, message: "Token invalid or Expired" });
  }
}
