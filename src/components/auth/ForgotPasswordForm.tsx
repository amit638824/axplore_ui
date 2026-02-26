"use client";

import React, { useState } from "react";
import Link from "next/link";
import { requestForgotPassword } from "@/lib/api/auth";
import toast from "react-hot-toast"; 

export default function ForgotPasswordForm() {
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
      toast.success("Reset link sent. Check your email.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send reset link";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
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
                <div className="formSection py-3">
                  <p className="mb-3">
                    <i className="fa fa-envelope-open-o" aria-hidden="true" style={{ fontSize: "2rem", color: "#fff" }} />
                  </p>
                  <p className="mb-2">If an account exists for <strong>{email}</strong>, we’ve sent a password reset link.</p>
                  <p className="small mb-3" style={{ color: "#fff", opacity: 0.9 }}>Check your inbox and spam folder.</p>
                  <p className="mb-0">
                    <Link href="/login" className="btn btn-default">
                      Back to Login
                    </Link>
                  </p>
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
              <div className="radioTop">
                  <i className="fa fa-info-circle" aria-hidden="true"></i>
                  Forgot Password 
                </div>
                <div className="formSection">
                 
                  <div className="form-group havewemial"  id="emailDiv">
                    <label className="sr-only" htmlFor="forgotEmail">
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control emailfield"
                      id="forgotEmail"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <button type="submit" className="btn btn-default" disabled={submitting} style={{ width: "107px" }}>
                    {submitting ? (
                      <i className="fa fa-spinner fa-spin" aria-hidden="true" />
                    ) : (
                      "Send Email"
                    )}
                  </button>
                </div>
                <div className="form-group havepassword mb-0" style={{ marginTop: "10px" }}>
                    <Link href="/login">
                      <i className="fa fa-arrow-left me-1" aria-hidden="true" />
                      Back to login
                    </Link>
                </div>
              </form>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
