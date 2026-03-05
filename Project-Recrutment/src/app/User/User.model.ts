export interface UserModel {
  id: number;
  username: string;
  password?: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  phoneNumber?: number;
  dateOfBirth: string;
  address?: string;
  countryId?: number;
  stateId?: number;
  city?: string;
  roleId: number;
  offerCTC: number;
  interviewStatus?: number;
  totalExperience?: number;
  createdDateTime?: string;
}

export interface UpdatePasswordDTO {
  userId: number;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiResponse {
  status: number;
  message: string;
  data?: any;
}