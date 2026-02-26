"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { requestForgotPassword } from "@/lib/api/auth";
import AuthLayout from "./AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setSubmitting(true);
      await requestForgotPassword(email.trim());
      setSent(true);
      toast.success("Reset link sent to your email");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send reset link");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}<AuthLayout>
      <div className="login-header">
        <img src="/images/logologin.png" alt="Company Logo" />
        <h2>Forgot Password</h2>
        <p>Enter your email to receive reset link</p>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className="btn-login"
            disabled={submitting}
          >
            {submitting ? "Sending..." : "Send Email"}
          </button>

          <div className="forgot">
            <Link href="/">← Back to Login</Link>
          </div>
        </form>
      ) : (
        <div className="success-box">
          <div className="mail-icon">📩</div>
          <p>
            If an account exists for <strong>{email}</strong>,
            we’ve sent a password reset link.
          </p>
          <Link href="/login" className="btn-login">
            Back to Login
          </Link>
        </div>
      )}
    </AuthLayout>
    </>
  );
}