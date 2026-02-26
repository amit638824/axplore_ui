
import AuthLayout from "@/components/auth/AuthLayout";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default async function ForgotPasswordPage() {

  return ( 
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
