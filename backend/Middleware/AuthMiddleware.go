package Middleware

// import (
// 	"fmt"
// 	"net/http"
// 	"transport/database"
// 	"transport/handles"
// )

// func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
// 	return func(w http.ResponseWriter, r *http.Request) {
// 		if r.Method == "OPTIONS" {
// 			next(w, r)
// 			return
// 		}
// 		token := r.Header.Get("Authorization")
// 		fmt.Println(" Checking Token in DB:", token)
// 		if !database.IsSessionValid(token) {
// 			fmt.Println("Token Invalid or Expired (DB Refused)")
// 			// handles.ShowError(w,r,http.StatusUnauthorized,"Unauthorized")
// 			handles.JSONError(w, http.StatusMethodNotAllowed, "Unauthorized")
// 			// http.Error(w, "Unauthorized", http.StatusUnauthorized)
// 			return
// 		}
// 		next(w, r)
// 	}
// }
