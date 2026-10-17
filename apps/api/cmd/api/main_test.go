package main

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/ndmfb/ndmfb-tool/apps/api/internal/auth"
	"github.com/ndmfb/ndmfb-tool/apps/api/internal/controllers"
	"github.com/ndmfb/ndmfb-tool/apps/api/internal/notifications"
	"github.com/ndmfb/ndmfb-tool/apps/api/internal/routes"
)

func TestHealthEndpoint(t *testing.T) {
	handler := routes.New(controllers.New(), auth.NewController(nil), notifications.NewController(nil, nil))

	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
	if got := res.Body.String(); got != "{\"status\":\"ok\"}\n" {
		t.Fatalf("unexpected response: %s", got)
	}
}
