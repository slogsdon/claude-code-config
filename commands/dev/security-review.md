# Security Review

Perform security assessment adapted to the project's technology stack and deployment model.

## Security Assessment Process
1. **Project Context**
   - Identify technology stack from project files
   - Determine deployment model (cloud, on-premise, hybrid)
   - Review existing security measures

2. **OWASP Top 10 Review**
   - Injection flaws
   - Broken authentication
   - Sensitive data exposure
   - XML External Entities (XXE)
   - Broken access control
   - Security misconfiguration
   - Cross-site scripting (XSS)
   - Insecure deserialization
   - Known vulnerabilities
   - Insufficient logging & monitoring

3. **Technology-Specific Checks**
   - **Node.js/JavaScript**: npm audit, secure headers, input validation
   - **Python**: bandit scanning, secure dependencies
   - **Docker**: image security, secrets management
   - **Cloud**: IAM policies, network security

4. **Code Review Focus**
   - Authentication and authorization
   - Input validation and sanitization
   - Error handling (avoid information leakage)
   - Cryptographic practices
   - Dependency vulnerabilities

**Output:** Prioritized security recommendations with remediation steps

---
Specific Area (optional): $ARGUMENTS