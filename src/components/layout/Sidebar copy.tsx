"use client";
import Link from "next/link";
import Image from "next/image";
import { FiLogOut } from "react-icons/fi";
import { useUser } from "@/lib/contexts/UserContext";

export default function Sidebar() {
  const { user } :any= useUser();

  const menu = user?.menus || []; // 👈 API se aa raha menu
console.log(menu,user);

  return (
    <div className="left-sidebar show">
      {/* LOGO */}
      <div className="brand">
        <a href="#" className="logo">
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
          <div className="menuandFooterimg">
            <ul className="navbar-nav">
              
              {menu
                ?.sort((a: any, b: any) => a.displayOrder - b.displayOrder)
                ?.map((item: any) => (
                  <li key={item.menuId} className="nav-item">
                    <Link href="#" className="nav-link menuitem-active">
                      <i className={item.icon}></i>
                      <span>{item.menuName}</span>
                    </Link>
                  </li>
                ))}

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
              <span className="whiteBoxtext">
                Know more about Axplore
              </span>
            </div>
          </div>

          <div className="footerRightSide">
            <a className="nav-link" href="#">
              <FiLogOut />
              <span>Logout</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}