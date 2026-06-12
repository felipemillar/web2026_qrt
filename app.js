/* ==========================================================================
   QRT SOLUTIONS - COMING SOON MACOS DYNAMIC WAVES
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. MACOS-STYLE DYNAMIC WAVES ENGINE WITH 3D DEPTH & RETINA HD SCALING
    // ==========================================================================
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let waves = [];

        // Logical layout dimensions (CSS pixels)
        let logicalWidth = window.innerWidth;
        let logicalHeight = window.innerHeight;

        function resizeCanvas() {
            const dpr = window.devicePixelRatio || 1;
            logicalWidth = window.innerWidth;
            logicalHeight = window.innerHeight;
            
            // Scale physical canvas pixels for high-density (Retina/4K) displays
            canvas.width = logicalWidth * dpr;
            canvas.height = logicalHeight * dpr;
            
            // Constrain visual size using CSS
            canvas.style.width = logicalWidth + 'px';
            canvas.style.height = logicalHeight + 'px';
            
            // Normalize coordinate system and scale context
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            
            initWaves();
        }

        // Create a new randomized wave crossing the screen at horizontal, vertical, or diagonal angles
        function createRandomWave(onScreenInit = false) {
            const w = logicalWidth;
            const h = logicalHeight;
            const R = Math.sqrt(w * w + h * h) / 2;
            
            // 3D Depth Factor: z ranges from 0.15 (deep background) to 1.0 (foreground)
            const z = 0.15 + Math.random() * 0.85;
            
            // Choose a random angle
            const angles = [
                0,                  // Horizontal (moving down/up)
                Math.PI,            // Horizontal opposite
                Math.PI / 2,        // Vertical (moving right/left)
                -Math.PI / 2,       // Vertical opposite
                Math.PI / 4,        // Diagonal 45 deg
                -Math.PI / 4,       // Diagonal -45 deg
                Math.PI * 0.15,     // Soft diagonal
                -Math.PI * 0.15
            ];
            const angle = angles[Math.floor(Math.random() * angles.length)];
            
            // Travel range perpendicular to the wave orientation
            const dStart = -R - 180;
            const dEnd = R + 180;
            
            // Slide speed: scale with depth (z) so distant waves move slower
            const baseSpeed = 0.2 + Math.random() * 0.45;
            const speedD = baseSpeed * z * (Math.random() < 0.5 ? 1 : -1);
            
            // Starting position: distribute randomly if initial build, otherwise place off-screen
            let d;
            if (onScreenInit) {
                d = dStart + Math.random() * (dEnd - dStart);
            } else {
                d = speedD > 0 ? dStart : dEnd;
            }
            
            // Wave amplitudes scale with depth (z) to make background waves flatter
            const baseAmplitude1 = (15 + z * 35) + Math.random() * 10; // 15px (back) up to 60px (front)
            const baseAmplitude2 = (1 + z * 3);                        // secondary micro-curves
            
            // Select one of the corporate pastel colors
            const colors = [
                { rgb: '99, 102, 241' },   // Indigo
                { rgb: '139, 92, 246' },   // Violet
                { rgb: '6, 182, 212' },    // Cyan
                { rgb: '16, 185, 129' },   // Mint
                { rgb: '59, 130, 246' },   // Blue (Standard)
                { rgb: '96, 165, 250' },   // Light Sky Blue
                { rgb: '147, 197, 253' }   // Soft Pastel Blue
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // Opacity scales with depth (z): background is faint, foreground is more visible
            const baseOpacity = 0.08 + (z * 0.5); // 0.15 to 0.58 opacity
            
            // Line width scales with depth (z)
            const lineWidth = 0.4 + (z * 1.5); // 0.55px (back) to 1.9px (front)
            
            return {
                z: z, // virtual depth coordinate
                angle: angle,
                d: d,
                dStart: dStart,
                dEnd: dEnd,
                speedD: speedD,
                baseAmplitude1: baseAmplitude1,
                baseAmplitude2: baseAmplitude2,
                amplitude1: baseAmplitude1,
                amplitude2: baseAmplitude2,
                frequency1: 0.002 + Math.random() * 0.0015,
                frequency2: 0.004 + Math.random() * 0.002,
                // Wave morphing speed scales with depth (z)
                speed1: (0.0005 + Math.random() * 0.001) * z * (Math.random() < 0.5 ? 1 : -1),
                speed2: (0.001 + Math.random() * 0.0015) * z * (Math.random() < 0.5 ? 1 : -1),
                phase1: Math.random() * 100,
                phase2: Math.random() * 100,
                colorRgb: color.rgb,
                baseOpacity: baseOpacity,
                lineWidth: lineWidth
            };
        }

        // Initialize active wave set (distributed on screen initially)
        function initWaves() {
            waves = [];
            // Maintain 7 active waves for rich depth complexity
            for (let i = 0; i < 7; i++) {
                waves.push(createRandomWave(true));
            }
        }

        // Draw a single wave layer at its specific rotation, translation, and morphing state
        function drawWave(wave) {
            const w = logicalWidth;
            const h = logicalHeight;
            const cosT = Math.cos(wave.angle);
            const sinT = Math.sin(wave.angle);
            
            // 1. Advance phases
            wave.phase1 += wave.speed1;
            wave.phase2 += wave.speed2;

            // 2. Calculate boundary fade opacity
            const totalDist = Math.abs(wave.dEnd - wave.dStart);
            const distFromStart = Math.abs(wave.d - wave.dStart);
            const distToEnd = Math.abs(wave.d - wave.dEnd);
            
            let boundaryOpacity = 1.0;
            const fadeThreshold = totalDist * 0.15;
            
            if (distFromStart < fadeThreshold) {
                boundaryOpacity = distFromStart / fadeThreshold;
            } else if (distToEnd < fadeThreshold) {
                boundaryOpacity = distToEnd / fadeThreshold;
            }
            
            const finalOpacity = boundaryOpacity * wave.baseOpacity;

            // 3. Setup drop shadow for 3D depth separation (only for middle/foreground waves)
            if (wave.z > 0.4) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
                ctx.shadowBlur = 12 * wave.z;
                ctx.shadowOffsetY = 6 * wave.z;
                ctx.shadowOffsetX = -2 * wave.z;
            } else {
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowOffsetX = 0;
            }

            // 4. Draw fill area
            const L = Math.sqrt(w * w + h * h) * 0.7;
            const step = 8;
            
            ctx.beginPath();
            let startGx = w / 2 - L * cosT - wave.d * sinT;
            let startGy = h / 2 - L * sinT + wave.d * cosT;
            ctx.moveTo(startGx, startGy);

            // Draw wave profile
            for (let u = -L; u <= L; u += step) {
                let sin1 = Math.sin(u * wave.frequency1 + wave.phase1) * wave.amplitude1;
                let sin2 = Math.cos(u * wave.frequency2 + wave.phase2) * wave.amplitude2;
                let v = sin1 + sin2;

                let gx = w / 2 + u * cosT - (wave.d + v) * sinT;
                let gy = h / 2 + u * sinT + (wave.d + v) * cosT;
                ctx.lineTo(gx, gy);
            }

            // Close polygon to the offset boundary (120px perpendicular)
            let endOffsetGx = w / 2 + L * cosT - (wave.d + 120) * sinT;
            let endOffsetGy = h / 2 + L * sinT + (wave.d + 120) * cosT;
            let startOffsetGx = w / 2 - L * cosT - (wave.d + 120) * sinT;
            let startOffsetGy = h / 2 - L * sinT + (wave.d + 120) * cosT;
            
            ctx.lineTo(endOffsetGx, endOffsetGy);
            ctx.lineTo(startOffsetGx, startOffsetGy);
            ctx.closePath();

            // Fill with perpendicular linear gradient
            const gradient = ctx.createLinearGradient(
                w / 2 - wave.d * sinT,
                h / 2 + wave.d * cosT,
                w / 2 - (wave.d + 120) * sinT,
                h / 2 + (wave.d + 120) * cosT
            );
            gradient.addColorStop(0, `rgba(${wave.colorRgb}, ${finalOpacity * 0.12})`);
            gradient.addColorStop(1, `rgba(${wave.colorRgb}, 0.00)`);
            ctx.fillStyle = gradient;
            ctx.fill();

            // 5. Draw top ridge stroke with high-definition linear gradient
            ctx.beginPath();
            let first = true;
            for (let u = -L; u <= L; u += step) {
                let sin1 = Math.sin(u * wave.frequency1 + wave.phase1) * wave.amplitude1;
                let sin2 = Math.cos(u * wave.frequency2 + wave.phase2) * wave.amplitude2;
                let v = sin1 + sin2;

                let gx = w / 2 + u * cosT - (wave.d + v) * sinT;
                let gy = h / 2 + u * sinT + (wave.d + v) * cosT;
                
                if (first) {
                    ctx.moveTo(gx, gy);
                    first = false;
                } else {
                    ctx.lineTo(gx, gy);
                }
            }
            
            // Create a stroke gradient across the screen to fade edges beautifully
            const strokeGradient = ctx.createLinearGradient(0, 0, w, h);
            strokeGradient.addColorStop(0, `rgba(${wave.colorRgb}, ${finalOpacity * 0.15})`);
            strokeGradient.addColorStop(0.5, `rgba(${wave.colorRgb}, ${finalOpacity * 0.85})`);
            strokeGradient.addColorStop(1, `rgba(${wave.colorRgb}, ${finalOpacity * 0.15})`);
            
            ctx.strokeStyle = strokeGradient;
            ctx.lineWidth = wave.lineWidth;
            ctx.stroke();

            // Reset shadows to not affect other drawings
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowOffsetX = 0;
        }

        // Animation Loop with Z-Sorting lifecycle management
        function animate() {
            ctx.clearRect(0, 0, logicalWidth, logicalHeight);
            
            // Set screen blend mode for glowing overlays
            ctx.globalCompositeOperation = 'screen';
            
            // Update waves positions and filter dead ones
            for (let i = waves.length - 1; i >= 0; i--) {
                let wave = waves[i];
                
                // Move wave perpendicularly
                wave.d += wave.speedD;
                
                // Check if wave is fully off-screen (dead)
                const isDead = (wave.speedD > 0 && wave.d > wave.dEnd) ||
                               (wave.speedD < 0 && wave.d < wave.dStart);
                               
                if (isDead) {
                    // Spawn a fresh off-screen wave to replace it
                    waves[i] = createRandomWave(false);
                }
            }
            
            // 3D Z-sorting: Sort waves by z coordinate (draw lowest z first)
            waves.sort((a, b) => a.z - b.z);
            
            // Draw waves in sorted order
            for (let i = 0; i < waves.length; i++) {
                drawWave(waves[i]);
            }
            
            ctx.globalCompositeOperation = 'source-over';
            requestAnimationFrame(animate);
        }



        // Initialize and Run
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animate();
    }

    // ==========================================================================
    // 2. COUNTDOWN TIMER (TARGET: JUNE 30, 2026)
    // ==========================================================================
    const launchDate = new Date('June 30, 2026 09:00:00').getTime();
    
    const daysEl = document.getElementById('timer-days');
    const hoursEl = document.getElementById('timer-hours');
    const minutesEl = document.getElementById('timer-minutes');
    const secondsEl = document.getElementById('timer-seconds');
    
    function updateCountdown() {
        const now = new Date().getTime();
        const difference = launchDate - now;
        
        if (difference < 0) {
            if (daysEl) daysEl.innerText = '00';
            if (hoursEl) hoursEl.innerText = '00';
            if (minutesEl) minutesEl.innerText = '00';
            if (secondsEl) secondsEl.innerText = '00';
            return;
        }
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        if (daysEl) daysEl.innerText = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.innerText = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.innerText = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.innerText = String(seconds).padStart(2, '0');
    }
    
    setInterval(updateCountdown, 1000);
    updateCountdown();


});
