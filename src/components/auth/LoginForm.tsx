"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import AuthLayout from "./AuthLayout";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FiPhone } from "react-icons/fi";
import { loginService, verifyOtpService, sendOtpService } from "@/services/AuthServices";
import { showAlert } from "@/utils/swalFire";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { login } from "@/redux/slice/authSlice";

type LoginType = "password" | "otp";
type OtpStep = "enterPhone" | "enterOtp";

interface LoginFormValues {
  email?: string;
  password?: string;
  phone?: string;
  otp?: string;
}

/* ------------------ Validation Schema ------------------ */

const getSchema = (loginType: LoginType, otpStep: OtpStep) =>
  yup.object().shape({
    email:
      loginType === "password"
        ? yup
          .string()
          .required("Email or Employee ID is required")
          .min(3, "Minimum 3 characters required")
        : yup.string().notRequired(),

    password:
      loginType === "password"
        ? yup
          .string()
          .required("Password is required")
          .min(6, "Password must be at least 6 characters")
        : yup.string().notRequired(),

    phone:
      loginType === "otp"
        ? yup
          .string()
          .required("Phone number is required")
          .matches(/^[0-9]{10}$/, "Enter valid 10 digit phone number")
        : yup.string().notRequired(),

    otp:
      loginType === "otp" && otpStep === "enterOtp"
        ? yup
          .string()
          .required("OTP is required")
          .matches(/^[0-9]{4,6}$/, "Enter valid OTP")
        : yup.string().notRequired(),
  });

/* ------------------ Component ------------------ */

export default function LoginPage() {
  const [loginType, setLoginType] = useState<LoginType>("password");
  const [otpStep, setOtpStep] = useState<OtpStep>("enterPhone");
  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<LoginFormValues>({
    resolver: yupResolver(getSchema(loginType, otpStep)) as any,
    mode: "onSubmit",
  });

  /* ------------------ Post-login handler ------------------ */

  const handleLoginSuccess = (res: any) => {
    const token = res?.data?.token;

    // 1️⃣ Dispatch to Redux store (persisted via redux-persist)
    dispatch(
      login({
        user: res.data?.user || {},
        token: token,
        permissions: res.data?.permissions || [],
      })
    );
    // 2️⃣ Store token in localStorage (read by axios interceptor)
    if (token) {
      localStorage.setItem("token", token);
    }
    // 3️⃣ Reset form state
    reset();
    // 4️⃣ Redirect to dashboard
    router.push("/dashboard");
  };

  /* ------------------ Submit ------------------ */

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setSubmitting(true);

      if (loginType === "password") {
        try {
          const res = await loginService(data);
          if (res.success) {
            showAlert("success", "Login Successful");
            handleLoginSuccess(res);
          } else {
            showAlert("error", res.message || "Invalid email or password");
          }
        } catch (err: any) {
          showAlert(
            "error",
            err.response?.data?.message || "Invalid email or password"
          );
        }
      }

      if (loginType === "otp") {
        if (otpStep === "enterPhone") {
          try {
            const res = await sendOtpService({ phone: data.phone });
            if (res.success) {
              toast.success("OTP Sent Successfully");
              setOtpStep("enterOtp");
            } else {
              toast.error(res.message || "Failed to send OTP");
            }
          } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
          }
        } else {
          try {
            const res = await verifyOtpService(data);
            if (res.success) {
              toast.success("Login Successful");
              handleLoginSuccess(res);
            } else {
              toast.error(res.message || "Invalid OTP");
            }
          } catch (err: any) {
            toast.error(err.response?.data?.message || "OTP verification failed");
          }
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------ Switch Login Type ------------------ */

  const switchLoginType = (type: LoginType) => {
    setLoginType(type);
    setOtpStep("enterPhone");
    reset();
  };

  /* ------------------ Resend OTP ------------------ */

  const handleResendOtp = async () => {
    const phone = getValues("phone");

    if (!phone) {
      toast.error("Enter phone number first");
      return;
    }

    try {
      const res = await sendOtpService({ phone });
      if (res.success) {
        toast.success("OTP Resent Successfully");
      } else {
        toast.error(res.message || "Failed to resend OTP");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  /* ------------------ UI ------------------ */

  return (
    <AuthLayout>
      <div className="login-header">
        <img src="/images/loginpage.png" alt="Company Logo" />
        <h2>Welcome Back</h2>
        <p>Sign in to Axplore CRM</p>
      </div>

      {/* Toggle */}
      <div className="login-toggle">
        <button
          type="button"
          className={loginType === "password" ? "active" : ""}
          onClick={() => switchLoginType("password")}
        >
          Password
        </button>

        <button
          type="button"
          className={loginType === "otp" ? "active" : ""}
          onClick={() => switchLoginType("otp")}
        >
          OTP
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* ---------------- PASSWORD LOGIN ---------------- */}
        {loginType === "password" && (
          <>
            <div className="form-controlbox">
              <label htmlFor="Employee ID / Email / Mobile" className="form-label">Employee ID / Email / Mobile</label>
              <input
                type="text"
                placeholder="username@gmail.com"
                className="form-control"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="error-text">{errors.email.message}</p>
            )}
            <div className="form-controlbox">
              <label htmlFor="Password" className="form-label">Password</label>
              <input
                type="password"
                placeholder="Password"
                className="form-control"
                {...register("password")}
              />
              <div className="mb-3 form-check authpage">
                <input type="checkbox" className="form-check-input" id="exampleCheck1" />
                <label className="form-check-label" htmlFor="exampleCheck1">By Logging In, you’re agreeing to the Terms and Conditions.</label>
              </div>
            </div>
            {errors.password && (
              <p className="error-text">{errors.password.message}</p>
            )}


          </>
        )}

        {/* ---------------- OTP LOGIN ---------------- */}
        {loginType === "otp" && (
          <>
            {/* STEP 1: Enter Phone */}
            {otpStep === "enterPhone" && (
              <>
                <div className="form-controlbox">
                  <label htmlFor="Password" className="form-label">Email ID / Mobile</label>
                  <input
                    type="tel"
                    placeholder="username@gmail.com"
                    className="form-control"
                    {...register("phone")}
                  />
                </div>
                {errors.phone && (
                  <p className="error-text">{errors.phone.message}</p>
                )}
              </>
            )}

            {/* STEP 2: Enter OTP */}
            {otpStep === "enterOtp" && (
              <>
                <input
                  type="tel"
                  disabled
                  className="form-control"
                  {...register("phone")}
                />

                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="form-control"
                  {...register("otp")}
                />
                {errors.otp && (
                  <p className="error-text">{errors.otp.message}</p>
                )}

                <div className="forgot">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="resend-btn"
                  >
                    Resend OTP
                  </button>
                </div>
              </>
            )}
          </>
        )}

        <button type="submit" className="btn-login" disabled={submitting}>
          {submitting
            ? "Please wait..."
            : loginType === "otp" && otpStep === "enterPhone"
              ? <><FiPhone /> Get OTP </>
              : "Login →"}
        </button>
        <div className="forgot">
          <Link href="/forgot-password">Forget password?</Link>
        </div>
      </form>
    </AuthLayout>
  );
}



