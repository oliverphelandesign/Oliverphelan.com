(function(){
  const canvas = document.getElementById('pebbles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, DPR;
  let pebbles = [];
  const mouse = { x: -9999, y: -9999 };

  // warm/cool stone tones — kept lighter than the ink background on purpose
  const TONES = [
    { fill: '#5a564a', edge: '#26241e' }, // basalt grey
    { fill: '#6b6152', edge: '#2c2822' }, // slate brown
    { fill: '#786c54', edge: '#332c22' }, // sun-warmed stone
    { fill: '#635d48', edge: '#2a231c' }, // olive-grey
    { fill: '#7a5644', edge: '#3a241c' }, // rust-tinted stone
  ];

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    seed();
  }

  function seed(){
    const count = Math.round((W * H) / 42000); // density scales with screen size
    pebbles = [];
    for (let i = 0; i < count; i++){
      const r = 6 + Math.random() * 22;
      const hx = Math.random() * W;
      const hy = Math.random() * H;
      pebbles.push({
        homeX: hx, homeY: hy,
        x: hx, y: hy,
        r,
        rot: Math.random() * Math.PI,
        squash: 0.55 + Math.random() * 0.35,
        tone: TONES[Math.floor(Math.random() * TONES.length)],
      });
    }
  }

  // faint raked-sand arcs, drawn once per frame beneath the pebbles
  function drawRake(){
    ctx.strokeStyle = 'rgba(233,227,212,0.035)';
    ctx.lineWidth = 1;
    const spacing = 26;
    for (let radius = spacing; radius < W * 1.3; radius += spacing){
      ctx.beginPath();
      ctx.arc(W * 0.12, H * 1.05, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawPebble(p){
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(1, p.squash);

    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = p.r * 0.8;
    ctx.shadowOffsetY = p.r * 0.25;

    const grad = ctx.createRadialGradient(-p.r * 0.3, -p.r * 0.3, p.r * 0.1, 0, 0, p.r);
    grad.addColorStop(0, p.tone.fill);
    grad.addColorStop(1, p.tone.edge);

    ctx.beginPath();
    ctx.arc(0, 0, p.r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  function frame(){
    ctx.clearRect(0, 0, W, H);
    drawRake();

    const REACT_RADIUS = 170;
    const PUSH = 26;
    const EASE_BACK = 0.06;
    const EASE_MOVE = 0.12;

    for (const p of pebbles){
      const dx = p.homeX - mouse.x;
      const dy = p.homeY - mouse.y;
      const dist = Math.hypot(dx, dy);

      let targetX = p.homeX;
      let targetY = p.homeY;

      if (dist < REACT_RADIUS){
        const strength = (1 - dist / REACT_RADIUS);
        const angle = Math.atan2(dy, dx);
        targetX = p.homeX + Math.cos(angle) * PUSH * strength;
        targetY = p.homeY + Math.sin(angle) * PUSH * strength;
      }

      const ease = dist < REACT_RADIUS ? EASE_MOVE : EASE_BACK;
      p.x += (targetX - p.x) * ease;
      p.y += (targetY - p.y) * ease;

      drawPebble(p);
    }

    requestAnimationFrame(frame);
  }

  window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('pointerleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });
  window.addEventListener('resize', resize);

  resize();
  requestAnimationFrame(frame);
})();
