const { pool } = require("../config/db");
const { validateRating } = require("../utils/validation");

async function submitRating({ userId, storeId, rating }) {
  const error = validateRating(rating);
  if (error) throw new Error(error);

  const result = await pool.query(
    `insert into ratings (user_id, store_id, rating)
     values ($1, $2, $3)
     on conflict (user_id, store_id)
     do update set rating = excluded.rating, updated_at = now()
     returning *`,
    [userId, storeId, Number(rating)]
  );
  return result.rows[0];
}

async function listRatingsForStoreIds(storeIds = []) {
  if (!storeIds.length) return [];
  const result = await pool.query(
    `select r.*, u.name as user_name, u.email as user_email, s.name as store_name
     from ratings r
     join users u on u.id = r.user_id
     join stores s on s.id = r.store_id
     where r.store_id = any($1::uuid[])
     order by r.updated_at desc`,
    [storeIds]
  );
  return result.rows;
}

async function listRatings() {
  const result = await pool.query(
    `select r.*, u.name as user_name, u.email as user_email, s.name as store_name
     from ratings r
     join users u on u.id = r.user_id
     join stores s on s.id = r.store_id
     order by r.updated_at desc`
  );
  return result.rows;
}

module.exports = { submitRating, listRatingsForStoreIds, listRatings };
