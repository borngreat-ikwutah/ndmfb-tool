export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Session = {
  id: string;
  expiresAt: string;
  user: User;
};

export type AuthResponse = {
  user: User;
  session: Session;
};

export type EmailCredentials = {
  email: string;
  password: string;
};

export type EmailSignUpRequest = EmailCredentials & {
  name: string;
};

export type ErrorResponse = {
  error: string;
  message: string;
  status: string;
};

export type AudienceType = "staff" | "user";

export type Contact = {
  id: string;
  email: string;
  name: string;
  audienceType: AudienceType;
  status: "active" | "suppressed";
  customFields: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

export type ContactList = {
  id: string;
  name: string;
  audienceType: AudienceType;
  contactCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ContactImportReport = {
  audienceType: AudienceType;
  list?: ContactList;
  totalRows: number;
  imported: number;
  updated: number;
  duplicates: number;
  rejected: number;
  errors: Array<{ row: number; message: string }>;
};

export type CreateNotificationDraftRequest = {
  title: string;
  subject: string;
  body: string;
  audienceType: AudienceType;
  listId?: string;
};

export type NotificationDraftStatus = "draft" | "approved" | "sending" | "sent" | "failed";

export type NotificationDraft = CreateNotificationDraftRequest & {
  id: string;
  status: NotificationDraftStatus;
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationSendStatus = "queued" | "sending" | "sent" | "partial" | "failed";

export type NotificationSend = {
  id: string;
  draftId: string;
  subject: string;
  body: string;
  audienceType: AudienceType;
  listId?: string | null;
  ownerId: string;
  status: NotificationSendStatus;
  total: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  updatedAt: string;
};

export type NotificationDeliveryStatus = "pending" | "sent" | "failed";

export type NotificationDelivery = {
  sendId: string;
  contactId: string;
  email: string;
  status: NotificationDeliveryStatus;
  error?: string | null;
  sentAt?: string | null;
  createdAt: string;
};

export type NotificationSendReport = {
  send: NotificationSend;
  deliveries: NotificationDelivery[];
};
