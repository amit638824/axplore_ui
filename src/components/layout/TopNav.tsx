// components/Topbar.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { IoMdMenu } from "react-icons/io";
import { MdOutlineNotificationsNone } from "react-icons/md";
import { useUser } from "@/lib/contexts/UserContext";
export default function Topbar() {
  const { user }: any = useUser();

  if (!user) return null;

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`;
  const designation =
    user?.designation?.designationName ||
    user?.roles?.[0]?.roleName ||
    "User";

  return (
    <div className="topbar">
      {/* Navbar */}
      <nav className="navbar-custom" id="navbar-custom">
        <ul className="list-unstyled topbar-nav float-end mb-0">
          <li className="dropdown notification-list">
            <Link
              className="nav-link dropdown-toggle arrow-none nav-icon"
              data-bs-toggle="dropdown"
              href="#"
              role="button"
              aria-haspopup="false"
              aria-expanded="false"
            >
              <span className="notificationIcon"><MdOutlineNotificationsNone /></span>
              <span className="alert-badge" />
            </Link>
            <div className="dropdown-menu dropdown-menu-end dropdown-lg pt-0">
              <h6 className="dropdown-item-text font-15 m-0 py-3 border-bottom d-flex justify-content-between align-items-center">
                Notifications{" "}
                <span className="badge bg-soft-primary badge-pill">2</span>
              </h6>
              <div className="notification-menu" data-simplebar="">
                {/* item*/}
                <Link href="#" className="dropdown-item py-3">
                  <small className="float-end text-muted ps-2">2 min ago</small>
                  <div className="media">
                    <div className="avatar-md bg-soft-primary">
                      <i className="ti ti-chart-arcs" />
                    </div>
                    <div className="media-body align-self-center ms-2 text-truncate">
                      <h6 className="my-0 fw-normal text-dark">
                        Your order is placed
                      </h6>
                      <small className="text-muted mb-0">
                        Dummy text of the printing and industry.
                      </small>
                    </div>
                    {/*end media-body*/}
                  </div>
                  {/*end media*/}
                </Link>
                {/*end-item*/}
                {/* item*/}
                <Link href="#" className="dropdown-item py-3">
                  <small className="float-end text-muted ps-2">10 min ago</small>
                  <div className="media">
                    <div className="avatar-md bg-soft-primary">
                      <i className="ti ti-device-computer-camera" />
                    </div>
                    <div className="media-body align-self-center ms-2 text-truncate">
                      <h6 className="my-0 fw-normal text-dark">
                        Meeting with designers
                      </h6>
                      <small className="text-muted mb-0">
                        It is a long established fact that a reader.
                      </small>
                    </div>
                    {/*end media-body*/}
                  </div>
                  {/*end media*/}
                </Link>
                {/*end-item*/}
                {/* item*/}
                <Link href="#" className="dropdown-item py-3">
                  <small className="float-end text-muted ps-2">40 min ago</small>
                  <div className="media">
                    <div className="avatar-md bg-soft-primary">
                      <i className="ti ti-diamond" />
                    </div>
                    <div className="media-body align-self-center ms-2 text-truncate">
                      <h6 className="my-0 fw-normal text-dark">
                        UX 3 Task complete.
                      </h6>
                      <small className="text-muted mb-0">
                        Dummy text of the printing.
                      </small>
                    </div>
                    {/*end media-body*/}
                  </div>
                  {/*end media*/}
                </Link>
                {/*end-item*/}
                {/* item*/}
                <Link href="#" className="dropdown-item py-3">
                  <small className="float-end text-muted ps-2">1 hr ago</small>
                  <div className="media">
                    <div className="avatar-md bg-soft-primary">
                      <i className="ti ti-drone" />
                    </div>
                    <div className="media-body align-self-center ms-2 text-truncate">
                      <h6 className="my-0 fw-normal text-dark">
                        Your order is placed
                      </h6>
                      <small className="text-muted mb-0">
                        It is a long established fact that a reader.
                      </small>
                    </div>
                    {/*end media-body*/}
                  </div>
                  {/*end media*/}
                </Link>
                {/*end-item*/}
                {/* item*/}
                <Link href="#" className="dropdown-item py-3">
                  <small className="float-end text-muted ps-2">2 hrs ago</small>
                  <div className="media">
                    <div className="avatar-md bg-soft-primary">
                      <i className="ti ti-users" />
                    </div>
                    <div className="media-body align-self-center ms-2 text-truncate">
                      <h6 className="my-0 fw-normal text-dark">
                        Payment Successfull
                      </h6>
                      <small className="text-muted mb-0">
                        Dummy text of the printing.
                      </small>
                    </div>
                    {/*end media-body*/}
                  </div>
                  {/*end media*/}
                </Link>
                {/*end-item*/}
              </div>
              {/* All*/}
              <Link
                href="#"
                className="dropdown-item text-center text-primary"
              >
                View all <i className="fi-arrow-right" />
              </Link>
            </div>
          </li>
          <li className="dropdown">
            <Link
              className="nav-link dropdown-toggle nav-user"
              data-bs-toggle="dropdown"
              href="#"
            >
              <div className="d-flex align-items-center">
                <div className="top-rigtprofiles">
                  <span className="d-none d-md-block profileName">
                    {fullName} <i className="mdi mdi-chevron-down" />
                  </span>

                  <span className="d-none d-md-block profileDesignation">
                    {designation}
                  </span>
                </div>

                <Image
                  width={36}
                  height={36}
                  src="/assets/images/users/user-4.jpg"
                  alt="profile-user"
                  className="rounded-circle me-2-left thumb-sm"
                />
              </div>
            </Link>

            <div className="dropdown-menu dropdown-menu-end">
              <Link className="dropdown-item" href="/profile">
                <i className="ti ti-user font-16 me-1 align-text-bottom" />
                Profile
              </Link>

              <Link className="dropdown-item" href="#">
                <i className="ti ti-settings font-16 me-1 align-text-bottom" />
                Settings
              </Link>

              <Link className="dropdown-item" href="/change-password">
                <i className="ti ti-lock font-16 me-1 align-text-bottom" />
                Change Password
              </Link>

              <div className="dropdown-divider mb-0" />

              <Link className="dropdown-item" href="#">
                <i className="ti ti-power font-16 me-1 align-text-bottom" />
                Logout
              </Link>
            </div>
          </li>
          {/*end topbar-profile*/}
        </ul>
        {/*end topbar-nav*/}

      </nav>
      {/* end navbar*/}
    </div>

  );
}

