export interface DocumentModel {
  documentId: number;
  userId: number;
  documentName: string;
  // Optional fields from your template/backend
  documentType?: string;
  uploadedAt?: string;
  fileUrl?: string;
}

export interface ApiResponse {
  status: number;
  message: string;
  data?: any;
}
