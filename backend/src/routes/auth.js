const express = require("express");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const {
  createUser,
  getUserByEmail,
  getUserById,
  verifyPassword,
  updatePassword,
  publicUser,
} = require("../services/users");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, address, password } = req.body;
    const user = await createUser({ name, email, address, password, role: "normal_user" });
    res.status(201).json({ user: publicUser(user) });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    const ok = await verifyPassword(user, password);
    if (!ok) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user: publicUser(user) });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.auth.sub);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: publicUser(user) });
  })
);

router.patch(
  "/me/password",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { password } = req.body;
    const user = await updatePassword(req.auth.sub, password);
    res.json({ ok: true, user });
  })
);

module.exports = router;
