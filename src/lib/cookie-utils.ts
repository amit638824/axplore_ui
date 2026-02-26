/**
 * Cookie options for auth_token so it works on both local and server (HTTPS, reverse proxy).
 * Use for login (set) and logout (clear).
 */
export function getAuthCookieOptions(req: Request): {
  httpOnly: boolean;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge: number;
  domain?: string;
} {
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const isSecure =
    (typeof window !== "undefined" && window.location.protocol === "https:") ||
    req.url?.startsWith("https://") ||
    forwardedProto === "https";

  const options: {
    httpOnly: boolean;
    sameSite: "lax";
    secure: boolean;
    path: string;
    maxAge: number;
    domain?: string;
  } = {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days (for login; logout uses 0)
  };

  const domain = process.env.COOKIE_DOMAIN?.trim();
  if (domain) {
    options.domain = domain;
  }

  return options;
}
