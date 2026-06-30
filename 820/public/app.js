/* ==========================================================================
   dc-820 Workspace Hub JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // Core State
  const state = {
    audioEnabled: localStorage.getItem('dc820-audio') !== 'false',
    audioCtx: null,
    latency: '14ms',
    consoleHistory: [],
  };

  // DOM Elements
  const liveTimeEl = document.getElementById('live-time');
  const pingEl = document.getElementById('stat-ping');
  const audioToggleBtn = document.getElementById('audio-toggle');
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  const mouseGlow = document.getElementById('mouse-glow');
  const cards = document.querySelectorAll('.project-card');
  const consoleInput = document.getElementById('console-input');
  const consoleOutput = document.getElementById('console-output');
  const themeResetBtn = document.getElementById('theme-reset-btn');
  const createProjectBtn = document.getElementById('create-project-btn');

  // --- Clock Widget ---
  function updateTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // convert 0 to 12
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    
    if (liveTimeEl) {
      liveTimeEl.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
    }
  }
  setInterval(updateTime, 1000);
  updateTime();

  // --- Ping Sim ---
  function updatePing() {
    const randomLatency = Math.floor(Math.random() * 8) + 8; // 8ms to 15ms
    state.latency = `${randomLatency}ms`;
    if (pingEl) {
      pingEl.textContent = state.latency;
    }
  }
  setInterval(updatePing, 5000);
  updatePing();

  // --- Sound FX Synthesizer (Web Audio API) ---
  function initAudio() {
    if (!state.audioCtx) {
      state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playSynthSound(type) {
    if (!state.audioEnabled) return;
    try {
      initAudio();
      if (state.audioCtx.state === 'suspended') {
        state.audioCtx.resume();
      }

      const osc = state.audioCtx.createOscillator();
      const gainNode = state.audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(state.audioCtx.destination);

      const now = state.audioCtx.currentTime;

      if (type === 'hover') {
        // High-pitched subtle blip
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
        gainNode.gain.setValueAtTime(0.015, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'click') {
        // Crisp select sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(600, now + 0.03);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'error') {
        // Low access denied sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        gainNode.gain.setValueAtTime(0.06, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'success') {
        // Beautiful chord/chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.06); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.12); // G5
        gainNode.gain.setValueAtTime(0.06, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      console.warn('Audio synthesis failed', e);
    }
  }

  // Audio Toggle Button logic
  function updateAudioButtonUI() {
    if (state.audioEnabled) {
      audioToggleBtn.innerHTML = '<i data-lucide="volume-2"></i>';
      audioToggleBtn.classList.remove('muted');
    } else {
      audioToggleBtn.innerHTML = '<i data-lucide="volume-x"></i>';
      audioToggleBtn.classList.add('muted');
    }
    lucide.createIcons();
  }

  audioToggleBtn.addEventListener('click', () => {
    state.audioEnabled = !state.audioEnabled;
    localStorage.setItem('dc820-audio', state.audioEnabled);
    updateAudioButtonUI();
    if (state.audioEnabled) {
      playSynthSound('success');
    }
  });
  updateAudioButtonUI();

  // --- Particle Network Canvas Background ---
  let particles = [];
  let mouse = { x: null, y: null, radius: 120 };
  let matrixMode = false;
  let matrixChars = "0101011001101001DC820";

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor(x, y) {
      this.x = x || Math.random() * canvas.width;
      this.y = y || Math.random() * canvas.height;
      this.baseSpeed = Math.random() * 0.4 + 0.1;
      this.speedX = (Math.random() - 0.5) * this.baseSpeed;
      this.speedY = (Math.random() - 0.5) * this.baseSpeed;
      this.size = Math.random() * 1.5 + 0.5;
      this.color = Math.random() > 0.5 ? 'rgba(99, 102, 241, 0.45)' : 'rgba(6, 182, 212, 0.45)';
    }

    update() {
      // Movement
      this.x += this.speedX;
      this.y += this.speedY;

      // Bounce off walls
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

      // Mouse magnetism
      if (mouse.x !== null && mouse.y !== null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= dx * force * 0.02;
          this.y -= dy * force * 0.02;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.min(100, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }
  initParticles();

  // Matrix drop particles class
  class MatrixDrop {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * -canvas.height;
      this.speed = Math.random() * 3 + 2;
      this.fontSize = Math.floor(Math.random() * 10) + 8;
      this.chars = [];
    }
    update() {
      this.y += this.speed;
      if (this.y > canvas.height) {
        this.y = Math.random() * -100;
        this.x = Math.random() * canvas.width;
      }
    }
    draw() {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
      ctx.font = `${this.fontSize}px monospace`;
      const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      ctx.fillText(char, this.x, this.y);
    }
  }
  let matrixDrops = [];

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].y - particles[j].y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
          let alpha = (100 - dist) / 100 * 0.12;
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (matrixMode) {
      if (matrixDrops.length === 0) {
        for (let i = 0; i < 50; i++) matrixDrops.push(new MatrixDrop());
      }
      matrixDrops.forEach(drop => {
        drop.update();
        drop.draw();
      });
    } else {
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      drawLines();
    }
    
    requestAnimationFrame(animate);
  }
  animate();

  // --- Mouse / Card Interaction & Glow Tracker ---
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    
    // Background Glow
    if (mouseGlow) {
      mouseGlow.style.opacity = '1';
      mouseGlow.style.left = `${mouse.x}px`;
      mouseGlow.style.top = `${mouse.y}px`;
    }
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
    if (mouseGlow) {
      mouseGlow.style.opacity = '0';
    }
  });

  // Card interaction
  cards.forEach(card => {
    // Sound FX on Hover
    card.addEventListener('mouseenter', () => {
      playSynthSound('hover');
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--x', `${x}px`);
      card.style.setProperty('--y', `${y}px`);

      // 3D Tilt calculation
      const width = rect.width;
      const height = rect.height;
      const rotateX = ((y - height / 2) / height) * -8; // Max 8 deg
      const rotateY = ((x - width / 2) / width) * 8;   // Max 8 deg
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  // Button clicks audio
  document.querySelectorAll('[data-sound]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = btn.getAttribute('data-sound');
      playSynthSound(type);
      if (btn.classList.contains('disabled-btn')) {
        e.preventDefault();
      }
    });
  });

  // Create Project Interaction
  if (createProjectBtn) {
    createProjectBtn.addEventListener('click', () => {
      printToConsole('\n[SYSTEM] Initializing repository expansion setup...');
      printToConsole('Creating new project workspace structure...');
      playSynthSound('success');
      setTimeout(() => {
        printToConsole('Workspace template initialized. Update firebase.json to register.');
      }, 1000);
    });
  }

  // Layout Reset
  if (themeResetBtn) {
    themeResetBtn.addEventListener('click', () => {
      playSynthSound('click');
      printToConsole('\nResetting workspace hub state...');
      matrixMode = false;
      state.audioEnabled = true;
      localStorage.setItem('dc820-audio', true);
      updateAudioButtonUI();
      initParticles();
      printToConsole('Reset completed successfully.');
    });
  }

  // --- Interactive Terminal console ---
  function printToConsole(text, type = 'normal') {
    const line = document.createElement('div');
    line.className = `console-line ${type}-msg`;
    line.textContent = text;
    consoleOutput.appendChild(line);
    // Scroll to bottom
    consoleOutput.parentElement.scrollTop = consoleOutput.parentElement.scrollHeight;
  }

  if (consoleInput) {
    consoleInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const input = consoleInput.value.trim();
        consoleInput.value = '';
        
        if (!input) return;
        
        // Print echo
        printToConsole(`tts-dc-820:~$ ${input}`, 'echo');
        playSynthSound('click');
        
        processCommand(input.toLowerCase());
      }
    });
  }

  function processCommand(cmd) {
    const args = cmd.split(' ');
    const command = args[0];

    switch (command) {
      case 'help':
        printToConsole('Available commands:\n' + 
                       '  status   - View workspace hosting and node status\n' +
                       '  ping     - Run latency check\n' +
                       '  projects - List registered projects and local routes\n' +
                       '  matrix   - Toggle visual matrix rain overlay\n' +
                       '  sound    - Toggle system synthesizer sound effects\n' +
                       '  clear    - Clear console display\n' +
                       '  version  - Display build version and developer info', 'response');
        break;
      case 'status':
        printToConsole('System status:\n' +
                       '  Hosting Provider : Firebase Hosting (dc-820)\n' +
                       '  SSL Certificate  : Operational (Valid)\n' +
                       '  Local Network    : Connected (Loopback)\n' +
                       '  Audio Synthesizer: ' + (state.audioEnabled ? 'ONLINE' : 'MUTED') + '\n' +
                       '  Particles Engine : ' + (matrixMode ? 'MATRIX_RAIN' : 'NEURAL_NETWORK'), 'response');
        break;
      case 'ping':
        printToConsole('Pinging Firebase edge routers [192.168.8.20] ...');
        setTimeout(() => {
          printToConsole(`Reply from 192.168.8.20: bytes=32 time=${state.latency} TTL=56`, 'response');
        }, 300);
        break;
      case 'projects':
        printToConsole('Registered directory items:\n' +
                       '  1. BJ\'s EquipTrack      -> https://equiptrack.teamturnersolutions.com [Active]\n' +
                       '  2. Team Feud            -> https://teamfeud.teamturnersolutions.com [Ready]\n' +
                       '  3. EquipTrack Admin     -> https://equiptrack-app.teamturnersolutions.com [Active]\n' +
                       '  4. Project Nexus        -> Inactive Workspace [Pending]', 'response');
        break;
      case 'matrix':
        matrixMode = !matrixMode;
        if (matrixMode) {
          printToConsole('Visual core set to MATRIX_RAIN_DROP.', 'response');
        } else {
          printToConsole('Visual core set to NEURAL_NETWORK_GRADIENT.', 'response');
        }
        break;
      case 'sound':
        state.audioEnabled = !state.audioEnabled;
        localStorage.setItem('dc820-audio', state.audioEnabled);
        updateAudioButtonUI();
        printToConsole('Sound effects toggled: ' + (state.audioEnabled ? 'ON' : 'OFF'), 'response');
        if (state.audioEnabled) playSynthSound('success');
        break;
      case 'clear':
        consoleOutput.innerHTML = '';
        break;
      case 'version':
        printToConsole('TTS-DC-820 Workspace Hub\n' +
                       'Version: v2.5.1-stable\n' +
                       'Platform: Firebase Static CLI v13.12.0\n' +
                       'Developer: Antigravity AI Pair Partner', 'response');
        break;
      default:
        printToConsole(`Unknown command: '${command}'. Type 'help' for options.`, 'error');
        playSynthSound('error');
    }
  }
});
