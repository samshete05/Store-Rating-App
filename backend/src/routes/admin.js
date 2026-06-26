const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRoles } = require("../middleware/auth");
const { createUser, getUserById } = require("../services/users");
const { createStore, listStores, getStoreById } = require("../services/stores");
const { listRatings } = require("../services/ratings");
const { pool } = require("../config/db");

const router = express.Router();

function publicUser(row) {
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

function publicStore(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    address: row.address,
    ownerId: row.owner_id,
    ownerName: row.owner_name || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.use(requireAuth, requireRoles("admin"));

router.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const [users, stores, ratings] = await Promise.all([
      pool.query("select count(*)::int as count from users"),
      pool.query("select count(*)::int as count from stores"),
      pool.query("select count(*)::int as count from ratings"),
    ]);

    res.json({
      totalUsers: users.rows[0].count,
      totalStores: stores.rows[0].count,
      totalRatings: ratings.rows[0].count,
    });
  })
);

router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const search = `%${String(req.query.search || "").trim().toLowerCase()}%`;
    const result = await pool.query(
      `select * from users
       where $1 = '%%'
          or lower(name) like $1
          or lower(email) like $1
          or lower(address) like $1
          or lower(role) like $1
       order by created_at desc`,
      [search]
    );
    res.json({ users: result.rows.map(publicUser) });
  })
);

router.post(
  "/users",
  asyncHandler(async (req, res) => {
    const user = await createUser(req.body);
    res.status(201).json({ user: publicUser(user) });
  })
);

router.get(
  "/stores",
  asyncHandler(async (req, res) => {
    const stores = await listStores(req.query.search || "");
    const enriched = await Promise.all(
      stores.map(async (store) => {
        const rating = await pool.query("select coalesce(avg(rating), 0)::numeric(10,2) as avg from ratings where store_id = $1", [store.id]);
        return {
          ...publicStore(store),
          averageRating: Number(rating.rows[0].avg),
        };
      })
    );
    res.json({ stores: enriched });
  })
);

router.post(
  "/stores",
  asyncHandler(async (req, res) => {
    const store = await createStore(req.body);
    res.status(201).json({ store: publicStore(store) });
  })
);

router.get(
  "/ratings",
  asyncHandler(async (req, res) => {
    const result = await listRatings();
    res.json({ ratings: result });
  })
);

router.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    const store = user.store_id ? await getStoreById(user.store_id) : null;
    const rating = store
      ? await pool.query("select coalesce(avg(rating),0)::numeric(10,2) as avg from ratings where store_id = $1", [store.id])
      : null;
    res.json({
      user: publicUser(user),
      store: store ? publicStore(store) : null,
      storeRating: rating ? Number(rating.rows[0].avg) : null,
    });
  })
);

module.exports = router;
