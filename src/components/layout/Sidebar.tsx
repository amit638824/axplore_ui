"use client";
import Link from "next/link";
import Image from "next/image";
import { MdOutlineDashboard } from "react-icons/md";
import { FiDatabase, FiBriefcase, FiGlobe, FiSettings, FiLogOut } from "react-icons/fi";
import { GrDocumentText } from "react-icons/gr";

export default function Sidebar() {

  return (
    <div className="left-sidebar show">

      {/* LOGO */}
      <div className="brand">
        <Link href="/" className="logo">
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
        </Link>
      </div>

      <div className="menu-body navbar-vertical tab-content menuitem-active">
        <div className="collapse navbar-collapse show" id="sidebarCollapse">
          <div className="menuandFooterimg">
            <ul className="navbar-nav">

              <li className="nav-item menuitem-active">
                <Link className="nav-link" href="#">
                  <MdOutlineDashboard />
                  <span>Dashboards</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" href="#">
                  <FiDatabase />
                  <span>Masters</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" href="#">
                  <FiBriefcase />
                  <span>Lead Management</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" href="#">
                  <FiGlobe />
                  <span>Operations</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" href="#">
                  <GrDocumentText />
                  <span>Reports</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" href="#">
                  <FiSettings />
                  <span>Settings</span>
                </Link>
              </li>


            </ul>

            <div className="bottomIMage">
              <Image
                src="/assets/images/footerbottom.png"
                alt="Footer"
                width={208}
                height={168}
                className="logo-lg logo-dark"
                priority
              />
              <span className="whiteBoxtext">Know more about Axplore</span>
            </div>
          </div>
          <div className="footerRightSide">
            <Link className="nav-link" href="#">
              <FiLogOut />
              <span>Logout</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}