// QRT Solutions - Coming Soon v2.0
// Background waves canvas & launch timer logic

document.addEventListener('DOMContentLoaded', () => {

    // Canvas waves logic (DPR scale fix included)
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let waves = [];

        // Screen dimensions (logical viewport pixels)
        let logicalWidth = window.innerWidth;
        let logicalHeight = window.innerHeight;

        function resizeCanvas() {
            const dpr = window.devicePixelRatio || 1;
            logicalWidth = window.innerWidth;
            logicalHeight = window.innerHeight;
            
            // Adjust canvas resolution for Retina / 4K monitors
            canvas.width = logicalWidth * dpr;
            canvas.height = logicalHeight * dpr;
            
            // Limit CSS dimensions
            canvas.style.width = logicalWidth + 'px';
            canvas.style.height = logicalHeight + 'px';
            
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            
            initWaves();
        }

        // Generate a wave structure with randomized depth & angles
        function createRandomWave(onScreenInit = false) {
            const w = logicalWidth;
            const h = logicalHeight;
            const R = Math.sqrt(w * w + h * h) / 2;
            
            // z-axis factor for 3D fake depth (0.15 to 1.0)
            const z = 0.15 + Math.random() * 0.85;
            
            const angles = [
                0,                  // horizontal
                Math.PI,            
                Math.PI / 2,        // vertical
                -Math.PI / 2,       
                Math.PI / 4,        // diagonal
                -Math.PI / 4,       
                Math.PI * 0.15,     // subtle slant
                -Math.PI * 0.15
            ];
            const angle = angles[Math.floor(Math.random() * angles.length)];
            
            const dStart = -R - 180;
            const dEnd = R + 180;
            
            // base movement speed (deep waves drift slower)
            const baseSpeed = 0.2 + Math.random() * 0.45;
            // const baseSpeed = 0.6; // debug: too fast for bg
            const speedD = baseSpeed * z * (Math.random() < 0.5 ? 1 : -1);
            
            let d;
            if (onScreenInit) {
                d = dStart + Math.random() * (dEnd - dStart);
            } else {
                d = speedD > 0 ? dStart : dEnd;
            }
            
            // amplitude scales with depth mapping
            const baseAmplitude1 = (15 + z * 35) + Math.random() * 10;
            const baseAmplitude2 = (1 + z * 3);
            
            // brand color palette
            const colors = [
                { rgb: '99, 102, 241' },   // indigo
                { rgb: '139, 92, 246' },   // violet
                { rgb: '6, 182, 212' },    // cyan
                { rgb: '16, 185, 129' },   // mint
                { rgb: '59, 130, 246' },   
                { rgb: '96, 165, 250' },   
                { rgb: '147, 197, 253' }   
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // alpha based on depth layer
            const baseOpacity = 0.08 + (z * 0.5);
            const lineWidth = 0.4 + (z * 1.5);
            
            return {
                z: z, 
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
                speed1: (0.0005 + Math.random() * 0.001) * z * (Math.random() < 0.5 ? 1 : -1),
                speed2: (0.001 + Math.random() * 0.0015) * z * (Math.random() < 0.5 ? 1 : -1),
                phase1: Math.random() * 100,
                phase2: Math.random() * 100,
                colorRgb: color.rgb,
                baseOpacity: baseOpacity,
                lineWidth: lineWidth
            };
        }

        // populate screen waves
        function initWaves() {
            waves = [];
            // 7 waves is optimal for depth layering without choking mobile CPUs
            for (let i = 0; i < 7; i++) {
                waves.push(createRandomWave(true));
            }
        }

        // render single wave layer
        function drawWave(wave) {
            const w = logicalWidth;
            const h = logicalHeight;
            const cosT = Math.cos(wave.angle);
            const sinT = Math.sin(wave.angle);
            
            // Analog speed drift (non-linear phase steps for organic look)
            const driftFactor = 1 + Math.sin(Date.now() * 0.00015) * 0.12;
            wave.phase1 += wave.speed1 * driftFactor;
            wave.phase2 += wave.speed2 * driftFactor;

            // boundary limits calculations
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

            // 3D shadow falloff
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

            // path drawing
            const L = Math.sqrt(w * w + h * h) * 0.7;
            const step = 8;
            
            ctx.beginPath();
            let startGx = w / 2 - L * cosT - wave.d * sinT;
            let startGy = h / 2 - L * sinT + wave.d * cosT;
            ctx.moveTo(startGx, startGy);

            // draw points
            for (let u = -L; u <= L; u += step) {
                let sin1 = Math.sin(u * wave.frequency1 + wave.phase1) * wave.amplitude1;
                let sin2 = Math.cos(u * wave.frequency2 + wave.phase2) * wave.amplitude2;
                let v = sin1 + sin2;

                let gx = w / 2 + u * cosT - (wave.d + v) * sinT;
                let gy = h / 2 + u * sinT + (wave.d + v) * cosT;
                ctx.lineTo(gx, gy);
            }

            // close polygon boundary
            let endOffsetGx = w / 2 + L * cosT - (wave.d + 120) * sinT;
            let endOffsetGy = h / 2 + L * sinT + (wave.d + 120) * cosT;
            let startOffsetGx = w / 2 - L * cosT - (wave.d + 120) * sinT;
            let startOffsetGy = h / 2 - L * sinT + (wave.d + 120) * cosT;
            
            ctx.lineTo(endOffsetGx, endOffsetGy);
            ctx.lineTo(startOffsetGx, startOffsetGy);
            ctx.closePath();

            // linear gradient fill
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

            // top stroke
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
            
            // fade stroke ends dynamically
            const strokeGradient = ctx.createLinearGradient(0, 0, w, h);
            strokeGradient.addColorStop(0, `rgba(${wave.colorRgb}, ${finalOpacity * 0.15})`);
            strokeGradient.addColorStop(0.5, `rgba(${wave.colorRgb}, ${finalOpacity * 0.85})`);
            strokeGradient.addColorStop(1, `rgba(${wave.colorRgb}, ${finalOpacity * 0.15})`);
            
            ctx.strokeStyle = strokeGradient;
            ctx.lineWidth = wave.lineWidth;
            ctx.stroke();

            // reset shadow state
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowOffsetX = 0;
        }

        // main loop
        function animate() {
            ctx.clearRect(0, 0, logicalWidth, logicalHeight);
            
            // blend mode
            ctx.globalCompositeOperation = 'screen';
            
            // updates and recycling
            for (let i = waves.length - 1; i >= 0; i--) {
                let wave = waves[i];
                wave.d += wave.speedD;
                
                const isDead = (wave.speedD > 0 && wave.d > wave.dEnd) ||
                               (wave.speedD < 0 && wave.d < wave.dStart);
                               
                if (isDead) {
                    waves[i] = createRandomWave(false);
                }
            }
            
            // sort by depth layering (z-sorting)
            waves.sort((a, b) => a.z - b.z);
            
            // draw
            for (let i = 0; i < waves.length; i++) {
                drawWave(waves[i]);
            }
            
            ctx.globalCompositeOperation = 'source-over';
            requestAnimationFrame(animate);
        }

        // listeners
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animate();
    }

    // Target Launch: June 30, 2026
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
