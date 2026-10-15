package routes

import (
	"net/http"

	"github.com/ndmfb/ndmfb-tool/apps/api/internal/auth"
	"github.com/ndmfb/ndmfb-tool/apps/api/internal/controllers"
	"github.com/ndmfb/ndmfb-tool/apps/api/internal/middleware"
)

func New(controller *controllers.Controller, authController *auth.Controller) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", controller.Health)
	mux.HandleFunc("GET /api/v1", controller.Version)
	mux.HandleFunc("GET /api/v1/me", controller.CurrentUser)
	mux.HandleFunc("POST /api/v1/auth/google", controller.GoogleAuth)
	mux.HandleFunc("POST /api/v1/auth/sign-out", controller.SignOut)
	mux.HandleFunc("POST /api/auth/sign-in/social", authController.SignInSocial)
	mux.HandleFunc("GET /api/auth/callback/google", authController.GoogleCallback)
	mux.HandleFunc("GET /api/auth/get-session", authController.GetSession)
	mux.HandleFunc("POST /api/auth/sign-out", authController.SignOut)
	mux.HandleFunc("POST /api/auth/update-user", authController.UpdateUser)
	return middleware.CORS(mux)
}
