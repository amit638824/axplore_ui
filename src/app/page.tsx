"use client";  
import PublicRoute from "@/components/AuthGaurd/PublicRoute";
import LoginForm from "@/components/auth/LoginForm"; 
export default function LoginPage() {
  return (<>
  <PublicRoute>
     <LoginForm/>
  </PublicRoute>
  </>)
  ;
}
