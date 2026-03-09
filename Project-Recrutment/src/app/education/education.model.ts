export interface EducationModel {
  id: number;
  userId: number;
  educationLevelId: number;
  schoolCollege: string;
  boardUniversity: string;
  degree: string;
  startMonth: number;
  startYear: number;
  endMonth: number;
  endYear: number;
  isContinue: boolean;
}

export interface ApiResponse {
  status: number;
  message: string;
  data?: any;
}