// ===== 粒子系统 =====
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.colors = ['#8b5cf6', '#3b82f6', '#f97316', '#ec4899', '#a855f7'];

        this.init();
        this.animate();
        this.setupEventListeners();
    }

    init() {
        this.resize();
        // 创建粒子
        for (let i = 0; i < 80; i++) {
            this.particles.push(this.createParticle());
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            opacity: Math.random() * 0.5 + 0.2,
            pulse: Math.random() * Math.PI * 2
        };
    }

    drawParticle(particle) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fillStyle = particle.color;
        this.ctx.globalAlpha = particle.opacity + Math.sin(particle.pulse) * 0.2;
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }

    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = this.particles[i].color;
                    this.ctx.globalAlpha = 0.1 * (1 - distance / 150);
                    this.ctx.stroke();
                    this.ctx.globalAlpha = 1;
                }
            }
        }
    }

    updateParticle(particle) {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.pulse += 0.02;

        // 鼠标吸引效果
        const dx = this.mouseX - particle.x;
        const dy = this.mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200) {
            particle.x += dx * 0.002;
            particle.y += dy * 0.002;
        }

        // 边界处理
        if (particle.x < 0 || particle.x > this.canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > this.canvas.height) particle.speedY *= -1;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制渐变背景
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2
        );
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.05)');
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.02)');
        gradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 更新和绘制粒子
        this.particles.forEach(particle => {
            this.updateParticle(particle);
            this.drawParticle(particle);
        });

        this.drawConnections();

        requestAnimationFrame(() => this.animate());
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());

        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }
}

// ===== 能量条动画 =====
class PowerMeter {
    constructor() {
        this.percentage = document.querySelector('.percentage');
        this.meterFill = document.querySelector('.meter-fill');
        this.targetValue = 100;
        this.currentValue = 0;
    }

    animate() {
        const duration = 2000;
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 使用缓动函数
            const easeOut = 1 - Math.pow(1 - progress, 3);
            this.currentValue = Math.floor(easeOut * this.targetValue);

            this.percentage.textContent = this.currentValue;

            // 更新SVG圆环
            const circumference = 283;
            const offset = circumference - (circumference * this.currentValue / 100);
            this.meterFill.style.strokeDashoffset = offset;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    }
}

// ===== 滚动动画 =====
class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.setupObserver();
    }

    setupObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');

                    // 触发能力条动画
                    if (entry.target.classList.contains('character-card')) {
                        const statFills = entry.target.querySelectorAll('.stat-fill');
                        statFills.forEach((fill, index) => {
                            fill.style.setProperty('--delay', index);
                        });
                    }
                }
            });
        }, this.observerOptions);

        // 观察所有需要动画的元素
        document.querySelectorAll('.character-card, .ability-item, .quote').forEach(el => {
            observer.observe(el);
        });
    }
}

// ===== 卡片悬浮效果 =====
class CardHoverEffect {
    constructor() {
        this.cards = document.querySelectorAll('.character-card');
        this.setupHover();
    }

    setupHover() {
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }
}

// ===== 平滑滚动 =====
class SmoothScroll {
    constructor() {
        this.setupSmoothScroll();
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// ===== 导航栏滚动效果 =====
class NavbarScroll {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.setupScroll();
    }

    setupScroll() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                this.navbar.style.background = 'rgba(10, 10, 15, 0.95)';
            } else {
                this.navbar.style.background = 'rgba(10, 10, 15, 0.8)';
            }
        });
    }
}

// ===== 标题闪烁效果 =====
class TitleFlicker {
    constructor() {
        this.title100 = document.querySelector('.title-100');
        this.setupFlicker();
    }

    setupFlicker() {
        // 随机闪烁效果
        setInterval(() => {
            if (Math.random() > 0.95) {
                this.title100.style.opacity = '0.8';
                setTimeout(() => {
                    this.title100.style.opacity = '1';
                }, 50);
            }
        }, 100);
    }
}

// ===== 能量爆发效果 =====
class PowerBurst {
    constructor() {
        this.createBurstElements();
    }

    createBurstElements() {
        const hero = document.querySelector('.hero');

        // 点击触发能量爆发
        hero.addEventListener('click', (e) => {
            this.burst(e.clientX, e.clientY);
        });
    }

    burst(x, y) {
        const burstCount = 20;
        const colors = ['#8b5cf6', '#3b82f6', '#f97316', '#ec4899'];

        for (let i = 0; i < burstCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
            `;

            document.body.appendChild(particle);

            const angle = (Math.PI * 2 * i) / burstCount;
            const velocity = 5 + Math.random() * 10;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;

            let posX = 0;
            let posY = 0;
            let opacity = 1;

            const animate = () => {
                posX += vx;
                posY += vy;
                opacity -= 0.02;

                particle.style.transform = `translate(${posX}px, ${posY}px)`;
                particle.style.opacity = opacity;

                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            };

            requestAnimationFrame(animate);
        }
    }
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    // 初始化粒子系统
    const canvas = document.getElementById('particles');
    new ParticleSystem(canvas);

    // 初始化能量条
    const powerMeter = new PowerMeter();
    setTimeout(() => powerMeter.animate(), 500);

    // 初始化滚动动画
    new ScrollAnimations();

    // 初始化卡片悬浮效果
    new CardHoverEffect();

    // 初始化平滑滚动
    new SmoothScroll();

    // 初始化导航栏效果
    new NavbarScroll();

    // 初始化标题闪烁
    new TitleFlicker();

    // 初始化能量爆发
    new PowerBurst();

    console.log('🔥 路人超能100 网页已加载');
    console.log('💡 点击Hero区域触发能量爆发效果！');
});

// ===== 添加SVG渐变定义 =====
const svgNS = "http://www.w3.org/2000/svg";
const svg = document.querySelector('.meter-circle svg');

if (svg) {
    const defs = document.createElementNS(svgNS, 'defs');
    const gradient = document.createElementNS(svgNS, 'linearGradient');
    gradient.setAttribute('id', 'gradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '0%');

    const stop1 = document.createElementNS(svgNS, 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#8b5cf6');

    const stop2 = document.createElementNS(svgNS, 'stop');
    stop2.setAttribute('offset', '50%');
    stop2.setAttribute('stop-color', '#3b82f6');

    const stop3 = document.createElementNS(svgNS, 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('stop-color', '#f97316');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    defs.appendChild(gradient);
    svg.insertBefore(defs, svg.firstChild);
}
