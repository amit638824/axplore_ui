import axiosInstance from "@/services/index";

// ─────────────────────────────────────────────
// 🔐 LOGIN
// ─────────────────────────────────────────────

/** Password login → returns { success, message, data: { token } } */
export const loginService = async (data: {
  email?: string;
  password?: string;
}) => {
  const res = await axiosInstance.post("/api/auth/login", data);
  return res.data;
};
export const fetchUserDetails = async () => {
  const res = await axiosInstance.get("/api/auth/user_info");
  return res.data;
};
/** OTP — Step 1: Send OTP to phone */
export const sendOtpService = async (data: { phone: string }) => {
  const res = await axiosInstance.post("/auth/send-otp", data);
  return res.data;
};

/** OTP — Step 2: Verify OTP → returns { success, message, data: { token } } */
export const verifyOtpService = async (data: {
  phone?: string;
  otp?: string;
}) => {
  const res = await axiosInstance.post("/auth/mobile-login", data);
  return res.data;
};

// ─────────────────────────────────────────────
// 👤 USER INFO
// ─────────────────────────────────────────────

/** Fetch full user profile by ID */
export const userDetailService = async (id: string) => {
  const res = await axiosInstance.get(`/auth/user-info?id=${id}`);
  return res.data;
};

/** Fetch the currently authenticated user's profile (token sent via interceptor) */
export const getMyProfileService = async () => {
  const res = await axiosInstance.get("/auth/me");
  return res.data;
};

// ─────────────────────────────────────────────
// 🔑 FORGOT / RESET PASSWORD
// ─────────────────────────────────────────────

/** Send forgot-password reset link to email */
export const forgotPasswordService = async (email: string) => {
  const res = await axiosInstance.post("/auth/forget-password", { email });
  return res.data;
};

/** Validate that a password-reset link/token is still valid */
export const resetlinkExpireCheckService = async (data: {
  token: string;
}) => {
  const res = await axiosInstance.post("/auth/reset-token-check", data);
  return res.data;
};

/** Set new password using the reset token */
export const resetPasswordService = async (data: {
  token: string;
  newPassword: string;
}) => {
  const res = await axiosInstance.post("/auth/reset-password", {
    token: data.token,
    newPassword: data.newPassword,
    password: data.newPassword, // some backends expect "password"
  });
  return res.data;
};

// ─────────────────────────────────────────────
// 🔒 LOGOUT
// ─────────────────────────────────────────────

/** Server-side logout (invalidate session/token on backend) */
export const logoutService = async () => {
  const res = await axiosInstance.post("/auth/logout");
  return res.data;
};

// ─────────────────────────────────────────────
// 🌐 SOCIAL / RECRUITER
// ─────────────────────────────────────────────

/** Google / social SSO login */
export const socialLoginService = async (idToken: string) => {
  const res = await axiosInstance.post("/auth/social-login", { idToken });
  return res.data;
};

/** Recruiter self-registration */
export const recruiterRegistrationService = async (data: any) => {
  const res = await axiosInstance.post("/auth/recruiter-register", data);
  return res.data;
};

// ─────────────────────────────────────────────
// 🔑 SUPER ADMIN OTP
// ─────────────────────────────────────────────

export const sendSuperAdminOtpService = async (data: any) => {
  const res = await axiosInstance.post("/api/super-admin-send", data);
  return res.data;
};

export const verifySuperAdminOtpService = async (data: any) => {
  const res = await axiosInstance.post("/api/super-admin-verify", data);
  return res.data;
};
