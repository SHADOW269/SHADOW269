  // Live date
  const d = new Date();
  document.getElementById('nav-date').textContent =
    String(d.getDate()).padStart(2,'0') + ' / ' +
    String(d.getMonth()+1).padStart(2,'0') + ' / ' + d.getFullYear();

  // Fade-up on scroll
  const fadeObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animation = 'fadeUp 0.7s cubic-bezier(0.23,1,0.32,1) forwards';
        fadeObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.07 });
  document.querySelectorAll('.fade-up').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.animation = 'none';
    fadeObs.observe(el);
  });

  // ── GLOBE ──────────────────────────────────────
  (function() {
    const canvas = document.getElementById('globe-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const R = W * 0.46;

    const LAT = 12.8698, LON = 74.8430;

    let rotY = 1.28;
    let rotX = -0.18;
    let isDragging = false;
    let lastMX = 0, lastMY = 0;
    let velX = 0, velY = 0;
    let autoSpin = true;

    function latLonTo3D(lat, lon) {
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (lon + 180) * Math.PI / 180;
      return {
        x: -Math.sin(phi) * Math.cos(theta),
        y: Math.cos(phi),
        z: Math.sin(phi) * Math.sin(theta)
      };
    }

    function rotate(p, ry, rx) {
      const x1 = p.x * Math.cos(ry) + p.z * Math.sin(ry);
      const z1 = -p.x * Math.sin(ry) + p.z * Math.cos(ry);
      const y1 = p.y;
      const y2 = y1 * Math.cos(rx) - z1 * Math.sin(rx);
      const z2 = y1 * Math.sin(rx) + z1 * Math.cos(rx);
      return { x: x1, y: y2, z: z2 };
    }

    function project(p) {
      return { x: cx + p.x * R, y: cy - p.y * R, visible: p.z > -0.05 };
    }

    const landmasses = [
      // India
      [[37.1,73.5],[36.0,76.5],[34.0,78.5],[31.5,78.0],[29.5,77.5],[28.5,77.2],[25.0,68.0],[23.5,68.5],[22.0,68.2],[20.0,72.0],[18.0,73.0],[16.5,73.5],[15.0,74.0],[13.5,74.5],[12.0,75.5],[10.5,76.0],[8.5,77.0],[8.0,77.5],[7.9,78.0],[8.5,80.0],[10.5,80.3],[13.0,80.3],[15.0,80.0],[16.5,81.5],[18.0,84.0],[20.0,86.5],[21.5,87.5],[22.5,88.0],[22.5,89.5],[24.0,89.5],[25.5,88.5],[26.5,88.7],[27.5,88.8],[28.0,87.0],[28.5,88.5],[27.0,89.5],[26.5,90.0],[26.0,92.0],[27.0,95.0],[27.5,97.0],[28.5,97.5],[29.5,95.0],[31.0,93.5],[32.5,93.0],[33.5,94.0],[34.5,73.5],[37.1,73.5]],
      // Africa
      [[37,9],[37,-1],[34,-5],[32,-9],[28,-13],[24,-17],[20,-17],[15,-18],[10,-17],[5,-4],[4,1],[3,8],[4,10],[3,14],[4,16],[5,18],[5,22],[7,24],[7,28],[5,30],[3,32],[4,35],[6,38],[8,40],[11,42],[12,44],[14,42],[15,38],[17,38],[20,37],[24,35],[28,34],[30,32],[32,30],[34,25],[30,20],[26,14],[24,7],[20,2],[16,-1],[12,-2],[8,-3],[5,-3],[2,7],[1,9],[-2,10],[-5,12],[-8,13],[-12,14],[-17,16],[-20,14],[-23,15],[-26,14],[-30,15],[-33,19],[-35,20],[-34,26],[-30,30],[-26,33],[-24,33],[-22,34],[-18,36],[-15,36],[-10,40],[-8,40],[-5,37],[0,33],[3,30],[5,25],[5,20],[8,15],[10,8],[5,2],[2,-4],[4,-12],[6,-15],[8,-17],[10,-18],[15,-18],[20,-17],[25,-16],[30,-12],[34,-9],[36,-1],[37,9]],
      // Europe
      [[35,26],[36,27],[37,26],[37,22],[38,20],[37,16],[38,14],[40,17],[42,13],[43,16],[44,13],[45,14],[44,15],[44,16],[47,12],[47,8],[47,4],[47,1],[48,-4],[49,-2],[51,0],[51,4],[52,5],[53,8],[54,10],[56,12],[56,14],[57,12],[57,16],[58,16],[60,18],[62,15],[63,17],[65,15],[67,15],[68,17],[70,18],[70,22],[69,26],[70,28],[72,24],[70,20],[71,15],[71,10],[69,10],[67,9],[65,8],[62,6],[60,4],[58,5],[55,8],[53,6],[52,4],[50,2],[49,-2],[48,-5],[46,-1],[44,1],[43,2],[41,2],[41,8],[43,6],[44,8],[44,12],[43,11],[40,13],[38,14],[37,12],[37,8],[37,5],[36,5],[35,8],[35,12],[35,16],[35,24],[35,26]],
      // Asia/Russia
      [[70,30],[70,40],[68,50],[65,60],[60,60],[55,60],[50,60],[45,55],[45,60],[50,70],[55,70],[58,68],[60,68],[62,68],[65,70],[66,72],[68,74],[70,72],[71,74],[72,80],[70,85],[66,86],[64,90],[65,95],[66,100],[68,104],[69,110],[70,120],[68,130],[66,132],[64,136],[62,142],[55,140],[52,142],[50,140],[50,135],[48,138],[45,136],[43,134],[43,131],[48,130],[50,120],[52,110],[50,100],[47,92],[48,88],[44,82],[42,78],[40,72],[40,68],[44,63],[44,60],[45,55],[42,50],[42,46],[44,45],[40,40],[39,38],[40,36],[38,30],[36,32],[36,38],[37,44],[38,50],[40,55],[38,56],[38,60],[40,60],[42,60],[45,62],[48,64],[50,70],[55,68],[58,65],[60,62],[62,60],[65,58],[68,50],[70,40],[72,35],[70,30]],
      // North America
      [[70,-140],[68,-136],[68,-130],[65,-128],[60,-125],[55,-124],[50,-125],[48,-125],[45,-125],[43,-125],[40,-125],[37,-122],[35,-120],[33,-118],[30,-116],[29,-112],[26,-110],[22,-108],[20,-106],[18,-102],[18,-100],[20,-98],[22,-100],[24,-105],[26,-108],[28,-110],[30,-112],[32,-114],[34,-118],[36,-120],[38,-122],[40,-125],[42,-125],[45,-125],[48,-125],[50,-125],[55,-130],[58,-138],[60,-145],[62,-148],[65,-165],[66,-168],[68,-165],[68,-160],[70,-155],[71,-148],[70,-140]],
      // South America
      [[-55,-68],[-54,-66],[-52,-68],[-50,-70],[-48,-66],[-46,-68],[-42,-63],[-40,-62],[-38,-58],[-34,-52],[-30,-50],[-27,-48],[-25,-44],[-22,-42],[-18,-40],[-12,-37],[-8,-35],[-5,-35],[-2,-38],[0,-42],[2,-50],[4,-52],[6,-55],[8,-60],[10,-62],[8,-70],[5,-75],[2,-78],[0,-75],[-3,-73],[-6,-75],[-8,-72],[-10,-75],[-14,-76],[-18,-70],[-20,-68],[-22,-68],[-24,-65],[-26,-65],[-28,-60],[-30,-55],[-32,-52],[-34,-53],[-36,-56],[-38,-60],[-42,-63],[-46,-65],[-50,-68],[-55,-68]],
      // Australia
      [[-14,126],[-12,130],[-10,136],[-12,142],[-16,145],[-20,148],[-24,151],[-28,153],[-32,153],[-36,150],[-38,148],[-38,144],[-36,140],[-34,136],[-32,132],[-30,128],[-26,114],[-22,114],[-18,122],[-14,126]],
      // Greenland
      [[83,-20],[80,-15],[78,-20],[75,-20],[72,-24],[72,-26],[70,-24],[68,-26],[66,-30],[64,-40],[65,-50],[66,-52],[68,-54],[70,-52],[72,-46],[74,-42],[76,-38],[78,-32],[80,-26],[82,-22],[83,-20]],
      // Japan
      [[44,145],[42,143],[40,141],[36,136],[34,132],[33,131],[33,130],[34,131],[36,136],[38,140],[40,140],[42,141],[44,145]],
      // Southeast Asia
      [[22,98],[20,100],[18,103],[15,104],[13,103],[10,105],[8,103],[5,100],[3,102],[1,104],[3,106],[5,104],[8,98],[10,99],[12,100],[14,100],[16,102],[18,104],[20,100],[22,98]]
    ];

    const graticules = [];
    for (let lat = -80; lat <= 80; lat += 20) {
      const line = [];
      for (let lon = -180; lon <= 180; lon += 4) line.push([lat, lon]);
      graticules.push(line);
    }
    for (let lon = -180; lon <= 180; lon += 30) {
      const line = [];
      for (let lat = -90; lat <= 90; lat += 4) line.push([lat, lon]);
      graticules.push(line);
    }

    function drawGlobe() {
      ctx.clearRect(0, 0, W, H);

      // Sphere base
      const grad = ctx.createRadialGradient(cx - R*0.3, cy - R*0.3, R*0.05, cx, cy, R);
      grad.addColorStop(0, '#0d2235');
      grad.addColorStop(0.5, '#060e18');
      grad.addColorStop(1, '#020508');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Atmosphere
      const atmoGrad = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.04);
      atmoGrad.addColorStop(0, 'rgba(0,200,255,0)');
      atmoGrad.addColorStop(0.5, 'rgba(0,200,255,0.05)');
      atmoGrad.addColorStop(1, 'rgba(0,200,255,0.18)');
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.04, 0, Math.PI * 2);
      ctx.fillStyle = atmoGrad;
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R - 1, 0, Math.PI * 2);
      ctx.clip();

      // Graticule
      for (const line of graticules) {
        let started = false;
        ctx.beginPath();
        for (const [lat, lon] of line) {
          const p = rotate(latLonTo3D(lat, lon), rotY, rotX);
          if (p.z < 0) { started = false; continue; }
          const s = project(p);
          if (!started) { ctx.moveTo(s.x, s.y); started = true; }
          else ctx.lineTo(s.x, s.y);
        }
        ctx.strokeStyle = 'rgba(0,200,255,0.055)';
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }

      // Landmasses
      for (const shape of landmasses) {
        ctx.beginPath();
        let first = true;
        for (const [lat, lon] of shape) {
          const p = rotate(latLonTo3D(lat, lon), rotY, rotX);
          if (p.z < 0) { first = true; continue; }
          const s = project(p);
          if (first) { ctx.moveTo(s.x, s.y); first = false; }
          else ctx.lineTo(s.x, s.y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,200,255,0.09)';
        ctx.strokeStyle = 'rgba(0,200,255,0.28)';
        ctx.lineWidth = 0.7;
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();

      // Specular highlight
      const shine = ctx.createRadialGradient(cx - R*0.32, cy - R*0.32, R*0.02, cx - R*0.2, cy - R*0.2, R*0.65);
      shine.addColorStop(0, 'rgba(255,255,255,0.07)');
      shine.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = shine;
      ctx.fill();

      // Mangaluru marker
      const mangP = rotate(latLonTo3D(LAT, LON), rotY, rotX);
      const mangS = project(mangP);
      const onFront = mangP.z > 0;
      const tooltip = document.getElementById('globe-tooltip');

      if (onFront) {
        const mx = mangS.x, my = mangS.y;
        const t = Date.now() / 1000;

        // Pulse rings
        for (let i = 3; i >= 1; i--) {
          const phase = (t * 1.8 + (i * 0.6)) % 3;
          const progress = phase / 3;
          const rad = (6 + i * 9) * progress * (R / 280);
          const alpha = 0.4 * (1 - progress) * (i === 1 ? 1 : 0.6);
          ctx.beginPath();
          ctx.arc(mx, my, Math.max(0.1, rad), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,200,255,${alpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Soft glow behind dot
        const glowGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 18 * (R / 280));
        glowGrad.addColorStop(0, 'rgba(255,107,0,0.35)');
        glowGrad.addColorStop(1, 'rgba(255,107,0,0)');
        ctx.beginPath();
        ctx.arc(mx, my, 18 * (R / 280), 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        // Orange dot
        const dotR = 4 * (R / 280);
        ctx.beginPath();
        ctx.arc(mx, my, dotR, 0, Math.PI * 2);
        ctx.fillStyle = '#ff6b00';
        ctx.shadowColor = '#ff9940';
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;

        // White core
        ctx.beginPath();
        ctx.arc(mx, my, dotR * 0.38, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fill();

        // Crosshair
        const ch = 10 * (R / 280);
        ctx.strokeStyle = 'rgba(255,107,0,0.35)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(mx - ch, my); ctx.lineTo(mx - dotR * 1.6, my);
        ctx.moveTo(mx + dotR * 1.6, my); ctx.lineTo(mx + ch, my);
        ctx.moveTo(mx, my - ch); ctx.lineTo(mx, my - dotR * 1.6);
        ctx.moveTo(mx, my + dotR * 1.6); ctx.lineTo(mx, my + ch);
        ctx.stroke();

        // Tooltip position
        if (tooltip) {
          const rect = canvas.getBoundingClientRect();
          const sx = rect.width / W, sy = rect.height / H;
          tooltip.style.left = (mx * sx - 100) + 'px';
          tooltip.style.top = ((my - 50) * sy) + 'px';
          tooltip.classList.add('visible');
        }
      } else {
        if (tooltip) tooltip.classList.remove('visible');
      }
    }

    // Drag
    canvas.style.cursor = 'grab';
    canvas.addEventListener('mousedown', e => {
      isDragging = true; autoSpin = false;
      lastMX = e.clientX; lastMY = e.clientY;
      velX = 0; velY = 0;
      canvas.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const dx = e.clientX - lastMX, dy = e.clientY - lastMY;
      velY = dx * 0.005; velX = dy * 0.005;
      rotY += velY; rotX += velX;
      rotX = Math.max(-1.2, Math.min(1.2, rotX));
      lastMX = e.clientX; lastMY = e.clientY;
    });
    window.addEventListener('mouseup', () => { isDragging = false; canvas.style.cursor = 'grab'; });

    canvas.addEventListener('touchstart', e => {
      isDragging = true; autoSpin = false;
      lastMX = e.touches[0].clientX; lastMY = e.touches[0].clientY;
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - lastMX, dy = e.touches[0].clientY - lastMY;
      velY = dx * 0.005; velX = dy * 0.005;
      rotY += velY; rotX += velX;
      rotX = Math.max(-1.2, Math.min(1.2, rotX));
      lastMX = e.touches[0].clientX; lastMY = e.touches[0].clientY;
    }, { passive: true });
    canvas.addEventListener('touchend', () => { isDragging = false; });

    function animate() {
      if (!isDragging) {
        if (autoSpin) {
          rotY += 0.003;
        } else {
          velY *= 0.94; velX *= 0.94;
          rotY += velY; rotX += velX;
          rotX = Math.max(-1.2, Math.min(1.2, rotX));
        }
      }
      drawGlobe();
      requestAnimationFrame(animate);
    }
    animate();
  })();