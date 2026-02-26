export type LoginSuccess = {
  token: string;
};

/**
 * If the response is 401 Unauthorized (session/token expired), redirect to login
 * and return true so callers can exit. Use after any fetch to api-next that
 * requires auth.
 */
export function redirectToLoginIfUnauthorized(response: Response): boolean {
  if (response.status === 401) {
    window.location.href = "/login";
    return true;
  }
  return false;
}

type LoginErrorBody = {
  error?: unknown;
  message?: unknown;
};

function getErrorMessage(body: unknown, fallback: string) {
  if (typeof body !== "object" || body === null) return fallback;
  const b = body as LoginErrorBody;
  if (typeof b.error === "string" && b.error) return b.error;
  if (typeof b.message === "string" && b.message) return b.message;
  return fallback;
}

/**
 * Client-side login via Next.js API route.
 * The API route sets the httpOnly `auth_token` cookie on success.
 */
export async function loginWithPassword(input: {
  email: string;
  password: string;
}): Promise<LoginSuccess> {
  // Call the Next.js API route (same-origin) so it can set the httpOnly cookie.
  const resp = await fetch("/api-next/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  let body: unknown = null;
  try {
    body = await resp.json();
  } catch {
    body = null;
  }

  if (!resp.ok) {
    throw new Error(getErrorMessage(body, "Login failed"));
  }

  // Handle new response structure: { success: true, message: "...", data: { token: "..." } }
  if (typeof body === "object" && body !== null) {
    const response = body as { data?: { token?: unknown }; token?: unknown };
    
    // Check for nested structure: data.data.token
    if (response.data && typeof response.data === "object" && "token" in response.data) {
      const token = response.data.token;
      if (typeof token === "string" && token) return { token };
    }
    // Fallback to direct token (for backward compatibility)
    else if ("token" in response) {
      const token = response.token;
      if (typeof token === "string" && token) return { token };
    }
  }

  // Even if token isn't used on client (cookie is), keep return type stable.
  return { token: "" };
}

/**
 * Client-side logout via Next.js API route.
 * The API route calls the backend logout endpoint and clears the httpOnly cookie.
 */
export async function logout(): Promise<void> {
  // Call the Next.js API route (same-origin) so it can clear the httpOnly cookie.
  const resp = await fetch("/api-next/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!resp.ok) {
    // Even if API call fails, redirect to login
    window.location.href = "/";
    return;
  }

  // The API route handles redirect, but if we're calling programmatically, redirect manually
  if (resp.redirected) {
    window.location.href = resp.url;
  } else {
    window.location.href = "/";
  }
}

/**
 * Client-side user info fetch via Next.js API route.
 * Returns user information including menus, roles, and permissions.
 * On any error (4xx, 5xx, invalid response), logs out and redirects to login.
 */
export async function getUserInfo(): Promise<import("@/lib/types/user").UserInfo> {
  let resp: Response;
  try {
    resp = await fetch("/api-next/auth/user_info", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
  } catch {
    await logout();
    throw new Error("Failed to fetch user info");
  }

  let body: unknown = null;
  try {
    body = await resp.json();
  } catch {
    body = null;
  }

  if (!resp.ok) {
    await logout();
    throw new Error(
      typeof body === "object" && body !== null && "error" in body
        ? String((body as { error?: unknown }).error)
        : "Failed to fetch user info",
    );
  }

  // Handle response structure: { success: true, message: "...", data: {...} }
  if (
    typeof body === "object" &&
    body !== null &&
    "success" in body &&
    "data" in body
  ) {
    const response = body as { success: boolean; data: unknown };
    if (response.success && response.data) {
      return response.data as import("@/lib/types/user").UserInfo;
    }
  }

  // Fallback: if data exists directly
  if (typeof body === "object" && body !== null && "data" in body) {
    return (body as { data: unknown }).data as import("@/lib/types/user").UserInfo;
  }

  await logout();
  throw new Error("Invalid user info response");
}

function getMessage(body: unknown, fallback: string): string {
  if (typeof body !== "object" || body === null) return fallback;
  const b = body as { message?: unknown; error?: unknown };
  if (typeof b.message === "string" && b.message) return b.message;
  if (typeof b.error === "string" && b.error) return b.error;
  return fallback;
}

/**
 * Request a password reset link to be sent to the given email.
 * Backend should send an email with a link containing the reset token.
 */
export async function requestForgotPassword(email: string): Promise<void> {
  const resp = await fetch("/api-next/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() }),
  });

  const body = await resp.json().catch(() => null);

  if (!resp.ok) {
    throw new Error(getMessage(body, "Failed to send reset link"));
  }
}

/**
 * Set a new password using the token from the reset link.
 */
export async function resetPassword(params: {
  token: string;
  newPassword: string;
}): Promise<void> {
  const resp = await fetch("/api-next/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: params.token.trim(),
      newPassword: params.newPassword,
      password: params.newPassword, // some backends expect "password"
    }),
  });

  const body = await resp.json().catch(() => null);

  if (!resp.ok) {
    throw new Error(getMessage(body, "Failed to reset password"));
  }
}

