const API_URL = "https://taufiks-imac.tailb50867.ts.net/v1/german-tutor";

const form = document.getElementById("quizForm");
const input = document.getElementById("userInput");
const arenaChat = document.getElementById("arenaChat");
const scholarContent = document.getElementById("scholarContent");
const submitBtn = document.getElementById("submitBtn");
const statusText = document.getElementById("statusText");
const pingOuter = document.getElementById("pingOuter");
const pingInner = document.getElementById("pingInner");
const typingIndicator = document.getElementById("typingIndicator");

// Handle Enter to submit
input.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        form.dispatchEvent(new Event("submit"));
    }
});

function appendArenaMessage(text, isUser = false, isVetoReject = false) {
    const bubble = document.createElement("div");
    bubble.className = `flex w-full ${isUser ? 'justify-end' : 'justify-start'}`;
    
    const inner = document.createElement("div");
    
    if (isUser) {
        inner.className = "max-w-[80%] rounded-2xl rounded-tr-sm bg-gray-700 text-gray-100 px-5 py-3 shadow-md";
        inner.textContent = text;
    } else {
        const bgClass = isVetoReject ? "bg-red-900/30 border border-red-700/50" : "bg-emerald-900/30 border border-emerald-800/50";
        const textClass = isVetoReject ? "text-red-200" : "text-emerald-100";
        inner.className = `max-w-[85%] rounded-2xl rounded-tl-sm px-5 py-4 shadow-md ${bgClass} ${textClass}`;
        
        // Parse markdown
        inner.innerHTML = marked.parse(text);
    }
    
    bubble.appendChild(inner);
    arenaChat.appendChild(bubble);
    arenaChat.scrollTop = arenaChat.scrollHeight;
}

function updateScholarDesk(markdownText) {
    scholarContent.innerHTML = `<div class="scholar-markdown">${marked.parse(markdownText)}</div>`;
}

function setSystemState(isProcessing) {
    if (isProcessing) {
        input.disabled = true;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Memproses...
        `;
        typingIndicator.textContent = "Herr Hermes sedang menganalisis...";
        pingOuter.classList.remove("bg-emerald-400");
        pingOuter.classList.add("bg-yellow-400");
        pingInner.classList.remove("bg-emerald-500");
        pingInner.classList.add("bg-yellow-500");
    } else {
        input.disabled = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <span>Kirim ke Algojo</span>
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        `;
        typingIndicator.textContent = "";
        pingOuter.classList.remove("bg-yellow-400");
        pingOuter.classList.add("bg-emerald-400");
        pingInner.classList.remove("bg-yellow-500");
        pingInner.classList.add("bg-emerald-500");
        input.focus();
    }
}

function triggerVisceralError() {
    input.classList.add('shake-error');
    setTimeout(() => {
        input.classList.remove('shake-error');
    }, 500);
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    appendArenaMessage(query, true);
    input.value = "";
    
    setSystemState(true);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ query: query })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const isReject = data.veto_status === "REJECT";
        
        if (isReject) {
            triggerVisceralError();
            statusText.textContent = "Status: Fatal Error (Grammatik)";
            statusText.classList.add("text-red-400");
        } else {
            statusText.textContent = "Status: Grammatik Korrekt";
            statusText.classList.remove("text-red-400");
            statusText.classList.add("text-emerald-400");
        }

        appendArenaMessage(data.summary || data.answer || "Tidak ada respons dari Quiz Master.", false, isReject);
        
        let scholarMsg = `# Analisis Tutor\nTopik: **${data.query || 'Grammar'}**\n\n`;
        scholarMsg += `Model: \`${data.used_model || 'Unknown'}\`\n\n`;
        
        if (data.follow_up_questions && data.follow_up_questions.length > 0) {
            scholarMsg += "### Latihan Selanjutnya\n";
            data.follow_up_questions.forEach(q => {
                scholarMsg += `- ${q}\n`;
            });
        }
        
        updateScholarDesk(scholarMsg);

    } catch (error) {
        console.error("Fetch Error:", error);
        appendArenaMessage(`**Koneksi Gagal:** Tidak dapat menghubungi Mac Backend (${API_URL}). Pastikan Tailscale Funnel menyala dan PM2 berjalan.`, false, true);
        triggerVisceralError();
    } finally {
        setSystemState(false);
    }
});
