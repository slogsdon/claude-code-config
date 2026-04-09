---
name: code-review
description: Use this skill when code has been written, modified, or generated in any supported language (PHP, .NET, Java, Python, Node.js, JavaScript, HTML, CSS, Go, Ruby, Kotlin, Objective-C, Swift). This skill should be invoked after completing code implementation, bug fixes, or refactoring tasks to ensure code quality, security, and adherence to best practices.
---
Perform comprehensive multi-language code review with expertise across PHP, .NET, Java, Python, Node.js, JavaScript, HTML, CSS, Go, Ruby, Kotlin, Objective-C, and Swift.

## Review Focus Areas

**Language-Specific Standards**: Apply appropriate coding standards for each language:
- PHP: PSR-12, PSR-4 autoloading, security best practices
- .NET: Microsoft coding conventions, SOLID principles, async/await patterns
- Java: Oracle Java conventions, design patterns, memory management
- Python: PEP 8, Pythonic idioms, type hints
- Node.js/JavaScript: ESLint standards, modern ES6+ patterns, async patterns
- HTML: Semantic markup, accessibility (WCAG), SEO best practices
- CSS: BEM methodology, responsive design, performance optimization
- Go: Effective Go guidelines, idiomatic patterns, concurrency patterns
- Ruby: Ruby Style Guide, Rails conventions (if applicable)
- Kotlin: Kotlin coding conventions, null safety, coroutines
- Objective-C: Apple coding guidelines, memory management (ARC)
- Swift: Swift API Design Guidelines, protocol-oriented programming

**Security Analysis**: Identify vulnerabilities including SQL injection, XSS, CSRF, authentication/authorization flaws, insecure data handling, dependency vulnerabilities, API security issues, and input validation gaps.

**Performance Optimization**: Evaluate algorithm efficiency, memory usage, database query optimization, caching opportunities, network request optimization, and lazy loading strategies.

**Code Quality**: Review SOLID principles adherence, design pattern appropriateness, code duplication (DRY), naming conventions, function/method complexity, test coverage, and error handling robustness.

## Review Process

1. Identify the language(s) and activate appropriate expertise
2. Perform deep review covering architecture, security, performance, maintainability, testing, and documentation
3. Categorize findings by severity:
   - 🔴 **Critical**: Security vulnerabilities, breaking bugs, data loss risks
   - 🟡 **Important**: Performance issues, maintainability concerns, missing tests
   - 🟢 **Minor**: Style inconsistencies, documentation improvements, refactoring suggestions
4. Provide actionable recommendations with:
   - Clear description of the issue
   - Explanation of impact
   - Specific code examples showing fixes
   - References to relevant standards or documentation

## Output Guidelines

Structure findings by severity, provide context-appropriate detail, include specific file paths and line numbers, offer concrete code examples for fixes, acknowledge well-implemented patterns, and provide prioritized next steps.

Example security fix:
```php
// ❌ Vulnerable to SQL injection
$query = "SELECT * FROM users WHERE email = '$email'";

// ✅ Secure with prepared statements
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
$stmt->execute([$email]);
```
