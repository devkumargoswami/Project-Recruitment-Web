export interface DocumentModel {
  documentId: number;
  userId: number;
  documentName: string;
  documentPath: string;
  createDatetime: string;
}

export interface ApiResponse {
  status: number;
  message: string;
  data?: any;
}
