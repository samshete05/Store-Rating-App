export function validateName(name) {
  const value = String(name || "").trim();
  if (value.length < 20) return "Name must be at least 20 characters.";
  if (value.length > 60) return "Name must be at most 60 characters.";
  return "";
}

export function validateAddress(address) {
  const value = String(address || "").trim();
  if (value.length > 400) return "Address must be at most 400 characters.";
  return "";
}

export function validatePassword(password) {
  const value = String(password || "");
  if (value.length < 8 || value.length > 16) {
    return "Password must be 8-16 characters long.";
  }
  if (!/[A-Z]/.test(value)) {
    return "Password must include at least one uppercase letter.";
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    return "Password must include at least one special character.";
  }
  return "";
}

export function validateEmail(email) {
  const value = String(email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Enter a valid email address.";
  }
  return "";
}

export function validateStoreName(name) {
  const value = String(name || "").trim();
  if (value.length < 3) return "Store name must be at least 3 characters.";
  if (value.length > 80) return "Store name must be at most 80 characters.";
  return "";
}

export function validateRating(rating) {
  const value = Number(rating);
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    return "Rating must be a whole number between 1 and 5.";
  }
  return "";
}
