# PRD: New Dawn MFB Internal Bulk Email Tool (NDMFB Tool)

**Owner:** BG (ChainSage)  
**Stakeholder:** New Dawn MFB Bank Office (internal staff)  
**Status:** Draft v1  
**Last updated:** 2026-08-22  
**Design Standard:** Cenpact Design System (`design.md`)

---

## 1. Summary

An internal web application that lets New Dawn Microfinance Bank (NDMFB) staff compose, edit, and send bulk emails to a list of recipients, using the bank's own on-prem SMTP/Exchange server. No external email providers or cloud APIs are involved — all mail routes through infrastructure the bank already controls.

---

## 2. Problem Statement

Staff currently have no self-serve way to send templated, one-to-many emails (e.g., policy notices, maintenance windows, loan/account updates, internal announcements) without manually mail-merging or looping in IT. They need a simple internal tool to:

1. Write/edit an email (subject + body, with merge fields like `{{name}}`, `{{account_ref}}`)
2. Upload or select a list of recipients
3. Preview before sending
4. Send it out through the bank's own mail server
5. See a record of what was sent, to whom, and when

---

## 3. Goals

- Staff can compose and edit an email template in a browser, no code required
- Sending goes through the bank's internal SMTP relay only — nothing leaves the bank's network to a third party
- Every send is logged for audit purposes (who sent what, to whom, when)
- Simple enough to deploy and maintain without a dedicated ops team
- High-density, refined developer/operator UX following the **Cenpact Design System** (`Dense but Breathable`, `Subtle Sophistication`, `Dark Mode Native`)

### Non-goals (v1)
- No marketing-style analytics (open/click tracking) — internal notices only
- No multi-tenant / multi-department permission system (single shared login is acceptable for v1; role-based access can be a v2 item)
- No scheduled/automated sends — this version is manually triggered by staff
- No support for attachments >10MB (Exchange relay limits typically apply)

---

## 4. Users & Roles

| Role | Description | Permissions |
|---|---|---|
| Staff / Sender | Office staff who need to send notices | Compose, edit, preview, send |
| Admin | IT / Ops administrator | Everything above + view full audit logs, manage SMTP configuration |

v1 assumes a small trusted user base (single office), so one shared or a handful of named logins via Better Auth is sufficient.

---

## 5. User Flows

### 5.1 Compose & Send
1. Staff logs in (Better Auth session)
2. Clicks **"New Email"**
3. Writes subject + body (rich text / markdown-lite editor with HTML preview)
4. Inserts merge fields (`{{first_name}}`, `{{account_ref}}`, `{{amount}}`, etc.)
5. Uploads a CSV of recipients (or selects a saved recipient list)
6. Previews the rendered email with real merge data for sample recipient rows
7. Clicks **Send** → confirmation modal shows recipient count → confirms
8. Backend sends via internal SMTP relay, respecting rate limits and batch sizes
9. Staff sees live send status (sent count, failed count, progress bar)

### 5.2 Edit Before Send
- Draft emails are editable and reusable as templates
- Edits to a draft don't affect already-sent emails (each send is an immutable snapshot)

### 5.3 Review History & Audit
- Staff/Admin can view a log: subject, recipient count, sender, timestamp, success/failure breakdown
- Detailed per-recipient audit logs with retry option for failed items

---

## 6. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| **F1** | User authentication (Better Auth session-based login) | **Must** |
| **F2** | Compose email: subject, body (HTML/plain text), merge fields support | **Must** |
| **F3** | Save draft / edit existing draft / template management | **Must** |
| **F4** | Upload recipient list via CSV (name, email, custom fields) | **Must** |
| **F5** | Validate CSV (malformed rows, invalid email formats, duplicate detection) | **Must** |
| **F6** | Preview rendered email with sample recipient data | **Must** |
| **F7** | Send via internal SMTP relay with per-recipient merge rendering | **Must** |
| **F8** | Rate-limit sending (configurable delay/batch size) to protect Exchange/SMTP server | **Must** |
| **F9** | Send log: sender, subject, recipient count, timestamp, per-recipient status | **Must** |
| **F10** | Retry failed sends individually or in batch | **Should** |
| **F11** | Reusable recipient lists (save a CSV as a named list in DB) | **Should** |
| **F12** | Basic role split (staff vs admin) | **Should** |
| **F13** | Attachment support (<10MB) | **Could** |
| **F14** | Scheduled sends | **Won't (v1)** |

---

## 7. Non-Functional & Security Requirements

- **Hosting & Privacy:** Runs entirely on the bank's internal network/server (on-prem or internal VM) — zero external SaaS or third-party email routing.
- **Mail Delivery:** Backend connects directly to the bank's internal SMTP/Exchange relay (port 587 authenticated TLS or port 25 trusted internal relay).
- **Security & PII Protection:**
  - Strict HTTPS with internal bank certificates
  - Passwords hashed using bcrypt / Argon2 via Better Auth; server-side session management
  - Recipient CSVs and email logs contain sensitive PII (names, emails, account refs) — stored solely in the bank's local PostgreSQL database
  - Input sanitization before rendering into HTML emails to prevent HTML/XSS injection via merge fields
- **Reliability:** A failed send to one recipient does not fail the batch; failures are captured with error messages and are individually retryable.
- **Auditability:** Every send snapshot and log is immutable once processed.
- **Design System:** Strictly built with the **Cenpact Design System** (`design.md`) for consistent dark/light themes, compact cards, high information density, and responsive layouts.

---

## 8. Technical Architecture

```
[Browser (Cenpact UI)]
       │
       ▼ (HTTPS)
[TanStack Start Server / React]
       ├─ Better Auth (Session Authentication)
       ├─ Template & Draft Engine
       ├─ CSV Parser & Validator
       ├─ Rate-Limited Send Queue Worker
       └─ Drizzle ORM ──▶ [PostgreSQL Database]
                                ├─ users & sessions
                                ├─ templates & drafts
                                ├─ recipient_lists & recipients
                                └─ sends & send_recipients
       │
       ▼ (Direct SMTP / TLS)
[New Dawn MFB Internal SMTP / Exchange Relay]
```

---

## 9. Data Model (Drizzle ORM Schema)

```typescript
// Authentication (Better Auth)
- user: id, name, email, role ('staff' | 'admin'), createdAt, updatedAt
- session: id, token, userId, ipAddress, userAgent, expiresAt, createdAt
- account: id, userId, providerId, accountId, password
- verification: id, identifier, value, expiresAt

// Email Templates & Drafts
- template: id, ownerId, title, subject, bodyHtml, bodyText, isDraft, createdAt, updatedAt

// Recipient Lists
- recipientList: id, name, ownerId, totalCount, createdAt, updatedAt
- recipient: id, listId, email, firstName, customFields (jsonb), createdAt

// Send Jobs & Audit Logs
- send: id, templateId, listId, senderId, subjectSnapshot, bodySnapshot, totalCount, successCount, failCount, status ('pending' | 'in_progress' | 'completed' | 'failed'), createdAt
- sendRecipient: id, sendId, recipientEmail, recipientName, status ('pending' | 'sent' | 'failed'), errorMessage, sentAt, retryCount
```

---

## 10. Success Metrics

- Staff can go from "need to send a notice" to "sent" in under 5 minutes without IT assistance.
- **0%** of email traffic leaves the bank's internal infrastructure to third-party APIs.
- **100%** of sent notices logged with immutable audit trails.
- Clear error visibility: zero silent delivery failures.
