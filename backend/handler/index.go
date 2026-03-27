package handler

import (
	"encoding/json"
	"net/http"
)

func Index(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status":   "Online",
			"message":  " app API is running",
			"frontend": "http//localhost:3000",
		})
	}
}
