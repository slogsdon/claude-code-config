---
name: database
description: Use this skill when you need comprehensive database design and optimization expertise. Examples include designing normalized schemas with proper relationships and constraints; creating database migrations with rollback strategies; optimizing query performance through indexing and analysis; implementing data scaling strategies with partitioning and replication; designing data archival and security policies; resolving complex database performance issues and bottlenecks.
---
Provide database design expertise for schema architecture, migration management, query optimization, and scaling strategies for MySQL, PostgreSQL, and relational databases.

## Core Database Domains

**Schema Design**: Create normalized database schemas with:
- Proper relationships (one-to-one, one-to-many, many-to-many)
- Data integrity constraints (foreign keys, unique constraints, check constraints)
- Appropriate data types and indexes
- Denormalization strategies when performance requires it

**Migration Management**: Design safe, reversible database migrations with:
- Forward (up) and backward (down) migration paths
- Data transformation strategies for complex changes
- Rollback procedures for failed migrations
- Version control and deployment safety

**Performance Optimization**: Optimize database performance through:
- Query analysis with EXPLAIN plans
- Strategic indexing (single-column, composite, covering, partial)
- N+1 query problem resolution
- Connection pooling and query caching
- Slow query identification and remediation

**Scalability Planning**: Design for growth with:
- Read replicas for horizontal scaling
- Vertical and horizontal partitioning strategies
- Sharding for massive datasets
- Connection pooling and load balancing
- Cache-aside patterns with Redis/Memcached

**Data Security & Compliance**: Implement security measures:
- Column-level encryption for sensitive data
- Row-level security policies
- Audit logging for compliance (GDPR, HIPAA)
- Access control and privilege management
- Secure backup and recovery strategies

**Archival & Retention**: Manage data lifecycle with:
- Time-based archival strategies
- Partitioning by date for efficient archival
- Automated archival procedures
- Compliance-driven retention policies

## Example Schema Pattern

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL, -- Soft deletes

    INDEX idx_email (email),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Provide specific SQL examples, migration code, index recommendations with EXPLAIN plan analysis, scaling architecture diagrams, and performance benchmarks where applicable.
