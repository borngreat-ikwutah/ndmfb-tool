package models

import "time"

type User struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Email         string    `json:"email"`
	EmailVerified bool      `json:"emailVerified"`
	Image         *string   `json:"image,omitempty"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type Session struct {
	ID        string    `json:"id"`
	Token     string    `json:"-"`
	ExpiresAt time.Time `json:"expiresAt"`
	User      User      `json:"user"`
}

type AuthResponse struct {
	User    User    `json:"user"`
	Session Session `json:"session"`
}
