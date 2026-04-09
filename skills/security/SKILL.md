---
name: security
description: Use this skill when you need comprehensive security auditing and OWASP compliance verification for applications across any technology stack. Examples include conducting vulnerability assessments with risk ratings; reviewing authentication and authorization implementations; analyzing data handling for privacy compliance (GDPR, CCPA); identifying SQL injection, XSS, and CSRF vulnerabilities; performing dependency security scanning; generating security reports with actionable remediation steps for PHP, JavaScript, Python, Java, Go, Ruby, .NET, and other languages.
---
Conduct comprehensive security audits for applications across any technology stack with focus on OWASP Top 10 compliance, vulnerability assessment, and secure coding practices.

## Security Focus Areas

**OWASP Top 10 Coverage**:
1. Injection Flaws (SQL, NoSQL, OS command, LDAP)
2. Broken Authentication (session management, password policies, MFA)
3. Sensitive Data Exposure (encryption, key management, PII protection)
4. XML External Entities (XXE parser vulnerabilities)
5. Broken Access Control (authorization flaws, privilege escalation)
6. Security Misconfiguration (default configs, error handling, security headers)
7. Cross-Site Scripting (XSS - reflected, stored, DOM-based)
8. Insecure Deserialization (object injection, RCE)
9. Known Vulnerabilities (dependency scanning, CVE tracking)
10. Insufficient Logging & Monitoring (audit trails, incident response)

**Input Validation**: Verify protection against injection attacks through prepared statements, parameterized queries, input sanitization, output encoding, and whitelist validation.

**Authentication & Authorization**: Review secure password hashing (Argon2ID, bcrypt), session management, token-based auth (JWT, OAuth2), role-based access control (RBAC), and MFA implementations.

**Data Protection**: Assess encryption at rest and in transit, secure key management, PII handling, secure storage practices, and compliance with GDPR/CCPA/HIPAA.

**API Security**: Evaluate OAuth2/JWT implementation, rate limiting, input validation, CORS configuration, and security headers.

## Vulnerability Assessment Format

Categorize findings by severity:
- 🔴 **Critical**: Security vulnerabilities, data breach risks, RCE (fix immediately)
- 🟡 **Important**: Weak authentication, missing encryption, privilege issues (fix next sprint)
- 🟢 **Minor**: Security hardening opportunities, header improvements (fix when convenient)

For each finding provide:
- File path and line number
- Clear description of the vulnerability
- Impact assessment (confidentiality, integrity, availability)
- Specific remediation code example
- Reference to relevant OWASP guidance or CWE number

## Secure Code Examples

**PHP**:
```php
// ❌ Vulnerable to SQL injection
$query = "SELECT * FROM users WHERE email = '$email'";

// ✅ Secure with prepared statements
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
$stmt->execute([$email]);

// ✅ Secure password hashing
$hash = password_hash($password, PASSWORD_ARGON2ID);

// ✅ XSS prevention
echo htmlspecialchars($userInput, ENT_QUOTES, 'UTF-8');

// ✅ CSRF token validation
if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
    throw new SecurityException('CSRF token mismatch');
}
```

**JavaScript/Node.js**:
```javascript
// ❌ Vulnerable to SQL injection
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Secure with parameterized queries
const query = 'SELECT * FROM users WHERE email = ?';
db.query(query, [email]);

// ✅ Secure password hashing
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 12);

// ✅ XSS prevention in React
<div>{userInput}</div> // React escapes by default

// ✅ Helmet for security headers
const helmet = require('helmet');
app.use(helmet());
```

**Python**:
```python
# ❌ Vulnerable to SQL injection
query = f"SELECT * FROM users WHERE email = '{email}'"

# ✅ Secure with parameterized queries
cursor.execute("SELECT * FROM users WHERE email = %s", (email,))

# ✅ Secure password hashing
from argon2 import PasswordHasher
ph = PasswordHasher()
hash = ph.hash(password)

# ✅ XSS prevention in templates
{{ user_input|escape }}  # Django/Jinja2
```

**Java**:
```java
// ❌ Vulnerable to SQL injection
String query = "SELECT * FROM users WHERE email = '" + email + "'";

// ✅ Secure with prepared statements
PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users WHERE email = ?");
stmt.setString(1, email);

// ✅ Secure password hashing
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
String hash = encoder.encode(password);
```

Provide actionable security reports with risk ratings, specific remediation steps, language-appropriate examples, and references to security standards.
