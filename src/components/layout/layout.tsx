import DashboardFooter from "./DashboardFooter";
import DashboardNavbar from "./DashboardNavbar";
import Sidebar from "./Sidebar";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (<>
    <Sidebar />
    <DashboardNavbar />
    <div className="page-wrapper">
      <div className="page-content-tab">
        {children}
        <DashboardFooter />
      </div>
    </div>


  </>);
}