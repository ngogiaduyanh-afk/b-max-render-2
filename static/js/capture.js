let currentStream = null;
let selectedBlob = null;
let latestResult = null;

function renderSurveyQuestions() {
  const wrap = document.getElementById('surveyQuestions');
  const features = window.FEATURE_CONFIG || [];
  wrap.innerHTML = features.map((item, idx) => `
    <div class="question-item">
      <label for="${item.name}">${idx + 1}. ${item.question}</label>
      <div class="range-row">
        <span>${item.left_label || item.min}</span>
        <input type="range" id="${item.name}" min="${item.min}" max="${item.max}" step="${item.step}" value="2">
        <span>${item.right_label || item.max}</span>
        <div class="survey-value" id="${item.name}_value">2</div>
      </div>
    </div>
  `).join('');
  features.forEach(item => {
    const input = document.getElementById(item.name);
    const value = document.getElementById(`${item.name}_value`);
    input.addEventListener('input', () => value.textContent = input.value);
  });
}

function getSurveyPayload() {
  const data = {};
  (window.FEATURE_CONFIG || []).forEach(item => {
    data[item.name] = Number(document.getElementById(item.name).value);
  });
  return data;
}

async function openCamera() {
  try {
    currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    document.getElementById('cameraPreview').srcObject = currentStream;
    document.getElementById('cameraContainer').style.display = 'block';
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('previewArea').style.display = 'none';
  } catch (e) {
    alert('Không mở được camera trên thiết bị này.');
  }
}

function stopCamera() {
  if (currentStream) currentStream.getTracks().forEach(t => t.stop());
  currentStream = null;
}

function showPreviewFromBlob(blob) {
  selectedBlob = blob;
  document.getElementById('previewImage').src = URL.createObjectURL(blob);
  document.getElementById('previewArea').style.display = 'block';
  document.getElementById('cameraContainer').style.display = 'none';
  document.getElementById('uploadArea').style.display = 'none';
  stopCamera();
}

function capturePhoto() {
  const video = document.getElementById('cameraPreview');
  const canvas = document.getElementById('captureCanvas');
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.toBlob(blob => showPreviewFromBlob(blob), 'image/jpeg', 0.9);
}

function resetPreview() {
  selectedBlob = null;
  latestResult = null;
  document.getElementById('previewArea').style.display = 'none';
  document.getElementById('uploadArea').style.display = 'grid';
  document.getElementById('resultCard').style.display = 'none';
  stopCamera();
}

async function analyzeAll() {
  if (!selectedBlob) return alert('Bạn cần chụp hoặc chọn ảnh trước.');
  const resultCard = document.getElementById('resultCard');
  resultCard.style.display = 'block';
  document.getElementById('analysisLoading').style.display = 'block';
  document.getElementById('analysisResult').style.display = 'none';
  try {
    const surveyPayload = getSurveyPayload();
    const stressRes = await fetch('/predict_stress', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(surveyPayload)
    });
    const stressData = await stressRes.json();
    if (!stressData.ok) throw new Error(stressData.message || 'Lỗi mô hình khảo sát');

    const formData = new FormData();
    formData.append('image', selectedBlob, 'capture.jpg');
    const imageRes = await fetch('/predict_emotion', { method: 'POST', body: formData });
    const imageData = await imageRes.json();
    if (!imageData.ok) throw new Error(imageData.message || 'Lỗi mô hình ảnh');

    const combinedRes = await fetch('/predict_combined', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ survey_label: stressData.raw_label, image_label: imageData.raw_label })
    });
    const combined = await combinedRes.json();
    if (!combined.ok) throw new Error(combined.message || 'Lỗi kết hợp kết quả');

    latestResult = {
      created_at: new Date().toISOString(),
      survey_label: stressData.raw_label,
      survey_score: stressData.survey_score,
      image_label: imageData.raw_label,
      image_score: imageData.image_score,
      image_probs: imageData.probabilities,
      combined_level: combined.level,
      combined_score: combined.combined_score,
      meaning: combined.meaning,
      explanation: combined.explanation,
      recommendations: combined.recommendations,
      emoji: combined.emoji,
      confidence: imageData.confidence
    };
    fillResult(latestResult);
  } catch (e) {
    alert(e.message || 'Có lỗi khi phân tích.');
  } finally {
    document.getElementById('analysisLoading').style.display = 'none';
  }
}

function fillResult(data) {
  document.getElementById('analysisResult').style.display = 'block';
  document.getElementById('resultEmotionIcon').textContent = data.emoji || '🙂';
  document.getElementById('resultEmotionLabel').textContent = data.combined_level;
  document.getElementById('confidenceFill').style.width = `${Math.round(data.confidence || 0)}%`;
  document.getElementById('confidenceText').textContent = `${Math.round(data.confidence || 0)}%`;
  document.getElementById('imageScoreText').textContent = `${Math.round(data.image_score)}/100`;
  document.getElementById('surveyScoreText').textContent = `${Math.round(data.survey_score)}/100`;
  document.getElementById('stressScoreText').textContent = `${Math.round(data.combined_score)}/100`;
  document.getElementById('surveyLevelText').textContent = data.meaning;
  document.getElementById('combinedRuleText').textContent = `${data.survey_label} + ${data.image_label} → ${data.combined_level}`;
  const probs = data.image_probs || {};
  const happy = Number(probs.Happy || 0), neutral = Number(probs.Neutral || 0), sad = Number(probs.Sad || 0);
  document.getElementById('lowBar').style.width = `${happy}%`;
  document.getElementById('mediumBar').style.width = `${neutral}%`;
  document.getElementById('highBar').style.width = `${sad}%`;
  document.getElementById('lowValue').textContent = `${happy.toFixed(1)}%`;
  document.getElementById('mediumValue').textContent = `${neutral.toFixed(1)}%`;
  document.getElementById('highValue').textContent = `${sad.toFixed(1)}%`;
  document.getElementById('recommendList').innerHTML = (data.recommendations || []).map(x => `<li>${x}</li>`).join('');
}

function renderTodayHistory() {
  const list = getTodayRecords();
  const card = document.getElementById('todayHistoryCard');
  const wrap = document.getElementById('todayCheckins');
  if (!list.length) {
    card.style.display = 'none';
    return;
  }
  card.style.display = 'block';
  wrap.innerHTML = list.map(item => `
    <div class="checkin-item">
      <strong>${item.emoji || '🙂'} ${item.combined_level}</strong>
      <div class="timeline-meta">${new Date(item.created_at).toLocaleTimeString('vi-VN')} · Tổng ${Math.round(item.combined_score)}/100</div>
    </div>
  `).join('');
}

function saveLatestResult() {
  if (!latestResult) return alert('Chưa có kết quả để lưu.');
  saveRecord(latestResult);
  renderTodayHistory();
  alert('Đã lưu vào nhật ký 7 ngày trên trình duyệt.');
}

document.addEventListener('DOMContentLoaded', () => {
  renderSurveyQuestions();
  renderTodayHistory();
  document.getElementById('openCameraBtn').addEventListener('click', openCamera);
  document.getElementById('chooseFileBtn').addEventListener('click', () => document.getElementById('fileInput').click());
  document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) showPreviewFromBlob(file);
  });
  document.getElementById('captureBtn').addEventListener('click', capturePhoto);
  document.getElementById('retakeBtn').addEventListener('click', resetPreview);
  document.getElementById('analyzeBtn').addEventListener('click', analyzeAll);
  document.getElementById('saveResultBtn').addEventListener('click', saveLatestResult);
});
