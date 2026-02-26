"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/api/auth";
import toast from "react-hot-toast";

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  return null;
}

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordError = newPassword ? validatePassword(newPassword) : null;
  const matchError =
    confirmPassword && newPassword !== confirmPassword ? "Passwords do not match" : null;
  const canSubmit =
    token &&
    newPassword &&
    confirmPassword &&
    !passwordError &&
    !matchError &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      await resetPassword({ token, newPassword });
      setSuccess(true);
      toast.success("Password updated. You can log in now.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reset password";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <>
        <div className="row">
          <div className="col-md-12">
            <div className="logoineer">
              <img src="/images/logologin.png" alt="Company Logo" />
              <p>More Than Tours, We Create Magic!</p>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="loginforms">
              <span className="emailform">
                <div className="formSection text-center py-3">
                  <p className="mb-3">
                    <i className="fa fa-link text-warning" aria-hidden="true" style={{ fontSize: "2rem" }} />
                  </p>
                  <p className="mb-3">Invalid or missing reset link. Request a new one from the login page.</p>
                  <Link href="/forgot-password" className="btn btn-default me-2">
                    Forgot password
                  </Link>
                  <Link href="/login" className="btn btn-outline-secondary">
                    Back to login
                  </Link>
                </div>
              </span>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (success) {
    return (
      <>
        <div className="row">
          <div className="col-md-12">
            <div className="logoineer">
              <img src="/images/logologin.png" alt="Company Logo" />
              <p>More Than Tours, We Create Magic!</p>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="loginforms">
              <span className="emailform">
                <div className="formSection text-center py-3">
                  <p className="mb-3">
                    <i className="fa fa-check-circle text-success" aria-hidden="true" style={{ fontSize: "2rem" }} />
                  </p>
                  <p className="mb-3">Your password has been updated successfully.</p>
                  <Link href="/login" className="btn btn-default">
                    Log in
                  </Link>
                </div>
              </span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <div className="logoineer">
            <img src="/images/logologin.png" alt="Company Logo" />
            <p>More Than Tours, We Create Magic!</p>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <div className="loginforms">
            <span className="emailform">
              <form className="form-inline" onSubmit={handleSubmit}>
                <div className="formSection">
                  <p className="mb-3 small text-muted">
                    Enter your new password below.
                  </p>
                  <div className="form-group havepassword">
                    <label className="sr-only" htmlFor="newPassword">
                      New password
                    </label>
                    <input
                      type="password"
                      className={`form-control passwordfield ${passwordError ? "is-invalid" : ""}`}
                      id="newPassword"
                      placeholder="New password (min 8 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                    {passwordError && (
                      <div className="invalid-feedback d-block">{passwordError}</div>
                    )}
                  </div>
                  <div className="form-group havepassword">
                    <label className="sr-only" htmlFor="confirmPassword">
                      Confirm password
                    </label>
                    <input
                      type="password"
                      className={`form-control passwordfield ${matchError ? "is-invalid" : ""}`}
                      id="confirmPassword"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    {matchError && (
                      <div className="invalid-feedback d-block">{matchError}</div>
                    )}
                  </div>
                  <button type="submit" className="btn btn-default w-100" disabled={!canSubmit}>
                    {submitting ? (
                      <i className="fa fa-spinner fa-spin" aria-hidden="true" />
                    ) : (
                      "Set new password"
                    )}
                  </button>
                  <p className="mt-3 mb-0 text-center">
                    <Link href="/login" className="small">
                      <i className="fa fa-arrow-left me-1" aria-hidden="true" />
                      Back to login
                    </Link>
                  </p>
                </div>
              </form>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
