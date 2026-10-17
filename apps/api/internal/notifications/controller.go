package notifications

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/csv"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/mail"
	"strings"

	"github.com/ndmfb/ndmfb-tool/apps/api/internal/auth"
	"github.com/ndmfb/ndmfb-tool/apps/api/internal/database"
	"github.com/ndmfb/ndmfb-tool/apps/api/internal/models"
)

type Controller struct {
	store       *database.Store
	authService *auth.Service
	mailer      *Mailer
}

func NewController(store *database.Store, authService *auth.Service) *Controller {
	return &Controller{store: store, authService: authService, mailer: NewMailerFromEnv()}
}

// NewControllerWithMailer allows tests to inject a fake mailer.
func NewControllerWithMailer(store *database.Store, authService *auth.Service, mailer *Mailer) *Controller {
	return &Controller{store: store, authService: authService, mailer: mailer}
}

func (c *Controller) ImportContacts(w http.ResponseWriter, r *http.Request) {
	ownerID, err := c.userID(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	if !c.requireStore(w) {
		return
	}
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		writeError(w, http.StatusBadRequest, "could not read import form")
		return
	}
	audienceType := models.AudienceType(strings.TrimSpace(r.FormValue("audienceType")))
	if !validAudienceType(audienceType) {
		writeError(w, http.StatusBadRequest, "audienceType must be staff or user")
		return
	}
	file, _, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "CSV file is required")
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	reader.FieldsPerRecord = -1
	headers, err := reader.Read()
	if err != nil {
		writeError(w, http.StatusBadRequest, "CSV must include a header row")
		return
	}
	headerIndex := make(map[string]int, len(headers))
	for index, header := range headers {
		headerIndex[strings.ToLower(strings.TrimSpace(header))] = index
	}
	emailIndex, ok := headerIndex["email"]
	if !ok {
		writeError(w, http.StatusBadRequest, "CSV must include an email column")
		return
	}

	var list *models.ContactList
	listName := strings.TrimSpace(r.FormValue("listName"))
	if listName != "" {
		list, err = c.store.CreateContactList(r.Context(), newID(), listName, audienceType, ownerID)
		if err != nil {
			writeError(w, http.StatusConflict, "could not create contact list")
			return
		}
	}

	report := models.ContactImportReport{AudienceType: audienceType, List: list, Errors: []models.ImportError{}}
	seen := make(map[string]struct{})
	rowNumber := 1
	for {
		row, readErr := reader.Read()
		if errors.Is(readErr, io.EOF) {
			break
		}
		rowNumber++
		report.TotalRows++
		if readErr != nil {
			report.Rejected++
			report.Errors = append(report.Errors, models.ImportError{Row: rowNumber, Message: "could not read row"})
			continue
		}
		if emailIndex >= len(row) {
			report.Rejected++
			report.Errors = append(report.Errors, models.ImportError{Row: rowNumber, Message: "email is missing"})
			continue
		}
		email := strings.ToLower(strings.TrimSpace(row[emailIndex]))
		address, addressErr := mail.ParseAddress(email)
		if addressErr != nil || address.Address != email {
			report.Rejected++
			report.Errors = append(report.Errors, models.ImportError{Row: rowNumber, Message: "email is invalid"})
			continue
		}
		if _, exists := seen[email]; exists {
			report.Duplicates++
			continue
		}
		seen[email] = struct{}{}

		name := csvValue(row, headerIndex, "name")
		if name == "" {
			name = strings.TrimSpace(strings.Join([]string{csvValue(row, headerIndex, "first_name"), csvValue(row, headerIndex, "last_name")}, " "))
		}
		customFields := make(map[string]string)
		for key, index := range headerIndex {
			if key == "email" || key == "name" || key == "first_name" || key == "last_name" || index >= len(row) {
				continue
			}
			customFields[key] = strings.TrimSpace(row[index])
		}
		contact, created, upsertErr := c.store.UpsertContact(r.Context(), database.ContactInput{
			ID:           newID(),
			Email:        email,
			Name:         name,
			AudienceType: audienceType,
			CustomFields: customFields,
		})
		if upsertErr != nil {
			report.Rejected++
			report.Errors = append(report.Errors, models.ImportError{Row: rowNumber, Message: "could not save contact"})
			continue
		}
		if list != nil {
			if err := c.store.AddContactToList(r.Context(), list.ID, contact.ID); err != nil {
				report.Rejected++
				report.Errors = append(report.Errors, models.ImportError{Row: rowNumber, Message: "could not add contact to list"})
				continue
			}
		}
		if created {
			report.Imported++
		} else {
			report.Updated++
		}
	}
	writeJSON(w, http.StatusCreated, report)
}

func (c *Controller) CreateList(w http.ResponseWriter, r *http.Request) {
	ownerID, err := c.userID(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	if !c.requireStore(w) {
		return
	}
	var input struct {
		Name         string              `json:"name"`
		AudienceType models.AudienceType `json:"audienceType"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil || strings.TrimSpace(input.Name) == "" || !validAudienceType(input.AudienceType) {
		writeError(w, http.StatusBadRequest, "name and a valid audienceType are required")
		return
	}
	list, err := c.store.CreateContactList(r.Context(), newID(), strings.TrimSpace(input.Name), input.AudienceType, ownerID)
	if err != nil {
		writeError(w, http.StatusConflict, "could not create contact list")
		return
	}
	writeJSON(w, http.StatusCreated, list)
}

func (c *Controller) GetLists(w http.ResponseWriter, r *http.Request) {
	ownerID, err := c.userID(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	if !c.requireStore(w) {
		return
	}
	lists, err := c.store.ListContactLists(r.Context(), ownerID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, lists)
}

func (c *Controller) CreateDraft(w http.ResponseWriter, r *http.Request) {
	ownerID, err := c.userID(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	if !c.requireStore(w) {
		return
	}
	var draft models.NotificationDraft
	if err := json.NewDecoder(r.Body).Decode(&draft); err != nil || strings.TrimSpace(draft.Title) == "" || strings.TrimSpace(draft.Subject) == "" || draft.Body == "" || !validAudienceType(draft.AudienceType) {
		writeError(w, http.StatusBadRequest, "title, subject, body, and a valid audienceType are required")
		return
	}
	draft.ID = newID()
	draft.Status = "draft"
	result, err := c.store.CreateNotificationDraft(r.Context(), draft, ownerID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, result)
}

func (c *Controller) GetDrafts(w http.ResponseWriter, r *http.Request) {
	ownerID, err := c.userID(r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	if !c.requireStore(w) {
		return
	}
	drafts, err := c.store.ListNotificationDrafts(r.Context(), ownerID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, drafts)
}

func (c *Controller) requireStore(w http.ResponseWriter) bool {
	if c.store == nil {
		writeError(w, http.StatusServiceUnavailable, "database is not configured")
		return false
	}
	return true
}

func (c *Controller) userID(r *http.Request) (string, error) {
	if c.authService == nil {
		return "", fmt.Errorf("authentication is not configured")
	}
	cookie, err := r.Cookie(auth.SessionCookieName)
	if err != nil {
		return "", err
	}
	session, err := c.authService.GetSession(r.Context(), cookie.Value)
	if err != nil || session == nil {
		return "", fmt.Errorf("unauthorized")
	}
	return session.User.ID, nil
}

func csvValue(row []string, headers map[string]int, key string) string {
	index, ok := headers[key]
	if !ok || index >= len(row) {
		return ""
	}
	return strings.TrimSpace(row[index])
}

func validAudienceType(value models.AudienceType) bool {
	return value == models.AudienceStaff || value == models.AudienceUser
}

func newID() string {
	buffer := make([]byte, 18)
	if _, err := rand.Read(buffer); err != nil {
		panic(err)
	}
	return base64.RawURLEncoding.EncodeToString(buffer)
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message, "message": message, "status": fmt.Sprint(status)})
}
