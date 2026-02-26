"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/hooks/useSession";

const ProtectedRoute = ({ children }: any) => {
  // const session = useSession();
  // const router = useRouter();
  // const pathname = usePathname();

  // useEffect(() => {
  //   if (!session?.isLoggedIn) {
  //     router.replace(`/`);
  //   }
  // }, [session, router, pathname]); 
 
  // if (!session?.isLoggedIn) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
