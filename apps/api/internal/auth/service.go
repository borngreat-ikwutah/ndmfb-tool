package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/ndmfb/ndmfb-tool/apps/api/internal/database"
	"github.com/ndmfb/ndmfb-tool/apps/api/internal/models"
	"golang.org/x/crypto/bcrypt"
)

const sessionLifetime = 30 * 24 * time.Hour

var (
	ErrEmailAlreadyRegistered = errors.New("email is already registered")
	ErrInvalidCredentials     = errors.New("invalid email or password")
)

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
	return s.createAuthResponse(ctx, token, user)
}

func (s *Service) CompleteEmailSignUp(ctx context.Context, name, email, password string) (*models.AuthResponse, error) {
	if s == nil || s.store == nil {
		return nil, fmt.Errorf("database is not configured")
	}
	name = strings.TrimSpace(name)
	email = normalizeEmail(email)
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}
	id, err := randomToken(24)
	if err != nil {
		return nil, err
	}
	user, err := s.store.CreateEmailUser(ctx, id, name, email, string(passwordHash))
	if err != nil {
		var pgError *pgconn.PgError
		if errors.As(err, &pgError) && pgError.Code == "23505" {
			return nil, ErrEmailAlreadyRegistered
		}
		return nil, err
	}
	token, err := randomToken(32)
	if err != nil {
		return nil, err
	}
	return s.createAuthResponse(ctx, token, user)
}

func (s *Service) CompleteEmailSignIn(ctx context.Context, email, password string) (*models.AuthResponse, error) {
	if s == nil || s.store == nil {
		return nil, fmt.Errorf("database is not configured")
	}
	user, passwordHash, err := s.store.FindEmailUser(ctx, normalizeEmail(email))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}
	if passwordHash == "" || bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(password)) != nil {
		return nil, ErrInvalidCredentials
	}
	token, err := randomToken(32)
	if err != nil {
		return nil, err
	}
	return s.createAuthResponse(ctx, token, user)
}

func (s *Service) createAuthResponse(ctx context.Context, token string, user *models.User) (*models.AuthResponse, error) {
	expiresAt := time.Now().Add(sessionLifetime)
	if err := s.store.CreateSession(ctx, token, user.ID, expiresAt); err != nil {
		return nil, err
	}
	return &models.AuthResponse{
		User:    *user,
		Session: models.Session{ID: token, Token: token, ExpiresAt: expiresAt, User: *user},
	}, nil
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
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
