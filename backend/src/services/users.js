const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const { validateAddress, validateEmail, validateName, validatePassword } = require("../utils/validation");

async function getUserByEmail(email) {
  const result = await pool.query("select * from users where lower(email) = lower($1) limit 1", [email]);
  return result.rows[0] || null;
}

async function getUserById(id) {
  const result = await pool.query("select * from users where id = $1 limit 1", [id]);
  return result.rows[0] || null;
}

async function createUser({ name, email, address, password, role = "normal_user", storeId = null }) {
  const errors = [validateName(name), validateEmail(email), validateAddress(address), validatePassword(password)].filter(Boolean);
  if (errors.length) throw new Error(errors[0]);

  const existing = await getUserByEmail(email);
  if (existing) throw new Error("This email is already registered.");

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `insert into users (name, email, address, password_hash, role, store_id)
     values ($1, $2, $3, $4, $5, $6)
     returning id, name, email, address, role, store_id, created_at, updated_at`,
    [name.trim(), email.trim().toLowerCase(), address.trim(), passwordHash, role, storeId]
  );
  return result.rows[0];
}

async function updatePassword(userId, password) {
  const error = validatePassword(password);
  if (error) throw new Error(error);
  const passwordHash = await bcrypt.hash(password, 10);
  await pool.query("update users set password_hash = $2, updated_at = now() where id = $1", [userId, passwordHash]);
}

async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.password_hash);
}

module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  updatePassword,
  verifyPassword,
};
