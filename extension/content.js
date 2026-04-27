console.log("GuardAI Content Script Loaded");

// 1. Extraction Logic (Robust & Safe)
function extractProfileData() {
    try {
        let username = window.location.pathname.replace(/\//g, '');
        
        // Find Bio (Multiple selectors)
        const bioElement = document.querySelector('header section div:nth-child(3) span') || 
                           document.querySelector('header section div:last-child span') ||
                           document.querySelector('h1').parentElement.parentElement.nextElementSibling;
        const bio = bioElement ? bioElement.innerText : "No bio found";
        
        // Find Stats
        const stats = document.querySelectorAll('header section ul li span');
        const followersStr = stats[1] ? stats[1].innerText.replace(/,/g, '') : "0";
        const followingStr = stats[2] ? stats[2].innerText.replace(/,/g, '') : "0";
        
        const followers = parseInstagramCount(followersStr);
        const following = parseInstagramCount(followingStr);
        
        // Find Profile Image
        const imgElement = document.querySelector('header img');
        const image_url = imgElement ? imgElement.src : "";

        return { username, bio, followers, following, image_url };
    } catch (e) {
        console.warn("GuardAI: Partial extraction failure", e);
        return { username: "unknown", bio: "", followers: 0, following: 0, image_url: "" };
    }
}

function parseInstagramCount(str) {
    if (!str) return 0;
    if (str.includes('K')) return parseFloat(str) * 1000;
    if (str.includes('M')) return parseFloat(str) * 1000000;
    return parseInt(str) || 0;
}

// 2. Button Injection
function injectButton() {
    if (document.getElementById('guardai-btn')) return;
    
    const btn = document.createElement('button');
    btn.id = 'guardai-btn';
    btn.className = 'guardai-btn';
    btn.innerHTML = `🛡️ Scan with GuardAI`;
    btn.onclick = handleScan;
    document.body.appendChild(btn);
}

// 3. Scan & Caching Logic (Safe Mode)
async function handleScan() {
    const btn = document.getElementById('guardai-btn');
    if (btn) {
        btn.innerText = "⏳ Connecting...";
        btn.disabled = true;
    }

    const data = extractProfileData();
    const cacheKey = `guardai_${data.username}`;
    
    try {
        const cached = await chrome.storage.local.get(cacheKey);
        const now = Date.now();

        if (cached[cacheKey] && (now - cached[cacheKey].timestamp < 10 * 60 * 1000)) {
            showResults(cached[cacheKey].result);
            if (btn) btn.innerText = "🛡️ Scan with GuardAI";
            if (btn) btn.disabled = false;
            return;
        }

        if (btn) btn.innerText = "⏳ AI Analyzing...";
        
        const response = await fetch('http://localhost:8000/analyze-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error("Backend not responding");
        
        const result = await response.json();
        await chrome.storage.local.set({ [cacheKey]: { result, timestamp: now } });
        showResults(result);
    } catch (e) {
        alert("GuardAI Error: Ensure your backend is running in the terminal.");
        console.error(e);
    } finally {
        if (btn) {
            btn.innerText = "🛡️ Scan with GuardAI";
            btn.disabled = false;
        }
    }
}

// 4. UI Overlay (Safe Mode)
function showResults(result) {
    let overlay = document.getElementById('guardai-overlay');
    if (overlay) overlay.remove();

    overlay = document.createElement('div');
    overlay.id = 'guardai-overlay';
    overlay.className = 'guardai-overlay';
    
    const riskClass = result.risk_score > 75 ? 'risk-high' : result.risk_score > 35 ? 'risk-suspicious' : 'risk-safe';

    overlay.innerHTML = `
        <div class="guardai-close" id="guardai-close-btn">✕</div>
        <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: bold;">Security Report</div>
        <h2 style="margin:4px 0 0 0; font-size: 26px; font-weight: 900; background: linear-gradient(to right, #ffffff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">GuardAI</h2>
        
        <div class="guardai-risk-badge ${riskClass}">
            ${result.label} • ${result.risk_score}% RISK
        </div>

        <div class="guardai-ai-box">
            <span class="guardai-ai-label">Gemini Intelligence Summary</span>
            <div class="guardai-ai-text">"${result.explanation}"</div>
        </div>

        <div class="guardai-detail-row">
            <span>AI Intent</span>
            <span style="color: white; font-weight: bold;">${result.intent}</span>
        </div>
        <div class="guardai-detail-row">
            <span>Visual Verification</span>
            <span style="color: white; font-weight: bold;">${result.visual}</span>
        </div>

        <div class="guardai-reasons">
            <div style="font-size: 11px; font-weight: bold; margin-bottom: 10px; color: #94a3b8;">DETECTION SIGNALS</div>
            ${result.reasons.slice(0,3).map(r => `
                <div class="guardai-reason-item">
                    <span style="color: #3b82f6;">•</span>
                    <span>${r}</span>
                </div>
            `).join('')}
        </div>
    `;
    document.body.appendChild(overlay);

    const closeBtn = document.getElementById('guardai-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => overlay.remove());
    }
}

// Observe URL changes
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        if (url.includes('instagram.com/') && !url.includes('/p/') && !url.includes('/explore/')) {
            setTimeout(injectButton, 2000);
        } else {
            const btn = document.getElementById('guardai-btn');
            if (btn) btn.remove();
        }
    }
}).observe(document, {subtree: true, childList: true});

// Initial check
if (location.href.includes('instagram.com/') && !location.href.includes('/p/')) {
    setTimeout(injectButton, 2000);
}
