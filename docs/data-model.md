
# QuickNotes Data Model

## 1. Overview

QuickNotes uses a relational database to store users, notes, tags, and the relationships between notes and tags. The design uses primary keys to identify records and foreign keys to preserve referential integrity.

The four entities are:

- **users:** Accounts belonging to people using QuickNotes.
- **notes:** Notes owned by individual users.
- **tags:** Labels used to organize notes.
- **note_tags:** A junction table connecting notes and tags.

## 2. Entities and Columns

### Users

| Column | Type | Key / Constraint | Description |
|---|---|---|---|
| id | BIGINT | Primary key, generated | Unique user ID |
| name | VARCHAR(100) | NOT NULL | User's display name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| password_hash | VARCHAR(255) | NOT NULL | Secure password hash |
| created_at | TIMESTAMP | NOT NULL | Account creation time |

### Notes

| Column | Type | Key / Constraint | Description |
|---|---|---|---|
| id | BIGINT | Primary key, generated | Unique note ID |
| user_id | BIGINT | Foreign key, NOT NULL | Owner of the note |
| title | VARCHAR(100) | NOT NULL | Note title |
| body | TEXT | Nullable | Optional note content |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

### Tags

| Column | Type | Key / Constraint | Description |
|---|---|---|---|
| id | BIGINT | Primary key, generated | Unique tag ID |
| user_id | BIGINT | Foreign key, NOT NULL | User who owns the tag |
| name | VARCHAR(50) | NOT NULL | Tag name |

A unique constraint on `(user_id, name)` prevents a user from creating duplicate tags with the same name.

### Note_Tags

| Column | Type | Key / Constraint | Description |
|---|---|---|---|
| note_id | BIGINT | Composite primary key, foreign key | Related note |
| tag_id | BIGINT | Composite primary key, foreign key | Related tag |

The composite primary key `(note_id, tag_id)` prevents the same tag from being assigned to the same note more than once.

## 3. Relationships

### One-to-Many

- One user can own many notes, but each note belongs to one user.
- One user can create many tags, but each tag belongs to one user.

These relationships use `user_id` foreign keys in the notes and tags tables.

### Many-to-Many

A note can have many tags, and a tag can be associated with many notes. The `note_tags` junction table implements this many-to-many relationship through its two foreign keys.

For a secure implementation, the application must verify that a user owns both the note and the tag before creating their association.

## 4. CREATE TABLE Statements

The following SQL uses PostgreSQL syntax.

```sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (char_length(trim(title)) BETWEEN 1 AND 100)
);

CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
    note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);
```

The application should update `updated_at` when a note changes, using application logic or a database trigger.

## 5. Example SQL Queries

### Query 1: List a User's Notes

```sql
SELECT id, title, body, created_at, updated_at
FROM notes
WHERE user_id = 7
ORDER BY updated_at DESC
LIMIT 20;
```

This retrieves the most recently updated notes for a particular user.

### Query 2: Retrieve One Note

```sql
SELECT id, user_id, title, body, created_at, updated_at
FROM notes
WHERE id = 101
  AND user_id = 7;
```

The application should obtain the authenticated user's ID from the session or token rather than trusting an ID supplied by the client.

### Query 3: List Notes with Their Tags (JOIN)

```sql
SELECT
    n.id AS note_id,
    n.title,
    t.id AS tag_id,
    t.name AS tag_name
FROM notes AS n
LEFT JOIN note_tags AS nt ON nt.note_id = n.id
LEFT JOIN tags AS t ON t.id = nt.tag_id
WHERE n.user_id = 7
ORDER BY n.id, t.name;
```

This retrieves notes together with their tags. The `LEFT JOIN` also includes notes that have no tags.

### Query 4: Count Notes Per User

```sql
SELECT
    u.id,
    u.name,
    COUNT(n.id) AS note_count
FROM users AS u
LEFT JOIN notes AS n ON n.user_id = u.id
GROUP BY u.id, u.name
ORDER BY note_count DESC;
```

This summarizes the number of notes owned by each user.

## 6. Indexes

The following index improves the performance of queries that retrieve a user's notes in update order:

```sql
CREATE INDEX idx_notes_user_updated
ON notes (user_id, updated_at DESC);
```

It supports the common query pattern `WHERE user_id = ? ORDER BY updated_at DESC`, reducing the need to scan and sort all notes.

The primary keys and unique constraints also create indexes in PostgreSQL. Additional indexes should be introduced based on actual query patterns and performance measurements.

## 7. SQL vs. NoSQL Decision

I recommend PostgreSQL, a relational SQL database, for the initial QuickNotes backend. Users, notes, tags, and note-tag associations have clear relationships, and foreign keys and transactions help maintain data consistency. SQL also supports joins and flexible reporting queries. At one million users, PostgreSQL can scale through indexing, connection pooling, read replicas, and appropriate infrastructure. A NoSQL database may be useful for particular high-volume or flexible-data workloads later, but it is not necessary for the core note data model.

## 8. Data Integrity and Security

- Store only password hashes, never plaintext passwords.
- Enforce note ownership in every relevant API operation.
- Verify that notes and tags belong to the same user before linking them.
- Use parameterized SQL queries to prevent SQL injection.
- Apply database migrations and maintain tested backups.
- Use transactions when multiple related database operations must succeed together.
