// Corporate API Response Types

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
  corporateId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  designation: string;
  isActive: boolean;
  createdAt: string;
}

export interface Corporate {
  corporateId: string;
  corporateCode: string;
  corporateName: string;
  websiteUrl: string;
  createdAt: string;
  divisions: Division[];
  contactPersons: ContactPerson[];
}

export interface CorporateResponse {
  success: boolean;
  message: string;
  data: Corporate[];
}
