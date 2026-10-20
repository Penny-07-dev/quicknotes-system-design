
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const statusMessage = document.getElementById("status");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");
const notesList = document.getElementById("notes-list");

let notes = [];

function setStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = type;
}

async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  // DELETE may return an empty response.
  if (response.status === 204) {
    return { data: null, status: response.status };
  }

  const data = await response.json();
  return { data, status: response.status };
}

function renderNotes() {
  notesList.replaceChildren();

  if (notes.length === 0) {
    const item = document.createElement("li");
    item.className = "empty-state";
    item.textContent = "No notes to display. Load notes or create one.";
    notesList.appendChild(item);
    return;
  }

  notes.forEach((note) => {
    const item = document.createElement("li");
    item.className = "note-item";

    const heading = document.createElement("h3");
    heading.textContent = note.title || "Untitled note";

    const body = document.createElement("p");
    body.textContent = note.body || "No body provided.";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteNote(note.id, deleteButton));

    item.append(heading, body, deleteButton);
    notesList.appendChild(item);
  });
}

// GET: Load up to 10 notes from JSONPlaceholder.
async function loadNotes() {
  loadButton.disabled = true;
  setStatus("Loading notes...");

  try {
    const result = await request(`${API_URL}?_limit=10`);
    notes = result.data;
    renderNotes();

    if (notes.length === 0) {
      setStatus("No notes were found.", "success");
    } else {
      setStatus(`Loaded ${notes.length} notes from the server.`, "success");
    }
  } catch (error) {
    setStatus("Sorry, we could not load notes. Please try again.", "error");
    console.error("Load notes error:", error);
  } finally {
    loadButton.disabled = false;
  }
}

// POST: Create a note.
async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    setStatus("Please enter a note title.", "error");
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    setStatus("The title must be 100 characters or fewer.", "error");
    titleInput.focus();
    return;
  }

  submitButton.disabled = true;
  loadButton.disabled = true;
  setStatus("Creating note...");

  try {
    const result = await request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ title, body, userId: 1 })
    });

    const createdNote = result.data;
    notes.unshift(createdNote);
    renderNotes();

    setStatus(
      `Note created (status ${result.status}, id ${createdNote.id}).`,
      "success"
    );
    noteForm.reset();
  } catch (error) {
    setStatus("Sorry, we could not create the note. Please try again.", "error");
    console.error("Create note error:", error);
  } finally {
    submitButton.disabled = false;
    loadButton.disabled = false;
  }
}

// DELETE: Remove a note from the API and the visible list.
async function deleteNote(id, deleteButton) {
  const wasLoading = loadButton.disabled;
  deleteButton.disabled = true;
  loadButton.disabled = true;
  submitButton.disabled = true;
  setStatus("Deleting note...");

  try {
    await request(`${API_URL}/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });

    // JSONPlaceholder simulates POST and DELETE; it does not persist
    // new notes or permanently delete server data. We update the local
    // list to reflect the successful simulated operation for this session.
    notes = notes.filter((note) => String(note.id) !== String(id));
    renderNotes();
    setStatus("Note deleted successfully.", "success");
  } catch (error) {
    setStatus("Sorry, we could not delete the note. Please try again.", "error");
    console.error("Delete note error:", error);
  } finally {
    deleteButton.disabled = false;
    loadButton.disabled = wasLoading;
    submitButton.disabled = false;
  }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);

// Display the empty state when the page first opens.
renderNotes();
