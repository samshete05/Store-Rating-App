const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRoles } = require("../middleware/auth");
const { listStores } = require("../services/stores");
const { pool } = require("../config/db");

const router = express.Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const stores = await listStores(req.query.search || "");
    const result = await Promise.all(
      stores.map(async (store) => {
        const avg = await pool.query(
          "select coalesce(avg(rating), 0)::numeric(10,2) as avg from ratings where store_id = $1",
          [store.id]
        );
        const userRating = await pool.query(
          "select * from ratings where store_id = $1 and user_id = $2 limit 1",
          [store.id, req.auth.sub]
        );
        return {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          ownerId: store.owner_id,
          ownerName: store.owner_name || null,
          averageRating: Number(avg.rows[0].avg),
          submittedRating: userRating.rows[0] ? Number(userRating.rows[0].rating) : null,
        };
      })
    );

    res.json({ stores: result });
  })
);

module.exports = router;
