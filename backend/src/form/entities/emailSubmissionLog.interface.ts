export interface EmailSubmissionLog {
  id?: number;
  code?: string;
  exceptionLog?: string;
  confirmationId?: string;
  formId?: string;
  formVersionId?: string;
  createTimestamp?: Date;
  emailType?: string;
  submissionUpdatedAt?: Date;
}
