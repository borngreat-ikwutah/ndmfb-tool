package auth

import (
	"net/url"
	"testing"
)

func TestGoogleAuthorizationURL(t *testing.T) {
	result, err := url.Parse(GoogleAuthorizationURL("client-id", "http://localhost/callback", "state-value"))
	if err != nil {
		t.Fatal(err)
	}
	query := result.Query()
	if query.Get("client_id") != "client-id" || query.Get("state") != "state-value" {
		t.Fatalf("unexpected OAuth query: %s", query.Encode())
	}
	if query.Get("redirect_uri") != "http://localhost/callback" {
		t.Fatalf("unexpected redirect URI: %s", query.Get("redirect_uri"))
	}
}
