package routes

import (
	"net/http"

	"github.com/ndmfb/ndmfb-tool/apps/api/internal/auth"
	"github.com/ndmfb/ndmfb-tool/apps/api/internal/controllers"
	"github.com/ndmfb/ndmfb-tool/apps/api/internal/middleware"
	"github.com/ndmfb/ndmfb-tool/apps/api/internal/notifications"
)

func New(controller *controllers.Controller, authController *auth.Controller, notificationController *notifications.Controller) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", controller.Health)
	mux.HandleFunc("GET /api/v1", controller.Version)
	mux.HandleFunc("GET /api/v1/me", controller.CurrentUser)
	mux.HandleFunc("POST /api/v1/auth/google", controller.GoogleAuth)
	mux.HandleFunc("POST /api/v1/auth/sign-out", controller.SignOut)
	mux.HandleFunc("POST /api/auth/sign-in/social", authController.SignInSocial)
	mux.HandleFunc("POST /api/auth/sign-in/email", authController.SignInEmail)
	mux.HandleFunc("POST /api/auth/sign-up/email", authController.SignUpEmail)
	mux.HandleFunc("GET /api/auth/callback/google", authController.GoogleCallback)
	mux.HandleFunc("GET /api/auth/get-session", authController.GetSession)
	mux.HandleFunc("POST /api/auth/sign-out", authController.SignOut)
	mux.HandleFunc("POST /api/auth/update-user", authController.UpdateUser)
	mux.HandleFunc("POST /api/audiences/import", notificationController.ImportContacts)
	mux.HandleFunc("POST /api/audiences/lists", notificationController.CreateList)
	mux.HandleFunc("GET /api/audiences/lists", notificationController.GetLists)
	mux.HandleFunc("POST /api/notifications/drafts", notificationController.CreateDraft)
	mux.HandleFunc("GET /api/notifications/drafts", notificationController.GetDrafts)
	mux.HandleFunc("POST /api/notifications/drafts/{id}/approve", notificationController.ApproveDraft)
	mux.HandleFunc("POST /api/notifications/drafts/{id}/send", notificationController.StartSend)
	mux.HandleFunc("GET /api/notifications/sends", notificationController.ListSends)
	mux.HandleFunc("GET /api/notifications/sends/{id}", notificationController.GetSend)
	return middleware.CORS(mux)
}
