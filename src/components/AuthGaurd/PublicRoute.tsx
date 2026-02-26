"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession"; 

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
//   const { isLoggedIn, user } = useSession();
//   const router = useRouter();

// useEffect(() => {
//   if (!isLoggedIn || !user) return;

//   const role = user?.roletbl_roleName;
//   const isProfileCompleted = Number(user?.user_isProfileCompleted);

//   console.log("Auth Redirect →", role, isProfileCompleted);

//   switch (role) {
//     case "SUPER_ADMIN":
//       router.replace("/super-admin");
//       break;

//     case "OPERATIONS_ADMIN":
//       router.replace("/super-admin");
//       break;

//     case "FINANCE_ADMIN":
//       router.replace("/super-admin");
//       break;

//     case "SUPPORT_ADMIN":
//       router.replace("/super-admin");
//       break;

//     case "RECRUITER":
//       router.replace(
//         isProfileCompleted === 0
//           ? "/recruiter/job"
//           : "/recruiter"
//       );
//       break;

//     default:
//       router.replace("/");
//   }
// }, [isLoggedIn, user?.user_id]);  

   
//   if (isLoggedIn) return <Loader/>;

  return <>{children}</>;
};

export default PublicRoute;
