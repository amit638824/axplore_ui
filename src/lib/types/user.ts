// User Info API Response Types

export interface City {
  cityId: string;
  name: string;
}

export interface State {
  stateId: string;
  name: string;
}

export interface Country {
  countryId: string;
  name: string;
}

export interface Branch {
  branchId: string;
  branchName: string;
  branchCode: string;
  phone: string;
  email: string;
  city: City;
  state: State;
  country: Country;
}

export interface TravelAgency {
  travelAgencyId: string;
  name: string;
  email: string;
  phone: string;
  websiteUrl: string;
}

export interface Designation {
  designationId: string;
  designationCode: string;
  designationName: string;
}

export interface Role {
  roleId: string;
  roleCode: string;
  roleName: string;
  description: string;
}

export interface Permission {
  permissionId: string;
  permissionCode: string;
  permissionName: string;
  description: string;
}

export interface SubMenu {
  subMenuId: string;
  subMenuCode: string;
  subMenuName: string;
  routePath: string;
  displayOrder: number;
  permissions: Permission[];
}

export interface Menu {
  menuId: string;
  menuCode: string;
  menuName: string;
  displayOrder: number;
  icon: string | null;
  subMenus: SubMenu[];
}

export interface UserInfo {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  mobile: string;
  employeeCode: string;
  isActive: boolean;
  travelAgency: TravelAgency;
  branch: Branch;
  designation: Designation;
  roles: Role[];
  menus: Menu[];
  permissions: string[];
}

export interface UserInfoResponse {
  success: boolean;
  message: string;
  data: UserInfo;
}
