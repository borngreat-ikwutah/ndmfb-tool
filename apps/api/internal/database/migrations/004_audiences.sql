CREATE TABLE IF NOT EXISTS contact (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  audience_type TEXT NOT NULL CHECK (audience_type IN ('staff', 'user')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suppressed')),
  custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_list (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  audience_type TEXT NOT NULL CHECK (audience_type IN ('staff', 'user')),
  owner_id TEXT NOT NULL REFERENCES "user" (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (owner_id, name)
);

CREATE TABLE IF NOT EXISTS contact_list_member (
  list_id TEXT NOT NULL REFERENCES contact_list (id) ON DELETE CASCADE,
  contact_id TEXT NOT NULL REFERENCES contact (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (list_id, contact_id)
);

CREATE TABLE IF NOT EXISTS notification_draft (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  audience_type TEXT NOT NULL CHECK (audience_type IN ('staff', 'user')),
  list_id TEXT REFERENCES contact_list (id) ON DELETE SET NULL,
  owner_id TEXT NOT NULL REFERENCES "user" (id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status = 'draft'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contact_audience_type_idx ON contact (audience_type);
CREATE INDEX IF NOT EXISTS contact_list_member_contact_idx ON contact_list_member (contact_id);
CREATE INDEX IF NOT EXISTS notification_draft_owner_idx ON notification_draft (owner_id);
