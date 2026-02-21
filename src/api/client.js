// src/api/client.js
// All API calls to the FastAPI backend

const PROTO = window.location.protocol; // "http:" or "https:"
const BASE = import.meta.env.VITE_API_URL || `${PROTO}//${window.location.hostname}:8001`;

async function request(method, path, body, isForm = false, timeoutMs = 120000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const opts = {
        method,
        headers: {},
        signal: controller.signal,
    };

    if (body) {
        if (isForm) {
            opts.body = body;   // FormData — no Content-Type header
        } else {
            opts.headers["Content-Type"] = "application/json";
            opts.body = JSON.stringify(body);
        }
    }

    console.log(`[API] ${method} ${BASE}${path}`);
    try {
        const res = await fetch(`${BASE}${path}`, opts);
        clearTimeout(timeoutId);

        if (!res.ok) {
            let msg = `HTTP ${res.status} error`;
            try {
                const json = await res.json();
                msg = json.detail || json.message || msg;
            } catch { /* non-JSON error body */ }
            throw new Error(msg);
        }
        return res.json();
    } catch (err) {
        clearTimeout(timeoutId);
        console.error(`[API Error] ${method} ${BASE}${path}:`, err);
        if (err.name === "AbortError") {
            throw new Error("Request timed out — backend may be overloaded. Please try again.");
        }
        if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError") || err.message.includes("ERR_CONNECTION_REFUSED")) {
            throw new Error(`Cannot connect to backend at ${BASE}. \n\nFIX: Open ${BASE}/health in a new tab, click "Advanced", and "Proceed" to trust the certificate, then return here and refresh.`);
        }
        throw err;
    }
}

// ── Health check ──────────────────────────────────────────────────────────────
export async function checkBackendHealth() {
    try {
        const data = await request("GET", "/health", null, false, 4000);
        return { online: true, modelReady: data.model_ready, message: data.message };
    } catch {
        return { online: false, modelReady: false, message: "Backend offline" };
    }
}

// ── Patients ─────────────────────────────────────────────────────────────────
export const api = {
    createPatient: (data) =>
        request("POST", "/patients", data),

    listPatients: () =>
        request("GET", "/patients"),

    getPatient: (id) =>
        request("GET", `/patients/${id}`),

    // ── Core analysis ──────────────────────────────────────────────────────────
    analyzeVoice: (patientId, audioBlob, language = "en") => {
        const form = new FormData();

        // Determine correct file extension from MIME type
        const mime = audioBlob.type || "";
        let ext = "webm";
        if (mime.includes("mp4") || mime.includes("m4a") || mime.includes("aac")) {
            ext = "m4a";    // iOS Safari
        } else if (mime.includes("ogg")) {
            ext = "ogg";
        } else if (mime.includes("wav") || mime.includes("wave")) {
            ext = "wav";
        } else if (mime.includes("webm")) {
            ext = "webm";
        }

        form.append("audio", audioBlob, `recording.${ext}`);
        form.append("language", language);

        console.log(`[VoiceScan] Uploading ${(audioBlob.size / 1024).toFixed(1)} KB of ${mime} as recording.${ext}`);
        // Audio analysis can take up to 60s on first call (includes Praat + XGBoost)
        return request("POST", `/patients/${patientId}/analyze`, form, true, 90000);
    },

    getSessions: (patientId, limit = 30) =>
        request("GET", `/patients/${patientId}/sessions?limit=${limit}`),

    getTrend: (patientId, days = 30) =>
        request("GET", `/patients/${patientId}/trend?days=${days}`),

    getOverview: () =>
        request("GET", "/overview"),
};

// ── WebSocket — live waveform amplitude ──────────────────────────────────────
export function openLiveWS(patientId, onAmplitude) {
    const wsBase = BASE.replace(/^https?/, (m) => m === "https" ? "wss" : "ws");
    const ws = new WebSocket(`${wsBase}/ws/live/${patientId}`);

    ws.onmessage = (e) => {
        try {
            const { amplitude } = JSON.parse(e.data);
            onAmplitude(amplitude);
        } catch { }
    };

    ws.onerror = (e) => console.error("WS error:", e);

    // Send PCM chunk
    ws.sendPCM = (pcmBuffer) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(pcmBuffer);
    };

    return ws;
}
