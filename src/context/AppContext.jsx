import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { seedRatings, seedStores, seedUsers } from "../data/seed";
import { loadJson, saveJson } from "../utils/storage";
import { averageRating, normalizeEmail, uid } from "../utils/helpers";
import {
  validateAddress,
  validateEmail,
  validateName,
  validatePassword,
  validateRating,
  validateStoreName,
} from "../utils/validation";

const STORAGE_KEYS = {
  users: "store-ratings-users",
  stores: "store-ratings-stores",
  ratings: "store-ratings-ratings",
  sessionUserId: "store-ratings-session-user-id",
};

const AppContext = createContext(null);

function seedIfMissing() {
  const users = loadJson(STORAGE_KEYS.users, null) || seedUsers;
  const stores = loadJson(STORAGE_KEYS.stores, null) || seedStores;
  const ratings = loadJson(STORAGE_KEYS.ratings, null) || seedRatings;
  return { users, stores, ratings };
}

export function AppProvider({ children }) {
  const seeded = useMemo(seedIfMissing, []);
  const [users, setUsers] = useState(seeded.users);
  const [stores, setStores] = useState(seeded.stores);
  const [ratings, setRatings] = useState(seeded.ratings);
  const [sessionUserId, setSessionUserId] = useState(() => loadJson(STORAGE_KEYS.sessionUserId, null));

  useEffect(() => saveJson(STORAGE_KEYS.users, users), [users]);
  useEffect(() => saveJson(STORAGE_KEYS.stores, stores), [stores]);
  useEffect(() => saveJson(STORAGE_KEYS.ratings, ratings), [ratings]);
  useEffect(() => saveJson(STORAGE_KEYS.sessionUserId, sessionUserId), [sessionUserId]);

  useEffect(() => {
    if (sessionUserId && !users.some((user) => user.id === sessionUserId)) {
      setSessionUserId(null);
    }
  }, [sessionUserId, users]);

  const currentUser = useMemo(
    () => users.find((user) => user.id === sessionUserId) || null,
    [users, sessionUserId]
  );

  const login = ({ email, password }) => {
    const normalizedEmail = normalizeEmail(email);
    const user = users.find((entry) => normalizeEmail(entry.email) === normalizedEmail);
    if (!user || user.password !== password) {
      throw new Error("Invalid email or password.");
    }
    setSessionUserId(user.id);
    return user;
  };

  const logout = () => setSessionUserId(null);

  const registerUser = ({ name, email, address, password }) => {
    const errors = [
      validateName(name),
      validateEmail(email),
      validateAddress(address),
      validatePassword(password),
    ].filter(Boolean);

    if (errors.length) {
      throw new Error(errors[0]);
    }

    const normalizedEmail = normalizeEmail(email);
    if (users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
      throw new Error("This email is already registered.");
    }

    const user = {
      id: uid("user"),
      name: name.trim(),
      email: normalizedEmail,
      address: address.trim(),
      password,
      role: "normal_user",
    };

    setUsers((current) => [...current, user]);
    return user;
  };

  const addUser = ({ name, email, address, password, role, storeId }) => {
    const errors = [
      validateName(name),
      validateEmail(email),
      validateAddress(address),
      validatePassword(password),
    ].filter(Boolean);

    if (errors.length) {
      throw new Error(errors[0]);
    }

    const normalizedEmail = normalizeEmail(email);
    if (users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
      throw new Error("This email is already registered.");
    }

    const user = {
      id: uid("user"),
      name: name.trim(),
      email: normalizedEmail,
      address: address.trim(),
      password,
      role,
    };

    if (role === "store_owner" && storeId) {
      user.storeId = storeId;
    }

    setUsers((current) => [...current, user]);

    if (role === "store_owner" && storeId) {
      setStores((current) =>
        current.map((store) =>
          store.id === storeId
            ? {
                ...store,
                ownerId: user.id,
              }
            : store
        )
      );
    }

    return user;
  };

  const addStore = ({ name, email, address, ownerId }) => {
    const errors = [
      validateStoreName(name),
      validateEmail(email),
      validateAddress(address),
    ].filter(Boolean);

    if (errors.length) {
      throw new Error(errors[0]);
    }

    const normalizedEmail = normalizeEmail(email);
    if (stores.some((store) => normalizeEmail(store.email) === normalizedEmail)) {
      throw new Error("This store email is already registered.");
    }

    const store = {
      id: uid("store"),
      name: name.trim(),
      email: normalizedEmail,
      address: address.trim(),
      ownerId: ownerId || "",
    };

    setStores((current) => [...current, store]);
    if (ownerId) {
      setUsers((current) =>
        current.map((user) =>
          user.id === ownerId
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

  const updatePassword = ({ userId, password }) => {
    const error = validatePassword(password);
    if (error) throw new Error(error);

    setUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, password } : user))
    );
  };

  const submitRating = ({ userId, storeId, rating }) => {
    const error = validateRating(rating);
    if (error) throw new Error(error);

    setRatings((current) => {
      const existing = current.find(
        (entry) => entry.userId === userId && entry.storeId === storeId
      );
      if (existing) {
        return current.map((entry) =>
          entry.id === existing.id
            ? { ...entry, rating: Number(rating), updatedAt: new Date().toISOString() }
            : entry
        );
      }
      return [
        ...current,
        {
          id: uid("rating"),
          userId,
          storeId,
          rating: Number(rating),
          updatedAt: new Date().toISOString(),
        },
      ];
    });
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
