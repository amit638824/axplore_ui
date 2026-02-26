// components/Topbar.tsx
"use client"; 
import Link from "next/link";
  import Image from "next/image";
import { IoMdMenu } from "react-icons/io";
import { MdOutlineNotificationsNone } from "react-icons/md";
export default function Topbar() { 
  return (
  <div className="topbar">
  {/* Navbar */}
  <nav className="navbar-custom" id="navbar-custom">
    <ul className="list-unstyled topbar-nav float-end mb-0">
      <li className="dropdown notification-list">
        <a
          className="nav-link dropdown-toggle arrow-none nav-icon"
          data-bs-toggle="dropdown"
          href="#"
          role="button"
          aria-haspopup="false"
          aria-expanded="false"
        >
          <span className="notificationIcon"><MdOutlineNotificationsNone /></span>
          <span className="alert-badge" />
        </a>
        <div className="dropdown-menu dropdown-menu-end dropdown-lg pt-0">
          <h6 className="dropdown-item-text font-15 m-0 py-3 border-bottom d-flex justify-content-between align-items-center">
            Notifications{" "}
            <span className="badge bg-soft-primary badge-pill">2</span>
          </h6>
          <div className="notification-menu" data-simplebar="">
            {/* item*/}
            <a href="#" className="dropdown-item py-3">
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
            </a>
            {/*end-item*/}
            {/* item*/}
            <a href="#" className="dropdown-item py-3">
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
            </a>
            {/*end-item*/}
            {/* item*/}
            <a href="#" className="dropdown-item py-3">
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
            </a>
            {/*end-item*/}
            {/* item*/}
            <a href="#" className="dropdown-item py-3">
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
            </a>
            {/*end-item*/}
            {/* item*/}
            <a href="#" className="dropdown-item py-3">
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
            </a>
            {/*end-item*/}
          </div>
          {/* All*/}
          <a
            href="javascript:void(0);"
            className="dropdown-item text-center text-primary"
          >
            View all <i className="fi-arrow-right" />
          </a>
        </div>
      </li>
      <li className="dropdown">
        <a
          className="nav-link dropdown-toggle nav-user"
          data-bs-toggle="dropdown"
          href="#"
          role="button"
          aria-haspopup="false"
          aria-expanded="false"
        >
          <div className="d-flex align-items-center">
           
            <div className="top-rigtprofiles">
               <span className="d-none d-md-block profileName">
                Vivek <i className="mdi mdi-chevron-down" />
              </span>
              <span className="d-none d-md-block profileDesignation">Admin Department</span>
             
            </div>
             <Image
              width={36}
              height={36}
              src="/assets/images/users/user-4.jpg"
              alt="profile-user"
              className="rounded-circle me-2-left thumb-sm"
            />
          </div>
        </a>
        <div className="dropdown-menu dropdown-menu-end">
          <a className="dropdown-item" href="profile.html">
            <i className="ti ti-user font-16 me-1 align-text-bottom" />
            Profile
          </a>
          <a className="dropdown-item" href="#">
            <i className="ti ti-settings font-16 me-1 align-text-bottom" />
            Settings
          </a>
          <a className="dropdown-item" href="change-password.html">
            <i className="ti ti-lock font-16 me-1 align-text-bottom" />
            Change Password
          </a>
          <div className="dropdown-divider mb-0" />
          <a className="dropdown-item" href="#">
            <i className="ti ti-power font-16 me-1 align-text-bottom" />
            Logout
          </a>
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

