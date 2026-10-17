package main

import (
	"log"
	"net/http"
	"os"

	"github.com/ndmfb/ndmfb-tool/apps/api/internal/auth"
	"github.com/ndmfb/ndmfb-tool/apps/api/internal/controllers"
	"github.com/ndmfb/ndmfb-tool/apps/api/internal/database"
	"github.com/ndmfb/ndmfb-tool/apps/api/internal/notifications"
	"github.com/ndmfb/ndmfb-tool/apps/api/internal/routes"
)

func main() {
	port := os.Getenv("API_PORT")
	if port == "" {
		port = "8080"
	}
	var store *database.Store
	if databaseURL := os.Getenv("DATABASE_URL"); databaseURL != "" {
		var err error
		store, err = database.Open(databaseURL)
		if err != nil {
			log.Fatalf("open database: %v", err)
		}
		defer store.Close()
		if err := store.Migrate(); err != nil {
			log.Fatalf("migrate database: %v", err)
		}
	}

	authService := auth.NewService(store)
	server := &http.Server{
		Addr:    ":" + port,
		Handler: routes.New(controllers.New(), auth.NewController(authService), notifications.NewController(store, authService)),
	}

	log.Printf("ndmfb API listening on http://localhost:%s", port)
	log.Fatal(server.ListenAndServe())
}
