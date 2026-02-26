import Dashboard from "@/components/dashboard/Dashboard";
import DashboardLayout from "@/components/layout/layout";
import CreateNewLeads from "@/components/leads/CreateNewLeads";
import LeadsList from "@/components/leads/LeadsList";


export default async function ForgotPasswordPage() {

  return (
    <DashboardLayout>
      <LeadsList />
    </DashboardLayout>
  );
}
