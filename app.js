// --- Supabase Config ---
const SUPABASE_URL = 'https://aiotlbnguhvavqwamilf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gVUaDUDY2hHkYi7YtYiYTw_isVrNTsx';

// Immediate Feedback
const debugStatus = document.getElementById('db-status')?.querySelector('.status-text');
if (debugStatus) {
    debugStatus.innerText = 'Script Loaded...';
    debugStatus.style.color = '#fbbf24'; // Yellow
}

let supabase = null;

// --- Core Functions ---
async function initSupabase() {
    const statusIndicator = document.getElementById('db-status');
    const statusText = statusIndicator?.querySelector('.status-text');

    // Helper to update UI with visual feedback
    const setStatus = (msg, type) => {
        if (!statusText) return;
        statusText.innerText = msg;
        if (type === 'error') statusText.style.color = '#ef4444';
        if (type === 'success') {
            statusIndicator.classList.add('connected');
            statusText.innerText = 'Supabase Connected';
            statusText.style.color = 'var(--text-secondary)';
        }
    };

    // 1. Check for library
    if (!window.supabase) {
        setStatus('Error: Supabase JS not loaded', 'error');
        return;
    }

    // 2. Already successful?
    if (supabase) return;

    // 3. Initialize
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        try {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            setStatus('Connected!', 'success'); // Optimistic update

            // 4. Test Data Fetch
            await loadNotes();
        } catch (err) {
            console.error('Supabase Setup Failed:', err);
            setStatus('Init Error: ' + err.message, 'error');
        }
    } else {
        setStatus('Mock Mode (Keys Missing)', 'neutral');
    }
}

async function loadNotes() {
    if (!supabase) return;
    try {
        const { data, error } = await supabase.from('notes').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        renderNotes(data);
    } catch (err) {
        console.error('Notes loading failed:', err);
        const statusText = document.querySelector('.status-text');
        if (statusText) statusText.innerText = 'DB Error: ' + err.message;
    }
}

function renderNotes(notes) {
    const list = document.getElementById('notes-list');
    if (!list) return;
    if (!notes || notes.length === 0) {
        list.innerHTML = '<li class="empty-state">No notes found yet. Be the first!</li>';
        return;
    }
    list.innerHTML = notes.map(note => `<li><div class="note-content">${escapeHTML(note.content)}</div></li>`).join('');
}

async function addNote() {
    const input = document.getElementById('note-input');
    const content = input?.value.trim();
    if (!content) return;

    if (!supabase) {
        addMockNote(content);
        if (input) input.value = '';
        return;
    }

    try {
        const { error } = await supabase.from('notes').insert([{ content }]);
        if (error) throw error;
        if (input) input.value = '';
        loadNotes();
    } catch (err) {
        alert('Oops! Could not save note: ' + err.message);
    }
}

function addMockNote(content) {
    const list = document.getElementById('notes-list');
    if (!list) return;
    const emptyState = list.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    const li = document.createElement('li');
    li.innerHTML = `<div class="note-content">${escapeHTML(content)} <span style="opacity: 0.5; font-size: 0.7rem;">(Mock Mode)</span></div>`;
    list.prepend(li);
}

function escapeHTML(str) {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
}

// --- Initialization with Polling ---
window.appStarted = false;

function tryStartApp() {
    if (window.appStarted) return;

    // Wait for Supabase Lib to be ready
    if (typeof window.supabase === 'undefined') {
        const statusText = document.querySelector('.status-text');
        if (statusText) statusText.innerText = 'Loading Library...';
        return; // Retry next tick
    }

    window.appStarted = true;

    const addBtn = document.getElementById('add-btn');
    const noteInput = document.getElementById('note-input');

    if (addBtn) addBtn.addEventListener('click', addNote);
    if (noteInput) noteInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addNote(); });

    initSupabase();
}

// Global exposing for debug
window.initSupabase = initSupabase;
window.addNote = addNote;

// Poll for readiness every 100ms for 5 seconds
const pollTimer = setInterval(tryStartApp, 100);
setTimeout(() => clearInterval(pollTimer), 5000);
