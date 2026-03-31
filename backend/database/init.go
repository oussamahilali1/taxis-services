package database

import (
	"database/sql"
	"log"
	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB() {
	var err error
	DB, err = sql.Open("sqlite3", "backend/database/trasport.db")
	if err != nil {
		log.Fatal(err)
	}
	err = DB.Ping()
	if err != nil {
		log.Fatal("Maqderch ntconnecta m3a sqlite:", err)
	}

	createTables()
	log.Println("Database Database Ready!")
}

func createTables() {
	ordersSQL := `CREATE TABLE IF NOT EXISTS Demandeapides (
        id SERIAL PRIMARY KEY, 
        adresse_de_départ TEXT, contact,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
	if _, err := DB.Exec(ordersSQL); err != nil {
		log.Fatal("Error creating orders table:", err)
	}
}
