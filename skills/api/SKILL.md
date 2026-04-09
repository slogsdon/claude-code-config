---
name: api
description: Use this skill when you need comprehensive RESTful API design and implementation guidance. Examples include designing new API endpoints with proper REST architecture; creating OpenAPI 3.0 specifications with complete documentation; implementing authentication and authorization systems (OAuth2, JWT, API keys); optimizing API performance with caching and pagination strategies; establishing API versioning and deprecation strategies; ensuring API security with input validation and rate limiting; designing resource relationships and HATEOAS implementations; creating API documentation and migration guides.
---
Provide RESTful API design expertise with focus on proper REST architecture, OpenAPI specifications, authentication, performance optimization, and security.

## Core API Design Domains

**REST Architecture**: Design resource-based APIs following REST principles:
- Noun-based resource URLs (not verb-based)
- Proper HTTP method usage (GET, POST, PUT, PATCH, DELETE)
- Correct HTTP status codes (200, 201, 204, 400, 401, 403, 404, 422, 429, 500)
- Resource relationships and nesting
- HATEOAS for discoverability

**OpenAPI 3.0 Specification**: Create comprehensive API documentation with:
- Complete endpoint descriptions with examples
- Request/response schemas with validation rules
- Authentication/authorization requirements
- Error response formats
- Example requests and responses

**Authentication & Authorization**: Implement secure access control with:
- OAuth2 flows (authorization code, client credentials, refresh tokens)
- JWT-based authentication with proper validation
- API key management and rotation
- Scope-based authorization
- Role-based access control (RBAC)

**Performance Optimization**: Enhance API performance through:
- Response caching with ETags and Cache-Control headers
- Cursor-based pagination for large datasets
- Field filtering and sparse fieldsets
- Compression (gzip, brotli)
- Query optimization and N+1 problem prevention

**API Versioning**: Manage API evolution with:
- Semantic versioning (MAJOR.MINOR.PATCH)
- URL versioning (/api/v1/resource) or header-based versioning
- Deprecation headers and sunset dates
- Backward compatibility strategies
- Migration guides for breaking changes

**Security**: Protect APIs with:
- Input validation and sanitization
- Rate limiting (token bucket, sliding window)
- CORS configuration
- Security headers (CSP, X-Frame-Options, etc.)
- SQL injection and XSS prevention
- API abuse detection

## REST Design Examples

```
✅ Good: Resource-based URLs
GET    /api/v1/users              # List users
POST   /api/v1/users              # Create user
GET    /api/v1/users/{id}         # Get user
PUT    /api/v1/users/{id}         # Update user
PATCH  /api/v1/users/{id}         # Partial update
DELETE /api/v1/users/{id}         # Delete user
GET    /api/v1/users/{id}/orders  # Get user's orders

❌ Bad: Verb-based URLs
POST /api/v1/createUser
GET  /api/v1/getUserById/{id}
```

## Response Format Standards

```json
{
  "data": { /* Resource or array of resources */ },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  },
  "links": {
    "self": "/api/v1/users?page=1",
    "next": "/api/v1/users?page=2",
    "prev": null
  }
}
```

## Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Email format is invalid"
      }
    ]
  }
}
```

Provide complete OpenAPI specifications, implementation examples with proper security and performance patterns, and migration strategies for API evolution.
