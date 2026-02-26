// components/Sidebar.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
export default function Sidebar() {
  return (
    <>
      <div className="left-sidebar show">

        <div className="brand">
          <a href="index.html" className="logo">
            <span>
              <Image src="/assets/images/logo-dark.png" alt="logo-large" className="logo-lg logo-dark" />
            </span>
          </a>
        </div>

        <div className="menu-body navbar-vertical tab-content menuitem-active">
          <div className="collapse navbar-collapse show" id="sidebarCollapse">
            <ul className="navbar-nav">
              <li className="nav-item menuitem-active">
                <a className="nav-link" href="#">
                  <Image src="/assets/images/dashbaord-Icon.svg"  alt="logo-large" />
                  <span>Dashboards</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  <Image src="/assets/images/masters-Icon.svg" alt="logo-large" />
                  <span>Masters</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  <Image src="/assets/images/leadManagement-Icon.svg"  alt="logo-large" />
                  <span>Lead Management</span>
                </a>
              </li>

            </ul>
          </div>
        </div>
      </div>

    </>
  );
}
