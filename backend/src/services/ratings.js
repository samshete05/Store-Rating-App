const { pool } = require("../config/db");
const { validateFeedback, validateRating } = require("../utils/validation");

function publicRating(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    storeId: row.store_id,
    rating: Number(row.rating),
    feedback: row.feedback || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userName: row.user_name || null,
    userEmail: row.user_email || null,
    storeName: row.store_name || null,
  };
}

async function submitRating({ userId, storeId, rating, feedback = "" }) {
  const error = validateRating(rating);
  if (error) throw new Error(error);

  const feedbackError = validateFeedback(feedback);
  if (feedbackError) throw new Error(feedbackError);

  const normalizedFeedback = String(feedback || "").trim();

  const result = await pool.query(
    `insert into ratings (user_id, store_id, rating, feedback)
     values ($1, $2, $3, $4)
     on conflict (user_id, store_id)
     do update set rating = excluded.rating, feedback = excluded.feedback, updated_at = now()
     returning *`,
    [userId, storeId, Number(rating), normalizedFeedback]
  );
  return publicRating(result.rows[0]);
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
  return result.rows.map(publicRating);
}

async function listAllRatings() {
  const result = await pool.query("select * from ratings order by updated_at desc");
  return result.rows.map(publicRating);
}

module.exports = { submitRating, listRatingsForStoreIds, listRatings, listAllRatings, publicRating };
