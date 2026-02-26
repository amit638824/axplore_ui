"use client";
import Link from "next/link";
import Image from "next/image";

export default function Sidebar() {
  return (
    <div className="left-sidebar show">
      
      {/* LOGO */}
      <div className="brand">
        <a href="index.html" className="logo">
          <span>
            <Image
              src="/assets/images/logo-dark.png"
              alt="logo-large"
              width={160}    
              height={54}  
              className="logo-lg logo-dark"
              priority
            />
          </span>
        </a>
      </div>

      <div className="menu-body navbar-vertical tab-content menuitem-active">
        <div className="collapse navbar-collapse show" id="sidebarCollapse">
          <ul className="navbar-nav">

            <li className="nav-item menuitem-active">
              <a className="nav-link" href="#">
                <Image
                  src="/assets/images/dashbaord-Icon.svg"
                  alt="dashboard"
                  width={20}
                  height={20}
                />
                <span>Dashboards</span>
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#">
                <Image
                  src="/assets/images/masters-Icon.svg"
                  alt="masters"
                  width={20}
                  height={20}
                />
                <span>Masters</span>
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#">
                <Image
                  src="/assets/images/leadManagement-Icon.svg"
                  alt="lead-management"
                  width={20}
                  height={20}
                />
                <span>Lead Management</span>
              </a>
            </li>

          </ul>
        </div>
      </div>
    </div>
  );
}