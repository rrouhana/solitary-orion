// --- Supabase Config ---
// Since we are in a 'No-Build' environment, we check for environment variables in the window or URL (for testing)
// In a real Vercel deployment, you would replace these or inject them via a tiny script tag.

const SUPABASE_URL = 'https://aiotlbnguhvavqwamilf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gVUaDUDY2hHkYi7YtYiYTw_isVrNTsx';

let supabase = null;

// Initialize elements
const statusIndicator = document.getElementById('db-status');
const statusText = statusIndicator.querySelector('.status-text');
const noteInput = document.getElementById('note-input');
const addBtn = document.getElementById('add-btn');
const notesList = document.getElementById('notes-list');

// --- Functions ---

function initSupabase() {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        try {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            statusIndicator.classList.add('connected');
            statusText.innerText = 'Supabase Connected';
            loadNotes();
        } catch (err) {
            console.error('Connection failed:', err);
            statusText.innerText = 'Connection Error';
        }
    } else {
        statusText.innerText = 'Keys Missing (See Console)';
        console.warn('Supabase keys not found. App running in mock mode.');
    }
}

async function loadNotes() {
    if (!supabase) return;

    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading notes:', error);
        return;
    }

    renderNotes(data);
}

function renderNotes(notes) {
    if (!notes || notes.length === 0) {
        notesList.innerHTML = '<li class="empty-state">No notes found yet. Be the first!</li>';
        return;
    }

    notesList.innerHTML = notes.map(note => `
        <li>
            <div class="note-content">${escapeHTML(note.content)}</div>
        </li>
    `).join('');
}

async function addNote() {
    const content = noteInput.value.trim();
    if (!content) return;

    // Local-only visual feedback if no Supabase
    if (!supabase) {
        addMockNote(content);
        noteInput.value = '';
        return;
    }

    const { error } = await supabase
        .from('notes')
        .insert([{ content }]);

    if (error) {
        alert('Error saving note: ' + error.message);
    } else {
        noteInput.value = '';
        loadNotes();
    }
}

function addMockNote(content) {
    const emptyState = notesList.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const li = document.createElement('li');
    li.innerHTML = `<div class="note-content">${escapeHTML(content)} <span style="opacity: 0.5; font-size: 0.7rem;">(Mock Mode)</span></div>`;
    notesList.prepend(li);
}

function escapeHTML(str) {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
}

// --- Event Listeners ---

addBtn.addEventListener('click', addNote);
noteInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addNote();
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
});
