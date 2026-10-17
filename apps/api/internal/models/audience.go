package models

import "time"

type AudienceType string

const (
	AudienceStaff AudienceType = "staff"
	AudienceUser  AudienceType = "user"
)

type Contact struct {
	ID           string            `json:"id"`
	Email        string            `json:"email"`
	Name         string            `json:"name"`
	AudienceType AudienceType      `json:"audienceType"`
	Status       string            `json:"status"`
	CustomFields map[string]string `json:"customFields"`
	CreatedAt    time.Time         `json:"createdAt"`
	UpdatedAt    time.Time         `json:"updatedAt"`
}

type ContactList struct {
	ID           string       `json:"id"`
	Name         string       `json:"name"`
	AudienceType AudienceType `json:"audienceType"`
	ContactCount int          `json:"contactCount"`
	CreatedAt    time.Time    `json:"createdAt"`
	UpdatedAt    time.Time    `json:"updatedAt"`
}

// Draft lifecycle: draft -> approved -> sending -> sent | failed.
// Approval is required before a send can start.
type NotificationDraft struct {
	ID           string       `json:"id"`
	Title        string       `json:"title"`
	Subject      string       `json:"subject"`
	Body         string       `json:"body"`
	AudienceType AudienceType `json:"audienceType"`
	ListID       *string      `json:"listId,omitempty"`
	Status       string       `json:"status"`
	ApprovedBy   *string      `json:"approvedBy,omitempty"`
	ApprovedAt   *time.Time   `json:"approvedAt,omitempty"`
	CreatedAt    time.Time    `json:"createdAt"`
	UpdatedAt    time.Time    `json:"updatedAt"`
}

// Send lifecycle: queued -> sending -> sent | partial | failed.
type NotificationSend struct {
	ID           string       `json:"id"`
	DraftID      string       `json:"draftId"`
	Subject      string       `json:"subject"`
	Body         string       `json:"body"`
	AudienceType AudienceType `json:"audienceType"`
	ListID       *string      `json:"listId,omitempty"`
	OwnerID      string       `json:"ownerId"`
	Status       string       `json:"status"`
	Total        int          `json:"total"`
	SentCount    int          `json:"sentCount"`
	FailedCount  int          `json:"failedCount"`
	CreatedAt    time.Time    `json:"createdAt"`
	UpdatedAt    time.Time    `json:"updatedAt"`
}

type NotificationDelivery struct {
	SendID    string     `json:"sendId"`
	ContactID string     `json:"contactId"`
	Email     string     `json:"email"`
	Status    string     `json:"status"`
	Error     *string    `json:"error,omitempty"`
	SentAt    *time.Time `json:"sentAt,omitempty"`
	CreatedAt time.Time  `json:"createdAt"`
}

type ContactImportReport struct {
	AudienceType AudienceType  `json:"audienceType"`
	List         *ContactList  `json:"list,omitempty"`
	TotalRows    int           `json:"totalRows"`
	Imported     int           `json:"imported"`
	Updated      int           `json:"updated"`
	Duplicates   int           `json:"duplicates"`
	Rejected     int           `json:"rejected"`
	Errors       []ImportError `json:"errors"`
}

type ImportError struct {
	Row     int    `json:"row"`
	Message string `json:"message"`
}
