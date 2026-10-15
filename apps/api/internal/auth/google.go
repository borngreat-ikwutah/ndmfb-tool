package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
)

type GoogleProfile struct {
	Subject       string `json:"sub"`
	Name          string `json:"name"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Picture       string `json:"picture"`
}

type googleTokenResponse struct {
	AccessToken string `json:"access_token"`
}

func ExchangeGoogleCode(ctx context.Context, clientID, clientSecret, redirectURL, code string) (GoogleProfile, error) {
	form := url.Values{
		"code":          {code},
		"client_id":     {clientID},
		"client_secret": {clientSecret},
		"redirect_uri":  {redirectURL},
		"grant_type":    {"authorization_code"},
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://oauth2.googleapis.com/token", strings.NewReader(form.Encode()))
	if err != nil {
		return GoogleProfile{}, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	response, err := http.DefaultClient.Do(req)
	if err != nil {
		return GoogleProfile{}, fmt.Errorf("exchange Google code: %w", err)
	}
	defer response.Body.Close()
	if response.StatusCode >= http.StatusBadRequest {
		return GoogleProfile{}, fmt.Errorf("Google token exchange returned %s", response.Status)
	}
	var token googleTokenResponse
	if err := json.NewDecoder(response.Body).Decode(&token); err != nil {
		return GoogleProfile{}, fmt.Errorf("decode Google token: %w", err)
	}
	profileRequest, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://openidconnect.googleapis.com/v1/userinfo", nil)
	if err != nil {
		return GoogleProfile{}, err
	}
	profileRequest.Header.Set("Authorization", "Bearer "+token.AccessToken)
	profileResponse, err := http.DefaultClient.Do(profileRequest)
	if err != nil {
		return GoogleProfile{}, fmt.Errorf("fetch Google profile: %w", err)
	}
	defer profileResponse.Body.Close()
	if profileResponse.StatusCode >= http.StatusBadRequest {
		return GoogleProfile{}, fmt.Errorf("Google profile request returned %s", profileResponse.Status)
	}
	var profile GoogleProfile
	if err := json.NewDecoder(profileResponse.Body).Decode(&profile); err != nil {
		return GoogleProfile{}, fmt.Errorf("decode Google profile: %w", err)
	}
	return profile, nil
}
