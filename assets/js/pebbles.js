(function(){
  const canvas = document.getElementById('pebbles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, DPR;
  let rocks = [];
  let noGo = null; // {x, y, w, h} -- rectangle around the text block
  const mouse = { x: -9999, y: -9999 };

  // natural stone tones -- river-worn greys and warm sandstone,
  // kept lighter than the ink background so they stay visible
  const TONES = [
    { fill: '#7d7a70', edge: '#302e29' }, // river grey
    { fill: '#8c8375', edge: '#332f28' }, // sandstone
    { fill: '#6f6d63', edge: '#2a2924' }, // basalt grey
    { fill: '#948a76', edge: '#372f26' }, // warm granite
    { fill: '#5f5c53', edge: '#242320' }, // dark slate
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
    measureNoGo();
    seed();
  }

  // read the content block's position so rocks steer clear of the copy
  function measureNoGo(){
    const el = document.getElementById('content');
    if (!el){ noGo = null; return; }
    const r = el.getBoundingClientRect();
    const pad = 56;
    noGo = {
      x: r.left - pad,
      y: r.top - pad,
      w: r.width + pad * 2,
      h: r.height + pad * 2
    };
  }

  function insideNoGo(x, y){
    if (!noGo) return false;
    return x > noGo.x && x < noGo.x + noGo.w && y > noGo.y && y < noGo.y + noGo.h;
  }

  // random point on-screen that isn't inside the text block
  function randomHome(){
    let x, y, tries = 0;
    do {
      x = Math.random() * W;
      y = Math.random() * H;
      tries++;
    } while (insideNoGo(x, y) && tries < 40);
    return { x, y };
  }

  // build an irregular, organic silhouette for one rock
  function makeSilhouette(r){
    const points = [];
    const count = 7 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++){
      const angle = (i / count) * Math.PI * 2;
      const wobble = 0.72 + Math.random() * 0.4;
      points.push({ x: Math.cos(angle) * r * wobble, y: Math.sin(angle) * r * wobble });
    }
    return points;
  }

  function makeRock(home, rOverride){
    const r = rOverride || (10 + Math.random() * 26);
    return {
      homeX: home.x, homeY: home.y,
      x: home.x, y: home.y,
      r,
      rot: Math.random() * Math.PI,
      squash: 0.6 + Math.random() * 0.3,
      tone: TONES[Math.floor(Math.random() * TONES.length)],
      points: makeSilhouette(r),
    };
  }

  function seed(){
    const count = Math.round((W * H) / 46000);
    rocks = [];

    for (let i = 0; i < count; i++){
      rocks.push(makeRock(randomHome()));
    }

    // a few balanced stacks scattered in, as a nod to rock-balancing --
    // a smaller stone resting on a single point atop a larger one
    const stackCount = Math.max(2, Math.round(count / 10));
    for (let i = 0; i < stackCount; i++){
      const base = makeRock(randomHome(), 20 + Math.random() * 14);
      rocks.push(base);
      const topStone = makeRock({ x: base.homeX + (Math.random() * 6 - 3), y: base.homeY - base.r * 1.35 }, base.r * 0.45);
      topStone.rot = (Math.random() - 0.5) * 0.6;
      rocks.push(topStone);
    }
  }

  function drawRock(p){
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(1, p.squash);

    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = p.r * 0.7;
    ctx.shadowOffsetY = p.r * 0.3;

    ctx.beginPath();
    const n = p.points.length;
    for (let i = 0; i <= n; i++){
      const cur = p.points[i % n];
      const nxt = p.points[(i + 1) % n];
      const midX = (cur.x + nxt.x) / 2;
      const midY = (cur.y + nxt.y) / 2;
      if (i === 0){ ctx.moveTo(midX, midY); }
      else { ctx.quadraticCurveTo(cur.x, cur.y, midX, midY); }
    }
    ctx.closePath();

    const grad = ctx.createRadialGradient(-p.r * 0.35, -p.r * 0.35, p.r * 0.1, 0, 0, p.r);
    grad.addColorStop(0, p.tone.fill);
    grad.addColorStop(1, p.tone.edge);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.restore();
  }

  function frame(){
    ctx.clearRect(0, 0, W, H);

    const REACT_RADIUS = 160;
    const PUSH = 20;
    const EASE_BACK = 0.06;
    const EASE_MOVE = 0.12;

    for (const p of rocks){
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

      drawRock(p);
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
