
# QuickNotes System Design

QuickNotes is a simple notes application and API client built to demonstrate asynchronous JavaScript, REST API requests, error handling, and scalable system design.

## Features

- Load up to 10 notes from the JSONPlaceholder API.
- Create notes using a POST request.
- Delete notes using a DELETE request.
- Display loading, success, error, and empty states.
- Validate note titles and limit titles to 100 characters.
- Disable relevant buttons while requests are running.
- Use `textContent` to display note text safely.
- Document a proposed REST API, relational data model, and scalable architecture.

**Important:** JSONPlaceholder is a demonstration API. Create and delete requests are simulated; changes are not permanently stored by the service.

## Project Files

- `index.html` — HTML structure for the client.
- `style.css` — Responsive styling.
- `api.js` — Fetch requests, validation, rendering, and error handling.
- `docs/api-design.md` — REST endpoints, examples, and error responses.
- `docs/data-model.md` — Database tables, relationships, and SQL queries.
- `docs/architecture.md` — System architecture, capacity estimates, and scaling decisions.

## How to Run the API Client

1. Download or clone this repository.
2. Open `index.html` in a modern web browser.
3. Click **Load Notes** to fetch sample notes.
4. Enter a title and note body, then submit the form to try creating a note.
5. Use a note's delete button to try the DELETE request.

An internet connection is required to access JSONPlaceholder.

## Design Documents

- [API Design](docs/api-design.md)
- [Data Model](docs/data-model.md)
- [System Architecture](docs/architecture.md)

## What I Learned

1. How to use asynchronous JavaScript and `fetch()` to communicate with a REST API.
2. How to handle loading states, HTTP errors, validation, and user feedback.
3. How REST methods such as GET, POST, and DELETE support common application operations.
4. How relational database tables, foreign keys, indexes, and JOIN queries organise data.
5. How load balancing, caching, read replicas, and background workers can support a growing system.

## Limitations

This is a learning project. The API client uses JSONPlaceholder, which does not permanently save created notes or apply real deletions. The documented production architecture is a proposed design, not a deployed backend.

## Author

Created as a web development and system design learning project.
# quicknotes-system-design
