// particles.js: Оптимизированная анимация частиц (без паутины)

import { state } from './state.js';

let canvas, ctx;
let particles = [];
let animationId = null;
const PARTICLE_COUNT = 40; // УМЕНЬШИЛИ КОЛИЧЕСТВО

const mouse = {
    x: null,
    y: null,
    radius: 150 
};

class Particle {
    constructor(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.radius = Math.random() * 2 + 1.5;
    }
    
    update(w, h) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;

        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;
                const directionX = forceDirectionX * force * 5;
                const directionY = forceDirectionY * force * 5;
                
                this.x -= directionX;
                this.y -= directionY;
            }
        }
    }

    draw(ctx, color) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function loop() {
    if (!ctx || !canvas) return;
    
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    
    const color = getComputedStyle(document.body).getPropertyValue('--accent-color').trim() || '#0062b1';

    particles.forEach((p) => {
        p.update(w, h);
        p.draw(ctx, color);
        // ПАУТИНУ (ЛИНИИ) УБРАЛИ, ЧТОБЫ НЕ ЛАГАЛО
    });
    
    animationId = requestAnimationFrame(loop);
}

function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

export function initParticles() {
    if (!state.get('settings').particles) return;

    canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    document.body.prepend(canvas);
    
    ctx = canvas.getContext('2d');
    resize();
    
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle(canvas.width, canvas.height));
    loop();
}

export function toggleParticles(isEnabled) {
    if (isEnabled) {
        if (!canvas) initParticles();
        else loop();
    } else {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        if (canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

export {};