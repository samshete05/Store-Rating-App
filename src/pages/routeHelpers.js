export function getHomePath(role) {
  if (role === "admin") return "/admin";
  if (role === "store_owner") return "/owner";
  return "/user";
}
