// components/Topbar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "@/lib/contexts/UserContext";

function getInitials(user: { firstName?: string; lastName?: string; email?: string }): string {
  const first = user.firstName?.trim().charAt(0) || "";
  const last = user.lastName?.trim().charAt(0) || "";
  if (first || last) return `${first}${last}`.toUpperCase();
  return user.email?.charAt(0)?.toUpperCase() || "U";
}

export default function Topbar() {
  const { user, loading } = useUser();

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim() || user.email
    : "User";

  const roleName = user?.roles?.[0]?.roleName || "User";
  const handleToggleMenu = () => {
    // Mobile (<992px): open the off-canvas sidebar
    // Desktop: toggle the compact sidebar mode (template behavior)
    if (window.innerWidth < 992) {
      document.body.classList.toggle("sidebar-open");
    } else {
      document.body.classList.toggle("enlarge-menu");
      document.body.classList.remove("sidebar-open");
    }
  };

  return (
    <div className="topbar">
      <nav className="navbar-custom" id="navbar-custom">
        {/* Right side - Notifications + User Profile */}
        <ul className="list-unstyled topbar-nav float-end mb-0">
          {/* Notifications Dropdown */}
          <li className="dropdown notification-list">
            <a
              className="nav-link dropdown-toggle arrow-none nav-icon"
              data-bs-toggle="dropdown"
              href="#"
              role="button"
              aria-haspopup="false"
              aria-expanded="false"
            >
              <i className="ti ti-bell"></i>
              <span className="alert-badge"></span>
            </a>

            <div className="dropdown-menu dropdown-menu-end dropdown-lg pt-0">
              <div className="d-flex justify-content-between align-items-center py-3 px-4 border-bottom">
                <h6 className="mb-0 font-15">Notifications</h6>
                <span className="badge bg-soft-primary badge-pill">2</span>
              </div>

              <div
                className="notification-menu"
                data-simplebar
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
                {/* Notification Item */}
                <Link href="#" className="dropdown-item py-3">
                  <small className="float-end text-muted ps-2">2 min ago</small>
                  <div className="d-flex">
                    <div className="avatar-md bg-soft-primary rounded d-flex align-items-center justify-content-center">
                      <i className="ti ti-chart-arcs"></i>
                    </div>
                    <div className="ms-3 flex-grow-1 text-truncate">
                      <h6 className="my-0 fw-normal text-dark">Your order is placed</h6>
                      <small className="text-muted mb-0">
                        Dummy text of the printing and industry.
                      </small>
                    </div>
                  </div>
                </Link>

                <Link href="#" className="dropdown-item py-3">
                  <small className="float-end text-muted ps-2">10 min ago</small>
                  <div className="d-flex">
                    <div className="avatar-md bg-soft-primary rounded d-flex align-items-center justify-content-center">
                      <i className="ti ti-device-computer-camera"></i>
                    </div>
                    <div className="ms-3 flex-grow-1 text-truncate">
                      <h6 className="my-0 fw-normal text-dark">Meeting with designers</h6>
                      <small className="text-muted mb-0">
                        It is a long established fact that a reader.
                      </small>
                    </div>
                  </div>
                </Link>

                <Link href="#" className="dropdown-item py-3">
                  <small className="float-end text-muted ps-2">40 min ago</small>
                  <div className="d-flex">
                    <div className="avatar-md bg-soft-primary rounded d-flex align-items-center justify-content-center">
                      <i className="ti ti-diamond"></i>
                    </div>
                    <div className="ms-3 flex-grow-1 text-truncate">
                      <h6 className="my-0 fw-normal text-dark">UX 3 Task complete.</h6>
                      <small className="text-muted mb-0">Dummy text of the printing.</small>
                    </div>
                  </div>
                </Link>

                {/* You can add more items here */}
              </div>

              <div className="text-center py-2">
                <Link href="#" className="text-primary">
                  View all <i className="fi-arrow-right"></i>
                </Link>
              </div>
            </div>
          </li>

          {/* User Profile Dropdown */}
          <li className="dropdown">
            <a
              className="nav-link dropdown-toggle nav-user d-flex align-items-center"
              data-bs-toggle="dropdown"
              href="#"
              role="button"
              aria-haspopup="false"
              aria-expanded="false"
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 bg-primary text-white fw-semibold font-12 me-2"
                style={{ width: 32, height: 32 }}
                aria-hidden
              >
                {loading ? "…" : user ? getInitials(user) : "U"}
              </div>
              <div className="d-none d-md-block text-start">
                <div className="fw-semibold font-13 text-truncate" style={{ maxWidth: 140 }}>
                  {loading ? "Loading…" : displayName}
                </div>
                <small className="text-muted font-11 d-block">{loading ? "" : roleName}</small>
              </div>
              <i className="ti ti-chevron-down font-14 ms-1 d-none d-md-inline-block opacity-75" aria-hidden />
            </a>

            <div className="dropdown-menu dropdown-menu-end py-2">
              <div className="px-3 py-2 d-md-none border-bottom">
                <div className="fw-semibold font-13">{displayName}</div>
                <small className="text-muted font-11">{roleName}</small>
              </div>
              <Link className="dropdown-item d-flex align-items-center py-2" href="/profile">
                <i className="ti ti-user font-16 me-2 flex-shrink-0" style={{ width: 20, textAlign: "center" }} aria-hidden />
                Profile
              </Link>
              <Link className="dropdown-item d-flex align-items-center py-2" href="#">
                <i className="ti ti-settings font-16 me-2 flex-shrink-0" style={{ width: 20, textAlign: "center" }} aria-hidden />
                Settings
              </Link>
              <Link className="dropdown-item d-flex align-items-center py-2" href="#">
                <i className="ti ti-lock font-16 me-2 flex-shrink-0" style={{ width: 20, textAlign: "center" }} aria-hidden />
                Change Password
              </Link>
              <div className="dropdown-divider my-2" />
              <a className="dropdown-item d-flex align-items-center py-2 text-danger" href="/api-next/auth/logout">
                <i className="ti ti-power font-16 me-2 flex-shrink-0" style={{ width: 20, textAlign: "center" }} aria-hidden />
                Logout
              </a>
            </div>
          </li>
        </ul>

        {/* Left side - Mobile Menu Toggle */}
        <ul className="list-unstyled topbar-nav mb-0">
          <li>
            <button
              className="nav-link button-menu-mobile nav-icon"
              id="togglemenu"
              type="button"
              onClick={handleToggleMenu}
            >
              <i className="ti ti-menu-2"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

