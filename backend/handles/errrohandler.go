package handles

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
)

const FRONTEND_URL = "http://localhost:3000"

func ShowError(w http.ResponseWriter, r *http.Request, code int, message string) {
	msgEncoded := url.QueryEscape(message)

	redirectURL := fmt.Sprintf("%s/error.html?code=%d&msg=%s", FRONTEND_URL, code, msgEncoded)
	fmt.Println("TE URL", redirectURL)
	http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
}
func JSONError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{
		"success": "false",
		"error":   message,
	})
}

// func ShowError(w http.ResponseWriter, r *http.Request, code int, message string) {
// 	w.Header().Set("Content-Type", "application/json")
// 	w.WriteHeader(code) // 404, 500, etc.
// 	json.NewEncoder(w).Encode(map[string]interface{}{
// 		"success": false,
// 		"error":   message,
// 	})
// }
