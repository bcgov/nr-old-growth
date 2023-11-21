export interface EmailSubmissionLog {
  id?: number;
  code?: string;
  exceptionLog?: string;
  confirmationId?: string;
  formId?: string;
  formVersionId?: string;
  emailType?: string;
  submissionUpdatedAt?: Date;
}
