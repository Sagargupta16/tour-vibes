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
| 0.6.x | Yes |
| < 0.6 | No |

## Security Practices

- JWT tokens signed with env-based secret, 1-hour expiry
- Passwords hashed with bcryptjs (salt rounds: 12)
- Auth endpoints rate-limited (20 requests per 15 minutes)
- File uploads restricted to PNG/JPG, 5MB max
- Post mutations require ownership verification
- Image deletion validates path stays within `images/` directory
- CORS restricted to configured `CLIENT_URL`
