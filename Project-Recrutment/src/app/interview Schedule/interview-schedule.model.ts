export interface InterviewSchedule {
  id: number;
  userId: number;
  interviewTitle: string;
  interviewDateTime: string;
  interviewBy: string;
  status: InterviewStatus;
  comments: string | null;       // ✅ null allow karo
  recordingPath: string | null;  // ✅ null allow karo
}
export enum InterviewStatus {
  Scheduled = 1,
  Completed = 2,
  Cancelled = 3,
}

export const InterviewStatusLabels: Record<InterviewStatus, string> = {
  [InterviewStatus.Scheduled]: 'Scheduled',
  [InterviewStatus.Completed]: 'Completed',
  [InterviewStatus.Cancelled]: 'Cancelled',
};

export const InterviewStatusClasses: Record<InterviewStatus, string> = {
  [InterviewStatus.Scheduled]: 'badge-scheduled',
  [InterviewStatus.Completed]: 'badge-completed',
  [InterviewStatus.Cancelled]: 'badge-cancelled',
};
