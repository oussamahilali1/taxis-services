package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"transport/Middleware"
	"transport/database"
	"transport/handles"
)

func main() {
	// Database
	database.InitDB()
	defer database.DB.Close()
	// demanderapide
	http.HandleFunc("/api/demanderapide", Middleware.CorsMiddleware(handles.HandleDemanderapide))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]string{
				"status":   "Online",
				"message":  "taxi services Booking API is running",
				"frontend": "http//localhost:3000",
			})
			return
		}
		// http.ServeFile(w,r,"../frontend/error.html")
		// fmt.Println("404 Error on path:", r.URL.Path)
		// handles.ShowError(w, r, http.StatusNotFound, "Endpoint not found")
		handles.JSONError(w, http.StatusNotFound, "Endpoint not found")
		return
	})

	// Server Start
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Println(" Server running on port:", "http://localhost:"+port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
