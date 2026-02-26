// components/Sidebar.tsx
"use client"; 
import React, { useLayoutEffect, useState, useMemo } from "react";
import Link from "next/link"; 
import { usePathname } from "next/navigation";  

export default function Sidebar() {  
  return (
    <div className="leftbar-tab-menu">
      {/* Left vertical icon menu */}
      <div className="main-icon-menu">
        {/* Logo (small version) */}
        <Link href="/dashboard" className="logo logo-metrica d-block text-center">
          <span>
            <img
              src="/assets/images/logo-sm.png"
              alt="logo-small"
              className="logo-sm"
            />
          </span>
        </Link>

        {/* Icon navigation */}
        <div className="main-icon-menu-body">
          <div
            className="position-relative h-100"
            data-simplebar
            style={{ overflowX: "hidden" }}
          >
            <ul className="nav nav-tabs" role="tablist" id="tab-menu">
             
            </ul>
          </div>
        </div>

        {/* Profile at bottom */}
        {/* <div className="pro-metrica-end">
          <a href="#" className="profile">
            <Image
              src="/assets/images/users/user-4.jpg"
              alt="profile-user"
              className="rounded-circle thumb-sm"
              width={36}
              height={36}
            />
          </a>
        </div> */}
      </div>

      {/* Main menu content (opens when icon is clicked) */}
      <div className="main-menu-inner">
        {/* Large logo */}
        <div className="topbar-left">
          <Link href="/dashboard" className="logo">
            <span>
              <img
                src="/assets/images/logo-dark.png"
                alt="logo-large"
                className="logo-lg logo-dark"
              />
              <img
                src="/assets/images/logo.png"
                alt="logo-large"
                className="logo-lg logo-light"
              />
            </span>
          </Link>
        </div>

        {/* Tab content */}
        <div
          className="menu-body navbar-vertical tab-content"
          data-simplebar
          style={{ overflowY: "auto" }}
        >
         
        </div>
      </div>
    </div>
  );
}
