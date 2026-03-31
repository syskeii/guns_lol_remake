// Default Data if LocalStorage is empty
const defaultProfile = {
    username: "syskei1",
    bio: "i like romance animes and love to code. welcome to my card ^^",
    pfpUrl: "assets/Untitled342_20260304161053.png",
    bgUrl: "assets/newbanner.png",
    musicUrl: "assets/MYGOD.mp3",
    cardBgHex: "#0a0a0a",
    cardOpacity: "0.4",
    textColor: "#ffffff",
    accentColor: "#ffffff",
    pfpShape: "50%",
    layout: "layout-center",
    enableTilt: "true",
    links: [
        { id: "discord-1", platform: "discord", type: "text", url: "syskei1" },
        { id: "youtube-1", platform: "youtube", type: "url", url: "https://youtube.com/@syskei1" },
        { id: "tiktok-1", platform: "tiktok", type: "url", url: "https://www.tiktok.com/@syswastaken" },
        { id: "globe-1", platform: "globe", type: "url", url: "https://luhhhzaee.github.io/thumbnails/" }
    ]
};

// State
let profileData = JSON.parse(localStorage.getItem('gunslol_profile')) || { ...defaultProfile };

// Elements - DOM Nodes
const enterOverlay = document.getElementById('enter-overlay');
const mainContent = document.getElementById('main-content');
const bgMusic = document.getElementById('bg-music');
const bgMusicSource = document.getElementById('bg-music-source');
const bgContainer = document.getElementById('bg-container');
const profileCard = document.getElementById('profile-card');
const profileCardWrapper = document.getElementById('profile-card-wrapper');
const snowCanvas = document.getElementById('snow-canvas');

// PFP & Text
const pfpImage = document.getElementById('pfp-image');
const usernameText = document.getElementById('username-text');
const bioText = document.getElementById('bio-text');
const socialLinksContainer = document.getElementById('social-links-container');

// Modal Elements
const textModal = document.getElementById('text-modal');
const modalPlatformIcon = document.getElementById('modal-platform-icon');
const modalTitle = document.getElementById('modal-title');
const modalTextValue = document.getElementById('modal-text-value');
const modalCopyBtn = document.getElementById('modal-copy-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const customCursor = document.getElementById('custom-cursor');
const audioToggle = document.getElementById('audio-toggle');

// Dashboard Elements
const dashboard = document.getElementById('dashboard');
const closeDashboardBtn = document.getElementById('close-dashboard');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const saveBtn = document.getElementById('save-btn');
const exportBtn = document.getElementById('export-btn');

// Input Elements
const inputs = {
    username: document.getElementById('input-username'),
    bio: document.getElementById('input-bio'),
    pfp: document.getElementById('input-pfp'),
    bg: document.getElementById('input-bg'),
    music: document.getElementById('input-music'),
    cardBg: document.getElementById('input-card-bg'),
    cardOpacity: document.getElementById('input-card-opacity'),
    textColor: document.getElementById('input-text-color'),
    accentColor: document.getElementById('input-accent-color'),
    pfpShape: document.getElementById('input-pfp-shape'),
    layout: document.getElementById('input-layout'),
    enableTilt: document.getElementById('input-enable-tilt')
};

// File Uploads
const inputPfpLocal = document.getElementById('input-pfp-local');
const inputBgLocal = document.getElementById('input-bg-local');
const editLinksContainer = document.getElementById('edit-links-container');
const addLinkBtn = document.getElementById('add-link-btn');
const addLinkPlatform = document.getElementById('add-link-platform');
const addLinkType = document.getElementById('add-link-type');
const addLinkUrl = document.getElementById('add-link-url');

let typedSequence = "";
const SECRET_WORD = "admin";
let isHoveringCard = false;

// --- Initialization ---
function init() {
    applyStateToUI();
    populateDashboardInputs();
    setupEventListeners();
    initSnowParticles();
    console.log("Profile Card Loaded. Type 'admin' on your keyboard to open customizer.");
}

// Check if a URL is a video
function isVideoUrl(url) {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg)$/i);
}

// Convert Hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

// --- Image Compression to Base64 ---
function compressImage(file, maxWidth, maxHeight, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = error => reject(error);
        };
        reader.onerror = error => reject(error);
    });
}


// --- Apply State to the Main Interface ---
function applyStateToUI() {
    // Text
    usernameText.textContent = profileData.username;
    bioText.textContent = profileData.bio;
    
    // Images/Media
    pfpImage.src = profileData.pfpUrl || 'https://via.placeholder.com/150';
    
    // Background
    if (isVideoUrl(profileData.bgUrl)) {
        bgContainer.innerHTML = `<video autoplay loop muted playsinline><source src="${profileData.bgUrl}" type="video/mp4"></video>`;
        bgContainer.style.backgroundImage = 'none';
    } else {
        bgContainer.innerHTML = '';
        if (profileData.bgUrl) {
           document.documentElement.style.setProperty('--bg-image', `url(${profileData.bgUrl})`);
        }
    }

    // Colors & Styles
    const rgb = hexToRgb(profileData.cardBgHex);
    if(rgb) document.documentElement.style.setProperty('--card-bg-rgb', rgb);
    
    document.documentElement.style.setProperty('--card-opacity', profileData.cardOpacity);
    document.documentElement.style.setProperty('--text-color', profileData.textColor);
    document.documentElement.style.setProperty('--accent-color', profileData.accentColor);
    document.documentElement.style.setProperty('--pfp-radius', profileData.pfpShape);

    // Browser Identity Sync
    document.title = `${profileData.username} | Profile`;
    let favicon = document.querySelector("link[rel~='icon']");
    if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
    }
    favicon.href = profileData.pfpUrl || 'https://via.placeholder.com/150';

    // Layout
    mainContent.className = 'main-content ' + (profileData.layout || 'layout-center');

    // Make sure 'visible' is reapplied if we already entered
    if(enterOverlay.classList.contains('hidden-overlay')) {
        mainContent.classList.add('visible');
    }

    // Audio & Toggle Button
    if (profileData.musicUrl && profileData.musicUrl !== bgMusicSource.src) {
        bgMusicSource.src = profileData.musicUrl;
        bgMusic.load();
        if (enterOverlay.classList.contains('hidden-overlay')) {
             bgMusic.play().catch(e => console.log('Autoplay prevented.'));
             audioToggle.classList.remove('hidden-element');
        }
    } else if (!profileData.musicUrl) {
        bgMusic.pause();
        bgMusicSource.src = "";
        audioToggle.classList.add('hidden-element');
    }
    
    // Ensure button is visible if already playing
    if (profileData.musicUrl && enterOverlay.classList.contains('hidden-overlay')) {
        audioToggle.classList.remove('hidden-element');
    }

    // Enable/Disable tilt defaults
    if (profileData.enableTilt === "false") {
        profileCard.style.transform = `rotateX(0deg) rotateY(0deg)`;
    }

    renderSocialLinks();
}

function renderSocialLinks() {
    socialLinksContainer.innerHTML = '';
    // ensure links exist before iteration (safeguard)
    if (!profileData.links) profileData.links = [];
    
    profileData.links.forEach((link, idx) => {
        const a = document.createElement('a');
        
        // Handle URL vs Text Popup Links
        if (link.type === 'text') {
            a.href = "#";
            a.addEventListener('click', (e) => {
                e.preventDefault();
                showTextModal(link.platform, link.url);
            });
        } else {
            a.href = link.url;
            a.target = '_blank';
        }

        a.className = `social-icon`;
        a.setAttribute('data-platform', link.platform);
        
        let iconClass = `fa-brands fa-${link.platform}`;
        if(link.platform === 'globe' || link.platform === 'envelope') {
             iconClass = `fa-solid fa-${link.platform}`;
        }
        
        a.innerHTML = `<i class="${iconClass}"></i>`;
        socialLinksContainer.appendChild(a);
    });
}

// --- Populate Dashboard Inputs ---
function populateDashboardInputs() {
    inputs.username.value = profileData.username;
    inputs.bio.value = profileData.bio;
    inputs.pfp.value = profileData.pfpUrl;
    inputs.bg.value = profileData.bgUrl;
    inputs.music.value = profileData.musicUrl || "";
    inputs.cardBg.value = profileData.cardBgHex;
    inputs.cardOpacity.value = profileData.cardOpacity;
    inputs.textColor.value = profileData.textColor;
    inputs.accentColor.value = profileData.accentColor;
    inputs.pfpShape.value = profileData.pfpShape;
    inputs.layout.value = profileData.layout || 'layout-center';
    inputs.enableTilt.value = profileData.enableTilt || "true";

    renderEditLinks();
}

function renderEditLinks() {
    editLinksContainer.innerHTML = '';
    
    if (!profileData.links) profileData.links = [];
    
    profileData.links.forEach((link, index) => {
        const div = document.createElement('div');
        div.className = 'edit-link-item';
        const typeBadge = link.type === 'text' ? '<span style="font-size: 0.7rem; background: var(--accent-color); color: #000; padding: 2px 6px; border-radius: 4px; margin-right: 5px;">TEXT</span>' : '';
        
        div.innerHTML = `
            <i class="${link.platform === 'globe' ? 'fa-solid' : 'fa-brands'} fa-${link.platform}"></i>
            ${typeBadge}
            <input type="text" value="${link.url}" data-index="${index}" class="edit-link-input">
            <button class="remove-link-btn" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
        `;
        editLinksContainer.appendChild(div);
    });

    document.querySelectorAll('.remove-link-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = e.currentTarget.getAttribute('data-index');
            profileData.links.splice(idx, 1);
            applyStateToUI();
            renderEditLinks();
        });
    });

    document.querySelectorAll('.edit-link-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const idx = e.target.getAttribute('data-index');
            profileData.links[idx].url = e.target.value;
            applyStateToUI();
        });
    });
}

// --- Text Modal Controller ---
function showTextModal(platform, text) {
    let iconClass = `fa-brands fa-${platform}`;
    if (platform === 'globe' || platform === 'envelope') iconClass = `fa-solid fa-${platform}`;
    
    modalPlatformIcon.className = iconClass;
    
    // Capitalize platform name
    let displayName = platform.charAt(0).toUpperCase() + platform.slice(1);
    
    if (platform === 'globe') {
        modalTitle.textContent = 'Website Content';
    } else if (platform === 'envelope') {
        modalTitle.textContent = 'Email Address';
    } else {
        modalTitle.textContent = `${displayName} Username`;
    }
    
    modalTextValue.textContent = text;
    
    // Reset copy button UI
    modalCopyBtn.innerHTML = `<i class="fa-solid fa-copy"></i>`;
    modalCopyBtn.classList.remove('copied');
    
    // Bind copy action
    modalCopyBtn.onclick = () => {
        navigator.clipboard.writeText(text);
        modalCopyBtn.innerHTML = `<i class="fa-solid fa-check"></i>`;
        modalCopyBtn.classList.add('copied');
        setTimeout(() => {
            modalCopyBtn.innerHTML = `<i class="fa-solid fa-copy"></i>`;
            modalCopyBtn.classList.remove('copied');
        }, 2000);
    };
    
    textModal.classList.remove('hidden-modal');
}

// --- Background Particles (Snow) ---
function initSnowParticles() {
    const ctx = snowCanvas.getContext('2d');
    let width = snowCanvas.width = window.innerWidth;
    let height = snowCanvas.height = window.innerHeight;
    const particles = [];

    // Create particles
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 2 + 1, // radius 1-3
            d: Math.random() * 100, // density
            vx: Math.random() * 1 - 0.5,
            vy: Math.random() * 1 + 0.5
        });
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.beginPath();
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            ctx.moveTo(p.x, p.y);
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
        }
        ctx.fill();
        update();
    }

    function update() {
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.y += p.vy;
            p.x += p.vx;

            // Reset bounds
            if (p.x > width + 5 || p.x < -5 || p.y > height) {
                if (i % 3 > 0) { // 66% go top
                    particles[i] = { x: Math.random() * width, y: -10, r: p.r, d: p.d, vx: p.vx, vy: p.vy };
                } else { // enter from left/right
                    if (Math.sin(p.d) > 0) {
                        particles[i] = { x: -5, y: Math.random() * height, r: p.r, d: p.d, vx: p.vx, vy: p.vy };
                    } else {
                        particles[i] = { x: width + 5, y: Math.random() * height, r: p.r, d: p.d, vx: p.vx, vy: p.vy };
                    }
                }
            }
        }
    }

    setInterval(draw, 33); // ~30fps
    window.addEventListener('resize', () => {
        width = snowCanvas.width = window.innerWidth;
        height = snowCanvas.height = window.innerHeight;
    });
}

// --- 3D Hover Tilt Logic ---
function handle3DTilt(e) {
    if(profileData.enableTilt === "false") return;
    
    // Disable tilt on Mobile devices
    if (window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768) return;
    
    // If the dashboard is open, pause the 3D tilt in its last position
    if (!dashboard.classList.contains('hidden')) return;
    
    // Check if within wrapper to know if we are hovering card
    const rect = profileCardWrapper.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top;

    // Center of the wrapper
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Max rotation in degrees
    const maxRotate = 10;
    
    // Calculate rotation based on distance from center
    const rotateX = ((y - centerY) / centerY) * -maxRotate;
    const rotateY = ((x - centerX) / centerX) * maxRotate;
    
    profileCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

// --- Event Listeners ---
function setupEventListeners() {
    
    // Custom Cursor Tracking
    document.addEventListener('mousemove', (e) => {
        if(window.getComputedStyle(customCursor).display === 'none') return;
        
        customCursor.style.left = e.clientX + 'px';
        customCursor.style.top = e.clientY + 'px';
        
        // Check for hover targets to expand cursor
        if(e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button') || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
            customCursor.classList.add('hover');
        } else {
            customCursor.classList.remove('hover');
        }
    });

    // Check for 3D logic
    document.addEventListener('mousemove', (e) => {
        if (!mainContent.classList.contains('visible')) return;
        requestAnimationFrame(() => handle3DTilt(e));
    });

    // Reset tilt on leave (but don't reset if dashboard is intentionally freezing it)
    document.addEventListener('mouseleave', () => {
        if(profileData.enableTilt === "true" && dashboard.classList.contains('hidden')){
            profileCard.style.transform = `rotateX(0deg) rotateY(0deg)`;
        }
    });

    // Enter Overlay Click
    enterOverlay.addEventListener('click', () => {
        enterOverlay.classList.add('hidden-overlay');
        mainContent.classList.remove('hidden');
        mainContent.classList.add('visible'); // triggers staggered CSS animations
        
        if (profileData.musicUrl) {
            bgMusic.volume = 0.5;
            bgMusic.play().then(() => {
                audioToggle.classList.remove('hidden-element');
            }).catch(console.log);
        }
    });
    
    // Audio Controls
    const muteBtn = document.getElementById('mute-btn');
    const volumeSlider = document.getElementById('volume-slider');
    
    muteBtn.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        } else {
            bgMusic.pause();
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        }
    });
    
    volumeSlider.addEventListener('input', (e) => {
        const vol = parseFloat(e.target.value);
        bgMusic.volume = vol;
        if (vol === 0) {
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        } else if (vol < 0.5) {
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-low"></i>';
        } else {
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        }
    });

    // Modal Handlers
    closeModalBtn.addEventListener('click', () => textModal.classList.add('hidden-modal'));
    textModal.addEventListener('click', (e) => {
        if(e.target === textModal) textModal.classList.add('hidden-modal');
    });

    // Hidden Keylogger logic for 'admin'
    document.addEventListener('keydown', (e) => {
        if (!enterOverlay.classList.contains('hidden-overlay')) {
            enterOverlay.click();
            return;
        }

        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        typedSequence += e.key.toLowerCase();
        if (typedSequence.length > SECRET_WORD.length) {
            typedSequence = typedSequence.slice(-SECRET_WORD.length);
        }

        if (typedSequence === SECRET_WORD) {
            dashboard.classList.toggle('hidden');
            typedSequence = ""; 
        }
    });

    closeDashboardBtn.addEventListener('click', () => dashboard.classList.add('hidden'));

    // Dashboard Navigation Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        });
    });

    // Text & Color Inputs Live Update
    Object.keys(inputs).forEach(key => {
        inputs[key].addEventListener('input', (e) => {
            let val = e.target.value;
            const updateState = () => {
                switch(key) {
                    case 'username': profileData.username = val; break;
                    case 'bio': profileData.bio = val; break;
                    case 'pfp': profileData.pfpUrl = val; break;
                    case 'bg': profileData.bgUrl = val; break;
                    case 'music': profileData.musicUrl = val; break;
                    case 'cardBg': profileData.cardBgHex = val; break;
                    case 'cardOpacity': profileData.cardOpacity = val; break;
                    case 'textColor': profileData.textColor = val; break;
                    case 'accentColor': profileData.accentColor = val; break;
                    case 'pfpShape': profileData.pfpShape = val; break;
                    case 'layout': profileData.layout = val; break;
                    case 'enableTilt': profileData.enableTilt = val; break;
                }
                applyStateToUI();
            };

            if (key === 'layout') {
                // Motion blur morph: blur peaks at 40%, swap layout there, unblur after
                profileCard.classList.remove('layout-morphing');
                // Force reflow to restart animation if switching rapidly
                void profileCard.offsetWidth;
                profileCard.classList.add('layout-morphing');
                
                // Swap layout at the peak of the blur (40% of 900ms = 360ms)
                setTimeout(() => {
                    profileData.layout = val;
                    applyStateToUI();
                }, 360);
                
                // Remove morphing class when animation finishes
                setTimeout(() => {
                    profileCard.classList.remove('layout-morphing');
                }, 900);
            } else {
                updateState();
            }
        });
    });

    // Add Link
    addLinkBtn.addEventListener('click', () => {
        const platform = addLinkPlatform.value;
        const type = addLinkType.value;
        const url = addLinkUrl.value;
        if (url) {
            if(!profileData.links) profileData.links = [];
            profileData.links.push({
                id: `${platform}-${Date.now()}`,
                platform: platform,
                type: type,
                url: url
            });
            addLinkUrl.value = '';
            applyStateToUI();
            renderEditLinks();
        }
    });

    // File Upload Listeners
    inputPfpLocal.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const base64 = await compressImage(file, 300, 300, 0.8);
                profileData.pfpUrl = base64;
                inputs.pfp.value = "";
                applyStateToUI();
            } catch (err) { alert("Image error"); }
        }
    });

    inputBgLocal.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const base64 = await compressImage(file, 1920, 1080, 0.7);
                profileData.bgUrl = base64;
                inputs.bg.value = "";
                applyStateToUI();
            } catch (err) { alert("Image error"); }
        }
    });

    // Save Button
    saveBtn.addEventListener('click', () => {
        try {
            localStorage.setItem('gunslol_profile', JSON.stringify(profileData));
            const oldText = saveBtn.textContent;
            saveBtn.textContent = "Saved Successfully!";
            saveBtn.style.background = "#28a745";
            setTimeout(() => {
                saveBtn.textContent = oldText;
                saveBtn.style.background = "var(--accent-color)";
            }, 2000);
        } catch (e) {
            console.error(e);
            alert("Error saving: Browser storage is full!");
        }
    });

    // Export Button
    exportBtn.addEventListener('click', () => {
        const configText = `const defaultProfile = ${JSON.stringify(profileData, null, 4)};`;
        navigator.clipboard.writeText(configText).then(() => {
            const oldText = exportBtn.innerHTML;
            exportBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied Config!`;
            exportBtn.style.background = "#28a745";
            exportBtn.style.borderColor = "#28a745";
            
            setTimeout(() => {
                exportBtn.innerHTML = oldText;
                exportBtn.style.background = "transparent";
                exportBtn.style.borderColor = "var(--accent-color)";
            }, 4000);
            
            alert("Configuration copied to clipboard!\n\nTo make your profile public on GitHub Pages:\n1. Open your 'app.js' file in your editor.\n2. In the very first few lines, completely replace the existing `const defaultProfile = {...}` block with the text you just copied.\n3. Save and push your changes to GitHub!");
        });
    });
}

// Boot up
window.addEventListener('DOMContentLoaded', init);
