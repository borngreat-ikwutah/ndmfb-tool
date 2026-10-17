-- Delivery slice: approvals, sends, and per-recipient delivery reports.
-- Extends the draft lifecycle from draft-only to draft -> approved -> sending -> sent.

ALTER TABLE notification_draft DROP CONSTRAINT IF EXISTS notification_draft_status_check;
ALTER TABLE notification_draft
  ADD CONSTRAINT notification_draft_status_check
  CHECK (status IN ('draft', 'approved', 'sending', 'sent', 'failed'));

ALTER TABLE notification_draft
  ADD COLUMN IF NOT EXISTS approved_by TEXT REFERENCES "user" (id),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS notification_send (
  id TEXT PRIMARY KEY,
  draft_id TEXT NOT NULL REFERENCES notification_draft (id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  audience_type TEXT NOT NULL CHECK (audience_type IN ('staff', 'user')),
  list_id TEXT REFERENCES contact_list (id) ON DELETE SET NULL,
  owner_id TEXT NOT NULL REFERENCES "user" (id),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sending', 'sent', 'partial', 'failed')),
  total INTEGER NOT NULL DEFAULT 0 CHECK (total >= 0),
  sent_count INTEGER NOT NULL DEFAULT 0 CHECK (sent_count >= 0),
  failed_count INTEGER NOT NULL DEFAULT 0 CHECK (failed_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_delivery (
  send_id TEXT NOT NULL REFERENCES notification_send (id) ON DELETE CASCADE,
  contact_id TEXT NOT NULL REFERENCES contact (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (send_id, contact_id)
);

CREATE INDEX IF NOT EXISTS notification_send_owner_idx ON notification_send (owner_id);
CREATE INDEX IF NOT EXISTS notification_send_draft_idx ON notification_send (draft_id);
CREATE INDEX IF NOT EXISTS notification_delivery_send_idx ON notification_delivery (send_id);
