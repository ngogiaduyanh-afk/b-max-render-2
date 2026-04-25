function renderDashboard() {
  const records = getRecentRecords(7);
  const latest = getAllRecords()[0];
  const todayMood = document.getElementById('todayMoodContent');
  if (latest && todayMood) {
    todayMood.innerHTML = `
      <div class="today-result-box">
        <div class="score-badge">${latest.emoji || '🙂'} ${latest.combined_level}</div>
        <h3 style="margin:0">${latest.meaning}</h3>
        <p style="margin:0;color:#7c6b4a">${latest.explanation}</p>
        <div class="summary-strip">
          <div class="summary-chip"><span>Điểm tổng hợp</span><strong>${Math.round(latest.combined_score)}</strong></div>
          <div class="summary-chip"><span>Khảo sát</span><strong>${Math.round(latest.survey_score)}</strong></div>
          <div class="summary-chip"><span>Ảnh</span><strong>${Math.round(latest.image_score)}</strong></div>
        </div>
      </div>`;
  }
  const counts = { low:0, medium:0, high:0 };
  let sumCombined = 0, sumSurvey = 0;
  records.forEach(r => {
    sumCombined += Number(r.combined_score || 0);
    sumSurvey += Number(r.survey_score || 0);
    if ((r.combined_score || 0) < 35) counts.low += 1;
    else if ((r.combined_score || 0) < 75) counts.medium += 1;
    else counts.high += 1;
  });
  document.getElementById('happyCount').textContent = counts.low;
  document.getElementById('neutralCount').textContent = counts.medium;
  document.getElementById('sadCount').textContent = counts.high;
  document.getElementById('stressLevel').textContent = records.length ? Math.round(sumCombined / records.length) : '--';
  document.getElementById('surveyAverage').textContent = records.length ? Math.round(sumSurvey / records.length) : '--';
  const canvas = document.getElementById('miniChart');
  const placeholder = document.getElementById('miniChartPlaceholder');
  if (!records.length) {
    placeholder.style.display = 'grid'; canvas.style.display = 'none';
  } else {
    placeholder.style.display = 'none'; canvas.style.display = 'block';
    drawLineChart(canvas, records.map(r => ({ label: (r.created_at || '').slice(0,10), value: Number(r.combined_score || 0) })), { color:'#d89b22' });
  }
}

document.addEventListener('DOMContentLoaded', renderDashboard);
