export interface User {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: string;
  internal?: boolean;
  external?: boolean;
  active?: boolean;
  locked?: boolean;
  cancelled?: boolean;
  contactEmail?: string;
  contactPhone?: string;
  contactMobile?: string;
  contactPosition?: string;
  registerDate?: string;
  activateDate?: string;
  loginDate?: string;
  lockDate?: string;
  cancelledDate?: string;
  company?: { id: number; companyName?: string };
}

export interface LoginResponse {
  token: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}
