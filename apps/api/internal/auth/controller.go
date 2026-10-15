package auth

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/ndmfb/ndmfb-tool/apps/api/internal/models"
)

const sessionCookie = "better-auth.session_token"
const stateCookie = "better-auth.oauth_state"

type Controller struct {
	service      *Service
	googleID     string
	googleSecret string
	redirectURL  string
	successURL   string
}

func NewController(service *Service) *Controller {
	return &Controller{
		service:      service,
		googleID:     os.Getenv("GOOGLE_CLIENT_ID"),
		googleSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		redirectURL:  envOr("GOOGLE_REDIRECT_URL", "http://localhost:8080/api/auth/callback/google"),
		successURL:   envOr("AUTH_SUCCESS_URL", "http://localhost:3000/"),
	}
}

func (c *Controller) SignInSocial(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Provider    string `json:"provider"`
		CallbackURL string `json:"callbackURL"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil || input.Provider != "google" {
		writeError(w, http.StatusBadRequest, "only Google sign in is supported")
		return
	}
	if c.googleID == "" || c.googleSecret == "" {
		writeError(w, http.StatusServiceUnavailable, "Google OAuth is not configured")
		return
	}
	state, err := randomToken(32)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not create OAuth state")
		return
	}
	http.SetCookie(w, &http.Cookie{Name: stateCookie, Value: state, Path: "/", HttpOnly: true, SameSite: http.SameSiteLaxMode, Secure: r.TLS != nil, MaxAge: 600})
	writeJSON(w, http.StatusOK, map[string]string{"url": GoogleAuthorizationURL(c.googleID, c.redirectURL, state), "callbackURL": input.CallbackURL})
}

func (c *Controller) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	stateCookieValue, err := r.Cookie(stateCookie)
	if err != nil || stateCookieValue.Value == "" || stateCookieValue.Value != r.URL.Query().Get("state") {
		writeError(w, http.StatusBadRequest, "invalid OAuth state")
		return
	}
	if r.URL.Query().Get("error") != "" {
		writeError(w, http.StatusUnauthorized, "Google sign in was cancelled")
		return
	}
	profile, err := ExchangeGoogleCode(r.Context(), c.googleID, c.googleSecret, c.redirectURL, r.URL.Query().Get("code"))
	if err != nil {
		writeError(w, http.StatusUnauthorized, err.Error())
		return
	}
	result, err := c.service.CompleteGoogleSignIn(r.Context(), profile)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	http.SetCookie(w, &http.Cookie{Name: sessionCookie, Value: result.Session.Token, Path: "/", HttpOnly: true, SameSite: http.SameSiteLaxMode, Secure: r.TLS != nil, Expires: result.Session.ExpiresAt})
	http.SetCookie(w, &http.Cookie{Name: stateCookie, Value: "", Path: "/", MaxAge: -1})
	http.Redirect(w, r, c.successURL, http.StatusFound)
}

func (c *Controller) GetSession(w http.ResponseWriter, r *http.Request) {
	session, err := c.sessionFromRequest(r)
	if errors.Is(err, pgx.ErrNoRows) || session == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, session)
}

func (c *Controller) SignOut(w http.ResponseWriter, r *http.Request) {
	if cookie, err := r.Cookie(sessionCookie); err == nil {
		_ = c.service.DeleteSession(r.Context(), cookie.Value)
	}
	http.SetCookie(w, &http.Cookie{Name: sessionCookie, Value: "", Path: "/", MaxAge: -1, HttpOnly: true})
	w.WriteHeader(http.StatusNoContent)
}

func (c *Controller) UpdateUser(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(sessionCookie)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	var input struct {
		Name  string `json:"name"`
		Image string `json:"image"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid profile")
		return
	}
	user, err := c.service.UpdateUser(r.Context(), cookie.Value, input.Name, input.Image)
	if err != nil {
		writeError(w, http.StatusUnauthorized, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, user)
}

func (c *Controller) sessionFromRequest(r *http.Request) (*models.Session, error) {
	cookie, err := r.Cookie(sessionCookie)
	if err != nil {
		return nil, nil
	}
	return c.service.GetSession(r.Context(), cookie.Value)
}

func envOr(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message, "message": message, "status": fmt.Sprint(status)})
}
