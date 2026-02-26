"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { UserInfo } from "@/lib/types/user";
import { fetchUserDetails } from "@/services/AuthServices";

interface UserContextType {
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const SESSION_CHECK_INTERVAL_MS = 10 * 60 * 1000;

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

    const data = await fetchUserDetails();

    if (data?.success && data?.data) {
      setUser(data.data);
    } else if (data?.data) {
      setUser(data.data);
    } else {
      setUser(null);
    }

  } catch (error: any) {

    if (!isMountedRef.current) return;

    // 401 = session expired
    if (error.response?.status === 401) {
      setUser(null);
    } else {
      setError("Something went wrong");
    }

  } finally {
    if (isMountedRef.current && !silent) {
      setLoading(false);
    }
  }
};
  useEffect(() => {
    isMountedRef.current = true;
    fetchUserInfo(false);

    const intervalId = setInterval(() => {
      fetchUserInfo(true);
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
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}