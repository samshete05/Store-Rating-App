const { pool } = require("../config/db");
const { validateAddress, validateEmail, validateStoreName } = require("../utils/validation");

async function listStores(search = "") {
  const q = `%${String(search).trim().toLowerCase()}%`;
  const result = await pool.query(
    `select s.*, u.name as owner_name
     from stores s
     left join users u on u.id = s.owner_id
     where ($1 = '%%' or lower(s.name) like $1 or lower(s.address) like $1 or lower(s.email) like $1)
     order by s.created_at desc`,
    [q]
  );
  return result.rows;
}

async function createStore({ name, email, address, ownerId = null }) {
  const errors = [validateStoreName(name), validateEmail(email), validateAddress(address)].filter(Boolean);
  if (errors.length) throw new Error(errors[0]);

  const existing = await pool.query("select id from stores where lower(email) = lower($1) limit 1", [email]);
  if (existing.rows[0]) throw new Error("This store email is already registered.");

  const result = await pool.query(
    `insert into stores (name, email, address, owner_id)
     values ($1, $2, $3, $4)
     returning *`,
    [name.trim(), email.trim().toLowerCase(), address.trim(), ownerId]
  );

  if (ownerId) {
    await pool.query(
      `update users
       set role = 'store_owner', store_id = $2, updated_at = now()
       where id = $1`,
      [ownerId, result.rows[0].id]
    );
  }

  return result.rows[0];
}

async function getStoreById(id) {
  const result = await pool.query("select * from stores where id = $1 limit 1", [id]);
  return result.rows[0] || null;
}

async function listOwnedStores(ownerId) {
  const result = await pool.query("select * from stores where owner_id = $1 order by created_at desc", [ownerId]);
  return result.rows;
}

module.exports = {
  listStores,
  createStore,
  getStoreById,
  listOwnedStores,
};
