package models

type Response struct {
	Status string `json:"status"`
	Name   string `json:"name,omitempty"`
}
