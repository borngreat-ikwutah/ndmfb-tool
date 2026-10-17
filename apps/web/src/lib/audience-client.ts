import type {
  AudienceType,
  ContactImportReport,
  ContactList,
  CreateNotificationDraftRequest,
  NotificationDraft,
} from "@ndmfb/contract";
import { clientEnv } from "~/config/client-env";

const apiURL = clientEnv.VITE_API_URL;

export async function importContacts(input: {
  file: File;
  audienceType: AudienceType;
  listName?: string;
}): Promise<ContactImportReport> {
  const form = new FormData();
  form.append("file", input.file);
  form.append("audienceType", input.audienceType);
  if (input.listName) form.append("listName", input.listName);
  return request<ContactImportReport>("/api/audiences/import", {
    method: "POST",
    body: form,
  });
}

export async function getContactLists(): Promise<ContactList[]> {
  const lists = await request<ContactList[] | null>("/api/audiences/lists");
  // The API serializes an empty result as `null` (Go nil slice), so coerce it
  // back to an array at the boundary before callers map/filter over it.
  return Array.isArray(lists) ? lists : [];
}

export function createNotificationDraft(input: CreateNotificationDraftRequest): Promise<NotificationDraft> {
  return request<NotificationDraft>("/api/notifications/drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiURL}${path}`, {
    ...init,
    credentials: "include",
  });
  const payload = (await response.json().catch(() => null)) as { message?: string } | T | null;
  if (!response.ok) {
    throw new Error(payload && typeof payload === "object" && "message" in payload ? payload.message : "Request failed");
  }
  return payload as T;
}
