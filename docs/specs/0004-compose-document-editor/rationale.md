# 0004 · rationale

## Context

The compose page today is a form: a title field, a subject field, an audience dropdown, a saved list dropdown, and a large plain textarea for the message. The engineering goal is a writing experience closer to Medium, so a staff member drafts a notice as a document rather than filling in fields. The current textarea stores `body` as a plain string, which cannot carry headings, lists, links, images, or structure of any kind.

Three forces shape the decision. First, the project already renders the authenticated shell with a sidebar and a set of feature folders under `apps/web`, so a new editor feature must slot into that structure and reuse the existing draft save path. Second, the draft body must be stored in a shape that round trips without loss, because an editor that loses formatting on re-open is worse than the form it replaces. Third, the backend is owned by the engineer, so the editor has to be designed as a frontend component with a crisp interface and a clearly named payload, and every backend touch has to be flagged rather than assumed.

> ⚠️ Premise note: the requested version one block set is larger than a first editor needs. Tables, code blocks, and video embeds add real sanitization work, and email clients render tables and code blocks unevenly, so the email flattening slice will be harder than it looks. The plan addresses this with a tracer bullet: a thin editor with headings and paragraphs wired to save ships first, and tables, code blocks, and embeds arrive as fast follow slices. If any of them slip, the earlier slices still deliver the Medium writing surface.

This is a frontend decision on the web workspace. The contract and API changes it implies are recorded here as dependencies the engineer owns, not as work this spec performs.

## Options considered

### Option 1: Tiptap (headless, on ProseMirror)

Tiptap is a headless rich text editor built on ProseMirror. It ships React bindings, a large extension catalogue (headings, lists, blockquote, link, image, horizontal rule, table, code block, placeholder, bubble menu, floating menu), and a structured JSON document model, with an HTML serializer for later email rendering.

**Pros**:
- Headless by design, so the toolbar and page look exactly as designed.
- Every version one block the engineer picked already exists as a maintained extension.
- ProseMirror's schema is the built in sanitizer for pasted content.
- A large community and stable docs, so operating it is a known quantity.
- The document model is collaboration ready later without a rewrite.

**Cons**:
- ProseMirror has a genuine learning curve.
- A sizable dependency, and its extension set is partly commercial (the free core covers version one).

### Option 2: Lexical (headless, Meta)

Lexical is Meta's headless editor, React first and used inside Facebook. It is fast and strongly accessible, with a clean plugin model.

**Pros**:
- Very good performance and accessibility defaults.
- First class React integration.

**Cons**:
- A smaller extension ecosystem, so lists, tables, and embeds mean more code written by hand.
- Fewer turnkey precedents for a Medium style block set compared with Tiptap.

### Option 3: Slate (headless, flexible)

Slate is a headless editor framework that hands almost total control of the model to the application.

**Pros**:
- Maximum flexibility in the document model and behavior.

**Cons**:
- The application assembles the schema and nearly every behavior.
- The API has shifted across releases, which is maintenance risk for a small team.

### Option 4: Custom `contenteditable`

No library, the editor is built directly on the browser's editable surface.

**Pros**:
- No dependency.

**Cons**:
- The team reimplements paste, selection, undo, and input method edge cases, which is weeks of work and a lasting maintenance burden.

## Rationale

Tiptap wins on the same reasoning the project already applies elsewhere: boring, proven technology over new and exciting. The requirement is a headless, Medium style editor, and Tiptap's core competence is exactly a headless editor with a full extension set. Every block the engineer chose exists today as an extension, so the build is assembly rather than invention, and ProseMirror's schema gives the pasted content sanitization for free, which directly serves the security criteria. Lexical and Slate are credible, but each leaves more of the block set for the team to build and maintain, and the engineer asked to build most of the backend, not most of the editor internals.

Storing the editor JSON rather than HTML follows from the same round trip requirement: JSON is the model and HTML is a projection, so saving the model keeps edits lossless whereas saving HTML invites lossy re-parsing. Cloudinary for images reuses keys the API env already carries, so no new provider enters the stack. Deferring email safe HTML to the send slice follows the project's tracer bullet approach and keeps this spec to one decision.

## References

**Project sources** (verifiable in this repo):
- `AGENTS.md`, the tracer bullet build approach and the rule that the Go API owns persistence.
- Spec `docs/specs/0003-audience-notifications.md`, the draft and audience flow this feature extends.
- `apps/web/AGENTS.md`, the feature folder layout and web conventions.
- `apps/web/src/lib/audience-client.ts`, the existing draft save path to be rewired.
- `apps/web/src/config/env.ts`, the Cloudinary keys already present.

**Practices & standards**:
- Headless editor, the separation of the document model from the presentation layer.
- Controlled form field component, a `value` and `onChange` contract the parent owns.
- Schema enforced sanitization of untrusted input for security.
- The strangler pattern and an expand then contract database migration sequence for the live change.

**Links** (web verified):
- Tiptap docs: https://tiptap.dev/docs
- ProseMirror: https://prosemirror.net/
