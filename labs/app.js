/* ==========================================================================
   QRT SOLUTIONS LABS v2.0 - CORE JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. QUANT OSCILLOSCOPE & MARKET WAVE RENDERER
    // ==========================================================================
    const canvas = document.getElementById('quant-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        
        let phase = 0;
        let speed = 0.012;
        
        function resizeCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        
        window.addEventListener('resize', resizeCanvas);
        
        // Draw sutil technical background grids
        function drawGrid() {
            ctx.strokeStyle = 'rgba(31, 41, 55, 0.25)'; // very faint grid lines
            ctx.lineWidth = 0.5;
            
            const gridSize = 40;
            
            // Vertical grid lines
            for (let x = 0; x < width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            
            // Horizontal grid lines
            for (let y = 0; y < height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
            
            // Draw a central horizontal axis line (representing baseline price)
            ctx.strokeStyle = 'rgba(75, 85, 99, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            ctx.lineTo(width, height / 2);
            ctx.stroke();
        }
        
        // Render a technical data wave (representing statistical market spreads)
        function drawQuantWave(amplitude, frequency, offset, color, drawPoints = false) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            
            const step = 4;
            let points = [];
            
            for (let x = 0; x < width; x += step) {
                // Compound sine wave to look like raw volatility data
                const y = height / 2 + 
                          Math.sin(x * frequency + phase + offset) * amplitude + 
                          Math.sin(x * (frequency * 2.5) - phase + offset) * (amplitude * 0.2) +
                          Math.cos(x * (frequency * 5.2) + (phase * 1.5)) * (amplitude * 0.08);
                
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                
                // Keep track of some points to render small nodes on the wave
                if (drawPoints && x % 80 === 0) {
                    points.push({ x, y });
                }
            }
            
            ctx.stroke();
            
            // Draw points/nodes with values to give it a scientific/quant interface feel
            if (drawPoints) {
                points.forEach(pt => {
                    // Node dot
                    ctx.fillStyle = '#06b6d4';
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Tiny horizontal tag line
                    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(pt.x, pt.y);
                    ctx.lineTo(pt.x + 15, pt.y - 8);
                    ctx.stroke();
                    
                    // Label (value offset from center)
                    ctx.fillStyle = 'rgba(156, 163, 175, 0.7)';
                    ctx.font = '8px Roboto Mono';
                    const sigmaOffset = ((pt.y - height / 2) / amplitude).toFixed(2);
                    ctx.fillText(`${sigmaOffset}σ`, pt.x + 18, pt.y - 6);
                });
            }
        }
        
        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            drawGrid();
            
            // Render 3 distinct waves overlapping representing multi-asset volatility
            // Wave 1: Cyan main trend
            drawQuantWave(70, 0.0018, 0, 'rgba(6, 182, 212, 0.55)', true);
            
            // Wave 2: Indigo faster trend
            drawQuantWave(45, 0.0035, Math.PI / 3, 'rgba(99, 102, 241, 0.35)', false);
            
            // Wave 3: Muted background noise
            drawQuantWave(90, 0.0008, Math.PI / 1.5, 'rgba(75, 85, 99, 0.15)', false);
            
            phase += speed;
            requestAnimationFrame(animate);
        }
        
        animate();
    }

    // ==========================================================================
    // 2. REAL-TIME QUANT TELEMETRY SIMULATOR
    // ==========================================================================
    const tickerElements = {
        usdclp: { price: document.getElementById('price-usdclp'), spread: document.getElementById('spread-usdclp') },
        xauusd: { price: document.getElementById('price-xauusd'), spread: document.getElementById('spread-xauusd') },
        vol: { price: document.getElementById('price-vol'), spread: document.getElementById('spread-vol') }
    };
    
    // Initial states
    let prices = {
        usdclp: 832.45,
        xauusd: 2345.80,
        vol: 1.42
    };
    
    function updateTickers() {
        // Random drift generator
        Object.keys(prices).forEach(key => {
            const el = tickerElements[key];
            if (!el || !el.price) return;
            
            let drift = 0;
            let decimals = 2;
            
            if (key === 'usdclp') {
                drift = (Math.random() - 0.5) * 0.40;
                prices[key] = Math.max(830, Math.min(835, prices[key] + drift));
                el.spread.innerText = `Spread: ${(0.15 + Math.random() * 0.15).toFixed(2)} CLP`;
            } else if (key === 'xauusd') {
                drift = (Math.random() - 0.5) * 1.20;
                prices[key] = prices[key] + drift;
                el.spread.innerText = `Spread: ${(0.05 + Math.random() * 0.08).toFixed(2)} USD`;
            } else if (key === 'vol') {
                drift = (Math.random() - 0.5) * 0.04;
                prices[key] = Math.max(0.8, Math.min(3.2, prices[key] + drift));
                decimals = 2;
            }
            
            // Apply visual flash (green/red) depending on change direction
            const formattedPrice = prices[key].toFixed(decimals);
            const currentHTMLPrice = el.price.innerText;
            
            el.price.innerText = formattedPrice;
            
            if (currentHTMLPrice !== '') {
                const prev = parseFloat(currentHTMLPrice);
                const curr = parseFloat(formattedPrice);
                
                el.price.classList.remove('ticker-up', 'ticker-down');
                // Force repaint to re-trigger CSS animation
                void el.price.offsetWidth; 
                
                if (curr > prev) {
                    el.price.classList.add('ticker-up');
                } else if (curr < prev) {
                    el.price.classList.add('ticker-down');
                }
            }
        });
        
        // Schedule next random update (between 400ms and 1200ms)
        setTimeout(updateTickers, 400 + Math.random() * 800);
    }
    
    updateTickers();

    // ==========================================================================
    // 3. LIVE ORDER BOOK / TRANSACTION FEED SIMULATOR
    // ==========================================================================
    const orderFeedList = document.getElementById('order-feed-list');
    if (orderFeedList) {
        const banks = ['ITAÚ', 'BCI', 'SANTANDER', 'SCOTIABANK', 'ESTADO', 'BICE', 'CHILE'];
        const types = ['LIMIT BUY', 'LIMIT SELL', 'MARKET SWAP', 'NETTING EXEC'];
        
        function addSimulatedOrder() {
            const time = new Date().toLocaleTimeString('es-CL', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const bank = banks[Math.floor(Math.random() * banks.length)];
            const type = types[Math.floor(Math.random() * types.length)];
            
            let amount = '';
            let details = '';
            
            if (type.includes('NETTING')) {
                amount = `$${(1 + Math.random() * 8).toFixed(1)}M USD`;
                details = `CONCILIATED`;
            } else {
                amount = `$${(100 + Math.floor(Math.random() * 900))}K USD`;
                details = `@ ${(831 + Math.random() * 3).toFixed(2)}`;
            }
            
            const li = document.createElement('li');
            li.className = 'py-2 border-b border-gray-900 flex justify-between text-[10px] code-meta text-gray-500 hover:text-gray-300 transition-colors duration-200';
            
            li.innerHTML = `
                <div class="flex gap-2">
                    <span class="text-cyan-500/80">[${time}]</span>
                    <span class="font-medium text-gray-400">${bank}</span>
                </div>
                <div class="flex gap-3">
                    <span class="${type.includes('BUY') || type.includes('NET') ? 'text-emerald-500/80' : 'text-indigo-400/80'}">${type}</span>
                    <span class="text-gray-300 font-medium">${amount}</span>
                    <span class="text-[9px] text-gray-600">${details}</span>
                </div>
            `;
            
            // Insert at the top of the list
            orderFeedList.insertBefore(li, orderFeedList.firstChild);
            
            // Maintain a maximum of 10 items in the feed list to prevent overflow
            if (orderFeedList.children.length > 10) {
                orderFeedList.removeChild(orderFeedList.lastChild);
            }
            
            // Schedule next order (between 1s and 4s)
            setTimeout(addSimulatedOrder, 1000 + Math.random() * 3000);
        }
        
        // Initial populate
        for (let i = 0; i < 6; i++) {
            addSimulatedOrder();
        }
    }

    // ==========================================================================
    // 4. INTERACTIVE PILLARS HUD CONTROLLER
    // ==========================================================================
    const tabButtons = {
        pilar1: document.getElementById('btn-pilar1'),
        pilar2: document.getElementById('btn-pilar2')
    };
    const tabContents = {
        pilar1: document.getElementById('content-pilar1'),
        pilar2: document.getElementById('content-pilar2')
    };
    
    function switchTab(targetId) {
        Object.keys(tabButtons).forEach(key => {
            const btn = tabButtons[key];
            const content = tabContents[key];
            
            if (key === targetId) {
                btn.classList.add('border-cyan-500', 'text-white');
                btn.classList.remove('border-transparent', 'text-gray-500');
                content.classList.remove('hidden');
            } else {
                btn.classList.add('border-transparent', 'text-gray-500');
                btn.classList.remove('border-cyan-500', 'text-white');
                content.classList.add('hidden');
            }
        });
    }
    
    if (tabButtons.pilar1 && tabButtons.pilar2) {
        tabButtons.pilar1.addEventListener('click', () => switchTab('pilar1'));
        tabButtons.pilar2.addEventListener('click', () => switchTab('pilar2'));
    }

});
