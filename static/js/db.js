const STORAGE_KEY = 'stress_ai_records_v1';

function getAllRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

function saveRecord(record) {
  const items = getAllRecords();
  items.unshift(record);
  const kept = items.slice(0, 100);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
  return kept;
}

function getRecentRecords(days = 7) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return getAllRecords().filter(item => new Date(item.created_at) >= cutoff).sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
}

function getTodayRecords() {
  const today = new Date().toISOString().slice(0, 10);
  return getAllRecords().filter(item => (item.created_at || '').slice(0, 10) === today);
}

function getStreakDays() {
  const dates = [...new Set(getAllRecords().map(r => (r.created_at || '').slice(0,10)).filter(Boolean))].sort().reverse();
  if (!dates.length) return 0;
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 365; i++) {
    const key = cursor.toISOString().slice(0,10);
    if (dates.includes(key)) streak += 1;
    else if (i > 0) break;
    else if (!dates.includes(key)) {
      cursor.setDate(cursor.getDate() - 1);
      const ykey = cursor.toISOString().slice(0,10);
      if (dates.includes(ykey)) streak += 1; else return 0;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
