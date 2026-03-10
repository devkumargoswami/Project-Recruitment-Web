export interface Experience {
  userId: number;
  companyName: string;
  designation: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  id?: number;
}

export interface ExperienceResponse {
  success: boolean;
  data: Experience[];
  message: string;
}

export interface ApiResponse {
  statusCode: number;
  data: any;
  message: string;
}