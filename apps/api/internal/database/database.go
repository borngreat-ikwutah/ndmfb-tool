package database

import (
	"context"
	"embed"
	"fmt"
	"sort"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ndmfb/ndmfb-tool/apps/api/internal/models"
)

//go:embed migrations/*.sql
var migrations embed.FS

type Store struct {
	pool *pgxpool.Pool
}

func Open(connectionString string) (*Store, error) {
	pool, err := pgxpool.New(context.Background(), connectionString)
	if err != nil {
		return nil, fmt.Errorf("create pool: %w", err)
	}
	return &Store{pool: pool}, nil
}

func (s *Store) Close() {
	s.pool.Close()
}

func (s *Store) Migrate() error {
	ctx := context.Background()
	if _, err := s.pool.Exec(ctx, `CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`); err != nil {
		return fmt.Errorf("create migration table: %w", err)
	}

	entries, err := migrations.ReadDir("migrations")
	if err != nil {
		return fmt.Errorf("read migrations: %w", err)
	}
	sort.Slice(entries, func(i, j int) bool { return entries[i].Name() < entries[j].Name() })

	for _, entry := range entries {
		version := entry.Name()
		var applied bool
		if err := s.pool.QueryRow(ctx, `SELECT EXISTS (SELECT 1 FROM schema_migrations WHERE version = $1)`, version).Scan(&applied); err != nil {
			return fmt.Errorf("check migration %s: %w", version, err)
		}
		if applied {
			continue
		}
		sql, err := migrations.ReadFile("migrations/" + version)
		if err != nil {
			return fmt.Errorf("read migration %s: %w", version, err)
		}
		tx, err := s.pool.Begin(ctx)
		if err != nil {
			return fmt.Errorf("begin migration %s: %w", version, err)
		}
		if _, err = tx.Exec(ctx, string(sql)); err != nil {
			_ = tx.Rollback(ctx)
			return fmt.Errorf("run migration %s: %w", version, err)
		}
		if _, err = tx.Exec(ctx, `INSERT INTO schema_migrations (version) VALUES ($1)`, version); err != nil {
			_ = tx.Rollback(ctx)
			return fmt.Errorf("record migration %s: %w", version, err)
		}
		if err = tx.Commit(ctx); err != nil {
			return fmt.Errorf("commit migration %s: %w", version, err)
		}
	}
	return nil
}

func (s *Store) UpsertGoogleUser(ctx context.Context, subject, name, email string, emailVerified bool, image string) (*models.User, error) {
	var user models.User
	err := s.pool.QueryRow(ctx, `
		INSERT INTO "user" (id, name, email, email_verified, image)
		VALUES ($1, $2, $3, $4, NULLIF($5, ''))
		ON CONFLICT (email) DO UPDATE SET
			name = EXCLUDED.name,
			email_verified = EXCLUDED.email_verified,
			image = EXCLUDED.image,
			updated_at = NOW()
		RETURNING id, name, email, email_verified, image, created_at, updated_at
	`, subject, name, email, emailVerified, image).Scan(
		&user.ID, &user.Name, &user.Email, &user.EmailVerified, &user.Image, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("upsert Google user: %w", err)
	}
	return &user, nil
}

func (s *Store) CreateEmailUser(ctx context.Context, id, name, email, passwordHash string) (*models.User, error) {
	var user models.User
	err := s.pool.QueryRow(ctx, `
		INSERT INTO "user" (id, name, email, email_verified, password_hash)
		VALUES ($1, $2, $3, FALSE, $4)
		RETURNING id, name, email, email_verified, image, created_at, updated_at
	`, id, name, email, passwordHash).Scan(
		&user.ID, &user.Name, &user.Email, &user.EmailVerified, &user.Image, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create email user: %w", err)
	}
	return &user, nil
}

func (s *Store) FindEmailUser(ctx context.Context, email string) (*models.User, string, error) {
	var user models.User
	var passwordHash *string
	err := s.pool.QueryRow(ctx, `
		SELECT id, name, email, email_verified, image, created_at, updated_at, password_hash
		FROM "user"
		WHERE email = $1
	`, email).Scan(
		&user.ID, &user.Name, &user.Email, &user.EmailVerified, &user.Image, &user.CreatedAt, &user.UpdatedAt, &passwordHash,
	)
	if err != nil {
		return nil, "", fmt.Errorf("find email user: %w", err)
	}
	if passwordHash == nil {
		return &user, "", nil
	}
	return &user, *passwordHash, nil
}

func (s *Store) CreateSession(ctx context.Context, token, userID string, expiresAt time.Time) error {
	_, err := s.pool.Exec(ctx, `INSERT INTO session (id, token, expires_at, user_id) VALUES ($1, $2, $3, $4)`, token, token, expiresAt, userID)
	if err != nil {
		return fmt.Errorf("create session: %w", err)
	}
	return nil
}

func (s *Store) FindSession(ctx context.Context, token string) (*models.Session, error) {
	var session models.Session
	err := s.pool.QueryRow(ctx, `
		SELECT s.id, s.token, s.expires_at, u.id, u.name, u.email, u.email_verified, u.image, u.created_at, u.updated_at
		FROM session s JOIN "user" u ON u.id = s.user_id
		WHERE s.token = $1 AND s.expires_at > NOW()
	`, token).Scan(
		&session.ID, &session.Token, &session.ExpiresAt,
		&session.User.ID, &session.User.Name, &session.User.Email, &session.User.EmailVerified, &session.User.Image,
		&session.User.CreatedAt, &session.User.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("find session: %w", err)
	}
	return &session, nil
}

func (s *Store) DeleteSession(ctx context.Context, token string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM session WHERE token = $1`, token)
	if err != nil {
		return fmt.Errorf("delete session: %w", err)
	}
	return nil
}

func (s *Store) UpdateUser(ctx context.Context, userID, name, image string) (*models.User, error) {
	var user models.User
	err := s.pool.QueryRow(ctx, `
		UPDATE "user" SET name = COALESCE(NULLIF($2, ''), name), image = NULLIF($3, ''), updated_at = NOW()
		WHERE id = $1
		RETURNING id, name, email, email_verified, image, created_at, updated_at
	`, userID, name, image).Scan(
		&user.ID, &user.Name, &user.Email, &user.EmailVerified, &user.Image, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("update user: %w", err)
	}
	return &user, nil
}
