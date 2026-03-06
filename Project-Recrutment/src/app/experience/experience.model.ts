export interface ExperienceModel {
  id: number;
  userId: number;
  companyName: string;
  designation: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

export interface ApiResponse {
  status: number;
  message: string;
  data?: any;
}