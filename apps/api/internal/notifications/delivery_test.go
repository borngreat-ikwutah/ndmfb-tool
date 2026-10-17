package notifications

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestDeliveryEndpointsRequireAuth(t *testing.T) {
	controller := NewController(nil, nil)
	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/notifications/drafts/{id}/approve", controller.ApproveDraft)
	mux.HandleFunc("POST /api/notifications/drafts/{id}/send", controller.StartSend)
	mux.HandleFunc("GET /api/notifications/sends", controller.ListSends)
	mux.HandleFunc("GET /api/notifications/sends/{id}", controller.GetSend)

	paths := []struct {
		method string
		path   string
	}{
		{http.MethodPost, "/api/notifications/drafts/draft-id/approve"},
		{http.MethodPost, "/api/notifications/drafts/draft-id/send"},
		{http.MethodGet, "/api/notifications/sends"},
		{http.MethodGet, "/api/notifications/sends/send-id"},
	}

	for _, endpoint := range paths {
		req := httptest.NewRequest(endpoint.method, endpoint.path, nil)
		res := httptest.NewRecorder()
		mux.ServeHTTP(res, req)
		if res.Code != http.StatusUnauthorized {
			t.Fatalf("%s %s: expected 401, got %d", endpoint.method, endpoint.path, res.Code)
		}
	}
}

func TestDraftStatusMapping(t *testing.T) {
	cases := map[string]string{
		"sent":    "sent",
		"partial": "sent",
		"failed":  "failed",
		"sending": "sending",
		"queued":  "sending",
	}
	for send, want := range cases {
		if got := draftStatusForSend(send); got != want {
			t.Fatalf("send %q: expected draft %q, got %q", send, want, got)
		}
	}
}

func TestUnconfiguredMailerSucceeds(t *testing.T) {
	mailer := &Mailer{}
	if mailer.Configured() {
		t.Fatal("expected empty mailer to be unconfigured")
	}
	if err := mailer.Send(MailMessage{To: "user@example.com", Subject: "hello", Body: "world"}); err != nil {
		t.Fatalf("expected log fallback to succeed, got %v", err)
	}
}
