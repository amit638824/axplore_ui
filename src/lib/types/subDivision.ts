// Sub-Division API Response Types

export interface SubDivisionAddress {
  subDivisionAddressId: string;
  subDivisionId: string;
  addressLine1: string;
  addressLine2: string;
  cityId: string;
  stateId: string;
  countryId: string;
  postalCode: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface Division {
  divisionId: string;
  corporateId: string;
  divisionCode: string;
  divisionName: string;
  isActive: boolean;
  createdAt: string;
}

export interface ContactPerson {
  contactPersonId: string;
  subDivisionId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  designation: string;
  isActive: boolean;
  createdAt: string;
}

export interface SubDivision {
  subDivisionId: string;
  divisionId: string;
  subDivisionName: string;
  websiteUrl: string;
  createdAt: string;
  division: Division;
  addresses: SubDivisionAddress[];
  contactPersons: ContactPerson[];
}

export interface SubDivisionResponse {
  success: boolean;
  message: string;
  data: SubDivision[];
}
