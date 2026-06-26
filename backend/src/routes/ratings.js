const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRoles } = require("../middleware/auth");
const { submitRating } = require("../services/ratings");
const { getStoreById, listOwnedStores } = require("../services/stores");
const { pool } = require("../config/db");

const router = express.Router();

router.post(
  "/",
  requireAuth,
  requireRoles("normal_user"),
  asyncHandler(async (req, res) => {
    const { storeId, rating } = req.body;
    const store = await getStoreById(storeId);
    if (!store) return res.status(404).json({ message: "Store not found." });
    const result = await submitRating({ userId: req.auth.sub, storeId, rating });
    res.status(201).json({ rating: result });
  })
);

router.get(
  "/owner",
  requireAuth,
  requireRoles("store_owner"),
  asyncHandler(async (req, res) => {
    const stores = await listOwnedStores(req.auth.sub);
    const storeIds = stores.map((store) => store.id);
    if (!storeIds.length) return res.json({ stores: [], reviews: [] });

    const reviews = await pool.query(
      `select r.*, u.name as user_name, u.email as user_email, s.name as store_name
       from ratings r
       join users u on u.id = r.user_id
       join stores s on s.id = r.store_id
       where r.store_id = any($1::uuid[])
       order by r.updated_at desc`,
      [storeIds]
    );

    const averages = await pool.query(
      `select store_id, coalesce(avg(rating), 0)::numeric(10,2) as avg, count(*)::int as total
       from ratings
       where store_id = any($1::uuid[])
       group by store_id`,
      [storeIds]
    );

    res.json({
      stores,
      reviews: reviews.rows,
      averages: averages.rows,
    });
  })
);

module.exports = router;
