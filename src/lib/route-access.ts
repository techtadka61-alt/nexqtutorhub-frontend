import { UserRole } from "@/types/api";

/** Pages only one role may use. Longest matching prefix wins; anything not listed is open to every role. */
const ROLE_ONLY: { prefix: string; role: UserRole }[] = [
  { prefix: "/account/tutor", role: UserRole.TUTOR },
  { prefix: "/account/student", role: UserRole.STUDENT },
  { prefix: "/my-requests", role: UserRole.STUDENT },
  { prefix: "/request-tutor", role: UserRole.STUDENT },
];

export const ROLE_NAME: Record<UserRole, { singular: string; plural: string }> = {
  [UserRole.SUPER_ADMIN]: { singular: "admin", plural: "admins" },
  [UserRole.STUDENT]: { singular: "student", plural: "students" },
  [UserRole.TUTOR]: { singular: "tutor", plural: "tutors" },
};

/** The single role allowed on `path` (query/hash ignored), or undefined when any role may open it. */
export function requiredRoleFor(path: string | null | undefined): UserRole | undefined {
  if (!path) return undefined;
  const pathname = path.split(/[?#]/)[0];
  return ROLE_ONLY.filter(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`)).sort(
    (a, b) => b.prefix.length - a.prefix.length,
  )[0]?.role;
}
