package database

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/ndmfb/ndmfb-tool/apps/api/internal/models"
)

type ContactInput struct {
	ID           string
	Email        string
	Name         string
	AudienceType models.AudienceType
	CustomFields map[string]string
}

func (s *Store) UpsertContact(ctx context.Context, input ContactInput) (*models.Contact, bool, error) {
	customFields, err := json.Marshal(input.CustomFields)
	if err != nil {
		return nil, false, fmt.Errorf("encode contact fields: %w", err)
	}
	var contact models.Contact
	var created bool
	err = s.pool.QueryRow(ctx, `
		INSERT INTO contact (id, email, name, audience_type, custom_fields)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (email) DO UPDATE SET
			name = EXCLUDED.name,
			audience_type = EXCLUDED.audience_type,
			custom_fields = EXCLUDED.custom_fields,
			updated_at = NOW()
		RETURNING id, email, name, audience_type, status, custom_fields, created_at, updated_at, (xmax = 0)
	`, input.ID, input.Email, input.Name, input.AudienceType, customFields).Scan(
		&contact.ID, &contact.Email, &contact.Name, &contact.AudienceType, &contact.Status,
		&customFields, &contact.CreatedAt, &contact.UpdatedAt, &created,
	)
	if err != nil {
		return nil, false, fmt.Errorf("upsert contact: %w", err)
	}
	if err := json.Unmarshal(customFields, &contact.CustomFields); err != nil {
		return nil, false, fmt.Errorf("decode contact fields: %w", err)
	}
	return &contact, created, nil
}

func (s *Store) CreateContactList(ctx context.Context, id, name string, audienceType models.AudienceType, ownerID string) (*models.ContactList, error) {
	var list models.ContactList
	err := s.pool.QueryRow(ctx, `
		INSERT INTO contact_list (id, name, audience_type, owner_id)
		VALUES ($1, $2, $3, $4)
		RETURNING id, name, audience_type, created_at, updated_at
	`, id, name, audienceType, ownerID).Scan(
		&list.ID, &list.Name, &list.AudienceType, &list.CreatedAt, &list.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create contact list: %w", err)
	}
	return &list, nil
}

func (s *Store) AddContactToList(ctx context.Context, listID, contactID string) error {
	_, err := s.pool.Exec(ctx, `
		INSERT INTO contact_list_member (list_id, contact_id)
		VALUES ($1, $2)
		ON CONFLICT DO NOTHING
	`, listID, contactID)
	if err != nil {
		return fmt.Errorf("add contact to list: %w", err)
	}
	return nil
}

func (s *Store) ListContactLists(ctx context.Context, ownerID string) ([]models.ContactList, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT l.id, l.name, l.audience_type, COUNT(m.contact_id), l.created_at, l.updated_at
		FROM contact_list l
		LEFT JOIN contact_list_member m ON m.list_id = l.id
		WHERE l.owner_id = $1
		GROUP BY l.id
		ORDER BY l.updated_at DESC
	`, ownerID)
	if err != nil {
		return nil, fmt.Errorf("list contact lists: %w", err)
	}
	defer rows.Close()
	var lists []models.ContactList
	for rows.Next() {
		var list models.ContactList
		if err := rows.Scan(&list.ID, &list.Name, &list.AudienceType, &list.ContactCount, &list.CreatedAt, &list.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan contact list: %w", err)
		}
		lists = append(lists, list)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read contact lists: %w", err)
	}
	return lists, nil
}

func (s *Store) CreateNotificationDraft(ctx context.Context, draft models.NotificationDraft, ownerID string) (*models.NotificationDraft, error) {
	var result models.NotificationDraft
	err := s.pool.QueryRow(ctx, `
		INSERT INTO notification_draft (id, title, subject, body, audience_type, list_id, owner_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, title, subject, body, audience_type, list_id, status, approved_by, approved_at, created_at, updated_at
	`, draft.ID, draft.Title, draft.Subject, draft.Body, draft.AudienceType, draft.ListID, ownerID).Scan(
		&result.ID, &result.Title, &result.Subject, &result.Body, &result.AudienceType, &result.ListID,
		&result.Status, &result.ApprovedBy, &result.ApprovedAt, &result.CreatedAt, &result.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create notification draft: %w", err)
	}
	return &result, nil
}

func (s *Store) ListNotificationDrafts(ctx context.Context, ownerID string) ([]models.NotificationDraft, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, title, subject, body, audience_type, list_id, status, approved_by, approved_at, created_at, updated_at
		FROM notification_draft
		WHERE owner_id = $1
		ORDER BY updated_at DESC
	`, ownerID)
	if err != nil {
		return nil, fmt.Errorf("list notification drafts: %w", err)
	}
	defer rows.Close()
	var drafts []models.NotificationDraft
	for rows.Next() {
		var draft models.NotificationDraft
		if err := rows.Scan(&draft.ID, &draft.Title, &draft.Subject, &draft.Body, &draft.AudienceType, &draft.ListID, &draft.Status, &draft.ApprovedBy, &draft.ApprovedAt, &draft.CreatedAt, &draft.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan notification draft: %w", err)
		}
		drafts = append(drafts, draft)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read notification drafts: %w", err)
	}
	return drafts, nil
}

func (s *Store) GetNotificationDraft(ctx context.Context, id, ownerID string) (*models.NotificationDraft, error) {
	var draft models.NotificationDraft
	err := s.pool.QueryRow(ctx, `
		SELECT id, title, subject, body, audience_type, list_id, status, approved_by, approved_at, created_at, updated_at
		FROM notification_draft
		WHERE id = $1 AND owner_id = $2
	`, id, ownerID).Scan(
		&draft.ID, &draft.Title, &draft.Subject, &draft.Body, &draft.AudienceType, &draft.ListID,
		&draft.Status, &draft.ApprovedBy, &draft.ApprovedAt, &draft.CreatedAt, &draft.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("get notification draft: %w", err)
	}
	return &draft, nil
}

func (s *Store) ApproveNotificationDraft(ctx context.Context, id, ownerID, approverID string) (*models.NotificationDraft, error) {
	var draft models.NotificationDraft
	err := s.pool.QueryRow(ctx, `
		UPDATE notification_draft
		SET status = 'approved', approved_by = $3, approved_at = NOW(), updated_at = NOW()
		WHERE id = $1 AND owner_id = $2 AND status = 'draft'
		RETURNING id, title, subject, body, audience_type, list_id, status, approved_by, approved_at, created_at, updated_at
	`, id, ownerID, approverID).Scan(
		&draft.ID, &draft.Title, &draft.Subject, &draft.Body, &draft.AudienceType, &draft.ListID,
		&draft.Status, &draft.ApprovedBy, &draft.ApprovedAt, &draft.CreatedAt, &draft.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("approve notification draft: %w", err)
	}
	return &draft, nil
}

func (s *Store) UpdateDraftStatus(ctx context.Context, id, status string) error {
	_, err := s.pool.Exec(ctx, `
		UPDATE notification_draft SET status = $2, updated_at = NOW() WHERE id = $1
	`, id, status)
	if err != nil {
		return fmt.Errorf("update draft status: %w", err)
	}
	return nil
}
