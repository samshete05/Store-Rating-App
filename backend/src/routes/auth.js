const express = require("express");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const { createUser, getUserByEmail, getUserById, verifyPassword, updatePassword } = require("../services/users");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function toPublicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    address: user.address,
    role: user.role,
    storeId: user.store_id,
  };
}

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, address, password } = req.body;
    const user = await createUser({ name, email, address, password, role: "normal_user" });
    res.status(201).json({ user: toPublicUser(user) });
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

    res.json({ token, user: toPublicUser(user) });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.auth.sub);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: toPublicUser(user) });
  })
);

router.patch(
  "/me/password",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { password } = req.body;
    await updatePassword(req.auth.sub, password);
    res.json({ ok: true });
  })
);

module.exports = router;
