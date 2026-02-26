import React from 'react'
import ApexChartsInitializer from './ApexChartsInitializer'

const Dashboard = () => {
  return (
     <>
      <ApexChartsInitializer />

      <div className="container-fluid">
        {/* Page-Title */}
        <div className="row">
          <div className="col-sm-12">
            <div className="page-title-box">
              <div className="float-end">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <a href="#">Axplore</a>
                  </li>
                  <li className="breadcrumb-item active">Dashboard</li>
                </ol>
              </div>
              <h4 className="page-title">Dashboard</h4>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <div className="row align-items-center">
                  <div className="col">
                    <h4 className="card-title">Leads Trends</h4>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col col-md">
                    <div className="media">
                      <i
                        data-feather="phone"
                        className="align-self-center icon-lg text-secondary"
                      ></i>
                      <div className="media-body align-self-center ms-2">
                        <h6 className="mt-0 mb-1 font-16">
                          76% Deals Successfull{" "}
                          <i className="fas fa-check text-success"></i>
                        </h6>
                        <p className="text-muted mb-0">
                          This is a simple hero unit, a simple jumbotron-style component.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div id="crm-dash" className="apex-charts"></div>
                </div>
              </div>
            </div>

            <div className="row kpiFiveBox">
              <div className="col-md-6 col-lg-3">
                <div className="card">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col text-center">
                        <span className="h4">60k</span>
                        <h6 className="text-uppercase text-muted mt-2 m-0">Leads</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-3">
                <div className="card">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col text-center">
                        <span className="h4">10k</span>
                        <h6 className="text-uppercase text-muted mt-2 m-0">
                          Customers
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-3">
                <div className="card">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col text-center">
                        <span className="h4">720</span>
                        <h6 className="text-uppercase text-muted mt-2 m-0">Vendors</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-3">
                <div className="card">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col text-center">
                        <span className="h4">$5964</span>
                        <h6 className="text-uppercase text-muted mt-2 m-0">Invoices</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-3">
                <div className="card">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col text-center">
                        <span className="h4">$3689</span>
                        <h6 className="text-uppercase text-muted mt-2 m-0">Payments</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <div className="row align-items-center">
                  <div className="col">
                    <h4 className="card-title">Activity</h4>
                  </div>
                </div>
              </div>
              <div className="card-body p-0 activityList">
                <div className="p-3" data-simplebar>
                  <div className="activity">
                    <div className="activity-info">
                      <div className="icon-info-activity">
                        <i className="las la-user-clock bg-soft-primary"></i>
                      </div>
                      <div className="activity-info-text">
                        <div className="d-flex justify-content-between align-items-center">
                          <p className="text-muted mb-0 font-13 w-75">
                            <span>Donald</span> updated the status of{" "}
                            <a href="#">Refund #1234</a> to awaiting customer response
                          </p>
                          <small className="text-muted">06:49</small>
                        </div>
                      </div>
                    </div>

                    <div className="activity-info">
                      <div className="icon-info-activity">
                        <i className="mdi mdi-timer-off bg-soft-primary"></i>
                      </div>
                      <div className="activity-info-text">
                        <div className="d-flex justify-content-between align-items-center">
                          <p className="text-muted mb-0 font-13 w-75">
                            <span>Lucy Peterson</span> was added to the group, group name is{" "}
                            <a href="#">Overtake</a>
                          </p>
                          <small className="text-muted">06:40</small>
                        </div>
                      </div>
                    </div>

                    <div className="activity-info">
                      <div className="icon-info-activity">
                        <img
                          src="/assets/images/users/user-5.jpg"
                          alt=""
                          className="rounded-circle thumb-sm"
                        />
                      </div>
                      <div className="activity-info-text">
                        <div className="d-flex justify-content-between align-items-center">
                          <p className="text-muted mb-0 font-13 w-75">
                            <span>Joseph Rust</span> opened new showcase{" "}
                            <a href="#">Mannat #112233</a> with theme market
                          </p>
                          <small className="text-muted">06:20</small>
                        </div>
                      </div>
                    </div>

                    <div className="activity-info">
                      <div className="icon-info-activity">
                        <i className="mdi mdi-clock-outline bg-soft-primary"></i>
                      </div>
                      <div className="activity-info-text">
                        <div className="d-flex justify-content-between align-items-center">
                          <p className="text-muted mb-0 font-13 w-75">
                            <span>Donald</span> updated the status of{" "}
                            <a href="#">Refund #1234</a> to awaiting customer response
                          </p>
                          <small className="text-muted">05:45</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="row align-items-center">
                  <div className="col">
                    <h4 className="card-title">Lead Status</h4>
                  </div>
                </div>
              </div>
              <div className="card-body leadStatusTExt">
                <div className="row">
                  <div className="col border-end">
                    <div className="d-flex justify-content-center align-items-center rounded-circle mx-auto">
                      <span className="thumb-lg justify-content-center d-flex align-items-center bg-soft-pink rounded-circle me-2">
                        HOT
                      </span>
                    </div>
                    <div className="text-center">
                      <h3 className="text-dark">184k</h3>
                    </div>
                  </div>

                  <div className="col border-end">
                    <div className="d-flex justify-content-center align-items-center rounded-circle mx-auto">
                      <span className="thumb-lg justify-content-center d-flex align-items-center bg-soft-warning rounded-circle me-2">
                        WARM
                      </span>
                    </div>
                    <div className="text-center">
                      <h3 className="text-dark">184k</h3>
                    </div>
                  </div>

                  <div className="col">
                    <div className="d-flex justify-content-center align-items-center rounded-circle mx-auto">
                      <span className="thumb-lg justify-content-center d-flex align-items-center bg-soft-purple rounded-circle me-2">
                        COLD
                      </span>
                    </div>
                    <div className="text-center">
                      <h3 className="text-dark">184k</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row monthlyandRecentTable">
          <div className="col-md-6 col-lg-4">
            <div className="card">
              <div className="card-header">
                <div className="row align-items-center">
                  <div className="col">
                    <h4 className="card-title">Monthly Trends</h4>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-xxl-6">
                    <div id="email_report" className="apex-charts"></div>
                  </div>
                  <div className="col-xxl-6 align-self-center">
                    <ul className="list-unstyled">
                      <li className="list-item mb-2">
                        <i className="fas fa-play text-primary me-2"></i>Sent
                      </li>
                      <li className="list-item mb-2">
                        <i className="fas fa-play text-info me-2"></i>Opened
                      </li>
                      <li className="list-item">
                        <i
                          className="fas fa-play me-2"
                          style={{ color: "#fdb5c8" }}
                        ></i>
                        Not Opened
                      </li>
                    </ul>
                    <button type="button" className="btn btn-sm btn-de-primary">
                      View Details <i className="mdi mdi-arrow-right"></i>
                    </button>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <h6 className="bg-light-alt py-3 px-2 mb-0">
                    <i
                      data-feather="calendar"
                      className="align-self-center icon-xs me-1"
                    ></i>
                    01 January 2021 to 31 December 2021
                  </h6>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="row align-items-center">
                  <div className="col">
                    <h4 className="card-title">Social Report</h4>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col border-end">
                    <div className="d-flex justify-content-center align-items-center thumb-lg bg-soft-primary rounded-circle mx-auto">
                      <i data-feather="facebook" className="align-self-center"></i>
                    </div>
                    <div className="text-center">
                      <h3 className="text-dark">184k</h3>
                      <h6 className="font-14 text-dark">Followers</h6>
                    </div>
                  </div>

                  <div className="col border-end">
                    <div className="d-flex justify-content-center align-items-center thumb-lg bg-soft-pink rounded-circle mx-auto">
                      <i data-feather="instagram" className="align-self-center"></i>
                    </div>
                    <div className="text-center">
                      <h3 className="text-dark">184k</h3>
                      <h6 className="font-14 text-dark">Followers</h6>
                    </div>
                  </div>

                  <div className="col">
                    <div className="d-flex justify-content-center align-items-center thumb-lg bg-soft-info rounded-circle mx-auto">
                      <i data-feather="twitter" className="align-self-center"></i>
                    </div>
                    <div className="text-center">
                      <h3 className="text-dark">101k</h3>
                      <h6 className="font-14 text-dark">Followers</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card recentLeadsTable">
              <div className="card-header">
                <div className="row align-items-center">
                  <div className="col">
                    <h4 className="card-title">Recent Leads</h4>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table mb-0">
                    <thead className="thead-light">
                      <tr>
                        <th>Lead</th>
                        <th>Email</th>
                        <th>Phone No</th>
                        <th>Company</th>
                        <th>Budget</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <img
                            src="/assets/images/users/user-10.jpg"
                            alt=""
                            className="thumb-sm rounded-circle me-2"
                          />
                          Donald Gardner
                        </td>
                        <td>xyx@gmail.com</td>
                        <td>+123456789</td>
                        <td>Starbucks coffee</td>
                        <td>$45000</td>
                        <td>
                          {" "}
                          <span className="badge badge-md badge-soft-purple">
                            New Lead
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <img
                            src="/assets/images/users/user-9.jpg"
                            alt=""
                            className="thumb-sm rounded-circle me-2"
                          />
                          Matt Rosales
                        </td>
                        <td>xyx@gmail.com</td>
                        <td>+123456789</td>
                        <td>Mac Donald</td>
                        <td>$45000</td>
                        <td>
                          {" "}
                          <span className="badge badge-md badge-soft-purple">
                            New Lead
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <img
                            src="/assets/images/users/user-8.jpg"
                            alt=""
                            className="thumb-sm rounded-circle me-2"
                          />
                          Michael Hill
                        </td>
                        <td>xyx@gmail.com</td>
                        <td>+123456789</td>
                        <td>Life Good</td>
                        <td>$45870</td>
                        <td>
                          {" "}
                          <span className="badge badge-md badge-soft-danger">
                            Lost
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <img
                            src="/assets/images/users/user-7.jpg"
                            alt=""
                            className="thumb-sm rounded-circle me-2"
                          />
                          Nancy Flanary
                        </td>
                        <td>xyx@gmail.com</td>
                        <td>+123456789</td>
                        <td>Flipcart</td>
                        <td>$87000</td>
                        <td>
                          {" "}
                          <span className="badge badge-md badge-soft-purple">
                            New Lead
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <img
                            src="/assets/images/users/user-6.jpg"
                            alt=""
                            className="thumb-sm rounded-circle me-2"
                          />
                          Dorothy Key
                        </td>
                        <td>xyx@gmail.com</td>
                        <td>+123456789</td>
                        <td>Adidas</td>
                        <td>$55000</td>
                        <td>
                          {" "}
                          <span className="badge badge-md badge-soft-primary">
                            Follow Up
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <img
                            src="/assets/images/users/user-5.jpg"
                            alt=""
                            className="thumb-sm rounded-circle me-2"
                          />
                          Joseph Cross
                        </td>
                        <td>xyx@gmail.com</td>
                        <td>+123456789</td>
                        <td>Reebok</td>
                        <td>$65000</td>
                        <td>
                          {" "}
                          <span className="badge badge-md badge-soft-success">
                            Converted
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <img
                            src="/assets/images/users/user-5.jpg"
                            alt=""
                            className="thumb-sm rounded-circle me-2"
                          />
                          Joseph Cross
                        </td>
                        <td>xyx@gmail.com</td>
                        <td>+123456789</td>
                        <td>Reebok</td>
                        <td>$65000</td>
                        <td>
                          {" "}
                          <span className="badge badge-md badge-soft-success">
                            Converted
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div></>
  )
}

export default Dashboard