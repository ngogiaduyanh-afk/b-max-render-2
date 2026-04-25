function setupLayout() {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  if (sidebarToggle) sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  const dateEl = document.getElementById('currentDate');
  if (dateEl) dateEl.textContent = new Date().toLocaleString('vi-VN', { weekday:'long', day:'2-digit', month:'2-digit', year:'numeric' });
  const streakEl = document.getElementById('streakCount');
  if (streakEl) streakEl.textContent = getStreakDays();
}

document.addEventListener('DOMContentLoaded', setupLayout);
