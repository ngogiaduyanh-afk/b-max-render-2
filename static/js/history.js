function renderHistory(days = 7) {
  const records = getRecentRecords(days);
  const placeholder = document.getElementById('chartPlaceholder');
  const lineCanvas = document.getElementById('emotionLineChart');
  const stressCanvas = document.getElementById('stressChart');
  const timeline = document.getElementById('emotionTimeline');
  if (!records.length) {
    placeholder.style.display = 'grid';
    lineCanvas.style.display = 'none';
    stressCanvas.style.display = 'none';
    timeline.innerHTML = '';
    return;
  }
  placeholder.style.display = 'none';
  lineCanvas.style.display = 'block';
  stressCanvas.style.display = 'block';
  drawLineChart(lineCanvas, records.map(r => ({ label: (r.created_at || '').slice(0,10), value: Number(r.combined_score || 0) })), { color:'#d89b22' });
  drawLineChart(stressCanvas, records.map(r => ({ label: (r.created_at || '').slice(0,10), value: Number(r.survey_score || 0) })), { color:'#8c6b2b' });
  const low = records.filter(r => (r.combined_score || 0) < 35).length;
  const medium = records.filter(r => (r.combined_score || 0) >= 35 && (r.combined_score || 0) < 75).length;
  const high = records.filter(r => (r.combined_score || 0) >= 75).length;
  const total = records.length || 1;
  document.getElementById('distLow').style.width = `${Math.round(low/total*100)}%`;
  document.getElementById('distMedium').style.width = `${Math.round(medium/total*100)}%`;
  document.getElementById('distHigh').style.width = `${Math.round(high/total*100)}%`;
  document.getElementById('distLowValue').textContent = `${Math.round(low/total*100)}%`;
  document.getElementById('distMediumValue').textContent = `${Math.round(medium/total*100)}%`;
  document.getElementById('distHighValue').textContent = `${Math.round(high/total*100)}%`;
  timeline.innerHTML = records.slice().reverse().map(r => `
    <div class="timeline-item">
      <h4>${r.emoji || '🙂'} ${r.combined_level}</h4>
      <p>${r.meaning}</p>
      <div class="timeline-meta">${new Date(r.created_at).toLocaleString('vi-VN')} · Khảo sát ${Math.round(r.survey_score)} · Ảnh ${Math.round(r.image_score)} · Tổng ${Math.round(r.combined_score)}</div>
    </div>`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderHistory(7);
  document.querySelectorAll('[data-range]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-range]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderHistory(Number(btn.dataset.range));
    });
  });
});
