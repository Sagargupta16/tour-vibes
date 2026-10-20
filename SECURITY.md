# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability, please report it privately to **sg85207@gmail.com**. Do not open a public issue.

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact

You should receive a response within 72 hours.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.7.x | Yes |
| < 0.7 | No |

## Security Practices

- JWT tokens signed with env-based secret, 1-hour expiry
- Reads are public and every write needs a valid token; a bad or expired token is rejected even on a public read, and public profiles never include the email
- Passwords hashed with bcryptjs (salt rounds: 12)
- Signup, login and password change rate-limited (20 requests per 15 minutes); other auth and feed routes 300 per 15 minutes
- File uploads restricted to PNG/JPG, 5MB max, accepted only on authenticated upload routes
- Login returns one message for unknown email and wrong password
- A post's image path is set only from the uploaded file, never from the request body
- Post mutations require ownership verification
- Image deletion validates path stays within `images/` directory
- CORS restricted to configured `CLIENT_URL`
