const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
const uiLayer = document.getElementById('ui-layer');
const introMsg = document.getElementById('intro-msg');
const actionArea = document.getElementById('action-area');
const nameInput = document.getElementById('nameInput');
const submitBtn = document.getElementById('submitBtn');
const messageArea = document.getElementById('message-area');
const personalMsg = document.getElementById('personal-msg');
const flowersContainer = document.getElementById('flowers-container');
const nameFlowersContainer = document.getElementById('name-flowers-container');

const colorMap = {
    'A': '#FF5733', 'B': '#33FF57', 'C': '#3357FF', 'D': '#FF33A1', 'E': '#A133FF',
    'F': '#33FFF5', 'G': '#F5FF33', 'H': '#FF8333', 'I': '#33FF83', 'İ': '#3383FF',
    'J': '#8333FF', 'K': '#FF3383', 'L': '#33FFD5', 'M': '#D5FF33', 'N': '#FF33D5',
    'O': '#33D5FF', 'Ö': '#D533FF', 'P': '#FF5733', 'R': '#33FF57', 'S': '#3357FF',
    'Ş': '#FF33A1', 'T': '#A133FF', 'U': '#33FFF5', 'Ü': '#F5FF33', 'V': '#FF8333',
    'Y': '#33FF83', 'Z': '#3383FF', 'W': '#8333FF', 'Q': '#FF3383', 'X': '#33FFD5'
};

function getColorsForLetter(letter) {
    const char = letter.toUpperCase();
    const hex = colorMap[char] || '#e73030';
    return {
        main: hex,
        light: adjustBrightness(hex, 20)
    };
}

function adjustBrightness(hex, percent) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.min(255, Math.floor(r * (1 + percent / 100)));
    g = Math.min(255, Math.floor(g * (1 + percent / 100)));
    b = Math.min(255, Math.floor(b * (1 + percent / 100)));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

let width, height;
let particles = [];
let state = 'INTRO';

// Performance: max particle cap
const MAX_PARTICLES = 120;

function init() {
    resize();
    createInitialParticles();
    animate();

    setTimeout(() => {
        uiLayer.style.opacity = 1;
        startIntroSequence();
    }, 500);
}

// devicePixelRatio-aware canvas resize for crisp rendering on retina displays
function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    bgCanvas.style.width = width + 'px';
    bgCanvas.style.height = height + 'px';
    bgCanvas.width = Math.floor(width * dpr);
    bgCanvas.height = Math.floor(height * dpr);
    bgCtx.scale(dpr, dpr);
}

window.addEventListener('resize', () => {
    // Re-scale after resize
    bgCtx.setTransform(1, 0, 0, 1, 0, 0);
    resize();
});

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2;
        this.opacity = Math.random() * 0.5;
        this.targetX = null;
        this.targetY = null;
    }
    update() {
        if (this.targetX !== null) {
            this.x += (this.targetX - this.x) * 0.05;
            this.y += (this.targetY - this.y) * 0.05;
        } else {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }
    }
    draw() {
        bgCtx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        bgCtx.beginPath();
        bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        bgCtx.fill();
    }
}

function createInitialParticles() {
    // Reduced from 200 to 110 — same visual, less CPU
    for (let i = 0; i < 110; i++) particles.push(new Particle());
}

function startIntroSequence() {
    setTimeout(() => {
        const centerX = width / 2;
        const centerY = height / 2 - 50;
        // Use for loop for performance
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const t = (i / particles.length) * Math.PI * 2;
            const r = 10;
            p.targetX = centerX + r * 16 * Math.pow(Math.sin(t), 3);
            p.targetY = centerY - r * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            p.opacity = 0.8;
        }

        typeWriter("Bir kadın ismi girin, harflerinden ona özel bir çiçek buketi oluşsun.", introMsg);
    }, 1000);

    setTimeout(() => {
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.targetX = null;
            p.targetY = null;
            p.opacity = Math.random() * 0.5;
        }
        uiLayer.style.opacity = 0;

        setTimeout(() => {
            document.getElementById('intro-box').style.display = 'none';
            actionArea.style.display = 'block';
            uiLayer.style.opacity = 1;
            state = 'INPUT';
        }, 1000);
    }, 5000);
}

function typeWriter(text, element, speed = 50) {
    let i = 0;
    element.innerHTML = "";
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

nameInput.addEventListener('input', (e) => {
    const val = e.target.value;
    if (val.length > 0) {
        messageArea.style.visibility = 'hidden';
        messageArea.style.opacity = 0;
    }
});

nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && nameInput.value.trim() !== '') {
        finishBouquet();
    }
});

submitBtn.addEventListener('click', () => {
    if (nameInput.value.trim() !== '') {
        finishBouquet();
    }
});

function finishBouquet() {
    state = 'BOUQUET';
    const name = nameInput.value.trim();
    actionArea.style.opacity = 0;
    setTimeout(() => actionArea.style.display = 'none', 1000);

    nameFlowersContainer.innerHTML = '';

    const totalFlowers = name.replace(/\s/g, '').length * 3;
    const angleRange = 80;
    const angleStep = angleRange / (totalFlowers - 1 || 1);
    let flowerIndex = 0;

    // Use DocumentFragment for batch DOM insertion (much faster than innerHTML +=)
    const fragment = document.createDocumentFragment();

    for (let char of name) {
        if (char === ' ') continue;
        const colors = getColorsForLetter(char);

        for (let i = 0; i < 3; i++) {
            const angle = -angleRange / 2 + (flowerIndex * angleStep);
            const flowerHeight = 35 + Math.random() * 20;
            const div = document.createElement('div');
            div.className = 'flower flower--name-based';
            div.style.cssText = `--flower-color: ${colors.main}; --flower-color-light: ${colors.light}; --fl-speed: ${0.5 + Math.random()}s; --flower-height: ${flowerHeight}vmin; transform: translateX(-50%) rotate(${angle}deg);`;
            div.innerHTML = `
                <div class="flower__leafs">
                    <div class="flower__leaf flower__leaf--1"></div>
                    <div class="flower__leaf flower__leaf--2"></div>
                    <div class="flower__leaf flower__leaf--3"></div>
                    <div class="flower__leaf flower__leaf--4"></div>
                    <div class="flower__white-circle"></div>
                    <div class="flower__light flower__light--1"></div>
                    <div class="flower__light flower__light--2"></div>
                    <div class="flower__light flower__light--3"></div>
                    <div class="flower__light flower__light--4"></div>
                    <div class="flower__light flower__light--5"></div>
                    <div class="flower__light flower__light--6"></div>
                    <div class="flower__light flower__light--7"></div>
                    <div class="flower__light flower__light--8"></div>
                </div>
                <div class="flower__line">
                    <div class="flower__line__leaf flower__line__leaf--1"></div>
                    <div class="flower__line__leaf flower__line__leaf--2"></div>
                    <div class="flower__line__leaf flower__line__leaf--3"></div>
                    <div class="flower__line__leaf flower__line__leaf--4"></div>
                </div>
            `;
            fragment.appendChild(div);
            flowerIndex++;
        }
    }

    nameFlowersContainer.appendChild(fragment);

    flowersContainer.style.display = 'block';

    personalMsg.innerText = `${name}, Dünya Kadınlar Günün Kutlu Olsun 💐`;
    messageArea.style.visibility = 'visible';
    setTimeout(() => {
        messageArea.style.opacity = 1;
    }, 500);
}

function animate() {
    bgCtx.clearRect(0, 0, width, height);

    // Use for loop instead of forEach for better performance
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }

    if (state === 'BOUQUET') {
        // Floating petals removed — they were causing lag
        // Remove any stray particles that go off screen
        if (particles.length > 110) {
            particles = particles.filter(p => p.y < height + 10);
        }
    }

    requestAnimationFrame(animate);
}

init();
