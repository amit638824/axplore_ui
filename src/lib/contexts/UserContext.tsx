 "use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import type { UserInfo } from "@/lib/types/user";
import { logout } from "@/lib/api/auth";

interface UserContextType {
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/** Interval (ms) to re-check session so expired token redirects to login */
const SESSION_CHECK_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchUserInfo = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }

      const resp = await fetch("/api-next/auth/user_info", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!resp.ok) {
        await logout();
        return;
      }

      const body = await resp.json();

      // Handle response structure: { success: true, message: "...", data: {...} }
      if (body.success && body.data) {
        setUser(body.data);
      } else if (body.data) {
        setUser(body.data);
      } else {
        await logout();
        return;
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      await logout();
    } finally {
      if (isMountedRef.current && !silent) setLoading(false);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchUserInfo(false);

    const intervalId = setInterval(() => {
      fetchUserInfo(true); // silent: only redirect on 401, no loading flash
    }, SESSION_CHECK_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, refetch: fetchUserInfo }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
