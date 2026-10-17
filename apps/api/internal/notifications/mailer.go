package notifications

import (
	"crypto/tls"
	"fmt"
	"log"
	"net"
	"net/smtp"
	"os"
	"strconv"
	"strings"
)

// MailMessage is a single outbound email.
type MailMessage struct {
	To      string
	ToName  string
	Subject string
	Body    string
}

// Mailer sends email through SMTP, or logs when SMTP is not configured.
type Mailer struct {
	host     string
	port     int
	username string
	password string
	from     string
	useTLS   bool
}

func NewMailerFromEnv() *Mailer {
	port, _ := strconv.Atoi(os.Getenv("SMTP_PORT"))
	return &Mailer{
		host:     strings.TrimSpace(os.Getenv("SMTP_HOST")),
		port:     port,
		username: os.Getenv("SMTP_USER"),
		password: os.Getenv("SMTP_PASS"),
		from:     fromAddress(),
		useTLS:   strings.EqualFold(os.Getenv("SMTP_TLS"), "true") || os.Getenv("SMTP_PORT") == "465",
	}
}

func fromAddress() string {
	if from := strings.TrimSpace(os.Getenv("SMTP_FROM")); from != "" {
		return from
	}
	return "NDMFB <no-reply@localhost>"
}

// Configured reports whether SMTP delivery is available.
func (m *Mailer) Configured() bool {
	return m != nil && m.host != ""
}

// Send delivers one message. Without SMTP config it logs and succeeds
// so local development can exercise the full send pipeline.
func (m *Mailer) Send(message MailMessage) error {
	if !m.Configured() {
		log.Printf("smtp not configured; logged email to=%s subject=%q", message.To, message.Subject)
		return nil
	}
	addr := net.JoinHostPort(m.host, strconv.Itoa(smtpPort(m.port)))
	headers := []string{
		"From: " + m.from,
		"To: " + displayAddress(message),
		"Subject: " + message.Subject,
		"MIME-Version: 1.0",
		`Content-Type: text/plain; charset="utf-8"`,
		"",
		message.Body,
	}
	payload := []byte(strings.Join(headers, "\r\n"))
	auth := smtpAuth(m)
	if m.useTLS {
		return sendWithTLS(addr, m, message.To, payload)
	}
	if auth != nil {
		return smtp.SendMail(addr, auth, envelopeFrom(m.from), []string{message.To}, payload)
	}
	return smtp.SendMail(addr, nil, envelopeFrom(m.from), []string{message.To}, payload)
}

func smtpPort(port int) int {
	if port > 0 {
		return port
	}
	return 587
}

func smtpAuth(m *Mailer) smtp.Auth {
	if m.username == "" {
		return nil
	}
	return smtp.PlainAuth("", m.username, m.password, m.host)
}

func sendWithTLS(addr string, m *Mailer, to string, payload []byte) error {
	conn, err := tls.Dial("tcp", addr, &tls.Config{ServerName: m.host})
	if err != nil {
		return fmt.Errorf("smtp dial: %w", err)
	}
	defer conn.Close()
	client, err := smtp.NewClient(conn, m.host)
	if err != nil {
		return fmt.Errorf("smtp client: %w", err)
	}
	defer client.Close()
	if auth := smtpAuth(m); auth != nil {
		if err := client.Auth(auth); err != nil {
			return fmt.Errorf("smtp auth: %w", err)
		}
	}
	if err := client.Mail(envelopeFrom(m.from)); err != nil {
		return fmt.Errorf("smtp mail from: %w", err)
	}
	if err := client.Rcpt(to); err != nil {
		return fmt.Errorf("smtp rcpt: %w", err)
	}
	writer, err := client.Data()
	if err != nil {
		return fmt.Errorf("smtp data: %w", err)
	}
	if _, err := writer.Write(payload); err != nil {
		_ = writer.Close()
		return fmt.Errorf("smtp write: %w", err)
	}
	if err := writer.Close(); err != nil {
		return fmt.Errorf("smtp close data: %w", err)
	}
	return client.Quit()
}

func displayAddress(message MailMessage) string {
	name := strings.TrimSpace(message.ToName)
	if name == "" {
		return message.To
	}
	return fmt.Sprintf("%s <%s>", name, message.To)
}

func envelopeFrom(from string) string {
	start := strings.Index(from, "<")
	end := strings.Index(from, ">")
	if start >= 0 && end > start {
		return strings.TrimSpace(from[start+1 : end])
	}
	return strings.TrimSpace(from)
}
