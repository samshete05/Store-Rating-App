const bcrypt = require("bcrypt");
const { pool } = require("../config/db");
const {
  validateAddress,
  validateEmail,
  validateName,
  validatePassword,
  validateRole,
} = require("../utils/validation");

function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    address: row.address,
    role: row.role,
    storeId: row.store_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getUserByEmail(email) {
  const result = await pool.query("select * from users where lower(email) = lower($1) limit 1", [email]);
  return result.rows[0] || null;
}

async function getUserById(id) {
  const result = await pool.query("select * from users where id = $1 limit 1", [id]);
  return result.rows[0] || null;
}

async function createUser({ name, email, address, password, role = "normal_user", storeId = null }) {
  const errors = [
    validateName(name),
    validateEmail(email),
    validateAddress(address),
    validatePassword(password),
    validateRole(role),
  ].filter(Boolean);
  if (errors.length) throw new Error(errors[0]);

  if (storeId && role !== "store_owner") {
    throw new Error("Store assignment is only allowed for store owners.");
  }

  const existing = await getUserByEmail(email);
  if (existing) throw new Error("This email is already registered.");

  const passwordHash = await bcrypt.hash(password, 10);
  const client = await pool.connect();

  try {
    await client.query("begin");

    if (storeId) {
      const storeCheck = await client.query("select id from stores where id = $1 limit 1", [storeId]);
      if (!storeCheck.rows[0]) {
        throw new Error("Store not found.");
      }
    }

    const result = await client.query(
      `insert into users (name, email, address, password_hash, role, store_id)
       values ($1, $2, $3, $4, $5, $6)
       returning *`,
      [name.trim(), email.trim().toLowerCase(), address.trim(), passwordHash, role, storeId]
    );

    if (storeId) {
      await client.query(
        `update stores
         set owner_id = $2,
             updated_at = now()
         where id = $1`,
        [storeId, result.rows[0].id]
      );
    }

    await client.query("commit");
    return result.rows[0];
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

async function updatePassword(userId, password) {
  const error = validatePassword(password);
  if (error) throw new Error(error);
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `update users
     set password_hash = $2,
         updated_at = now()
     where id = $1
     returning *`,
    [userId, passwordHash]
  );
  return publicUser(result.rows[0] || null);
}

async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.password_hash);
}

async function listUsers(search = "") {
  const q = `%${String(search).trim().toLowerCase()}%`;
  const result = await pool.query(
    `select * from users
     where $1 = '%%'
        or lower(name) like $1
        or lower(email) like $1
        or lower(address) like $1
        or lower(role) like $1
     order by created_at desc`,
    [q]
  );
  return result.rows;
}

module.exports = {
  publicUser,
  getUserByEmail,
  getUserById,
  createUser,
  updatePassword,
  verifyPassword,
  listUsers,
};
