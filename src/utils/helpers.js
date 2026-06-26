export const roleLabels = {
  admin: "System Administrator",
  normal_user: "Normal User",
  store_owner: "Store Owner",
};

export function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function averageRating(ratings, storeId) {
  const storeRatings = ratings.filter((rating) => rating.storeId === storeId);
  if (!storeRatings.length) return 0;
  const total = storeRatings.reduce((sum, rating) => sum + Number(rating.rating), 0);
  return total / storeRatings.length;
}

export function ratingCount(ratings, storeId) {
  return ratings.filter((rating) => rating.storeId === storeId).length;
}

export function getSubmittedRating(ratings, userId, storeId) {
  return ratings.find((rating) => rating.userId === userId && rating.storeId === storeId) || null;
}

export function formatRating(value) {
  if (!value) return "0.0";
  return Number(value).toFixed(1);
}

export function formatDate(iso) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDateTime(iso) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function sortByField(list, field, direction = "asc", accessor) {
  const sorted = [...list].sort((a, b) => {
    const left = accessor ? accessor(a) : a[field];
    const right = accessor ? accessor(b) : b[field];
    const leftValue = String(left ?? "").toLowerCase();
    const rightValue = String(right ?? "").toLowerCase();
    if (leftValue < rightValue) return -1;
    if (leftValue > rightValue) return 1;
    return 0;
  });
  return direction === "desc" ? sorted.reverse() : sorted;
}

export function formatRole(role) {
  return roleLabels[role] || role;
}
