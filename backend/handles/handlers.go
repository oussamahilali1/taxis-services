package handles

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"transport/database"
	"transport/models"
)

func HandleDemanderapide(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		JSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}

	var Demandeapide models.Demandeapide
	if err := json.NewDecoder(r.Body).Decode(&Demandeapide); err != nil {
		// http.Error(w, "Invalid JSON", http.StatusBadRequest)
		JSONError(w, http.StatusBadRequest, "Invalid Data")
		return
	}

	Demandeapide.Adressededépart = strings.TrimSpace(Demandeapide.Adressededépart)
	Demandeapide.Contact = strings.TrimSpace(Demandeapide.Contact)

	if Demandeapide.Contact == "" || Demandeapide.Adressededépart == "" {
		JSONError(w, http.StatusBadRequest, "Vous devez remplir tous les champs du formulaire")
		return
	}
	fmt.Println("the result", Demandeapide.Adressededépart, Demandeapide.Contact)

	stmt, err := database.DB.Prepare("INSERT INTO Demandeapides(adresse_de_départ, contact) VALUES($1, $2)")
	if err != nil {
		// http.Error(w, "Database Error", http.StatusInternalServerError)
		JSONError(w, http.StatusInternalServerError, "Server DB Error")
		return
	}

	_, err = stmt.Exec(Demandeapide.Adressededépart, Demandeapide.Contact)
	if err != nil {
		// http.Error(w, "Error saving order", http.StatusInternalServerError)
		JSONError(w, http.StatusInternalServerError, "Server DB Error")
		return
	}

	fmt.Printf("the Demandeapide Saved to SQLite by : %s\n",Demandeapide.Contact )

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models.Response{Success: true, Message: "Réservation réussie ! Nous vous appellerons dans un instant"})
}
