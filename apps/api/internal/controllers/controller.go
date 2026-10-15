package controllers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/ndmfb/ndmfb-tool/apps/api/internal/models"
)

type Controller struct{}

func New() *Controller {
	return &Controller{}
}

func (c *Controller) Health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, models.Response{Status: "ok"})
}

func (c *Controller) Version(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, models.Response{Status: "ok", Name: "ndmfb-api"})
}

func (c *Controller) CurrentUser(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusUnauthorized, models.Response{Status: "unauthorized"})
}

func (c *Controller) GoogleAuth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusNotImplemented, models.Response{Status: "authentication_not_configured"})
}

func (c *Controller) SignOut(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusNoContent)
}

func writeJSON(w http.ResponseWriter, status int, value models.Response) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(value); err != nil {
		log.Printf("write response: %v", err)
	}
}
