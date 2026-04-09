export type AuthRole = "user" | "manager";

type RoleSource = {
  username?: string | null;
  email?: string | null;
  role?: string | null;
};

const managerUsernames = new Set(["manager"]);
const managerEmails = new Set(["manager@example.com", "manager@diicsu.edu.cn"]);

export function normalizeAuthRole(value?: string | null): AuthRole {
  return value?.trim().toLowerCase() === "manager" ? "manager" : "user";
}

export function resolveAuthRole(source: RoleSource): AuthRole {
  const explicitRole = normalizeAuthRole(source.role);
  if (explicitRole === "manager") {
    return explicitRole;
  }

  const username = source.username?.trim().toLowerCase();
  if (username && managerUsernames.has(username)) {
    return "manager";
  }

  const email = source.email?.trim().toLowerCase();
  if (email && managerEmails.has(email)) {
    return "manager";
  }

  return "user";
}

export function isManagerUser(source: RoleSource) {
  return resolveAuthRole(source) === "manager";
}
