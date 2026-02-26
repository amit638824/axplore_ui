"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { UserInfo } from "@/lib/types/user";
import { getMyProfileService } from "@/services/AuthServices";
import { setUserDetails } from "@/redux/slice/userDetailSlice";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface UserContextType {
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.user?.token);

  const fetchUserInfo = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await getMyProfileService(); // token auto-attached by axios interceptor

      if (!isMountedRef.current) return;

      if (res?.success && res?.data) {
        setUser(res.data as UserInfo);
        dispatch(setUserDetails(res.data)); // sync to Redux
      } else {
        setError("Failed to load user info");
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setError(err?.response?.data?.message || "Failed to load user info");
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchUserInfo();

    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <UserContext.Provider value={{ user, loading, error, refetch: fetchUserInfo }}>
      {children}
    </UserContext.Provider>
  );
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
