import React, { createContext, useContext, useState } from "react";
import { averageRating, normalizeEmail } from "../utils/helpers";
import {
  validateAddress,
  validateEmail,
  validateFeedback,
  validateName,
  validatePassword,
  validateRating,
  validateStoreName,
} from "../utils/validation";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

const AppContext = createContext(null);

function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

async function apiRequest(path, { method = "GET", body, token } = {}) {
  const response = await fetch(apiUrl(path), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : {};

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
}

function normalizeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: normalizeEmail(user.email),
    address: user.address,
    role: user.role,
    storeId: user.storeId ?? user.store_id ?? "",
    createdAt: user.createdAt ?? user.created_at ?? null,
    updatedAt: user.updatedAt ?? user.updated_at ?? null,
  };
}

function normalizeStore(store) {
  if (!store) return null;

  return {
    id: store.id,
    name: store.name,
    email: normalizeEmail(store.email),
    address: store.address,
    ownerId: store.ownerId ?? store.owner_id ?? "",
    ownerName: store.ownerName ?? store.owner_name ?? null,
    averageRating: Number(store.averageRating ?? store.average_rating ?? 0),
    submittedRating: store.submittedRating ?? store.submitted_rating ?? null,
    createdAt: store.createdAt ?? store.created_at ?? null,
    updatedAt: store.updatedAt ?? store.updated_at ?? null,
  };
}

function normalizeRating(rating) {
  if (!rating) return null;

  return {
    id: rating.id,
    userId: rating.userId ?? rating.user_id,
    storeId: rating.storeId ?? rating.store_id,
    rating: Number(rating.rating),
    feedback: rating.feedback || "",
    createdAt: rating.createdAt ?? rating.created_at ?? null,
    updatedAt: rating.updatedAt ?? rating.updated_at ?? null,
    userName: rating.userName ?? rating.user_name ?? null,
    userEmail: rating.userEmail ?? rating.user_email ?? null,
    storeName: rating.storeName ?? rating.store_name ?? null,
  };
}

function upsertById(list, item) {
  const filtered = list.filter((entry) => entry.id !== item.id);
  return [...filtered, item];
}

function buildUsersFromReviews(reviews, currentUser) {
  const users = [];
  const seen = new Set();

  const addUser = (user) => {
    if (!user || !user.id || seen.has(user.id)) return;
    seen.add(user.id);
    users.push(user);
  };

  addUser(currentUser);

  reviews.forEach((review) => {
    if (review.userId) {
      addUser({
        id: review.userId,
        name: review.userName || "Unknown user",
        email: normalizeEmail(review.userEmail || ""),
        address: "",
        role: "normal_user",
        storeId: "",
      });
    }
  });

  return users;
}

async function loadRoleData(user, token) {
  if (user.role === "admin") {
    const [usersResponse, storesResponse, ratingsResponse] = await Promise.all([
      apiRequest("/api/admin/users", { token }),
      apiRequest("/api/admin/stores", { token }),
      apiRequest("/api/admin/ratings", { token }),
    ]);

    return {
      users: (usersResponse.users || []).map(normalizeUser),
      stores: (storesResponse.stores || []).map(normalizeStore),
      ratings: (ratingsResponse.ratings || []).map(normalizeRating),
    };
  }

  if (user.role === "store_owner") {
    const ownerResponse = await apiRequest("/api/ratings/owner", { token });
    const normalizedStores = (ownerResponse.stores || []).map(normalizeStore);
    const normalizedRatings = (ownerResponse.reviews || []).map(normalizeRating);

    return {
      users: buildUsersFromReviews(normalizedRatings, user),
      stores: normalizedStores,
      ratings: normalizedRatings,
    };
  }

  const [storesResponse, ratingsResponse] = await Promise.all([
    apiRequest("/api/stores", { token }),
    apiRequest("/api/ratings", { token }),
  ]);

  return {
    users: [user],
    stores: (storesResponse.stores || []).map(normalizeStore),
    ratings: (ratingsResponse.ratings || []).map(normalizeRating),
  };
}

export function AppProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState("");

  const logout = () => {
    setUsers([]);
    setStores([]);
    setRatings([]);
    setCurrentUser(null);
    setAuthToken("");
  };

  const login = async ({ email, password }) => {
    const response = await apiRequest("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });

    const user = normalizeUser(response.user);
    const token = response.token;
    const roleData = await loadRoleData(user, token);

    setAuthToken(token);
    setCurrentUser(user);
    setUsers(roleData.users);
    setStores(roleData.stores);
    setRatings(roleData.ratings);

    return user;
  };

  const registerUser = async ({ name, email, address, password }) => {
    const errors = [
      validateName(name),
      validateEmail(email),
      validateAddress(address),
      validatePassword(password),
    ].filter(Boolean);

    if (errors.length) {
      throw new Error(errors[0]);
    }

    const response = await apiRequest("/api/auth/register", {
      method: "POST",
      body: { name, email, address, password },
    });

    const user = normalizeUser(response.user);
    setUsers((current) => upsertById(current, user));
    return user;
  };

  const addUser = async ({ name, email, address, password, role, storeId }) => {
    const errors = [
      validateName(name),
      validateEmail(email),
      validateAddress(address),
      validatePassword(password),
    ].filter(Boolean);

    if (errors.length) {
      throw new Error(errors[0]);
    }

    const normalizedRole = role || "normal_user";
    if (normalizedRole === "store_owner" && !storeId) {
      throw new Error("Choose a store to assign to the store owner.");
    }

    const response = await apiRequest("/api/users", {
      method: "POST",
      token: authToken,
      body: {
        name,
        email,
        address,
        password,
        role: normalizedRole,
        storeId: storeId || null,
      },
    });

    const user = normalizeUser(response.user);
    setUsers((current) => upsertById(current, user));

    if (user.role === "store_owner" && user.storeId) {
      setStores((current) =>
        current.map((store) =>
          store.id === user.storeId
            ? {
                ...store,
                ownerId: user.id,
                ownerName: user.name,
              }
            : store
        )
      );
    }

    return user;
  };

  const addStore = async ({ name, email, address, ownerId }) => {
    const errors = [validateStoreName(name), validateEmail(email), validateAddress(address)].filter(Boolean);

    if (errors.length) {
      throw new Error(errors[0]);
    }

    const response = await apiRequest("/api/stores", {
      method: "POST",
      token: authToken,
      body: {
        name,
        email,
        address,
        ownerId: ownerId || null,
      },
    });

    const store = normalizeStore(response.store);
    setStores((current) => upsertById(current, store));

    if (store.ownerId) {
      setUsers((current) =>
        current.map((user) =>
          user.id === store.ownerId
            ? {
                ...user,
                role: "store_owner",
                storeId: store.id,
              }
            : user
        )
      );
    }

    return store;
  };

  const updatePassword = async ({ userId, password }) => {
    const error = validatePassword(password);
    if (error) throw new Error(error);

    const response = await apiRequest(`/api/users/${userId}/password`, {
      method: "PUT",
      token: authToken,
      body: { password },
    });

    const user = normalizeUser(response.user);
    if (currentUser && currentUser.id === user.id) {
      setCurrentUser(user);
    }
    setUsers((current) => upsertById(current, user));
    return user;
  };

  const submitRating = async ({ userId, storeId, rating, feedback = "" }) => {
    const error = validateRating(rating);
    if (error) throw new Error(error);

    const feedbackError = validateFeedback(feedback);
    if (feedbackError) throw new Error(feedbackError);

    const response = await apiRequest("/api/ratings", {
      method: "POST",
      token: authToken,
      body: {
        storeId,
        rating: Number(rating),
        feedback,
      },
    });

    const savedRating = normalizeRating(response.rating);
    setRatings((current) => upsertById(current, savedRating));
    return savedRating;
  };

  const getStoreAverage = (storeId) => averageRating(ratings, storeId);

  const value = {
    users,
    stores,
    ratings,
    currentUser,
    login,
    logout,
    registerUser,
    addUser,
    addStore,
    updatePassword,
    submitRating,
    getStoreAverage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
}