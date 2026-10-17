package database

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/ndmfb/ndmfb-tool/apps/api/internal/models"
)

// ResolveRecipients returns active contacts for a send target.
// A saved list scopes the audience; otherwise every active contact
// of the draft audience type is included.
func (s *Store) ResolveRecipients(ctx context.Context, ownerID string, audienceType models.AudienceType, listID *string) ([]models.Contact, error) {
	if listID != nil && *listID != "" {
		return s.recipientsForList(ctx, ownerID, *listID)
	}
	return s.recipientsForAudience(ctx, audienceType)
}

func (s *Store) recipientsForAudience(ctx context.Context, audienceType models.AudienceType) ([]models.Contact, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, email, name, audience_type, status, custom_fields, created_at, updated_at
		FROM contact
		WHERE audience_type = $1 AND status = 'active'
		ORDER BY email ASC
	`, audienceType)
	if err != nil {
		return nil, fmt.Errorf("resolve audience recipients: %w", err)
	}
	defer rows.Close()
	return scanContacts(rows)
}

func (s *Store) recipientsForList(ctx context.Context, ownerID, listID string) ([]models.Contact, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT c.id, c.email, c.name, c.audience_type, c.status, c.custom_fields, c.created_at, c.updated_at
		FROM contact c
		JOIN contact_list_member m ON m.contact_id = c.id
		JOIN contact_list l ON l.id = m.list_id AND l.owner_id = $2
		WHERE m.list_id = $1 AND c.status = 'active'
		ORDER BY c.email ASC
	`, listID, ownerID)
	if err != nil {
		return nil, fmt.Errorf("resolve list recipients: %w", err)
	}
	defer rows.Close()
	return scanContacts(rows)
}

func scanContacts(rows pgx.Rows) ([]models.Contact, error) {
	var contacts []models.Contact
	for rows.Next() {
		var contact models.Contact
		var customFields []byte
		if err := rows.Scan(
			&contact.ID, &contact.Email, &contact.Name, &contact.AudienceType,
			&contact.Status, &customFields, &contact.CreatedAt, &contact.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan contact: %w", err)
		}
		contact.CustomFields = decodeCustomFields(customFields)
		contacts = append(contacts, contact)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read contacts: %w", err)
	}
	return contacts, nil
}

func decodeCustomFields(raw []byte) map[string]string {
	fields := make(map[string]string)
	if len(raw) == 0 {
		return fields
	}
	_ = json.Unmarshal(raw, &fields)
	if fields == nil {
		return make(map[string]string)
	}
	return fields
}

func (s *Store) CreateSend(ctx context.Context, send models.NotificationSend) (*models.NotificationSend, error) {
	var result models.NotificationSend
	err := s.pool.QueryRow(ctx, `
		INSERT INTO notification_send (id, draft_id, subject, body, audience_type, list_id, owner_id, status, total, sent_count, failed_count)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, draft_id, subject, body, audience_type, list_id, owner_id, status, total, sent_count, failed_count, created_at, updated_at
	`, send.ID, send.DraftID, send.Subject, send.Body, send.AudienceType, send.ListID, send.OwnerID, send.Status, send.Total, send.SentCount, send.FailedCount).Scan(
		&result.ID, &result.DraftID, &result.Subject, &result.Body, &result.AudienceType, &result.ListID,
		&result.OwnerID, &result.Status, &result.Total, &result.SentCount, &result.FailedCount,
		&result.CreatedAt, &result.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create notification send: %w", err)
	}
	return &result, nil
}

func (s *Store) UpdateSendProgress(ctx context.Context, id, status string, sentCount, failedCount int) error {
	_, err := s.pool.Exec(ctx, `
		UPDATE notification_send
		SET status = $2, sent_count = $3, failed_count = $4, updated_at = NOW()
		WHERE id = $1
	`, id, status, sentCount, failedCount)
	if err != nil {
		return fmt.Errorf("update send progress: %w", err)
	}
	return nil
}

func (s *Store) RecordDelivery(ctx context.Context, delivery models.NotificationDelivery) error {
	var errText *string
	if delivery.Error != nil && *delivery.Error != "" {
		errText = delivery.Error
	}
	_, err := s.pool.Exec(ctx, `
		INSERT INTO notification_delivery (send_id, contact_id, email, status, error, sent_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (send_id, contact_id) DO UPDATE SET
			status = EXCLUDED.status,
			error = EXCLUDED.error,
			sent_at = EXCLUDED.sent_at
	`, delivery.SendID, delivery.ContactID, delivery.Email, delivery.Status, errText, delivery.SentAt)
	if err != nil {
		return fmt.Errorf("record delivery: %w", err)
	}
	return nil
}

func (s *Store) GetSend(ctx context.Context, id, ownerID string) (*models.NotificationSend, error) {
	var send models.NotificationSend
	err := s.pool.QueryRow(ctx, `
		SELECT id, draft_id, subject, body, audience_type, list_id, owner_id, status, total, sent_count, failed_count, created_at, updated_at
		FROM notification_send
		WHERE id = $1 AND owner_id = $2
	`, id, ownerID).Scan(
		&send.ID, &send.DraftID, &send.Subject, &send.Body, &send.AudienceType, &send.ListID,
		&send.OwnerID, &send.Status, &send.Total, &send.SentCount, &send.FailedCount,
		&send.CreatedAt, &send.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("get notification send: %w", err)
	}
	return &send, nil
}

func (s *Store) ListSends(ctx context.Context, ownerID string) ([]models.NotificationSend, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, draft_id, subject, body, audience_type, list_id, owner_id, status, total, sent_count, failed_count, created_at, updated_at
		FROM notification_send
		WHERE owner_id = $1
		ORDER BY updated_at DESC
	`, ownerID)
	if err != nil {
		return nil, fmt.Errorf("list notification sends: %w", err)
	}
	defer rows.Close()
	var sends []models.NotificationSend
	for rows.Next() {
		var send models.NotificationSend
		if err := rows.Scan(
			&send.ID, &send.DraftID, &send.Subject, &send.Body, &send.AudienceType, &send.ListID,
			&send.OwnerID, &send.Status, &send.Total, &send.SentCount, &send.FailedCount,
			&send.CreatedAt, &send.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan notification send: %w", err)
		}
		sends = append(sends, send)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read notification sends: %w", err)
	}
	return sends, nil
}

func (s *Store) ListDeliveries(ctx context.Context, sendID, ownerID string) ([]models.NotificationDelivery, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT d.send_id, d.contact_id, d.email, d.status, d.error, d.sent_at, d.created_at
		FROM notification_delivery d
		JOIN notification_send s ON s.id = d.send_id AND s.owner_id = $2
		WHERE d.send_id = $1
		ORDER BY d.email ASC
	`, sendID, ownerID)
	if err != nil {
		return nil, fmt.Errorf("list notification deliveries: %w", err)
	}
	defer rows.Close()
	var deliveries []models.NotificationDelivery
	for rows.Next() {
		var delivery models.NotificationDelivery
		if err := rows.Scan(
			&delivery.SendID, &delivery.ContactID, &delivery.Email, &delivery.Status,
			&delivery.Error, &delivery.SentAt, &delivery.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan notification delivery: %w", err)
		}
		deliveries = append(deliveries, delivery)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read notification deliveries: %w", err)
	}
	return deliveries, nil
}
