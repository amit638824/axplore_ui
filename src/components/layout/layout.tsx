import DashboardFooter from "./DashboardFooter";
import Topbar from "./TopNav"; 
import Sidebar from "./Sidebar";
import './layout.css';


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (<>
    <Sidebar />
    <Topbar/> 
    <div className="page-wrapper">
      <div className="page-content-tab">
        {children}
        <DashboardFooter />
      </div>
    </div>
 


  </>);
}