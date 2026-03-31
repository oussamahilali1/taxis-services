package models
type Demandeapide struct {
	ID           int    `json:"id"` 
	Adressededépart   string `json:"adresse_de_départ"`
	Contact        string `json:"contact"`
}