# 0004. Compose document editor

**Date**: 2026-10-17
**Status**: Proposed

## Summary

The compose page stops being a form and becomes one calm, Medium style writing surface built on Tiptap (an open source, headless rich text editor). A draft body is now stored as the editor's structured JSON document instead of a plain string, so a saved notice re-opens exactly as it was written. The web workspace delivers the editor as a form field component, while the shared contract and the server endpoints stay with the engineer.

## Requirements

**User stories**:
- As a New Dawn staff member composing a notice, I want to write and format a rich document on one surface so the message reads well and I am not fighting a form.
- As a staff member, I want my formatted document saved and re-opened exactly as I wrote it.
- As a staff member, I want to include images, links, tables, and a video embed so a notice is complete.
- As the engineer, I want the editor exposed as a form field component with a clear interface so I can wire it to the backend I own.

**Acceptance criteria** (the contract, each independently checkable):
- **AC-1**: The authenticated compose page presents one writing surface where a user can type and format a document (headings, paragraphs, lists, blockquote, inline links) and save it as a draft.
- **AC-2**: Saving a draft persists the document as structured editor JSON, and re-opening that draft restores the document with no content or formatting loss.
- **AC-3**: The editor supports the version one block set: headings, paragraphs, bulleted and numbered lists, blockquote, inline links, images, horizontal divider, code block, table, and video embeds by URL.
- **AC-4**: Link, image, and embed URLs are validated: only `http` and `https` are accepted, and `javascript:` or other schemes are rejected with a visible message.
- **AC-5**: An inserted image uploads to Cloudinary and the document stores the returned hosted URL, never an inline data URL.
- **AC-6**: Pasted or dropped rich content is sanitized to the editor schema, meaning unsupported nodes and marks are dropped and script or event handler attributes are removed.
- **AC-7**: The editor exposes its value as a form field, a `value` and `onChange` contract, so a parent form can read and set the document, and it is keyboard accessible with a reachable, labeled toolbar.
- **AC-8**: When the API cannot be reached, saving shows the API not reachable message and the in-progress document stays in the editor.
- **AC-9**: The editor sends and receives the document through the shared contract type, and the web workspace adds no database driver and no direct database access.
- **AC-10**: A draft document is readable and writable only by its owner, and a request from another user receives not found (this criterion is verified on the API side).
- **AC-11**: A document that contains only empty paragraphs is treated as empty, save is blocked, and the user sees a visible required message.
- **AC-12**: Opening an existing draft shows a loading state and restores the document, and saving keeps the document and the draft id in place instead of clearing the page.
- **AC-13**: When a paste drops unsupported content, a non blocking notice tells the user that some formatting was stripped.
- **AC-14**: Re-saving after a timeout does not create a duplicate draft.

## Decision

**Chosen option**: Option 1: Tiptap, delivered as a headless form field component.

The compose page becomes a Tiptap powered writing surface, exported from the web editor feature folder as a form field component, and the draft body is stored as the editor's JSON document.

## Feature design

**Data model sketch** (the contract change is owned by the engineer):

- `NotificationDraft` (existing, extended): `id`, `title`, `subject`, `body`, `audienceType`, `listId`, `status`, `ownerId`, `createdAt`, `updatedAt`.
- `body` changes type from a plain string to `DocumentContent` in `packages/contract`.
- `DocumentContent` is declared concretely as a recursive document:

```ts
type DocumentContent = { type: "doc"; content?: DocumentNode[] };
type DocumentNode = {
  type:
    | "paragraph" | "heading" | "bulletList" | "orderedList" | "listItem"
    | "blockquote" | "codeBlock" | "horizontalRule" | "image"
    | "table" | "tableRow" | "tableCell" | "tableHeader" | "embed" | "text";
  attrs?: Record<string, unknown>;
  content?: DocumentNode[];
  text?: string;
  marks?: DocumentMark[];
};
type DocumentMark = {
  type: "bold" | "italic" | "code" | "link";
  attrs?: Record<string, unknown>;
};
```

- Node types in version one: `doc`, `paragraph`, `heading` (levels 1 to 3), `text`, `bulletList`, `orderedList`, `listItem`, `blockquote`, `codeBlock`, `horizontalRule`, `image`, `table`, `tableRow`, `tableCell`, `tableHeader`, `embed`.
- Marks in version one: `bold`, `italic`, `code`, `link` with `href`.
- `image` attributes: `src` (hosted URL, required), `alt`, `title`.
- `embed` attributes: `provider` (`youtube` or generic `video`), `src` (the embed URL), `videoId`.
- `CreateNotificationDraftRequest.body` and the drafts responses carry `DocumentContent`. POST create returns the full `NotificationDraft`, and GET single draft returns `NotificationDraft` with `body: DocumentContent`.
- A draft is opened through a `draftId` route param on the compose route (`/compose?draftId=<id>`), which threads the id into the load. The `Drafts & templates` sidebar surface is the list entry point.

**State transitions**: unchanged. The editor does not add draft states; it only changes the shape of `body`.

**API surface** (outline, the engineer owns the backend):

| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| /api/notifications/drafts | POST | title, subject, body (document), audienceType, listId, idempotency key | the full NotificationDraft | session | 400 invalid body, 401 |
| /api/notifications/drafts/{id} | GET | id | NotificationDraft with body: DocumentContent | session, owner | 404 |
| /api/uploads | POST | file (multipart, image only, max 5 MB) | hosted URL, public id | session | 400 unsupported type, 413 too large |

The GET single draft endpoint and the upload endpoint are the two additions the editor depends on. POST create returns the full draft so the page can capture the new id. The create request carries an idempotency key so a retry after a timeout does not create a duplicate. The API re-validates URLs and the document size on save.

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Open a draft | the draft id | the `draftId` route param on the compose route |
| Load a draft into the editor | the document JSON | the GET draft response `body` field |
| Save a draft | the document JSON | the editor's `onChange` value |
| Detect an empty document | whether every text node is empty | derived from the document JSON |
| Enforce the size limit | the serialized document size | derived from the document JSON, compared to the 100 KB limit |
| Ensure no duplicate on retry | the idempotency key | generated once per save attempt |
| Render an image | hosted image URL | the `/api/uploads` response after the Cloudinary upload |
| Render a video embed | embed URL and provider | the typed URL, parsed by the agreed patterns |
| Validate a link or src | accepted scheme | derived from the typed URL |
| Show a save failure | the not reachable message | the shared unreachable detection in `~/lib/api-client`, reached from the save path |

**Key invariants**:
- A saved document always has a valid `doc` root node.
- A document of only empty paragraphs is invalid on save.
- Every `link` mark and every `image` src uses an `http` or `https` URL.
- An `image` src is a hosted URL, never a data URL.
- Only the draft owner can read or write a draft.
- A serialized document above 100 KB is rejected before save, and again on receipt by the API.
- An uploaded file is an image (png, jpeg, webp, gif) of at most 5 MB.
- During the migration, the document column wins; the string column is read only when the document column is null.

**Security model**: Drafts stay private to their owner. The editor treats all pasted and dropped content as hostile and sanitizes it to the schema; dangerous hrefs (`javascript:`, `data:`) are dropped silently on paste, and the visible validation message appears only on manual entry. The API re-validates URLs and the document size on save. Uploads are limited to images of at most 5 MB. The web workspace never connects to the database.

**Configuration required**:
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: already present in the API env, used by the upload endpoint.
- Upload limit: images only (png, jpeg, webp, gif), 5 MB maximum, mirrored client side.
- Document limit: 100 KB serialized, enforced client side and server side.

**Critical test scenarios** (each maps to an acceptance criterion):
- Happy path: a user writes a heading, a paragraph, a list, and a link, saves, re-opens, and the document is identical, verifies **AC-1**, **AC-2**.
- Blocks: every version one block can be inserted, edited, and re-opened without loss, verifies **AC-3**.
- Failure case: pasting HTML that contains a script tag and an unsupported node keeps the readable text and drops the rest, verifies **AC-6**.
- Failure case: saving while the API is unreachable shows the message and keeps the document in the editor, verifies **AC-8**.
- Security: a `javascript:` link and a data URL image are rejected, verifies **AC-4**, **AC-5**.
- Interface: a parent form reads and sets the document through `value` and `onChange`, verifies **AC-7**.
- Empty: a document of only empty paragraphs blocks save with the required message, verifies **AC-11**.
- Re-open: a saved draft reloads through the draft id with a loading state and keeps the id after save, verifies **AC-12**.
- Paste: pasting content with unsupported formatting keeps the text and shows the stripped notice, verifies **AC-13**.
- Retry: re-saving after a timeout does not create a second draft, verifies **AC-14**.
- Auth: loading another user's draft returns not found, verifies **AC-10**.

## Build plan

Sliced as a tracer bullet: a thin end to end thread to a saved rich draft first, then the block set layered on. Each slice is independently verifiable.

1. Slice 1, the thin thread: install Tiptap, build the minimal editor (paragraph, heading, text), wrap it as a form field with `value` and `onChange` plus the full props interface, render it as the compose page, and give it a manual Save that posts the document JSON through the shared unreachable detection. Add the `draftId` route param, the loading state, the empty state, the empty document rule, the size limit, and the idempotency key. Wire the shared contract type for `body`. Backend dependency: the contract change plus the drafts endpoints accepting a document `body`, owned by the engineer. satisfies **AC-1**, **AC-2**, **AC-7**, **AC-8**, **AC-9**, **AC-11**, **AC-12**, **AC-14**.
2. Slice 2: add bulleted and ordered lists, blockquote, and inline links with URL validation and inline messages, plus the bubble toolbar. satisfies **AC-3**, **AC-4**.
3. Slice 3: add images with the uploading and error states, uploading through `/api/uploads` to Cloudinary and storing the hosted URL, with a best effort delete on save failure. satisfies **AC-3**, **AC-5**.
4. Slice 4: add the horizontal divider, code block, and table. satisfies **AC-3**.
5. Slice 5: add video embeds by URL (YouTube and generic video) with the parsing rules and an invalid URL message. satisfies **AC-3**, **AC-4**.
6. Slice 6: harden paste and drop sanitization with the stripped notice, and finish the keyboard accessible toolbar and labels. satisfies **AC-6**, **AC-13**.
7. Engineer owned: change `NotificationDraft.body` to the document type in `packages/contract` and the Go model, add the GET draft endpoint and the upload endpoint, re-validate URLs and size on save, and run the data migration with the document column winning (see Migration plan). satisfies **AC-2**, **AC-9**, **AC-10**.

## Consequences

**Positive**:
- One calm surface replaces a form, which is the point of the change.
- Lossless document storage means re-editing is faithful.
- Deferring email rendering keeps this slice contained.
- The Tiptap and ProseMirror ecosystem covers later needs such as collaboration and comments without a rewrite.

**Negative / tradeoffs**:
- The `body` type change ripples into `packages/contract`, the Go model, and every existing draft.
- Tiptap and ProseMirror add a sizable dependency and a real learning curve.
- Email safe HTML flattening is now a required future slice, and rich content makes it harder.
- The larger version one block set (tables, code blocks, embeds) raises sanitization and email compatibility risk.
- Upload failures can orphan a Cloudinary image; a best effort delete is the chosen mitigation.
- The 100 KB document limit and the 5 MB image limit are product constraints real writers may hit.

**Neutral**:
- A new feature folder `src/features/editor` appears under `apps/web`.
- A new upload endpoint and Cloudinary usage enter the API.
- The compose route gains a `draftId` query param, and the `Drafts & templates` surface becomes the entry point to re-open a draft.
- Existing drafts must be migrated to the document shape.

## Migration plan

**Strategy**: feature flagged, with a safe data migration for `body` (the migration is owned by the engineer).

**Phases**:
1. Add a nullable document column for `body` (for example `body_document`), leaving the old string column in place.
2. Deploy the API writing both shapes, and the web app reading the document column first and falling back to the old string only when the document column is null (the document column always wins).
3. Backfill existing drafts: wrap an existing plain text body into a single paragraph document.
4. Add the not null constraint and retire the old string column.
5. Turn on the editor as the compose surface for all users.

**Rollback**: keep the old string column until the backfill is proven, so reverting the web app returns to the old compose form and the string body.

**Risks**: the backfill loses formatting that the plain string never had (acceptable, it was plain text); a draft saved only in the new shape is unreadable by the old form after a rollback; a failed save can leave an orphaned Cloudinary image, mitigated by a best effort delete.

## Follow-up

- [ ] Contract change `NotificationDraft.body` from string to document, the GET draft endpoint, and the upload endpoint are owned by the engineer and must land with slice 1.
- [ ] Email safe HTML flattening is deferred to the send slice; the editor HTML is not directly sendable.
- [ ] Related spec 0003 (audience notifications) assumed a string `body`; reconcile it when the contract changes.
- [ ] Enroll `Drafts & templates` as the drafts list surface, since opening a draft through the `draftId` route param needs an entry point.
- [ ] Consider a `verify.md` for the editor interactions if this feature is built at Beta or higher depth.

## Rationale

Reasoning, options considered, and sources: see [rationale.md](rationale.md).
