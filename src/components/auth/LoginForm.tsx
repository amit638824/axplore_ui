"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast"; 

export default function LoginPage() {
  const [loginType, setLoginType] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      if (loginType === "password") {
        console.log("Password Login:", { email, password });
      } else {
        console.log("OTP Login:", { phone, otp });
      }

      toast.success("Login Successful (Demo)");
    } catch (err: any) {
      toast.error(err?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>


      <div className="auth-wrapper">
        <div className="auth-overlay">
          <div className="auth-card">
            <div className="login-header">
              <img src="/images/logologin.png" alt="Company Logo" />
              <h2>Welcome Back</h2>
              <p>Sign in to Axplore CRM</p>
            </div>

            {/* Toggle */}
            <div className="login-toggle">
              <button
                type="button"
                className={loginType === "password" ? "active" : ""}
                onClick={() => setLoginType("password")}
              >
                Password
              </button>
              <button
                type="button"
                className={loginType === "otp" ? "active" : ""}
                onClick={() => setLoginType("otp")}
              >
                OTP
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {loginType === "password" && (
                <>
                  <input
                    type="text"
                    placeholder="Email or Employee ID"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <div className="forgot">
                    <Link href="/forgot-password">Forgot password?</Link>
                  </div>
                </>
              )}

              {loginType === "otp" && (
                <>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />

                  <input
                    type="text"
                    placeholder="Enter OTP"
                    className="form-control"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </>
              )}

              <button type="submit" className="btn-login" disabled={submitting}>
                {submitting ? "Please wait..." : "Login →"}
              </button>
            </form>
          </div>

          <div className="powered">
            <span>Powered by</span>
            <img src="/images/ftrlogo.png" alt="Footer Logo" />
          </div>
        </div>
      </div>

    </>
  );
}