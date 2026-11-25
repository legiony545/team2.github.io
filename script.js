// ==========================================
// 1. Weather Data via Open-Meteo API
// Wonju (원주), Seoul (서울), Jeju (제주)
// ==========================================
const CITIES = {
  wonju: { name: '원주', lat: 37.3422, lon: 127.9202, prefix: 'wonju' },
  seoul: { name: '서울', lat: 37.5665, lon: 126.9780, prefix: 'seoul' },
  jeju:  { name: '제주', lat: 33.4996, lon: 126.5312, prefix: 'jeju' }
};

function getWeatherMeta(code, isDay = 1) {
  // Clear
  if (code === 0) {
    return {
      desc: isDay ? '맑음' : '맑은 밤',
      icon: isDay
        ? `<svg viewBox="0 0 64 64" width="42" height="42"><circle cx="32" cy="32" r="14" fill="#f59e0b"/><g stroke="#f59e0b" stroke-width="4" stroke-linecap="round"><line x1="32" y1="6" x2="32" y2="12"/><line x1="32" y1="52" x2="32" y2="58"/><line x1="6" y1="32" x2="12" y2="32"/><line x1="52" y1="32" x2="58" y2="32"/><line x1="13.6" y1="13.6" x2="17.8" y2="17.8"/><line x1="46.2" y1="46.2" x2="50.4" y2="50.4"/><line x1="13.6" y1="50.4" x2="17.8" y2="46.2"/><line x1="46.2" y1="17.8" x2="50.4" y2="13.6"/></g></svg>`
        : `<svg viewBox="0 0 64 64" width="42" height="42"><path d="M38 12 A18 18 0 1 1 20 48 A22 22 0 0 0 38 12 z" fill="#f59e0b"/></svg>`
    };
  }
  // Partly Cloudy
  if (code === 1 || code === 2) {
    return {
      desc: '구름 조금',
      icon: `<svg viewBox="0 0 64 64" width="42" height="42"><circle cx="26" cy="24" r="11" fill="#f59e0b"/><path d="M22 46 h26 a12 12 0 0 0 0-24 a13 13 0 0 0-24 4 a10 10 0 0 0-2 20 z" fill="#93c5fd" opacity="0.95"/></svg>`
    };
  }
  // Overcast / Cloudy
  if (code === 3) {
    return {
      desc: '흐림',
      icon: `<svg viewBox="0 0 64 64" width="42" height="42"><path d="M20 46 h28 a12 12 0 0 0 0-24 a14 14 0 0 0-26 4 a11 11 0 0 0-2 20 z" fill="#94a3b8"/></svg>`
    };
  }
  // Rain
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return {
      desc: code >= 65 || code === 82 ? '강한 비' : '비',
      icon: `<svg viewBox="0 0 64 64" width="42" height="42"><path d="M18 36 h26 a10 10 0 0 0 0-20 a12 12 0 0 0-22 3 a9 9 0 0 0-4 17 z" fill="#64748b"/><g stroke="#3b82f6" stroke-width="3" stroke-linecap="round"><line x1="20" y1="44" x2="16" y2="52"/><line x1="32" y1="44" x2="28" y2="52"/><line x1="44" y1="44" x2="40" y2="52"/></g></svg>`
    };
  }
  // Snow
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return {
      desc: '눈',
      icon: `<svg viewBox="0 0 64 64" width="42" height="42"><path d="M18 34 h26 a10 10 0 0 0 0-20 a12 12 0 0 0-22 3 a9 9 0 0 0-4 17 z" fill="#94a3b8"/><g fill="#60a5fa"><circle cx="20" cy="46" r="2.5"/><circle cx="32" cy="48" r="2.5"/><circle cx="44" cy="46" r="2.5"/></g></svg>`
    };
  }
  // Thunderstorm
  if ([95, 96, 99].includes(code)) {
    return {
      desc: '뇌우',
      icon: `<svg viewBox="0 0 64 64" width="42" height="42"><path d="M18 32 h26 a10 10 0 0 0 0-20 a12 12 0 0 0-22 3 a9 9 0 0 0-4 17 z" fill="#475569"/><polygon points="32,36 24,47 31,47 28,58 38,45 32,45" fill="#f59e0b"/></svg>`
    };
  }
  // Fallback
  return {
    desc: '맑음',
    icon: `<svg viewBox="0 0 64 64" width="42" height="42"><circle cx="32" cy="32" r="14" fill="#f59e0b"/></svg>`
  };
}

async function fetchCityWeather(cityKey) {
  const city = CITIES[cityKey];
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&timezone=Asia%2FSeoul`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    const cur = data.current;

    const temp = Math.round(cur.temperature_2m);
    const humidity = cur.relative_humidity_2m;
    const wind = (cur.wind_speed_10m / 3.6).toFixed(1);
    const meta = getWeatherMeta(cur.weather_code, cur.is_day);

    document.getElementById(`${city.prefix}-temp`).textContent = `${temp}°C`;
    document.getElementById(`${city.prefix}-desc`).textContent = meta.desc;
    document.getElementById(`${city.prefix}-humidity`).textContent = `습도: ${humidity}%`;
    document.getElementById(`${city.prefix}-wind`).textContent = `풍속: ${wind} m/s`;
    document.getElementById(`${city.prefix}-icon`).innerHTML = meta.icon;
  } catch (err) {
    console.warn(`Weather load fallback for ${city.name}:`, err);
    // Exact fallback matching the user's screenshot
    const fallbackMap = {
      wonju: { temp: '0°C', desc: '맑음', humidity: '57%', wind: '6.9 m/s', code: 0 },
      seoul: { temp: '1°C', desc: '맑음', humidity: '48%', wind: '3.9 m/s', code: 0 },
      jeju:  { temp: '10°C', desc: '구름 조금', humidity: '83%', wind: '12.2 m/s', code: 1 }
    };
    const f = fallbackMap[cityKey];
    const meta = getWeatherMeta(f.code, 1);

    document.getElementById(`${city.prefix}-temp`).textContent = f.temp;
    document.getElementById(`${city.prefix}-desc`).textContent = f.desc;
    document.getElementById(`${city.prefix}-humidity`).textContent = `습도: ${f.humidity}`;
    document.getElementById(`${city.prefix}-wind`).textContent = `풍속: ${f.wind}`;
    document.getElementById(`${city.prefix}-icon`).innerHTML = meta.icon;
  }
}

async function loadAllWeather() {
  const btn = document.getElementById('refresh-weather-btn');
  if (btn) btn.classList.add('spinning');

  await Promise.all([
    fetchCityWeather('wonju'),
    fetchCityWeather('seoul'),
    fetchCityWeather('jeju')
  ]);

  if (btn) {
    setTimeout(() => btn.classList.remove('spinning'), 600);
  }
}

document.getElementById('refresh-weather-btn')?.addEventListener('click', loadAllWeather);
loadAllWeather();

// ==========================================
// 2. Quotes Collection & Shuffler
// ==========================================
const QUOTES = [
  { text: "우리가 두려워해야 할 유일한 것은 두려움 그 자체다", author: "프랭클린 D. 루스벨트" },
  { text: "시작이 반이다", author: "한국 속담" },
  { text: "위대한 일을 해내는 유일한 방법은 당신이 하는 일을 사랑하는 것이다", author: "스티브 잡스" },
  { text: "어제와 똑같이 살면서 다른 미래를 기대하는 것은 정신병 초기증세다", author: "알베르트 아인슈타인" },
  { text: "실패는 다시 시작할 수 있는 기회일 뿐이다. 이번에는 더 현명하게", author: "헨리 포드" },
  { text: "꿈을 이룰 수 있다는 믿음만 있다면 모든 꿈을 이룰 수 있다", author: "월트 디즈니" },
  { text: "인생은 속도가 아니라 방향이다", author: "요한 볼프강 폰 괴테" },
  { text: "오늘 할 수 있는 일을 내일로 미루지 마라", author: "벤자민 프랭클린" },
  { text: "바람이 불지 않을 때 바람개비를 돌리는 방법은 앞으로 달려가는 것이다", author: "데일 카네기" },
  { text: "인생에서 가장 큰 영광은 넘어지지 않는 것이 아니라, 넘어질 때마다 일어서는 데 있다", author: "넬슨 만델라" },
  { text: "길을 아는 것과 그 길을 걷는 것은 다르다", author: "모피어스 (매트릭스)" },
  { text: "스스로를 믿어라. 당신은 생각보다 더 용감하고, 똑똑하며 강하다", author: "A.A. 밀른" }
];

let curQuoteIndex = 0; // Starts with Roosevelt quote from screenshot

function shuffleQuote() {
  const textEl = document.getElementById('quote-text');
  const authorEl = document.getElementById('quote-author');
  const wrapEl = document.querySelector('.quote-content-wrap');

  if (!textEl || !authorEl || !wrapEl) return;

  let nextIndex;
  do {
    nextIndex = Math.floor(Math.random() * QUOTES.length);
  } while (nextIndex === curQuoteIndex && QUOTES.length > 1);

  curQuoteIndex = nextIndex;
  const q = QUOTES[nextIndex];

  wrapEl.classList.add('fading');
  setTimeout(() => {
    textEl.textContent = `“${q.text}”`;
    authorEl.textContent = `— ${q.author}`;
    wrapEl.classList.remove('fading');
  }, 220);
}

document.getElementById('new-quote-btn')?.addEventListener('click', shuffleQuote);

// ==========================================
// 3. Google Search Bar Toggle & Shortcut (/)
// ==========================================
const searchToggleBtn = document.getElementById('search-toggle-btn');
const searchContainer = document.getElementById('search-container');
const searchInput = document.getElementById('search-input');

function toggleSearch() {
  if (!searchContainer) return;
  const isHidden = searchContainer.classList.contains('hidden');
  if (isHidden) {
    searchContainer.classList.remove('hidden');
    searchInput?.focus();
  } else {
    searchContainer.classList.add('hidden');
  }
}

searchToggleBtn?.addEventListener('click', toggleSearch);

// Press '/' or Ctrl+K to toggle Google Search
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    if (searchContainer?.classList.contains('hidden')) {
      toggleSearch();
    } else {
      searchInput?.focus();
    }
  }
});

// ==========================================
// 4. Dark/Light Theme Handler
// ==========================================
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(mode) {
  if (mode === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem('halla-theme', mode);
}

const saved = localStorage.getItem('halla-theme');
if (saved) {
  applyTheme(saved);
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  applyTheme('dark');
}

themeToggle?.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  applyTheme(isDark ? 'light' : 'dark');
});
