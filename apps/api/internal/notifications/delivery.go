package notifications

import (
	"context"
	"net/http"
	"time"

	"github.com/ndmfb/ndmfb-tool/apps/api/internal/models"
)

// ApproveDraft moves a draft to approved. Only drafts can be approved.
func (c *Controller) ApproveDraft(w http.ResponseWriter, r *http.Request) {
	ownerID, err := c.userID(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	if !c.requireStore(w) {
		return
	}
	draftID := r.PathValue("id")
	if draftID == "" {
		writeError(w, http.StatusBadRequest, "draft id is required")
		return
	}
	draft, err := c.store.ApproveNotificationDraft(r.Context(), draftID, ownerID, ownerID)
	if err != nil {
		writeError(w, http.StatusConflict, "only drafts can be approved")
		return
	}
	writeJSON(w, http.StatusOK, draft)
}

// StartSend snapshots an approved draft, resolves recipients, and sends
// email in the background while progress is tracked in notification_send.
func (c *Controller) StartSend(w http.ResponseWriter, r *http.Request) {
	ownerID, err := c.userID(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	if !c.requireStore(w) {
		return
	}
	draftID := r.PathValue("id")
	if draftID == "" {
		writeError(w, http.StatusBadRequest, "draft id is required")
		return
	}
	draft, err := c.store.GetNotificationDraft(r.Context(), draftID, ownerID)
	if err != nil {
		writeError(w, http.StatusNotFound, "draft not found")
		return
	}
	if draft.Status != "approved" {
		writeError(w, http.StatusConflict, "only approved drafts can be sent")
		return
	}
	recipients, err := c.store.ResolveRecipients(r.Context(), ownerID, draft.AudienceType, draft.ListID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if len(recipients) == 0 {
		writeError(w, http.StatusConflict, "no active recipients for this draft")
		return
	}
	send := models.NotificationSend{
		ID:           newID(),
		DraftID:      draft.ID,
		Subject:      draft.Subject,
		Body:         draft.Body,
		AudienceType: draft.AudienceType,
		ListID:       draft.ListID,
		OwnerID:      ownerID,
		Status:       "queued",
		Total:        len(recipients),
	}
	created, err := c.store.CreateSend(r.Context(), send)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err := c.store.UpdateDraftStatus(r.Context(), draft.ID, "sending"); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	go c.deliver(created.ID, draft.ID, created.Subject, created.Body, recipients)
	writeJSON(w, http.StatusAccepted, created)
}

func (c *Controller) deliver(sendID, draftID, subject, body string, recipients []models.Contact) {
	ctx := context.Background()
	mailer := c.mailer
	if mailer == nil {
		mailer = NewMailerFromEnv()
	}
	sent, failed := 0, 0
	finalize := func(status string) {
		_ = c.store.UpdateSendProgress(ctx, sendID, status, sent, failed)
		_ = c.store.UpdateDraftStatus(ctx, draftID, draftStatusForSend(status))
	}
	_ = c.store.UpdateSendProgress(ctx, sendID, "sending", 0, 0)
	for _, recipient := range recipients {
		deliveryErr := mailer.Send(MailMessage{
			To:      recipient.Email,
			ToName:  recipient.Name,
			Subject: subject,
			Body:    body,
		})
		delivery := models.NotificationDelivery{
			SendID:    sendID,
			ContactID: recipient.ID,
			Email:     recipient.Email,
		}
		if deliveryErr != nil {
			message := deliveryErr.Error()
			delivery.Status = "failed"
			delivery.Error = &message
			failed++
		} else {
			now := time.Now()
			delivery.Status = "sent"
			delivery.SentAt = &now
			sent++
		}
		_ = c.store.RecordDelivery(ctx, delivery)
		_ = c.store.UpdateSendProgress(ctx, sendID, "sending", sent, failed)
	}
	switch {
	case failed == 0:
		finalize("sent")
	case sent == 0:
		finalize("failed")
	default:
		finalize("partial")
	}
}

func draftStatusForSend(sendStatus string) string {
	switch sendStatus {
	case "sent", "partial":
		return "sent"
	case "failed":
		return "failed"
	default:
		return "sending"
	}
}

// ListSends returns send progress for the owner.
func (c *Controller) ListSends(w http.ResponseWriter, r *http.Request) {
	ownerID, err := c.userID(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	if !c.requireStore(w) {
		return
	}
	sends, err := c.store.ListSends(r.Context(), ownerID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, sends)
}

// GetSend returns one send with its per-recipient delivery report.
func (c *Controller) GetSend(w http.ResponseWriter, r *http.Request) {
	ownerID, err := c.userID(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	if !c.requireStore(w) {
		return
	}
	sendID := r.PathValue("id")
	if sendID == "" {
		writeError(w, http.StatusBadRequest, "send id is required")
		return
	}
	send, err := c.store.GetSend(r.Context(), sendID, ownerID)
	if err != nil {
		writeError(w, http.StatusNotFound, "send not found")
		return
	}
	deliveries, err := c.store.ListDeliveries(r.Context(), sendID, ownerID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"send": send, "deliveries": deliveries})
}
