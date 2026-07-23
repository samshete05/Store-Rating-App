const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRoles } = require("../middleware/auth");
const { createUser, listUsers, updatePassword, publicUser } = require("../services/users");

const router = express.Router();

router.use(requireAuth, requireRoles("admin"));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const users = await listUsers(req.query.search || "");
    res.json({ users: users.map(publicUser) });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const user = await createUser(req.body);
    res.status(201).json({ user: publicUser(user) });
  })
);

router.put(
  "/:id/password",
  asyncHandler(async (req, res) => {
    const { password } = req.body;
    const user = await updatePassword(req.params.id, password);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ user });
  })
);

module.exports = router;