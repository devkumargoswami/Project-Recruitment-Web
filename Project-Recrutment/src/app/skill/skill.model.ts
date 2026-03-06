export interface SkillModel {
  id: number;
  userId: number;
  name: string;
}

export interface ApiResponse {
  status: number;
  message: string;
  data?: any;
}