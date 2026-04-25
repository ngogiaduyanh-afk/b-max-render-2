function drawLineChart(canvas, points, options = {}) {
  if (!canvas || !points || !points.length) return false;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  const pad = 36;
  const max = options.max || 100;
  ctx.strokeStyle = '#e4d3a4';
  ctx.lineWidth = 1;
  for (let i=0;i<=5;i++) {
    const y = pad + ((h - pad*2) / 5) * i;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w-pad, y); ctx.stroke();
  }
  ctx.strokeStyle = options.color || '#d89b22';
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((p, i) => {
    const x = pad + ((w - pad*2) * i / Math.max(points.length - 1, 1));
    const y = h - pad - ((p.value / max) * (h - pad*2));
    if (i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();
  points.forEach((p, i) => {
    const x = pad + ((w - pad*2) * i / Math.max(points.length - 1, 1));
    const y = h - pad - ((p.value / max) * (h - pad*2));
    ctx.fillStyle = options.color || '#d89b22';
    ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#6d5730';
    ctx.font = '12px sans-serif';
    ctx.fillText((p.label || '').slice(5), x-16, h-12);
  });
  return true;
}
