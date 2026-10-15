package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"net/url"
	"time"

	"github.com/ndmfb/ndmfb-tool/apps/api/internal/database"
	"github.com/ndmfb/ndmfb-tool/apps/api/internal/models"
)

const sessionLifetime = 30 * 24 * time.Hour

type Service struct {
	store *database.Store
}

func NewService(store *database.Store) *Service {
	return &Service{store: store}
}

func (s *Service) GetSession(ctx context.Context, token string) (*models.Session, error) {
	if s == nil || s.store == nil || token == "" {
		return nil, nil
	}
	return s.store.FindSession(ctx, token)
}

func (s *Service) DeleteSession(ctx context.Context, token string) error {
	if s == nil || s.store == nil || token == "" {
		return nil
	}
	return s.store.DeleteSession(ctx, token)
}

func (s *Service) UpdateUser(ctx context.Context, sessionToken, name, image string) (*models.User, error) {
	session, err := s.GetSession(ctx, sessionToken)
	if err != nil {
		return nil, err
	}
	if session == nil {
		return nil, fmt.Errorf("unauthorized")
	}
	return s.store.UpdateUser(ctx, session.User.ID, name, image)
}

func (s *Service) CompleteGoogleSignIn(ctx context.Context, profile GoogleProfile) (*models.AuthResponse, error) {
	if s == nil || s.store == nil {
		return nil, fmt.Errorf("database is not configured")
	}
	token, err := randomToken(32)
	if err != nil {
		return nil, err
	}
	user, err := s.store.UpsertGoogleUser(ctx, profile.Subject, profile.Name, profile.Email, profile.EmailVerified, profile.Picture)
	if err != nil {
		return nil, err
	}
	expiresAt := time.Now().Add(sessionLifetime)
	if err := s.store.CreateSession(ctx, token, user.ID, expiresAt); err != nil {
		return nil, err
	}
	return &models.AuthResponse{
		User:    *user,
		Session: models.Session{Token: token, ExpiresAt: expiresAt, User: *user},
	}, nil
}

func GoogleAuthorizationURL(clientID, redirectURL, state string) string {
	query := url.Values{
		"client_id":     {clientID},
		"redirect_uri":  {redirectURL},
		"response_type": {"code"},
		"scope":         {"openid email profile"},
		"state":         {state},
		"access_type":   {"offline"},
		"prompt":        {"select_account"},
	}
	return "https://accounts.google.com/o/oauth2/v2/auth?" + query.Encode()
}

func randomToken(size int) (string, error) {
	buffer := make([]byte, size)
	if _, err := rand.Read(buffer); err != nil {
		return "", fmt.Errorf("generate token: %w", err)
	}
	return base64.RawURLEncoding.EncodeToString(buffer), nil
}
