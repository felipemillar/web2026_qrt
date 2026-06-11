/* ==========================================================================
   QRT SOLUTIONS - COMING SOON MACOS DYNAMIC WAVES
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. MACOS-STYLE DYNAMIC WAVES ENGINE
    // ==========================================================================
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let waves = [];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initWaves();
        }

        // Create a new randomized wave crossing the screen at horizontal, vertical, or diagonal angles
        function createRandomWave(onScreenInit = false) {
            const w = canvas.width;
            const h = canvas.height;
            const R = Math.sqrt(w * w + h * h) / 2;
            
            // Choose a random angle (0 = horizontal, PI/2 = vertical, PI/4 = diagonal, etc.)
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
            
            // Slide speed (pixels per frame)
            const speedD = (0.2 + Math.random() * 0.45) * (Math.random() < 0.5 ? 1 : -1);
            
            // Starting position: distribute randomly if initial build, otherwise place off-screen
            let d;
            if (onScreenInit) {
                d = dStart + Math.random() * (dEnd - dStart);
            } else {
                d = speedD > 0 ? dStart : dEnd;
            }
            
            // Wave parameters (large sweeping curves, no micro-undulations)
            const baseAmplitude1 = 35 + Math.random() * 15;  // 35 to 50px amplitude
            const baseAmplitude2 = 2 + Math.random() * 2;    // 2 to 4px secondary
            const baseAmplitude3 = 0;                        // disabled to remove micro-undulations
            
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
            
            return {
                angle: angle,
                d: d,
                dStart: dStart,
                dEnd: dEnd,
                speedD: speedD,
                baseAmplitude1: baseAmplitude1,
                baseAmplitude2: baseAmplitude2,
                baseAmplitude3: baseAmplitude3,
                amplitude1: baseAmplitude1,
                amplitude2: baseAmplitude2,
                amplitude3: baseAmplitude3,
                frequency1: 0.002 + Math.random() * 0.0015,   // Wavelength ~1200px to ~3000px (1-2 wide curves)
                frequency2: 0.004 + Math.random() * 0.002,    // Wavelength ~800px to ~1500px
                frequency3: 0.01,                             // Unused (amplitude is 0)
                speed1: (0.0005 + Math.random() * 0.001) * (Math.random() < 0.5 ? 1 : -1),
                speed2: (0.001 + Math.random() * 0.0015) * (Math.random() < 0.5 ? 1 : -1),
                speed3: (0.002 + Math.random() * 0.003) * (Math.random() < 0.5 ? 1 : -1),
                phase1: Math.random() * 100,
                phase2: Math.random() * 100,
                phase3: Math.random() * 100,
                colorRgb: color.rgb,
                baseOpacity: 0.6 + Math.random() * 0.25,
                lineWidth: 1.0 + Math.random() * 0.6,
                
                targetAmplitude1: baseAmplitude1,
                targetAmplitude2: baseAmplitude2,
                targetAmplitude3: baseAmplitude3
            };
        }

        // Initialize active wave set (distributed on screen initially)
        function initWaves() {
            waves = [];
            // Maintain 6 active waves flowing simultaneously
            for (let i = 0; i < 6; i++) {
                waves.push(createRandomWave(true));
            }
        }

        // Draw a single wave layer at its specific rotation, translation, and morphing state
        function drawWave(wave) {
            const w = canvas.width;
            const h = canvas.height;
            const cosT = Math.cos(wave.angle);
            const sinT = Math.sin(wave.angle);
            
            // 1. Advance phases at constant, smooth speeds for stable, organic wave morphing
            wave.phase1 += wave.speed1;
            wave.phase2 += wave.speed2;
            wave.phase3 += wave.speed3;

            // 2. Amplitudes remain fixed and stable at their base values during their stay on screen
            wave.amplitude1 = wave.baseAmplitude1;
            wave.amplitude2 = wave.baseAmplitude2;
            wave.amplitude3 = wave.baseAmplitude3;

            // 3. Calculate opacity based on proximity to entry/exit boundaries (fade in/out smoothly)
            const totalDist = Math.abs(wave.dEnd - wave.dStart);
            const distFromStart = Math.abs(wave.d - wave.dStart);
            const distToEnd = Math.abs(wave.d - wave.dEnd);
            
            let boundaryOpacity = 1.0;
            const fadeThreshold = totalDist * 0.15; // 15% travel distance fade zones
            
            if (distFromStart < fadeThreshold) {
                boundaryOpacity = distFromStart / fadeThreshold;
            } else if (distToEnd < fadeThreshold) {
                boundaryOpacity = distToEnd / fadeThreshold;
            }
            
            const finalOpacity = boundaryOpacity * wave.baseOpacity;

            // 4. Draw fill area closed to offset boundary
            const L = Math.sqrt(w * w + h * h) * 0.7; // length along baseline covering viewport
            const step = 8;
            
            ctx.beginPath();
            // Start of polygon boundary
            let startGx = w / 2 - L * cosT - wave.d * sinT;
            let startGy = h / 2 - L * sinT + wave.d * cosT;
            ctx.moveTo(startGx, startGy);

            // Draw wave profile
            for (let u = -L; u <= L; u += step) {
                let sin1 = Math.sin(u * wave.frequency1 + wave.phase1) * wave.amplitude1;
                let sin2 = Math.cos(u * wave.frequency2 + wave.phase2) * wave.amplitude2;
                let sin3 = Math.sin(u * wave.frequency3 + wave.phase3) * wave.amplitude3;
                let v = sin1 + sin2 + sin3;

                let gx = w / 2 + u * cosT - (wave.d + v) * sinT;
                let gy = h / 2 + u * sinT + (wave.d + v) * cosT;
                ctx.lineTo(gx, gy);
            }

            // Close polygon to the offset boundary (150px perpendicular)
            let endOffsetGx = w / 2 + L * cosT - (wave.d + 150) * sinT;
            let endOffsetGy = h / 2 + L * sinT + (wave.d + 150) * cosT;
            let startOffsetGx = w / 2 - L * cosT - (wave.d + 150) * sinT;
            let startOffsetGy = h / 2 - L * sinT + (wave.d + 150) * cosT;
            
            ctx.lineTo(endOffsetGx, endOffsetGy);
            ctx.lineTo(startOffsetGx, startOffsetGy);
            ctx.closePath();

            // Fill with perpendicular linear gradient
            const gradient = ctx.createLinearGradient(
                w / 2 - wave.d * sinT,
                h / 2 + wave.d * cosT,
                w / 2 - (wave.d + 150) * sinT,
                h / 2 + (wave.d + 150) * cosT
            );
            gradient.addColorStop(0, `rgba(${wave.colorRgb}, ${finalOpacity * 0.12})`);
            gradient.addColorStop(1, `rgba(${wave.colorRgb}, 0.00)`);
            ctx.fillStyle = gradient;
            ctx.fill();

            // 5. Draw top ridge stroke
            ctx.beginPath();
            let first = true;
            for (let u = -L; u <= L; u += step) {
                let sin1 = Math.sin(u * wave.frequency1 + wave.phase1) * wave.amplitude1;
                let sin2 = Math.cos(u * wave.frequency2 + wave.phase2) * wave.amplitude2;
                let sin3 = Math.sin(u * wave.frequency3 + wave.phase3) * wave.amplitude3;
                let v = sin1 + sin2 + sin3;

                let gx = w / 2 + u * cosT - (wave.d + v) * sinT;
                let gy = h / 2 + u * sinT + (wave.d + v) * cosT;
                
                if (first) {
                    ctx.moveTo(gx, gy);
                    first = false;
                } else {
                    ctx.lineTo(gx, gy);
                }
            }
            ctx.strokeStyle = `rgba(${wave.colorRgb}, ${finalOpacity * 0.85})`;
            ctx.lineWidth = wave.lineWidth;
            ctx.stroke();
        }

        // Animation Loop with lifecycle management (replacing dead waves)
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Set screen blend mode for glowing overlays
            ctx.globalCompositeOperation = 'screen';
            
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
                } else {
                    drawWave(wave);
                }
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
