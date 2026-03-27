package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"taxis/handler"
)

func main() {
	// PORT := ":" + os.Getenv("PORT")
	ADDRESS := os.Getenv("ADDRESS")
	FRONTEND_ORIGIN := os.Getenv("FRONTEND_ORIGIN")
	if FRONTEND_ORIGIN == "" {
		FRONTEND_ORIGIN = "http://localhost:3000"
	}
	http.Handle("/", http.HandlerFunc(handler.Index))
	fmt.Printf("the server run on http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
	fmt.Println("the addrees", ADDRESS)
}
