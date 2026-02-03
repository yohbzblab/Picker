import { normalizeEmail } from "@/lib/emailUtils";

const PHONE_VERIFICATION_BYPASS_EMAILS = new Set([
  "kwonjunghuck@gmail.com",
]);

export function isPhoneVerificationBypassed({ user, dbUser } = {}) {
  const candidate = normalizeEmail(dbUser?.email || user?.email);
  if (!candidate) return false;
  return PHONE_VERIFICATION_BYPASS_EMAILS.has(candidate);
}
