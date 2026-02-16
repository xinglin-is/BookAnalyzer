const API_URL = 'http://localhost:8000';

export async function checkApiHealth() {
    const res = await fetch(`${API_URL}/`);
    return res.json();
}

export async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function startAnalysis(filename: string, apiKey: string) {
    const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, api_key: apiKey }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function getTaskStatus(taskId: string) {
    const res = await fetch(`${API_URL}/status/${taskId}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function getBooks() {
    const res = await fetch(`${API_URL}/books`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function getBookGraph(bookId: string) {
    const res = await fetch(`${API_URL}/book/${bookId}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function queryBook(bookId: string, query: string, apiKey: string) {
    const res = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_id: bookId, query, api_key: apiKey }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}
