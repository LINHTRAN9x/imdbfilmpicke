/* ════════════════════════════════════════════════════════════════
   IMDb What to Watch — app.js
   Full port of Python tkinter app to vanilla JS + TMDB API
   ════════════════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════════════════════════════
   SECTION 1 — CONSTANTS & DATA
══════════════════════════════════════════════════════════════ */

const CURRENT_YEAR = new Date().getFullYear();
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG  = 'https://image.tmdb.org/t/p';

const TMDB_GENRE_MAP = {
  28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',
  99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',
  27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Sci-Fi',
  10770:'TV Movie',53:'Thriller',10752:'War',37:'Western'
};

const DECADE_OPTIONS = {
  'Tất cả thời đại':['',''],
  [`🆕 ${CURRENT_YEAR}`]:[`${CURRENT_YEAR}-01-01`,`${CURRENT_YEAR}-12-31`],
  [`📅 ${CURRENT_YEAR-1}`]:[`${CURRENT_YEAR-1}-01-01`,`${CURRENT_YEAR-1}-12-31`],
  [`🔥 2 năm gần đây (${CURRENT_YEAR-1}–${CURRENT_YEAR})`]:[`${CURRENT_YEAR-1}-01-01`,`${CURRENT_YEAR}-12-31`],
  [`📆 5 năm gần đây (${CURRENT_YEAR-4}–${CURRENT_YEAR})`]:[`${CURRENT_YEAR-4}-01-01`,`${CURRENT_YEAR}-12-31`],
  [`📆 10 năm gần đây (${CURRENT_YEAR-9}–${CURRENT_YEAR})`]:[`${CURRENT_YEAR-9}-01-01`,`${CURRENT_YEAR}-12-31`],
  '2020s (2020–nay)':['2020-01-01',''],
  '2010s (2010–2019)':['2010-01-01','2019-12-31'],
  '2000s (2000–2009)':['2000-01-01','2009-12-31'],
  '1990s (1990–1999)':['1990-01-01','1999-12-31'],
  '1980s (1980–1989)':['1980-01-01','1989-12-31'],
  '1970s (1970–1979)':['1970-01-01','1979-12-31'],
  'Trước 1970':['','1969-12-31'],
  '🔧 Tùy chỉnh...': null,
};

const GENRE_OPTIONS = {
  '🎬 Tất cả thể loại':'',
  '🎭 Drama':'drama','💥 Action':'action','😂 Comedy':'comedy',
  '👻 Horror':'horror','🚀 Sci-Fi':'sci-fi','🕵️ Thriller':'thriller',
  '💕 Romance':'romance','🧪 Crime':'crime','🧙 Fantasy':'fantasy',
  '🏔️ Adventure':'adventure','🧚 Animation':'animation',
  '🎵 Musical':'musical','📖 Biography':'biography','📚 History':'history',
  '🌍 Documentary':'documentary','🔍 Mystery':'mystery',
  '👨‍👩‍👧 Family':'family','⚔️ War':'war','🤠 Western':'western',
  '🕳️ Film Noir':'film-noir','👾 Superhero':'superhero',
  '🏎️ Sports':'sport','🛸 Space':'sci-fi,adventure',
  '🗡️ Martial Arts':'action,adventure','🌀 Mind-Bending':'mystery,sci-fi',
};

const LANGUAGE_OPTIONS = {
  '🌐 Tất cả ngôn ngữ':'',
  '🇺🇸 English':'en','🇻🇳 Tiếng Việt':'vi','🇰🇷 Korean':'ko',
  '🇯🇵 Japanese':'ja','🇨🇳 Chinese':'zh','🇫🇷 French':'fr',
  '🇪🇸 Spanish':'es','🇮🇳 Hindi':'hi','🇹🇭 Thai':'th',
  '🇩🇪 German':'de','🇮🇹 Italian':'it','🇵🇹 Portuguese':'pt',
  '🇷🇺 Russian':'ru','🇹🇷 Turkish':'tr','🇸🇦 Arabic':'ar',
};

const SORT_OPTIONS = {
  '🔥 Phổ biến nhất':'popularity.desc',
  '⭐ Đánh giá cao nhất':'vote_average.desc',
  '🆕 Mới nhất':'release_date.desc',
  '🗳️ Nhiều vote nhất':'vote_count.desc',
  '💰 Doanh thu cao nhất':'revenue.desc',
  '📅 Cũ nhất trước':'release_date.asc',
  '🔤 A–Z':'original_title.asc',
};

const RATING_OPTIONS = {
  'Tất cả rating':'',
  '⭐ 6.0+':'6.0','⭐ 6.5+':'6.5','⭐ 7.0+':'7.0',
  '⭐ 7.5+':'7.5','⭐ 8.0+':'8.0','⭐ 8.5+':'8.5','⭐ 9.0+':'9.0',
};

const TYPE_OPTIONS = {
  '🎬 Phim lẻ (Feature)':'movie',
  '📺 TV Series':'tv',
  '🔂 Mini Series':'tv', // filtered by type
  '🎬+📺 Phim lẻ + TV':'both',
  '🌍 Documentary':'movie', // genre doc
};

const COUNT_OPTIONS = ['12','16','20','24','32','40','50','75','100'];

const STATIC_SOURCES = {
  '⭐ Phổ biến nhất (Movie)':       {type:'movie', sort:'popularity.desc', minVotes:1000},
  '⭐ Đánh giá cao nhất (Movie)':   {type:'movie', sort:'vote_average.desc', minVotes:5000},
  '🆕 Mới nhất':                    {type:'movie', sort:'release_date.desc', minVotes:100},
  '🔥 Top Trending This Week':      {type:'movie', sort:'popularity.desc', year: CURRENT_YEAR},
  [`🆕 Best of ${CURRENT_YEAR}`]:     {type:'movie', sort:'vote_average.desc', year: CURRENT_YEAR, minVotes:100},
  [`📅 Best of ${CURRENT_YEAR-1}`]:   {type:'movie', sort:'vote_average.desc', year: CURRENT_YEAR-1, minVotes:500},
  '🕰️ Best of 2010s':               {type:'movie', sort:'vote_average.desc', yearFrom:2010, yearTo:2019, minVotes:5000},
  '📼 Best of 2000s':               {type:'movie', sort:'vote_average.desc', yearFrom:2000, yearTo:2009, minVotes:5000},
  '📽️ Best of 1990s':               {type:'movie', sort:'vote_average.desc', yearFrom:1990, yearTo:1999, minVotes:3000},
  '🎞️ Classics (trước 1980)':       {type:'movie', sort:'vote_average.desc', yearTo:1979, minVotes:100},
  '❤️ Fan Favorites (Nhiều vote)':  {type:'movie', sort:'vote_count.desc'},
  '💰 Doanh thu cao nhất':          {type:'movie', sort:'revenue.desc'},
  // ── STREAMING ──
  '🔴 New on Netflix':            {type:'movie', sort:'release_date.desc',  watchProvider:8,   watchRegion:'US', minVotes:50},
  '🔴 Popular on Netflix':        {type:'movie', sort:'popularity.desc',    watchProvider:8,   watchRegion:'US'},
  '🔴 Best on Netflix':           {type:'movie', sort:'vote_average.desc',  watchProvider:8,   watchRegion:'US', minVotes:5000},
  '📺 New on HBO Max':            {type:'movie', sort:'release_date.desc',  watchProvider:384, watchRegion:'US', minVotes:50},
  '📺 Popular on HBO Max':        {type:'movie', sort:'popularity.desc',    watchProvider:384, watchRegion:'US'},
  '🔵 New on Disney+':            {type:'movie', sort:'release_date.desc',  watchProvider:337, watchRegion:'US', minVotes:50},
  '🔵 Popular on Disney+':        {type:'movie', sort:'popularity.desc',    watchProvider:337, watchRegion:'US'},
  '🟡 New on Amazon Prime':       {type:'movie', sort:'release_date.desc',  watchProvider:9,   watchRegion:'US', minVotes:50},
  '🟡 Popular on Amazon Prime':   {type:'movie', sort:'popularity.desc',    watchProvider:9,   watchRegion:'US'},
  '⚫ New on Apple TV+':          {type:'movie', sort:'release_date.desc',  watchProvider:350, watchRegion:'US', minVotes:50},
  '🦚 New on Peacock':            {type:'movie', sort:'release_date.desc',  watchProvider:386, watchRegion:'US', minVotes:50},
  '🌟 New on Paramount+':         {type:'movie', sort:'release_date.desc',  watchProvider:531, watchRegion:'US', minVotes:50},
  '📡 Best TV Series':              {type:'tv',    sort:'vote_average.desc', minVotes:20000},
  '🔂 Best Mini Series':            {type:'tv',    sort:'vote_average.desc', minVotes:10000, miniSeries:true},
  [`📺 Best TV of ${CURRENT_YEAR}`]:  {type:'tv',    sort:'vote_average.desc', year:CURRENT_YEAR, minVotes:1000},
  '🇰🇷 Best Korean':                {type:'movie', sort:'vote_average.desc', lang:'ko', minVotes:5000},
  '🇯🇵 Best Japanese':              {type:'movie', sort:'vote_average.desc', lang:'ja', minVotes:5000},
  '🇫🇷 Best French':                {type:'movie', sort:'vote_average.desc', lang:'fr', minVotes:5000},
  '🇮🇳 Best Hindi / Bollywood':     {type:'movie', sort:'vote_average.desc', lang:'hi', minVotes:5000},
};

const DECADE_PRESETS = [
  [String(CURRENT_YEAR), `🆕 ${CURRENT_YEAR}`],
  ['2 năm', `🔥 2 năm gần đây (${CURRENT_YEAR-1}–${CURRENT_YEAR})`],
  ['5 năm', `📆 5 năm gần đây (${CURRENT_YEAR-4}–${CURRENT_YEAR})`],
  ['2020s', '2020s (2020–nay)'],
  ['2010s', '2010s (2010–2019)'],
  ['2000s', '2000s (2000–2009)'],
  ['1990s', '1990s (1990–1999)'],
  ['Tất cả', 'Tất cả thời đại'],
];

const GENRE_COLORS = {
  action:'#c0392b',comedy:'#e67e22',drama:'#8e44ad',horror:'#2c3e50',
  'sci-fi':'#2980b9',thriller:'#6d4c41',romance:'#e91e63',animation:'#27ae60',
  crime:'#546e7a',fantasy:'#5e35b1',history:'#f9a825',documentary:'#00897b',
  family:'#7cb342',war:'#8d6e63',western:'#ff7043',biography:'#039be5',
  mystery:'#455a64',musical:'#ab47bc',adventure:'#00acc1',
};

/* ══════════════════════════════════════════════════════════════
   SECTION 2 — STATE
══════════════════════════════════════════════════════════════ */

const STATE = {
  pageStack: [],
  tmdbKey: '',
  theme: 'dark',
  tab: 'browse',
  filterMode: 'filter',
  filterCollapsed: false,
  // filter values
  decade: `🔥 2 năm gần đây (${CURRENT_YEAR-1}–${CURRENT_YEAR})`,
  genre: '🎬 Tất cả thể loại',
  sort: '🔥 Phổ biến nhất',
  rating: '⭐ 7.0+',
  type: '🎬 Phim lẻ (Feature)',
  language: '🌐 Tất cả ngôn ngữ',
  count: '24',
  staticSrc: Object.keys(STATIC_SOURCES)[0],
  yearFrom: '', yearTo: '',
  customDateActive: false,
  cinemaRegion: 'US',
  otdYearFrom: '1980',
  otdType: '',
  // runtime
  movies: [],
  allMovies: [],
  watchlist: {},
  detailCache: {},
  pageNextStatic: 2,
  pageExhausted: false,
  loadToken: 0,
  cinemaMovies: [],
  onThisDayCache: null,
  preDetailMovies: [],
  preDetailTab: 'browse',
  preActorMovies: [],
  preActorDetailMovie: null,
  currentDetailMovie: null,
};

/* ══════════════════════════════════════════════════════════════
   SECTION 3 — PERSISTENCE
══════════════════════════════════════════════════════════════ */

function loadStorage() {
  try {
    const cfg = JSON.parse(localStorage.getItem('imdb_config') || '{}');
    STATE.tmdbKey        = cfg.tmdbKey        || '';
    STATE.theme          = cfg.theme          || 'dark';
    STATE.filterMode     = cfg.filterMode     || 'filter';
    STATE.decade         = cfg.decade         || STATE.decade;
    STATE.genre          = cfg.genre          || STATE.genre;
    STATE.sort           = cfg.sort           || STATE.sort;
    STATE.rating         = cfg.rating         || STATE.rating;
    STATE.type           = cfg.type           || STATE.type;
    STATE.language       = cfg.language       || STATE.language;
    STATE.count          = cfg.count          || STATE.count;
    STATE.staticSrc      = cfg.staticSrc      || STATE.staticSrc;
    STATE.yearFrom       = cfg.yearFrom       || '';
    STATE.yearTo         = cfg.yearTo         || '';
    STATE.customDateActive = cfg.customDateActive || false;
    STATE.cinemaRegion   = cfg.cinemaRegion   || 'US';
    STATE.otdYearFrom    = cfg.otdYearFrom    || '1980';
    STATE.otdType        = cfg.otdType        || '';
    STATE.dailyPickShown = cfg.dailyPickShown || '';
    STATE.filterCollapsed= cfg.filterCollapsed|| false;
  } catch(e) {}

  try {
    STATE.watchlist = JSON.parse(localStorage.getItem('imdb_watchlist') || '{}');
  } catch(e) { STATE.watchlist = {}; }
}

function saveConfig() {
  const cfg = {
    tmdbKey: STATE.tmdbKey, theme: STATE.theme, filterMode: STATE.filterMode,
    decade: STATE.decade, genre: STATE.genre, sort: STATE.sort,
    rating: STATE.rating, type: STATE.type, language: STATE.language,
    count: STATE.count, staticSrc: STATE.staticSrc,
    yearFrom: STATE.yearFrom, yearTo: STATE.yearTo,
    customDateActive: STATE.customDateActive, cinemaRegion: STATE.cinemaRegion,
    otdYearFrom: STATE.otdYearFrom, otdType: STATE.otdType,
    dailyPickShown: STATE.dailyPickShown, filterCollapsed: STATE.filterCollapsed,
  };
  localStorage.setItem('imdb_config', JSON.stringify(cfg));
}

function saveWatchlist() {
  localStorage.setItem('imdb_watchlist', JSON.stringify(STATE.watchlist));
}

/* ══════════════════════════════════════════════════════════════
   SECTION 4 — TMDB API
══════════════════════════════════════════════════════════════ */

async function tmdb(path, params = {}) {
  if (!STATE.tmdbKey) throw new Error('No TMDB key');
  const url = new URL(TMDB_BASE + path);
  url.searchParams.set('api_key', STATE.tmdbKey);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`TMDB ${r.status}`);
  return r.json();
}

function buildDiscoverParams(cfg = {}) {
  // cfg comes from STATIC_SOURCES entry or filter state
  const p = {};
  if (cfg.sort)      p['sort_by']                = cfg.sort;
  if (cfg.minVotes)  p['vote_count.gte']          = cfg.minVotes;
  if (cfg.genre)     p['with_genres']             = cfg.genre;
  if (cfg.lang)      p['with_original_language']  = cfg.lang;
  if (cfg.year)      p[cfg.type === 'tv' ? 'first_air_date_year' : 'primary_release_year'] = cfg.year;
  if (cfg.yearFrom)  p[cfg.type === 'tv' ? 'first_air_date.gte' : 'primary_release_date.gte'] = cfg.yearFrom + '-01-01';
  if (cfg.yearTo)    p[cfg.type === 'tv' ? 'first_air_date.lte' : 'primary_release_date.lte'] = cfg.yearTo + '-12-31';
  if (cfg.rating)    p['vote_average.gte']        = cfg.rating;
  if (cfg.miniSeries)p['with_type']               = '3';
  if (cfg.watchProvider) p['with_watch_providers']  = cfg.watchProvider;
  if (cfg.watchRegion)   p['watch_region']           = cfg.watchRegion;
  return p;
}

async function discoverMovies(cfg, page = 1) {
  const mediaType = (cfg.type === 'tv') ? 'tv' : 'movie';
  const p = buildDiscoverParams(cfg);
  p.page = page;
  const data = await tmdb(`/discover/${mediaType}`, p);
  return { results: data.results || [], totalPages: data.total_pages || 1 };
}

function normalizeMovie(raw, mediaType = 'movie') {
  const isTV = mediaType === 'tv';
  const release = raw.release_date || raw.first_air_date || '';
  const genres = (raw.genre_ids || []).slice(0, 3).map(id => TMDB_GENRE_MAP[id] || '').filter(Boolean);
  return {
    title:       raw.title || raw.name || '',
    year:        release.slice(0, 4),
    rating:      String(Math.round((raw.vote_average || 0) * 10) / 10),
    genre:       genres.join(', '),
    description: raw.overview || '',
    poster:      raw.poster_path ? `${TMDB_IMG}/w342${raw.poster_path}` : '',
    tmdb_id:     String(raw.id || ''),
    imdb_id:     '',
    url:         '',
    mediaType,
    vote_count:  raw.vote_count || 0,
    release_date: release,
  };
}

async function fetchFilterMovies() {
  if (!STATE.tmdbKey) return { movies: [], error: 'nokey' };
  try {
    const typeKey = STATE.type;
    const typeVal = TYPE_OPTIONS[typeKey] || 'movie';
    const mediaType = (typeVal === 'tv' || typeKey.includes('TV')) ? 'tv' : 'movie';

    const [df, dt] = getDateRange();
    const genreVal = GENRE_OPTIONS[STATE.genre] || '';
    const sortVal  = SORT_OPTIONS[STATE.sort] || 'popularity.desc';
    const ratingVal= RATING_OPTIONS[STATE.rating] || '';
    const langVal  = LANGUAGE_OPTIONS[STATE.language] || '';
    const count    = parseInt(STATE.count) || 24;

    const cfg = {
      type: mediaType,
      sort: sortVal,
    };
    if (ratingVal) cfg.rating = ratingVal;
    if (langVal)   cfg.lang   = langVal;
    if (genreVal)  {
      // Map genre string to id
      const gid = Object.entries(TMDB_GENRE_MAP).find(([,n])=> n.toLowerCase() === genreVal.replace('-','').toLowerCase());
      if (gid) cfg.genre = gid[0];
    }
    if (df) cfg.yearFrom = df.slice(0,4);
    if (dt) cfg.yearTo   = dt.slice(0,4);

    const pagesNeeded = Math.ceil(count / 20);
    let all = [];
    for (let pg = 1; pg <= Math.min(pagesNeeded, 5); pg++) {
      const { results } = await discoverMovies(cfg, pg);
      all.push(...results.map(r => normalizeMovie(r, mediaType)));
      if (all.length >= count) break;
    }
    return { movies: all.slice(0, count) };
  } catch(e) {
    return { movies: [], error: e.message };
  }
}

async function fetchStaticMovies(srcKey) {
  if (!STATE.tmdbKey) return { movies: [], error: 'nokey' };
  try {
    const cfg = STATIC_SOURCES[srcKey];
    if (!cfg) return { movies: [] };
    const mediaType = cfg.type || 'movie';
    const { results } = await discoverMovies(cfg, 1);
    STATE.pageNextStatic = 2;
    return { movies: results.map(r => normalizeMovie(r, mediaType)) };
  } catch(e) {
    return { movies: [], error: e.message };
  }
}

async function loadMoreStatic() {
  if (!STATE.tmdbKey || STATE.pageExhausted) return;
  const cfg = STATIC_SOURCES[STATE.staticSrc];
  if (!cfg) return;
  try {
    const mediaType = cfg.type || 'movie';
    const { results, totalPages } = await discoverMovies(cfg, STATE.pageNextStatic);
    if (!results.length || STATE.pageNextStatic >= totalPages) {
      STATE.pageExhausted = true;
      return;
    }
    const newMovies = results.map(r => normalizeMovie(r, mediaType));
    const seen = new Set(STATE.movies.map(m => m.tmdb_id).filter(Boolean));
    const fresh = newMovies.filter(m => !seen.has(m.tmdb_id));
    STATE.movies.push(...fresh);
    STATE.allMovies.push(...fresh);
    STATE.pageNextStatic++;
    appendCards(fresh);
    setStatusCount(`${STATE.movies.length} phim`);
  } catch(e) {}
}

async function fetchMovieDetail(movie) {
  const cacheKey = movie.tmdb_id || movie.imdb_id || movie.title;
  if (STATE.detailCache[cacheKey] && STATE.detailCache[cacheKey]._full) {
    return STATE.detailCache[cacheKey];
  }
  if (!STATE.tmdbKey) return { _nokey: true };

  try {
    let tmdbId = movie.tmdb_id;
    let mediaType = movie.mediaType || 'movie';

    if (!tmdbId && movie.imdb_id) {
      const found = await tmdb(`/find/${movie.imdb_id}`, { external_source: 'imdb_id' });
      const res = found.movie_results?.[0] || found.tv_results?.[0];
      if (!res) return {};
      tmdbId = String(res.id);
      mediaType = found.movie_results?.length ? 'movie' : 'tv';
    }

    if (!tmdbId) return {};

    const [info, videos, similar] = await Promise.all([
      tmdb(`/${mediaType}/${tmdbId}`, { append_to_response: 'credits,images' }),
      tmdb(`/${mediaType}/${tmdbId}/videos`),
      tmdb(`/${mediaType}/${tmdbId}/similar`),
    ]);

    // IMDb ID
    const extIds = await tmdb(`/${mediaType}/${tmdbId}/external_ids`).catch(()=>({}));
    if (extIds.imdb_id) {
      movie.imdb_id = extIds.imdb_id;
      movie.url = `https://www.imdb.com/title/${extIds.imdb_id}/`;
    }

    const runtime = info.runtime || (info.episode_run_time || [])[0] || 0;
    const h = Math.floor(runtime / 60), mn = runtime % 60;
    const runtimeStr = runtime ? (h ? `${h}h ${mn}m` : `${mn} phút`) : '';

    const crew = info.credits?.crew || [];
    const directors = crew.filter(p => p.job === 'Director').map(p => p.name).slice(0, 2);

    const cast = (info.credits?.cast || []).slice(0, 8).map(p => ({
      name: p.name,
      character: p.character || '',
      avatar: p.profile_path ? `${TMDB_IMG}/w185${p.profile_path}` : '',
      tmdb_id: String(p.id),
    }));

    // Trailer
    const trailerList = (videos.results || []).filter(v => v.site === 'YouTube');
    const trailer = (trailerList.find(v => v.type === 'Trailer' && v.official)
                  || trailerList.find(v => v.type === 'Trailer')
                  || trailerList[0]);
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '';
    const trailerThumb = trailer ? `https://img.youtube.com/vi/${trailer.key}/mqdefault.jpg` : '';
    const trailerKey = trailer?.key || '';

    // Images
    const backdrops = (info.images?.backdrops || []).sort((a,b) => b.vote_average - a.vote_average);
    const backdrop = backdrops[0] ? `${TMDB_IMG}/w1280${backdrops[0].file_path}` : '';
    const screenshots = backdrops.slice(1, 9).map(b => `${TMDB_IMG}/w500${b.file_path}`);

    // Similar
    const simMovies = (similar.results || []).slice(0, 10).map(r => normalizeMovie(r, mediaType));

    // Genres
    const genres = (info.genres || []).map(g => g.name).join(', ');

    const detail = {
      _full: true,
      director: directors.join(', '),
      cast,
      runtime: runtimeStr,
      votes: (info.vote_count || 0).toLocaleString(),
      trailerUrl, trailerThumb, trailerKey,
      backdrop, screenshots,
      similar: simMovies,
      genres,
      description: info.overview || movie.description || '',
      tmdb_id: String(tmdbId),
      mediaType,
    };

    STATE.detailCache[cacheKey] = detail;
    return detail;
  } catch(e) {
    console.warn('[fetchMovieDetail]', e);
    return {};
  }
}

async function fetchNowPlaying(region = 'US', page = 1) {
  if (!STATE.tmdbKey) return { movies: [], error: 'nokey' };
  try {
    const data = await tmdb('/movie/now_playing', { region: region.toUpperCase(), page });
    const movies = (data.results || []).map(r => ({
      ...normalizeMovie(r, 'movie'),
      now_playing: true,
    }));
    return { movies, totalPages: data.total_pages || 1 };
  } catch(e) {
    return { movies: [], error: e.message };
  }
}

async function fetchOnThisDay(month, day, yearFrom = 1980, yearTo = CURRENT_YEAR - 1, mediaTypeFilter = '') {
  if (!STATE.tmdbKey) return [];
  const years = [];
  for (let y = yearTo; y >= yearFrom; y--) years.push(y);

  const fetchYear = async (year) => {
    try {
      const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const endpoints = mediaTypeFilter === 'movie' ? ['movie']
                      : mediaTypeFilter === 'tv'    ? ['tv']
                      : mediaTypeFilter === 'mini'  ? ['tv']
                      : ['movie','tv'];

      for (const ep of endpoints) {
        const dateField = ep === 'movie' ? 'primary_release_date' : 'first_air_date';
        const extra = (mediaTypeFilter === 'mini') ? { with_type: '3' } : {};
        const thresholds = [1000, 800, 600, 400, 200, 100, 50, 0];

        const requests = thresholds.map(minVotes =>
          tmdb(`/discover/${ep}`, {
            [`${dateField}.gte`]: dateStr,
            [`${dateField}.lte`]: dateStr,
            sort_by: 'vote_average.desc',
            ...(minVotes > 0 ? { 'vote_count.gte': minVotes } : {}),
            ...extra,
          }).then(d => ({ minVotes, results: d.results || [] }))
            .catch(() => ({ minVotes, results: [] }))
        );

        const all = await Promise.all(requests);
        const best = all
          .sort((a, b) => b.minVotes - a.minVotes)
          .find(r => r.results.length > 0);

        if (best) {
          return {
            year,
            exact_date: best.results[0].release_date || best.results[0].first_air_date || dateStr,
            movie: normalizeMovie(best.results[0], ep),
          };
        }
      }
      return null;
    } catch(e) { return null; }
  };

  const results = [];
  for (let i = 0; i < years.length; i += 8) {
    const batch = years.slice(i, i + 8);
    const settled = await Promise.all(batch.map(fetchYear));
    settled.forEach(r => { if (r) results.push(r); });
  }
  results.sort((a, b) => b.year - a.year);
  return results;
}

async function fetchPersonDetail(name) {
  if (!STATE.tmdbKey) return null;
  try {
    const search = await tmdb('/search/person', { query: name });
    const person = search.results?.[0];
    if (!person) return null;
    const data = await tmdb(`/person/${person.id}`, { append_to_response: 'movie_credits,tv_credits' });

    const JUNK = ['tonight show','late show','late night','daily show','talk show','game show','jimmy','ellen','wendy'];
    const isJunk = t => JUNK.some(j => t.toLowerCase().includes(j));

    const crew = (data.movie_credits?.crew || []).filter(m => m.job === 'Director' && m.title && m.release_date);
    const directed = crew.map(m => ({
      ...normalizeMovie(m, 'movie'),
      vote_count: m.vote_count || 0,
      genre_ids: m.genre_ids || [],
    })).filter(m => m.vote_count >= 50).sort((a,b) => b.year - a.year);

    const castMovies = (data.movie_credits?.cast || [])
      .filter(m => m.title && m.release_date && !isJunk(m.title) && (m.vote_count||0) >= 100)
      .map(m => ({ ...normalizeMovie(m,'movie'), vote_count: m.vote_count||0, character: m.character||'' }))
      .sort((a,b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, 20);

    const castTV = (data.tv_credits?.cast || [])
      .filter(m => m.name && m.first_air_date && !isJunk(m.name) && (m.vote_count||0) >= 50)
      .map(m => ({ ...normalizeMovie(m,'tv'), vote_count: m.vote_count||0, character: m.character||'' }))
      .sort((a,b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, 6);

    return {
      id: person.id,
      tmdb_id: String(person.id),
      imdb_id: data.imdb_id || '',
      name: data.name || name,
      avatar: data.profile_path ? `${TMDB_IMG}/w342${data.profile_path}` : '',
      birthday: data.birthday || '',
      deathday: data.deathday || '',
      birthplace: data.place_of_birth || '',
      biography: data.biography || '',
      known_for: data.known_for_department || '',
      directed,
      filmography: castMovies.concat(castTV).slice(0, 20),
      isDirector: directed.length > 0,
    };
  } catch(e) {
    console.warn('[fetchPersonDetail]', e);
    return null;
  }
}

async function fetchImdbExternalId(tmdbId, mediaType = 'movie') {
  if (!STATE.tmdbKey || !tmdbId) return null;
  try {
    const data = await tmdb(`/${mediaType}/${tmdbId}/external_ids`);
    return data.imdb_id || null;
  } catch(e) { return null; }
}

async function fetchSuggestions(query) {
  if (!query || query.length < 2 || !STATE.tmdbKey) return [];
  try {
    const data = await tmdb('/search/multi', { query, page: 1 });
    return (data.results || [])
      .filter(r => r.media_type === 'movie' || r.media_type === 'tv')
      .slice(0, 8)
      .map(r => ({
        title: r.title || r.name || '',
        year: (r.release_date || r.first_air_date || '').slice(0, 4),
        tmdb_id: String(r.id),
        mediaType: r.media_type,
        poster: r.poster_path ? `${TMDB_IMG}/w92${r.poster_path}` : '',
        description: r.overview?.slice(0, 80) || '',
      }));
  } catch(e) { return []; }
}

/* ══════════════════════════════════════════════════════════════
   SECTION 5 — DOM HELPERS
══════════════════════════════════════════════════════════════ */

const $ = id => document.getElementById(id);
const qs = sel => document.querySelector(sel);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };

function setStatus(msg) { $('status-text').textContent = msg; }
function setStatusCount(msg) { $('status-count').textContent = msg; }
function setStatusUrl(msg) { $('status-url').textContent = msg; }

function showToast(msg, type = 'info', icon = '💬') {
  let container = $('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = el('div', `toast toast-${type}`);
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-msg">${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function showEl(...ids) { ids.forEach(id => $(`${id}`)?.classList.remove('hidden')); }
function hideEl(...ids) { ids.forEach(id => $(`${id}`)?.classList.add('hidden')); }

function ratingBg(val) {
  const v = parseFloat(val);
  if (isNaN(v)) return '#555';
  return v >= 7.5 ? '#00cc66' : v >= 6.0 ? '#f5c518' : '#ff6644';
}
function ratingFg(val) {
  const v = parseFloat(val);
  return (!isNaN(v) && v >= 6.0) ? '#000' : '#fff';
}

function getGenreColor(genreStr) {
  const g = (genreStr || '').toLowerCase().split(',')[0].trim();
  return GENRE_COLORS[g] || '#e50914';
}

function sanitize(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function lazyImg(imgEl, src) {
  if (!src) return;
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      imgEl.src = src;
      imgEl.onload = () => imgEl.style.opacity = '1';
      io.disconnect();
    }
  }, { rootMargin: '200px' });
  io.observe(imgEl);
  imgEl.style.opacity = '0';
  imgEl.style.transition = 'opacity 0.3s';
}

/* ══════════════════════════════════════════════════════════════
   SECTION 6 — POPULATE SELECTS
══════════════════════════════════════════════════════════════ */

function populateSelects() {
  function fill(sel, opts, current) {
    sel.innerHTML = '';
    Object.keys(opts).forEach(k => {
      const o = document.createElement('option');
      o.value = k; o.textContent = k;
      if (k === current) o.selected = true;
      sel.appendChild(o);
    });
  }
  fill($('sel-decade'),   DECADE_OPTIONS,   STATE.decade);
  fill($('sel-genre'),    GENRE_OPTIONS,    STATE.genre);
  fill($('sel-sort'),     SORT_OPTIONS,     STATE.sort);
  fill($('sel-rating'),   RATING_OPTIONS,   STATE.rating);
  fill($('sel-type'),     TYPE_OPTIONS,     STATE.type);
  fill($('sel-language'), LANGUAGE_OPTIONS, STATE.language);
  fill($('sel-static'),   STATIC_SOURCES,   STATE.staticSrc);

  // Count
  const sc = $('sel-count');
  sc.innerHTML = '';
  COUNT_OPTIONS.forEach(v => {
    const o = document.createElement('option');
    o.value = v; o.textContent = v;
    if (v === STATE.count) o.selected = true;
    sc.appendChild(o);
  });

  // Decade presets
  const container = $('decade-presets');
  container.innerHTML = '';
  DECADE_PRESETS.forEach(([label, key]) => {
    const b = el('button', 'preset-btn', label);
    b.addEventListener('click', () => {
      STATE.decade = key;
      STATE.customDateActive = false;
      $('sel-decade').value = key;
      hideEl('custom-date-wrap');
      saveConfig();
      loadMovies();
    });
    container.appendChild(b);
  });

  // OTD year from
  const oyd = $('otd-year-from');
  oyd.innerHTML = '';
  for (let y = 1920; y < CURRENT_YEAR; y += 10) {
    const o = document.createElement('option');
    o.value = y; o.textContent = y;
    if (String(y) === STATE.otdYearFrom) o.selected = true;
    oyd.appendChild(o);
  }

  updateKeyBtn();
  updateWlTab();
}

function getDateRange() {
  if (STATE.customDateActive) {
    const yf = STATE.yearFrom, yt = STATE.yearTo;
    return [
      /^\d{4}$/.test(yf) ? `${yf}-01-01` : '',
      /^\d{4}$/.test(yt) ? `${yt}-12-31` : '',
    ];
  }
  const val = DECADE_OPTIONS[STATE.decade];
  if (!val) return ['',''];
  return val;
}

/* ══════════════════════════════════════════════════════════════
   SECTION 7 — CARD RENDERING
══════════════════════════════════════════════════════════════ */

function createSkeletons(count = 12) {
  const grid = $('movie-grid');
  grid.innerHTML = '';
  for (let i = 0; i < Math.min(count, 20); i++) {
    const sk = el('div', 'skeleton-card');
    sk.innerHTML = `<div class="skel-poster"></div>
      <div class="skel-line"></div>
      <div class="skel-line short"></div>`;
    grid.appendChild(sk);
  }
}

function createMovieCard(m, opts = {}) {
  const card = el('div', 'movie-card');
  const wlId = m.tmdb_id || m.title;
  const inWl = !!STATE.watchlist[wlId];
  const firstGenre = (m.genre || '').split(',')[0].trim();
  const rBg = ratingBg(m.rating);
  const rFg = ratingFg(m.rating);
  const gColor = getGenreColor(firstGenre);

  // Banner
  const banner = el('div', 'card-banner');
  const ph = el('div', 'card-poster-placeholder', '🎬');
  banner.appendChild(ph);

  if (m.poster) {
    const img = document.createElement('img');
    img.alt = m.title;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;position:absolute;inset:0;';
    img.onload = () => { ph.remove(); };
    img.onerror = () => {};
    banner.style.position = 'relative';
    banner.appendChild(img);
    lazyImg(img, m.poster);
  }

  // Badge: cinema / OTD / genre
  if (opts.cinemaCard) {
    const b = el('span', 'cinema-badge', '🎬 Đang chiếu');
    banner.appendChild(b);
  } else if (opts.otdEntry) {
    const entry = opts.otdEntry;
    const ago = new Date().getFullYear() - entry.year;
    const ybg = ago<=5?'#1a3a1a':ago<=20?'#1a1a3a':ago<=40?'#2a1a0a':'#2a0a0a';
    const yfg = ago<=5?'#44ff88':ago<=20?'#f5c518':ago<=40?'#ffaa44':'#ff6644';
    const yb = el('span', 'otd-year-badge', entry.movie.genre ? entry.movie.genre.split(',')[0].trim() : '🎬');
    yb.style.background = getGenreColor((entry.movie.genre || '').split(',')[0].trim().toLowerCase());
    yb.style.cssText = `background:${ybg};color:${yfg}`;
    banner.appendChild(yb);
    
    if (entry.exact_date) {
      const db = el('span','');
      db.style.cssText='position:absolute;bottom:6px;left:8px;font-size:0.7rem;color:#aaa;background:rgba(0,0,0,0.6);padding:1px 5px;border-radius:3px;';
      db.textContent = `🗓 ${entry.exact_date}`;
      banner.appendChild(db);
    }
  } else if (firstGenre && firstGenre.toLowerCase() !== 'movie') {
    const gb = el('span', 'card-genre-badge', firstGenre.slice(0, 15));
    gb.style.background = gColor;
    banner.appendChild(gb);
  }

  // Year badge
  if (m.year && m.year !== 'N/A') {
    const yb = el('span', 'card-year-badge', m.year);
    banner.appendChild(yb);
  }

  // Heart
  const heart = el('button', 'card-heart', inWl ? '❤️' : '🤍');
  heart.title = 'Thêm/xóa Watchlist';
  heart.addEventListener('click', e => {
    e.stopPropagation();
    toggleWatchlist(wlId, m, heart);
  });
  banner.appendChild(heart);
  card.appendChild(banner);

  // Info
  const info = el('div', 'card-info');
  const title = el('div', 'card-title', m.title || '?');
  info.appendChild(title);

  const meta = el('div', 'card-meta');
  if (true) {
    const rb = el('span', 'rating-badge', m.rating && m.rating !== '0' ? `⭐ ${m.rating}` : '⭐ N/A');
    rb.style.cssText = `background:${rBg};color:${rFg}`;
    meta.appendChild(rb);
  }
  if (firstGenre && firstGenre.toLowerCase() !== 'movie' && !opts.otdEntry && !opts.cinemaCard) {
    const gt = el('span', 'genre-tag', firstGenre.slice(0, 14));
    gt.style.background = gColor;
    meta.appendChild(gt);
  }
  info.appendChild(meta);

  const desc = el('div', 'card-desc', m.description || 'Nhấn để xem chi tiết');
  info.appendChild(desc);

  const actions = el('div', 'card-actions');
  if (m.url) {
    const ib = el('button', 'card-btn imdb', 'IMDb →');
    ib.addEventListener('click', e => { e.stopPropagation(); window.open(m.url, '_blank'); });
    actions.appendChild(ib);
  }
  const db = el('button', 'card-btn', 'ℹ️ Chi tiết');
  db.title = 'Xem thêm: đạo diễn, diễn viên, thời lượng';
  db.addEventListener('click', e => { e.stopPropagation(); showDetailPage(m); });
  actions.appendChild(db);
  info.appendChild(actions);
  card.appendChild(info);

  card.addEventListener('click', () => showDetailPage(m));
  return card;
}

function renderGrid(movies, gridEl) {
  const target = gridEl || $('movie-grid');
  target.innerHTML = '';
  if (!movies.length) {
    const emp = el('div', 'empty-state');
    emp.innerHTML = '<div class="empty-icon">⚠️</div><p>Không tìm thấy phim.<br>Thử thay đổi bộ lọc hoặc nhập TMDB Key.</p>';
    target.appendChild(emp);
    return;
  }
  const seen = new Set();
  movies.forEach((m, i) => {
    const key = m.tmdb_id || m.title || i;
    if (seen.has(key)) return;
    seen.add(key);
    const card = createMovieCard(m);
    card.style.animationDelay = `${Math.min(i * 30, 500)}ms`;
    target.appendChild(card);
  });
}

function appendCards(movies) {
  const grid = $('movie-grid');
  const seen = new Set(STATE.movies.slice(0, -movies.length).map(m => m.tmdb_id).filter(Boolean));
  movies.forEach(m => {
    if (seen.has(m.tmdb_id)) return;
    seen.add(m.tmdb_id);
    grid.appendChild(createMovieCard(m));
  });
}

/* ══════════════════════════════════════════════════════════════
   SECTION 8 — LOAD MOVIES
══════════════════════════════════════════════════════════════ */

async function loadMovies() {
  STATE.loadToken++;
  const token = STATE.loadToken;
  STATE.pageNextStatic = 2;
  STATE.pageExhausted = false;

  createSkeletons(parseInt(STATE.count) || 24);
  setStatus('⏳ Đang tải...');
  setStatusCount('');

  let result;
  if (STATE.filterMode === 'static') {
    setStatusUrl(`TMDB Discover: ${STATE.staticSrc}`);
    result = await fetchStaticMovies(STATE.staticSrc);
  } else {
    const [df, dt] = getDateRange();
    setStatusUrl(`TMDB Discover: ${STATE.genre} / ${STATE.sort}`);
    result = await fetchFilterMovies();
  }

  if (token !== STATE.loadToken) return;

  if (result.error === 'nokey') {
    $('movie-grid').innerHTML = '';
    const emp = el('div','empty-state');
    emp.innerHTML = `<div class="empty-icon">🔑</div>
      <p>Cần TMDB API Key để tải phim.<br>
      <button onclick="openTmdbModal()" style="margin-top:10px;padding:8px 18px;background:var(--accent);color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:700;">🔑 Nhập TMDB Key</button></p>`;
    $('movie-grid').appendChild(emp);
    setStatus('⚠️ Chưa có TMDB Key');
    return;
  }

  STATE.movies = result.movies || [];
  STATE.allMovies = [...STATE.movies];
  renderGrid(STATE.movies);
  setStatus('✅ Đã tải xong');
  setStatusCount(`${STATE.movies.length} phim`);
}

/* ══════════════════════════════════════════════════════════════
   SECTION 9 — WATCHLIST
══════════════════════════════════════════════════════════════ */

function toggleWatchlist(wlId, movie, heartBtn) {
  if (STATE.watchlist[wlId]) {
    delete STATE.watchlist[wlId];
    showToast(`Đã xóa <b>${movie.title}</b> khỏi Watchlist`, 'remove', '💔');
    if (heartBtn) { heartBtn.textContent = '🤍'; heartBtn.classList.remove('heart-pop'); }
    // Nếu đang ở tab watchlist thì xóa card khỏi grid luôn
    if (STATE.tab === 'watchlist') {
      const card = heartBtn?.closest('.movie-card');
      if (card) {
        // Heart break animation trước
        if (heartBtn) heartBtn.classList.add('heart-break');
        setTimeout(() => {
          card.classList.add('card-poof');
          setTimeout(() => {
            card.remove();
            if (!Object.keys(STATE.watchlist).length) showWatchlist();
            else setStatusCount(`${Object.keys(STATE.watchlist).length} phim yêu thích`);
          }, 450);
        }, 200);
      }
    }
  } else {
    STATE.watchlist[wlId] = movie;
    showToast(`Đã thêm <b>${movie.title}</b> vào Watchlist`, 'add', '❤️');
    if (heartBtn) {
      heartBtn.textContent = '❤️';
      heartBtn.classList.remove('heart-pop', 'heart-add-pop');
      void heartBtn.offsetWidth;
      heartBtn.classList.add('heart-add-pop');

      // Sparkles xung quanh tim
      const SPARKS = ['❤️','✨','💖','⭐','💛'];
      for (let i = 0; i < 6; i++) {
        const spark = document.createElement('span');
        spark.className = 'heart-sparkle';
        spark.textContent = SPARKS[i % SPARKS.length];
        const angle = (i / 6) * 360;
        const dist = 30 + Math.random() * 20;
        spark.style.setProperty('--tx', `${Math.cos(angle * Math.PI/180) * dist}px`);
        spark.style.setProperty('--ty', `${Math.sin(angle * Math.PI/180) * dist}px`);
        heartBtn.appendChild(spark);
        setTimeout(() => spark.remove(), 500);
      }

      // Card glow
      const card = heartBtn.closest('.movie-card');
      if (card) {
        card.classList.remove('card-watchlist-add');
        void card.offsetWidth;
        card.classList.add('card-watchlist-add');
        setTimeout(() => card.classList.remove('card-watchlist-add'), 500);
      }
    }
  }
  saveWatchlist();
  updateWlTab();
}

function updateWlTab() {
  const n = Object.keys(STATE.watchlist).length;
  $('wl-count').textContent = `(${n})`;
}

function showWatchlist() {
  const movies = Object.values(STATE.watchlist);
  if (!movies.length) {
    $('movie-grid').innerHTML = `<div class="empty-state"><div class="empty-icon">❤️</div>
      <p>Watchlist trống<br>Hãy nhấn ❤️ trên các phim để thêm vào!</p></div>`;
    setStatusCount('0 phim');
    return;
  }
  renderGrid(movies);
  setStatusCount(`${movies.length} phim yêu thích`);

  // Clear watchlist button
  const grid = $('movie-grid');
  const clearRow = el('div', '');
  clearRow.style.cssText = 'grid-column:1/-1;text-align:center;padding:16px 0';
  const cb = el('button', '', '🗑️ Xóa toàn bộ Watchlist');
  cb.style.cssText = 'background:var(--bg-danger);color:#ddd;border:none;border-radius:6px;padding:8px 18px;cursor:pointer;font-size:0.88rem;font-weight:700;';
  cb.addEventListener('click', () => {
    if (confirm('Xóa toàn bộ watchlist?')) {
      STATE.watchlist = {};
      saveWatchlist();
      updateWlTab();
      showWatchlist();
    }
  });
  clearRow.appendChild(cb);
  grid.appendChild(clearRow);
}

/* ══════════════════════════════════════════════════════════════
   SECTION 10 — DETAIL PAGE
══════════════════════════════════════════════════════════════ */

async function showDetailPage(movie) {
  // Lưu stack trước
  if (!$('detail-page').classList.contains('hidden')) {
    STATE.pageStack.push({ type: 'detail', movie: STATE.currentDetailMovie });
  } else if (!$('director-page').classList.contains('hidden')) {
    STATE.pageStack.push({ type: 'director', name: STATE.currentDirectorName });
  } else if (!$('actor-page').classList.contains('hidden')) {
    STATE.pageStack.push({ type: 'actor', actor: STATE.currentActor });
  } else {
    STATE.pageStack = [{ type: STATE.tab }];
  }

  STATE.currentDetailMovie = movie;

  // Ẩn các trang khác
  $('director-page').classList.add('hidden');
  $('actor-page').classList.add('hidden');

  const page = $('detail-page');
  const body = $('detail-body');
  body.innerHTML = '<div style="padding:40px;text-align:center;color:var(--gray);">⏳ Đang tải chi tiết...</div>';
  page.classList.remove('hidden');
  page.scrollTop = 0;

  const detail = await fetchMovieDetail(movie);
  if (detail.imdb_id) { movie.imdb_id = detail.imdb_id; movie.url = `https://www.imdb.com/title/${detail.imdb_id}/`; }
  if (detail.genres) movie.genre = detail.genres;

  renderDetailBody(body, movie, detail);
}

function renderDetailBody(body, m, d) {
  const wlId = m.tmdb_id || m.title;
  const inWl = !!STATE.watchlist[wlId];
  const genres = (d.genres || m.genre || '').split(',').map(g => g.trim()).filter(Boolean).slice(0, 5);
  const desc = d.description || m.description || '';

  body.innerHTML = '';
  const wrap = el('div', 'detail-body');

  // ── LEFT COLUMN ──
  const left = el('div', 'detail-left');
  
  const posterWrap = el('div', 'detail-poster-wrap');
  if (m.poster) {
    const img = document.createElement('img');
    img.src = m.poster;
    img.alt = m.title;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
    posterWrap.appendChild(img);
  } else {
    posterWrap.textContent = '🎬';
  }
  left.appendChild(posterWrap);

  const wlBtn = el('button', `detail-wl-btn${inWl?' in-wl':''}`, inWl ? '❤️ Đã lưu' : '🤍 Thêm Watchlist');
  wlBtn.addEventListener('click', () => {
    toggleWatchlist(wlId, m, null);
    const nw = !!STATE.watchlist[wlId];
    wlBtn.textContent = nw ? '❤️ Đã lưu' : '🤍 Thêm Watchlist';
    wlBtn.classList.toggle('in-wl', nw);
  });
  left.appendChild(wlBtn);

  const actionBtns = el('div', 'detail-action-btns');
  if (m.url) {
    const imdbB = el('button', 'detail-action-btn imdb-link-btn', '🎬 IMDb');
    imdbB.addEventListener('click', () => window.open(m.url, '_blank'));
    actionBtns.appendChild(imdbB);
  }
  left.appendChild(actionBtns);

  // Trailer
  if (d.trailerKey) {
    const tw = el('div', 'trailer-wrap');
    const tthumb = el('img', 'trailer-thumb');
    tthumb.src = d.trailerThumb || '';
    tthumb.alt = 'Trailer';
    tw.appendChild(tthumb);

    const tOverlay = el('div', 'trailer-play-overlay');
    const tBtn = el('button', 'trailer-play-btn', '▶');
    tBtn.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${d.trailerKey}?autoplay=1`;
      iframe.style.cssText = 'width:100%;height:100%;border:none;position:absolute;inset:0;';
      iframe.allow = 'autoplay; encrypted-media';
      iframe.allowFullscreen = true;
      tw.innerHTML = '';
      tw.appendChild(iframe);
    });
    tOverlay.appendChild(tBtn);
    tw.appendChild(tOverlay);
    left.appendChild(tw);
  } else if (d._full) {
    const tw = el('div', 'trailer-wrap');
    const tOverlay = el('div', 'trailer-play-overlay');
    const tlbl = el('div', 'trailer-loading', '⚠️ Không có trailer');
    tOverlay.appendChild(tlbl);
    const tsrch = el('button', 'trailer-play-btn', '🔍');
    tsrch.title = 'Tìm trailer trên YouTube';
    tsrch.addEventListener('click', () => {
      const q = encodeURIComponent(`${m.title} ${m.year} official trailer`);
      window.open(`https://www.youtube.com/results?search_query=${q}`, '_blank');
    });
    tOverlay.appendChild(tsrch);
    tw.appendChild(tOverlay);
    left.appendChild(tw);
  }

  wrap.appendChild(left);

  // ── RIGHT COLUMN ──
  const right = el('div', 'detail-right');

  const title = el('h1', 'detail-title', m.title || '?');
  right.appendChild(title);

  const metaRow = el('div', 'detail-meta-row');
  if (m.year) metaRow.appendChild(el('span', 'detail-meta-item year', `📅 ${m.year}`));
  if (m.rating && m.rating !== '0') metaRow.appendChild(el('span', 'detail-meta-item rating', `⭐ ${m.rating}`));
  if (d.runtime) metaRow.appendChild(el('span', 'detail-meta-item', `⏱️ ${d.runtime}`));
  if (d.votes) metaRow.appendChild(el('span', 'detail-meta-item', `🗳️ ${d.votes} votes`));
  const genreTags = el('div', 'detail-genre-tags');
  genres.forEach(g => { const t = el('span','detail-genre-tag',g); t.style.background=getGenreColor(g.toLowerCase()); genreTags.appendChild(t); });
  metaRow.appendChild(genreTags);
  right.appendChild(metaRow);

  // Description
  const descEl = el('p', 'detail-desc', desc || 'Đang tải mô tả...');
  right.appendChild(descEl);

  // Translate button
  const transRow = el('div', 'detail-translate-row');
  let translated = false, origDesc = desc;
  const transBtn = el('button', 'translate-btn', '🌐 Dịch sang tiếng Việt');
  transBtn.addEventListener('click', async () => {
    if (translated) {
      descEl.textContent = origDesc;
      translated = false;
      transBtn.textContent = '🌐 Dịch sang tiếng Việt';
      transBtn.style.color = '';
      return;
    }
    transBtn.textContent = '⏳ Đang dịch...';
    transBtn.disabled = true;
    try {
      const encoded = encodeURIComponent(descEl.textContent);
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encoded}`;
      const r = await fetch(url);
      const json = await r.json();
      const vi = json[0].map(p => p[0]).join('');
      origDesc = descEl.textContent;
      descEl.textContent = vi;
      translated = true;
      transBtn.textContent = '↩️ Xem bản gốc';
      transBtn.style.color = 'var(--green)';
    } catch(e) {
      transBtn.textContent = '⚠️ Lỗi dịch';
      transBtn.style.color = 'var(--accent)';
    }
    transBtn.disabled = false;
  });
  transRow.appendChild(transBtn);
  right.appendChild(transRow);

  right.appendChild(el('hr', 'detail-divider'));

  // Info rows
  const infoRows = el('div', 'detail-info-rows');
  if (d.director) {
    const row = el('div', 'detail-info-row');
    row.appendChild(el('span', 'detail-info-label', '🎬 Đạo diễn:'));
    const valEl = el('span', 'detail-info-val');
    d.director.split(',').map(s => s.trim()).filter(Boolean).forEach((name, i) => {
      if (i > 0) valEl.appendChild(document.createTextNode(', '));
      const link = el('span', 'director-link', name);
      link.addEventListener('click', () => showDirectorPage(name));
      valEl.appendChild(link);
    });
    row.appendChild(valEl);
    infoRows.appendChild(row);
  }
  if (d.cast?.length) {
    const row = el('div', 'detail-info-row');
    row.appendChild(el('span', 'detail-info-label', '🎭 Diễn viên:'));
    row.appendChild(el('span', 'detail-info-val', d.cast.map(c => c.name).join(', ')));
    infoRows.appendChild(row);
  }
  right.appendChild(infoRows);

  // Vietsub search
  const vsSection = el('div', 'vietsub-section');
    vsSection.appendChild(el('h4', '', '🔎 Tìm Vietsub trên Google'));
    const vsRow = el('div', 'vietsub-search-row');
    const vsInput = document.createElement('input');
    vsInput.type = 'text';
    vsInput.value = `${m.title} ${m.year} vietsub`;
    const vsBtn = el('button', 'apply-btn', '🔍 Tìm');
    const doVsSearch = () => {
    const q = vsInput.value.trim();
    if (!q) return;
    // Xóa kết quả cũ nếu có
    const oldFrame = vsSection.querySelector('.vietsub-iframe-wrap');
    if (oldFrame) oldFrame.remove();

    const wrap = el('div', 'vietsub-iframe-wrap');
    wrap.style.cssText = 'margin-top:10px;border-radius:8px;overflow:hidden;border:1px solid var(--border);resize:vertical;min-height:400px;';
    
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.google.com/search?q=${encodeURIComponent(q)}&igu=1`;
    iframe.style.cssText = 'width:100%;height:100%;min-height:400px;border:none;display:block;';
    iframe.allowFullscreen = true;
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allow', 'fullscreen; autoplay');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups allow-presentation allow-top-navigation');
    wrap.appendChild(iframe);
    vsSection.appendChild(wrap);
    const fsBtn = el('button', 'apply-btn', '⛶ Toàn màn hình');
    fsBtn.style.cssText = 'margin-top:6px;width:100%;';
    fsBtn.addEventListener('click', () => {
      if (wrap.requestFullscreen) wrap.requestFullscreen();
      else if (wrap.webkitRequestFullscreen) wrap.webkitRequestFullscreen();
    });
    wrap.after(fsBtn);
    wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  vsBtn.addEventListener('click', doVsSearch);
  vsInput.addEventListener('keydown', e => { if (e.key === 'Enter') doVsSearch(); });
  vsRow.appendChild(vsInput); vsRow.appendChild(vsBtn);
  vsSection.appendChild(vsRow);
  const vsSugg = el('div', 'vietsub-suggests');
  [`${m.title} vietsub full`, `${m.title} vietsub ophim`, `${m.title} vietsub phimmoi`].forEach(q => {
    const b = el('button', 'vsub-suggest', q.replace(m.title+' ',''));
    b.addEventListener('click', () => { vsInput.value = q; doVsSearch(); });
    vsSugg.appendChild(b);
  });
  vsSection.appendChild(vsSugg);
  right.appendChild(vsSection);

  right.appendChild(el('hr', 'detail-divider'));

  // Cast with avatars
  if (d.cast?.length) {
    const castSec = el('div', 'cast-section');
    castSec.appendChild(el('h4', '', '🎭 Diễn viên'));
    const castScroll = el('div', 'cast-scroll');
    d.cast.forEach(actor => {
      const card = el('div', 'cast-card');
      card.title = actor.name;
      const av = el('div', 'cast-avatar', actor.avatar ? '' : '👤');
      if (actor.avatar) {
        const img = document.createElement('img');
        img.alt = actor.name;
        img.src = actor.avatar;
        av.appendChild(img);
      }
      card.appendChild(av);
      card.appendChild(el('div', 'cast-name', actor.name));
      const char = (actor.character || '').slice(0, 20);
      if (char && !['Self','Narrator','Various'].includes(char)) {
        card.appendChild(el('div', 'cast-char', `"${char}"`));
      }
      card.addEventListener('click', () => showActorPage(actor));
      castScroll.appendChild(card);
    });
    castSec.appendChild(castScroll);
    right.appendChild(castSec);
  }

  // Similar movies
  if (d.similar?.length) {
    const simSec = el('div', 'h-scroll-section');
    simSec.appendChild(el('h4', '', '🎬 Phim tương tự'));
    const scroll = el('div', 'h-scroll');
    d.similar.forEach(sm => {
      const card = el('div', 'sim-card');
      const poster = el('div', 'sim-poster', sm.poster ? '' : '🎬');
      if (sm.poster) {
        const img = document.createElement('img');
        img.alt = sm.title; img.src = sm.poster;
        poster.appendChild(img);
      }
      card.appendChild(poster);
      const info = el('div', 'sim-info');
      info.appendChild(el('div', 'sim-title', sm.title));
      info.appendChild(el('div', 'sim-meta', `⭐${sm.rating}  ${sm.year}`));
      card.appendChild(info);
      card.addEventListener('click', () => {
        const toShow = { ...sm };
        showDetailPage(toShow);
      });
      scroll.appendChild(card);
    });
    simSec.appendChild(scroll);
    right.appendChild(simSec);
  }

  // Screenshots
  if (d.screenshots?.length) {
    const scSec = el('div', 'h-scroll-section');
    scSec.appendChild(el('h4', '', '🖼️ Ảnh từ phim'));
    const scroll = el('div', 'h-scroll');
    d.screenshots.forEach(url => {
      const th = el('div', 'screenshot-thumb');
      const img = document.createElement('img');
      img.alt = 'Screenshot'; img.src = url;
      img.addEventListener('click', () => window.open(url, '_blank'));
      th.appendChild(img);
      scroll.appendChild(th);
    });
    scSec.appendChild(scroll);
    right.appendChild(scSec);
  }

  wrap.appendChild(right);
  body.appendChild(wrap);
}

function hideDetailPage() {
  hideEl('detail-page');
}

/* ══════════════════════════════════════════════════════════════
   SECTION 11 — ACTOR / DIRECTOR PAGE
══════════════════════════════════════════════════════════════ */

async function showActorPage(actor) {
  STATE.preActorDetailMovie = STATE.currentDetailMovie;
  const page = $('actor-page');
  const body = $('actor-body');
  body.innerHTML = '<div style="padding:40px;text-align:center;color:var(--gray);">⏳ Đang tải thông tin diễn viên...</div>';
  page.classList.remove('hidden');
  page.scrollTop = 0;

  const person = await fetchPersonDetail(actor.name);
  renderActorBody(body, actor, person);
}

async function showDirectorPage(name) {
  STATE.currentDirectorName = name;
  STATE.preActorDetailMovie = STATE.currentDetailMovie;
  const page = $('director-page');
  const body = $('director-body');
  body.innerHTML = '<div style="padding:40px;text-align:center;color:var(--gray);">⏳ Đang tải thông tin đạo diễn...</div>';
  page.classList.remove('hidden');
  page.scrollTop = 0;

  const person = await fetchPersonDetail(name);
  renderActorBody(body, { name, avatar: '' }, person, true);
}

function renderActorBody(body, actorBase, person, isDirector = false) {
  body.innerHTML = '';

  const hdr = el('div', 'actor-header');

  // Avatar
  const avWrap = el('div', 'actor-avatar-wrap', person?.avatar ? '' : (isDirector ? '🎬' : '👤'));
  if (person?.avatar) {
    const img = document.createElement('img');
    img.src = person.avatar; img.alt = actorBase.name;
    avWrap.appendChild(img);
  } else if (actorBase.avatar) {
    const img = document.createElement('img');
    img.src = actorBase.avatar; img.alt = actorBase.name;
    avWrap.appendChild(img);
  }
  hdr.appendChild(avWrap);

  const info = el('div', 'actor-info');
  info.appendChild(el('div', 'actor-name', person?.name || actorBase.name));
  info.appendChild(el('div', 'actor-role', isDirector ? '🎬 Đạo diễn' : (actorBase.character ? `vai "${actorBase.character}"` : '🎭 Diễn viên')));

  if (person) {
    const metaRows = el('div', 'actor-meta-rows');
    if (person.known_for) { const r = el('div','actor-meta-row'); r.appendChild(el('span','actor-meta-lbl','🎭 Nổi tiếng với:')); r.appendChild(el('span','actor-meta-val',person.known_for)); metaRows.appendChild(r); }
    if (person.birthday)  { const r = el('div','actor-meta-row'); r.appendChild(el('span','actor-meta-lbl','🎂 Sinh ngày:')); r.appendChild(el('span','actor-meta-val',person.birthday)); metaRows.appendChild(r); }
    if (person.deathday)  { const r = el('div','actor-meta-row'); r.appendChild(el('span','actor-meta-lbl','✝️ Mất ngày:')); r.appendChild(el('span','actor-meta-val',person.deathday)); metaRows.appendChild(r); }
    if (person.birthplace){ const r = el('div','actor-meta-row'); r.appendChild(el('span','actor-meta-lbl','📍 Quê quán:')); r.appendChild(el('span','actor-meta-val',person.birthplace)); metaRows.appendChild(r); }
    info.appendChild(metaRows);

    const links = el('div', 'actor-links');
    if (person.imdb_id) {
      const b = el('button','actor-link-btn imdb','🎬 IMDb');
      b.addEventListener('click', () => window.open(`https://www.imdb.com/name/${person.imdb_id}/`,'_blank'));
      links.appendChild(b);
    }
    if (person.tmdb_id) {
      const b = el('button','actor-link-btn tmdb','🎥 TMDB');
      b.addEventListener('click', () => window.open(`https://www.themoviedb.org/person/${person.tmdb_id}`,'_blank'));
      links.appendChild(b);
    }
    info.appendChild(links);
  }
  hdr.appendChild(info);
  body.appendChild(hdr);

  if (!person) {
    body.appendChild(el('p','', !STATE.tmdbKey ? '⚠️ Cần TMDB Key để xem thông tin.' : 'Không tìm thấy thông tin.'));
    return;
  }

  // Stats bar
  const films = isDirector ? person.directed : person.filmography;
  if (films?.length) {
    const statsBar = el('div', 'stats-bar');
    const ratings = films.map(m => parseFloat(m.rating)).filter(v => !isNaN(v) && v > 0);
    const avgR = ratings.length ? (ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(1) : 'N/A';
    const best = films.reduce((a,b) => (parseFloat(a.rating)||0) >= (parseFloat(b.rating)||0) ? a : b);
    [
      ['🎬 Tổng phim', String(films.length)],
      ['⭐ Rating TB', avgR],
      ['🏆 Hay nhất', (best.title||'').slice(0,22)],
      ['📅 Mới nhất', films[0]?.year || ''],
    ].forEach(([lbl, val]) => {
      const cell = el('div','stat-cell');
      cell.appendChild(el('div','stat-val', val));
      cell.appendChild(el('div','stat-lbl', lbl));
      statsBar.appendChild(cell);
    });
    body.appendChild(statsBar);
  }
  // Biography
  if (person.biography) {
    const bioSec = el('div', 'bio-section');
    bioSec.appendChild(el('h4','','📝 Tiểu sử'));
    const bioText = el('div','bio-text', person.biography.slice(0,400) + (person.biography.length > 400 ? '...' : ''));
    bioSec.appendChild(bioText);
    const bioActions = el('div','bio-actions');
    if (person.biography.length > 400) {
      let expanded = false;
      const expBtn = el('button','bio-btn','▼ Xem thêm');
      expBtn.addEventListener('click', () => {
        expanded = !expanded;
        bioText.textContent = expanded ? person.biography : person.biography.slice(0,400) + '...';
        expBtn.textContent = expanded ? '▲ Thu gọn' : '▼ Xem thêm';
      });
      bioActions.appendChild(expBtn);
    }
    // Translate bio
    let bioTranslated = false, origBio = bioText.textContent;
    const transBtn = el('button','bio-btn','🌐 Dịch tiểu sử');
    transBtn.addEventListener('click', async () => {
      if (bioTranslated) { bioText.textContent = origBio; bioTranslated = false; transBtn.textContent = '🌐 Dịch tiểu sử'; transBtn.style.color=''; return; }
      transBtn.textContent = '⏳...'; transBtn.disabled = true;
      try {
        const encoded = encodeURIComponent(bioText.textContent);
        const r = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encoded}`);
        const json = await r.json();
        origBio = bioText.textContent;
        bioText.textContent = json[0].map(p=>p[0]).join('');
        bioTranslated = true;
        transBtn.textContent = '↩️ Bản gốc';
        transBtn.style.color = 'var(--green)';
      } catch(e) { transBtn.textContent = '⚠️ Lỗi'; }
      transBtn.disabled = false;
    });
    bioActions.appendChild(transBtn);
    bioSec.appendChild(bioActions);
    body.appendChild(bioSec);
  }


  // Sau statsBar, thêm: Known For (phim nổi tiếng nhất)
  if (isDirector && person.directed?.length) {
    const knownSec = el('div', 'h-scroll-section');
    knownSec.appendChild(el('h4', '', '🏆 Phim nổi tiếng nhất'));
    const knownRow = el('div', 'known-for-row');
    [...person.directed]
      .sort((a,b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, 6)
      .forEach(fm => {
        const card = el('div', 'known-card');
        const poster = el('div', 'known-poster', fm.poster ? '' : '🎬');
        if (fm.poster) { const img = document.createElement('img'); img.src = fm.poster; poster.appendChild(img); }
        card.appendChild(poster);
        const info = el('div', 'known-info');
        info.appendChild(el('div', 'known-title', fm.title));
        info.appendChild(el('div', 'known-meta', `⭐ ${fm.rating}  •  ${fm.year}`));
        card.appendChild(info);
        card.addEventListener('click', () => {
      STATE.pageStack.push({ type: 'director', name: STATE.currentDirectorName });
      showDetailPage({ ...fm });
    });
        knownRow.appendChild(card);
      });
    knownSec.appendChild(knownRow);
    body.appendChild(knownSec);
  }

  // Thống kê thể loại
  if (isDirector && person.directed?.length) {
    const genreSec = el('div', '');
    genreSec.style.cssText = 'margin:16px 0;';
    genreSec.appendChild(el('h4', '', '📊 Thể loại hay làm nhất'));
    const genreCount = {};
    person.directed.forEach(m => {
      (m.genre || '').split(',').map(g => g.trim()).filter(Boolean).forEach(g => {
        genreCount[g] = (genreCount[g] || 0) + 1;
      });
    });
    const maxVal = Math.max(...Object.values(genreCount));
    Object.entries(genreCount)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 8)
      .forEach(([genre, count]) => {
        const row = el('div', 'genre-bar-row');
        row.appendChild(el('span', 'genre-bar-name', genre));
        const track = el('div', 'genre-bar-track');
        const fill = el('div', 'genre-bar-fill');
        fill.style.cssText = `width:${Math.round(count/maxVal*100)}%;background:${getGenreColor(genre.toLowerCase())};`;
        track.appendChild(fill);
        row.appendChild(track);
        row.appendChild(el('span', 'genre-bar-pct', `${count} phim (${Math.round(count/person.directed.length*100)}%)`));
        genreSec.appendChild(row);
      });
    body.appendChild(genreSec);
  }

  // Toàn bộ filmography theo thập kỷ
  if (isDirector && person.directed?.length) {
    const filmSec = el('div', '');
    filmSec.appendChild(el('h4', '', `🎬 Toàn bộ tác phẩm — ${person.directed.length} phim`));
    const byDecade = {};
    person.directed.forEach(m => {
      const dec = m.year ? Math.floor(parseInt(m.year)/10)*10 + 's' : 'Unknown';
      if (!byDecade[dec]) byDecade[dec] = [];
      byDecade[dec].push(m);
    });
    Object.entries(byDecade).sort((a,b) => b[0].localeCompare(a[0])).forEach(([dec, films]) => {
      const lbl = el('div', 'decade-label', `📅 ${dec}`);
      filmSec.appendChild(lbl);
      const scroll = el('div', 'h-scroll');
      films.sort((a,b) => parseFloat(b.rating)-parseFloat(a.rating)).forEach(fm => {
        const card = el('div', 'sim-card');
        const poster = el('div', 'sim-poster', fm.poster ? '' : '🎬');
        if (fm.poster) { const img = document.createElement('img'); img.src = fm.poster; poster.appendChild(img); }
        card.appendChild(poster);
        const info = el('div', 'sim-info');
        info.appendChild(el('div', 'sim-title', fm.title));
        info.appendChild(el('div', 'sim-meta', `⭐${fm.rating}  ${fm.year}`));
        card.appendChild(info);
        card.addEventListener('click', () => {
          STATE.pageStack.push({ type: 'director', name: STATE.currentDirectorName });
          showDetailPage({ ...fm });
        });
        scroll.appendChild(card);
      });
      filmSec.appendChild(scroll);
    });
    body.appendChild(filmSec);
  }

  

  // Filmography
  if (films?.length) {
    const filmSec = el('div','h-scroll-section');
    filmSec.appendChild(el('h4','', `🎬 Filmography — ${films.length} phim`));
    const scroll = el('div','h-scroll');
    films.forEach(fm => {
      const card = el('div','sim-card');
      const poster = el('div','sim-poster', fm.poster ? '' : '🎬');
      if (fm.poster) { const img = document.createElement('img'); img.src = fm.poster; poster.appendChild(img); }
      card.appendChild(poster);
      const info = el('div','sim-info');
      info.appendChild(el('div','sim-title', fm.title));
      info.appendChild(el('div','sim-meta', `⭐${fm.rating}  ${fm.year}` + (fm.character ? `  "${fm.character.slice(0,16)}"` : '')));
      card.appendChild(info);
      card.addEventListener('click', () => {
      STATE.pageStack.push({ type: 'director', name: STATE.currentDirectorName });
      showDetailPage({ ...fm });
    });
      scroll.appendChild(card);
    });
    filmSec.appendChild(scroll);
    body.appendChild(filmSec);
  }
}


/* ══════════════════════════════════════════════════════════════
   SECTION 12 — CINEMA TAB
══════════════════════════════════════════════════════════════ */

async function loadCinema(region) {
  region = (region || STATE.cinemaRegion || 'US').toUpperCase();
  STATE.cinemaRegion = region;
  saveConfig();

  const grid = $('cinema-grid');
  grid.innerHTML = '<div class="empty-state"><div class="empty-icon">⏳</div><p>Đang tải...</p></div>';

  if (!STATE.tmdbKey) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🔑</div>
      <p>Cần TMDB Key để xem phim chiếu rạp.<br>
      <button onclick="openTmdbModal()" style="margin-top:10px;padding:8px 18px;background:var(--accent);color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:700;">🔑 Nhập Key</button></p></div>`;
    return;
  }

  const { movies, error } = await fetchNowPlaying(region);
  if (error || !movies.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Không tìm thấy phim chiếu rạp tại "${region}"</p></div>`;
    return;
  }

  STATE.cinemaMovies = movies;
  grid.innerHTML = '';
  const seen = new Set();
  movies.forEach(m => {
    if (seen.has(m.tmdb_id)) return;
    seen.add(m.tmdb_id);
    const card = createMovieCard(m, { cinemaCard: true });
    grid.appendChild(card);
  });
  setStatusCount(`${movies.length} phim đang chiếu tại ${region}`);
}

/* ══════════════════════════════════════════════════════════════
   SECTION 13 — ON THIS DAY TAB
══════════════════════════════════════════════════════════════ */

async function loadOnThisDay() {
  const now = new Date();
  const month = now.getMonth() + 1, day = now.getDate();
  $('otd-title').textContent = `📅 Ngày này năm xưa — ${day}/${month}`;

  const grid = $('onthisday-grid');
  grid.innerHTML = '<div class="empty-state"><div class="empty-icon">⏳</div><p>Đang tải...</p></div>';

  if (!STATE.tmdbKey) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🔑</div>
      <p>Cần TMDB Key.<br>
      <button onclick="openTmdbModal()" style="margin-top:10px;padding:8px 18px;background:var(--accent);color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:700;">🔑 Nhập Key</button></p></div>`;
    return;
  }

  if (STATE.onThisDayCache) {
    renderOtdGrid(STATE.onThisDayCache);
    return;
  }

  const entries = await fetchOnThisDay(month, day, parseInt(STATE.otdYearFrom)||1980, CURRENT_YEAR-1, STATE.otdType);
  STATE.onThisDayCache = entries;
  renderOtdGrid(entries);
}

function renderOtdGrid(entries) {
  const grid = $('onthisday-grid');
  grid.innerHTML = '';
  if (!entries.length) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><p>Không tìm thấy dữ liệu</p></div>';
    return;
  }
  entries.forEach(entry => {
    const card = createMovieCard(entry.movie, { otdEntry: entry });
    grid.appendChild(card);
  });
  setStatusCount(`${entries.length} phim`);
}

/* ══════════════════════════════════════════════════════════════
   SECTION 14 — BRACKET
══════════════════════════════════════════════════════════════ */

function startBracket() {
  const pool = [];
  const seen = new Set();
  const addMovies = arr => arr.forEach(m => {
    const k = m.tmdb_id || m.title;
    if (k && !seen.has(k) && m.title) { seen.add(k); pool.push(m); }
  });
  addMovies(STATE.allMovies);
  addMovies(Object.values(STATE.watchlist));
  addMovies(STATE.cinemaMovies);

  if (pool.length < 8) {
    alert('Cần ít nhất 8 phim! Hãy browse thêm phim trước.');
    return;
  }

  // Shuffle and pick 20
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const contestants = pool.slice(0, 20);
  runBracket(contestants);
}

function runBracket(contestants) {
  const overlay = $('bracket-overlay');
  overlay.classList.remove('hidden');

  // Stars canvas
  const canvas = $('bracket-star-canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() < 0.8 ? 1 : 2;
    const b = 40 + Math.floor(Math.random() * 80);
    ctx.fillStyle = `rgb(${b},${b},${b})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
  }

  const roundLabel = $('bracket-round-label');
  const subLabel   = $('bracket-sub-label');
  const cardsGrid  = $('bracket-cards');
  const winnerBanner = $('bracket-winner-banner');

  let stopped = false;
  let currentPool = [...contestants];

  const ROUNDS = [
    { keep: 10, label: 'VÒNG 1 — QUALIFYING ROUND',  color: '#4488cc' },
    { keep: 5,  label: 'VÒNG 2 — QUARTER FINALS',     color: '#9933cc' },
    { keep: 3,  label: 'VÒNG 3 — SEMI FINALS',    color: '#cc6600' },
    { keep: 1,  label: 'VÒNG 4 — FINAL',  color: '#cc2222' },
  ];

  function buildBracketCard(m) {
    const card = el('div', 'bracket-card');
    card.dataset.id = m.tmdb_id || m.title;
    const poster = el('div', 'bracket-card-poster', m.poster ? '' : '🎬');
    if (m.poster) { const img = document.createElement('img'); img.src = m.poster; poster.appendChild(img); }
    card.appendChild(poster);
    const info = el('div', 'bracket-card-info');
    info.appendChild(el('div', 'bracket-card-title', m.title));
    const rEl = el('span', 'bracket-card-rating', `⭐${m.rating}`);
    rEl.style.cssText = `background:${ratingBg(m.rating)};color:${ratingFg(m.rating)}`;
    info.appendChild(rEl);
    card.appendChild(info);
    return card;
  }

  function buildCards(movies) {
    cardsGrid.innerHTML = '';
    movies.forEach(m => cardsGrid.appendChild(buildBracketCard(m)));
  }

  function getCardEl(movie) {
    return cardsGrid.querySelector(`[data-id="${CSS.escape(movie.tmdb_id || movie.title)}"]`);
  }

  async function sweepEliminate(losers, survivors) {
    const loserIds = new Set(losers.map(m => m.tmdb_id || m.title));
    const all = [...cardsGrid.querySelectorAll('.bracket-card')];
    for (const card of all) {
      if (stopped) return;
      card.style.borderColor = '#f5c518';
      await sleep(80);
      const id = card.dataset.id;
      if (loserIds.has(id)) {
        await animateBurn(card);
      } else {
        card.style.borderColor = '#00cc66';
      }
    }
    await sleep(400);
  }

  async function animateBurn(card) {
    card.classList.add('burned');
    card.style.transition = 'none';

    const frames = [
      ['#8a2000','🔥'],['#aa3000','🔥💀'],['#cc4400','🔥🔥'],
      ['#882200','💀🔥'],['#441100','💀'],
    ];
    const ov = el('div','');
    ov.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:1.8rem;border-radius:8px;z-index:3;';
    card.style.position = 'relative';
    card.appendChild(ov);

    for (const [bg, txt] of frames) {
      ov.style.background = bg;
      ov.textContent = txt;
      // Shake effect
      card.style.transform = `translate(${(Math.random()-0.5)*6}px, ${(Math.random()-0.5)*6}px) rotate(${(Math.random()-0.5)*4}deg)`;
      await sleep(160);
    }

    // Shrink và fade
    card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    card.style.transform = 'scale(0) rotate(15deg)';
    card.style.opacity = '0';
    await sleep(300);
  }

  async function runRound(idx) {
    if (stopped || idx >= ROUNDS.length) {
      if (!stopped) showChampion(currentPool[0]);
      return;
    }
    const cfg = ROUNDS[idx];
    const keep = Math.min(cfg.keep, currentPool.length);

    // Animate round label vào
    roundLabel.style.opacity = '0';
    roundLabel.style.transform = 'scale(0.5)';
    roundLabel.textContent = cfg.label;
    roundLabel.style.color = cfg.color;
    subLabel.textContent = `${currentPool.length} phim → loại bỏ ${currentPool.length - keep} → còn ${keep}`;
    await sleep(100);
    roundLabel.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
    roundLabel.style.opacity = '1';
    roundLabel.style.transform = 'scale(1)';

    // Build cards với stagger animation
    if (idx === 0) {
      cardsGrid.innerHTML = '';
      currentPool.forEach((m, i) => {
        const card = buildBracketCard(m);
        card.style.opacity = '0';
        card.style.transform = 'scale(0.5) translateY(30px)';
        cardsGrid.appendChild(card);
        setTimeout(() => {
          card.style.transition = 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)';
          card.style.opacity = '1';
          card.style.transform = 'scale(1) translateY(0)';
        }, i * 60);
      });
      await sleep(currentPool.length * 60 + 400);
    }

    // Vòng 4 (CHUNG KẾT) — cho user bấm ROLL
    if (idx === ROUNDS.length - 1) {
      await sleep(400);

      // Highlight tất cả finalists
      cardsGrid.querySelectorAll('.bracket-card').forEach(c => {
        c.style.borderColor = '#f5c518';
        c.style.boxShadow = '0 0 20px rgba(245,197,24,0.5)';
      });

      subLabel.textContent = `⚔️ ${currentPool.length} finalists — Bạn quyết định!`;

      // Nút ROLL
      await new Promise(resolve => {
        const rollBtn = document.createElement('button');
        rollBtn.className = 'bracket-roll-btn';
        rollBtn.innerHTML = '🎲 ROLL CHAMPION';
        overlay.appendChild(rollBtn);

        // Pulse animation cho từng card
        let pulseIdx = 0;
        const cards = [...cardsGrid.querySelectorAll('.bracket-card')];
        const pulseTimer = setInterval(() => {
          cards.forEach(c => { c.style.borderColor = '#2a2a4a'; c.style.boxShadow = ''; });
          cards[pulseIdx % cards.length].style.borderColor = '#f5c518';
          cards[pulseIdx % cards.length].style.boxShadow = '0 0 30px rgba(245,197,24,0.7)';
          pulseIdx++;
        }, 300);

        rollBtn.addEventListener('click', () => {
          clearInterval(pulseTimer);
          rollBtn.style.animation = 'none';
          rollBtn.style.transform = 'scale(0.95)';
          setTimeout(() => rollBtn.remove(), 200);
          resolve();
        });
      });
    }

    const scored = currentPool.map(m => [m, (parseFloat(m.rating)||5) + Math.random()*1.5 - 0.75]);
    scored.sort((a,b) => b[1] - a[1]);
    const survivors = scored.slice(0, keep).map(([m]) => m);
    const losers    = scored.slice(keep).map(([m]) => m);

    await sweepEliminate(losers, survivors);
    currentPool = survivors;
    await sleep(500);

    if (idx < ROUNDS.length - 1) {
      // Transition cards sang vòng mới
      const oldCards = [...cardsGrid.querySelectorAll('.bracket-card:not(.burned)')];
      oldCards.forEach((c, i) => {
        setTimeout(() => {
          c.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          c.style.opacity = '0';
          c.style.transform = 'scale(0.8)';
        }, i * 40);
      });
      await sleep(oldCards.length * 40 + 350);

      // Build survivors với entrance animation
      cardsGrid.innerHTML = '';
      survivors.forEach((m, i) => {
        const card = buildBracketCard(m);
        card.style.opacity = '0';
        card.style.transform = 'scale(0.5) translateY(-20px)';
        cardsGrid.appendChild(card);
        setTimeout(() => {
          card.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)';
          card.style.opacity = '1';
          card.style.transform = 'scale(1) translateY(0)';
        }, i * 80);
      });
      await sleep(survivors.length * 80 + 400);
    }

    roundLabel.style.transition = '';
    await runRound(idx + 1);
  }

  async function showChampion(winner) {
    cardsGrid.innerHTML = '';
    // Confetti
    spawnConfetti(overlay);

    const champWrap = el('div', 'bracket-champion-wrap');
    champWrap.innerHTML = `
      <div class="champ-title">🏆 CHAMPION 🏆</div>
      <div class="champ-sub">Phim xuất sắc nhất từ mọi nguồn!</div>
      <div class="champ-card">
        <div class="champ-poster" id="champ-poster-wrap">
          <span style="font-size:3rem">🏆</span>
          <div class="champ-trophy">🏆</div>
        </div>
        <div class="champ-info">
          <div class="champ-movie-title">${sanitize(winner.title)}</div>
          <div class="champ-meta">⭐ ${winner.rating}  •  ${winner.year}</div>
        </div>
      </div>
      <div class="champ-actions">
        <button id="champ-detail-btn" class="modal-btn primary" style="padding:12px 24px;font-size:1rem;">🎬 Xem chi tiết</button>
        <button id="champ-again-btn" class="modal-btn secondary" style="padding:12px 24px;">🔄 Chơi lại</button>
        <button id="champ-close-btn" class="modal-btn ghost" style="padding:12px 18px;">✕ Đóng</button>
      </div>`;

    if (winner.poster) {
      const pw = champWrap.querySelector('#champ-poster-wrap');
      const img = document.createElement('img');
      img.src = winner.poster; img.alt = winner.title;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;position:absolute;inset:0;';
      img.onload = () => pw.querySelector('span')?.remove();
      pw.style.position = 'relative';
      pw.appendChild(img);
    }

    overlay.appendChild(champWrap);
    roundLabel.textContent = ''; subLabel.textContent = '';

    champWrap.querySelector('#champ-detail-btn').addEventListener('click', () => {
      stopped = true; closeBracket(); showDetailPage(winner);
    });
    champWrap.querySelector('#champ-again-btn').addEventListener('click', () => {
      stopped = true; closeBracket(); switchTab('bracket');
    });
    champWrap.querySelector('#champ-close-btn').addEventListener('click', () => {
      stopped = true; closeBracket();
    });
  }

  function closeBracket() {
    overlay.classList.add('hidden');
    overlay.querySelector('.bracket-champion-wrap')?.remove();
    overlay.querySelector('#confetti-canvas')?.remove();
  }

  $('btn-skip-bracket').onclick = () => { stopped = true; closeBracket(); };

  // Start!
  runRound(0);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function spawnConfetti(parent) {
  const canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  parent.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const COLORS = ['#f5c518','#e50914','#44ff88','#4488ff','#ff44cc','#ffffff','#ffaa00','#00ffcc'];
  const pieces = [];
  for (let i = 0; i < 100; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -50,
      vx: (Math.random() - 0.5) * 3,
      vy: 3 + Math.random() * 5,
      w: 6 + Math.random() * 10,
      h: 4 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.2,
    });
  }
  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.vx *= 0.99; p.rot += p.rotV;
      if (p.y < canvas.height + 20) {
        alive++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      }
    });
    if (alive > 0) requestAnimationFrame(tick);
    else canvas.remove();
  }
  requestAnimationFrame(tick);
}

/* ══════════════════════════════════════════════════════════════
   SECTION 15 — RANDOM PICK (Cinematic Rewrite)
══════════════════════════════════════════════════════════════ */

function doRandom() {
  let src = STATE.tab === 'watchlist'  ? Object.values(STATE.watchlist)
          : STATE.tab === 'cinema'     ? STATE.cinemaMovies
          : STATE.tab === 'onthisday'  ? (STATE.onThisDayCache || []).map(e => e.movie).filter(Boolean)
          : STATE.movies;
  if (!src.length) { alert('Chưa có phim!'); return; }
  const winner = src[Math.floor(Math.random() * src.length)];
  showRandomPick(winner, src);
}

function showRandomPick(winner, allMovies) {
  const overlay  = $('random-overlay');
  const phase    = $('random-phase-label');
  const cardRow  = $('random-cards');
  const winBanner= $('random-winner-banner');
  const winCard  = $('random-winner-card');
  const slotMachine = $('random-slot-machine');
  const canvas   = $('random-particle-canvas');

  // Reset
  overlay.classList.remove('hidden');
  cardRow.innerHTML = '';
  winBanner.classList.add('hidden');
  winCard.classList.add('hidden');
  slotMachine.classList.add('hidden');
  phase.className = 'random-phase-lbl';
  phase.textContent = '';

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  let stopped = false;
  let rafId   = null;

  // ── Particle system ──
  const ctx = canvas.getContext('2d');
  const particles = [];

  function spawnParticles(x, y, count, colors) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        life: 1,
        decay: 0.012 + Math.random() * 0.02,
        size: 3 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.random() > 0.5 ? 'circle' : 'rect',
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.15,
      });
    }
  }

  function tickParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x  += p.vx; p.y  += p.vy;
      p.vy += 0.18;  p.vx *= 0.98;
      p.life -= p.decay;
      p.rot += p.rotV;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
      }
      ctx.restore();
    }
    rafId = requestAnimationFrame(tickParticles);
  }
  tickParticles();

  // ── Pool for fake candidates (decoys) ──
  const others = allMovies.filter(m => (m.tmdb_id || m.title) !== (winner.tmdb_id || winner.title));
  const shuffled = [...others].sort(() => Math.random() - 0.5);
  const decoys = shuffled.slice(0, 6);
  const spinPool = [...decoys, winner].sort(() => Math.random() - 0.5);

  // ── PHASE 1: "đang lọc ứng viên…" — show spinning cards ──
  async function phase1() {
    phase.textContent = '⚙️ ĐANG QUÉT TẤT CẢ PHIM...';
    phase.classList.add('glitch');

    cardRow.classList.remove('hidden');
    cardRow.innerHTML = '';

    // ── BƯỚC 1: Vòng xoáy — cards bay vào theo spiral rồi xếp thành grid ──
    const srcMovies = STATE.tab === 'watchlist'  ? Object.values(STATE.watchlist)
                : STATE.tab === 'cinema'     ? STATE.cinemaMovies
                : STATE.tab === 'onthisday'  ? (STATE.onThisDayCache || []).map(e => e.movie).filter(Boolean)
                : STATE.movies;
    const allPool = [...srcMovies].sort(() => Math.random() - 0.5);

    const cx = window.innerWidth / 2;
    const cy = 280;

    cardRow.style.cssText = `
      position: relative;
      width: 100%;
      height: 560px;
    `;

    // Tính vị trí grid cuối cùng (6 cột x 4 hàng, căn giữa)
    const COLS = 13, CARD_W = 110, CARD_H = 130, GAP = 10;
    const PADDING = 0;
    const gridStartX = PADDING;
    const gridStartY = 40;
    const availableW = window.innerWidth - PADDING * 2;
    // Tính lại CARD_W để lấp đầy chiều ngang
    const CARD_W_ACTUAL = Math.floor((availableW - (COLS - 1) * GAP) / COLS);
    const CARD_H_ACTUAL = Math.floor(CARD_W_ACTUAL * 1.2);

    const getGridPos = (i) => ({
      x: gridStartX + (i % COLS) * (CARD_W_ACTUAL + GAP),
      y: gridStartY + Math.floor(i / COLS) * (CARD_H_ACTUAL + GAP),
    });

    // Tạo tất cả cards, bắt đầu từ vị trí xoắn ốc
    const spiralCards = allPool.map((m, i) => {
      const angle = i * 137.5 * (Math.PI / 180); // golden angle
      const radius = 40 + i * 18;
      const startX = cx + Math.cos(angle) * radius - CARD_W / 2;
      const startY = cy + Math.sin(angle) * radius - CARD_H / 2;

      const c = document.createElement('div');
      c.style.cssText = `
        position: absolute;
        width: ${CARD_W}px; height: ${CARD_H}px;
        left: ${startX}px; top: ${startY}px;
        border-radius: 8px; overflow: hidden;
        border: 1px solid rgba(245,197,24,0.4);
        opacity: 0;
        transform: scale(0.2) rotate(${Math.random()*360}deg);
        transition: none;
        box-shadow: 0 0 10px rgba(245,197,24,0.3);
        z-index: 2;
      `;
      if (m.poster) {
        const img = document.createElement('img');
        img.src = m.poster;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
        c.appendChild(img);
      } else {
        c.style.background = '#1a1a2e';
        c.style.display = 'flex'; c.style.alignItems = 'center';
        c.style.justifyContent = 'center'; c.style.fontSize = '2rem';
        c.textContent = '🎬';
      }
      cardRow.appendChild(c);
      return { el: c, startX, startY, movie: m };
    });

    // Phase A: cards xuất hiện theo xoắn ốc từ trung tâm ra
    for (let i = 0; i < spiralCards.length; i++) {
      if (stopped) return;
      const { el } = spiralCards[i];
      setTimeout(() => {
        el.style.transition = 'opacity 0.25s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)';
        el.style.opacity = '1';
        el.style.transform = 'scale(1) rotate(0deg)';
        // Particle nhỏ
        const rect = el.getBoundingClientRect();
        spawnParticles(rect.left + CARD_W/2, rect.top + CARD_H/2, 5, ['#f5c518','#fff','#44ff88']);
      }, i * 55);
    }
    await sleep(spiralCards.length * 55 + 400);

    // Phase B: tất cả bay vào đúng vị trí grid + auto scroll theo
    phase.textContent = '🎯 XẾP HÀNG...';
    spiralCards.forEach(({ el }, i) => {
      const { x, y } = getGridPos(i);
      el.style.transition = `left 0.55s cubic-bezier(0.4,0,0.2,1) ${i*18}ms, top 0.55s cubic-bezier(0.4,0,0.2,1) ${i*18}ms, transform 0.55s ease ${i*18}ms, box-shadow 0.3s ease`;
      el.style.left = x + 'px';
      el.style.top  = y + 'px';
      el.style.transform = 'scale(1) rotate(0deg)';
    });

    // Auto scroll theo card cuối cùng đang bay xuống
    const totalRows = Math.ceil(spiralCards.length / COLS);
    const totalGridH = totalRows * (CARD_H_ACTUAL + GAP) + gridStartY;
    const scrollContainer = overlay;
    let scrollDone = false;
    const scrollFollow = () => {
      const totalDuration = spiralCards.length * 18 + 600;
      const startTime = performance.now();
      const startScroll = scrollContainer.scrollTop;
      const endScroll = Math.max(0, totalGridH - window.innerHeight + 120);

      const tick = (now) => {
        if (stopped || scrollDone) return;
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / totalDuration, 1);
        // easeInOutCubic
        const ease = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        scrollContainer.scrollTop = startScroll + (endScroll - startScroll) * ease;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    scrollFollow();
    scrollFollow();

    await sleep(spiralCards.length * 18 + 600);
    scrollDone = true;

    // Phase C: quét highlight qua grid
    phase.textContent = '⚙️ ĐANG PHÂN TÍCH...';
    for (let round = 0; round < 14; round++) {
      if (stopped) return;
      spiralCards.forEach(({ el }) => {
        el.style.boxShadow = '0 0 6px rgba(255,255,255,0.1)';
        el.style.border = '1px solid rgba(245,197,24,0.2)';
        el.style.transform = 'scale(1)';
      });
      const picks = [...spiralCards].sort(() => Math.random()-0.5).slice(0, 4);
      picks.forEach(({ el }) => {
        el.style.boxShadow = '0 0 22px #f5c518, 0 0 8px #fff';
        el.style.border = '2px solid #f5c518';
        el.style.transform = 'scale(1.08)';
      });
      await sleep(90);
    }

    // Phase D: tất cả thu nhỏ và biến mất
    phase.textContent = '✅ ĐÃ CHỌN XONG!';
    spiralCards.forEach(({ el }, i) => {
      el.style.transition = `opacity 0.3s ease ${i*15}ms, transform 0.3s ease ${i*15}ms`;
      el.style.opacity = '0';
      el.style.transform = 'scale(0.5)';
    });
    await sleep(spiralCards.length * 15 + 350);
    cardRow.innerHTML = '';
    cardRow.style.cssText = '';
    await sleep(100);

    // ── BƯỚC 2: Zoom ra 6 finalist với stagger animation ──
    phase.textContent = '🎯 ĐÃ CHỌN RA 6 ỨNG VIÊN!';
    phase.classList.remove('glitch');

    const candidatePool = [winner, ...decoys.slice(0, 5)].sort(() => Math.random() - 0.5);
    const candidateCards = [];

    for (let i = 0; i < candidatePool.length; i++) {
      const card = buildMiniCard(candidatePool[i], false);
      card.classList.add('rp-candidate');
      card.style.opacity = '0';
      card.style.transform = 'scale(0) rotate(-15deg)';
      card.style.transition = `opacity 0.35s ease ${i * 80}ms, transform 0.35s cubic-bezier(0.34,1.56,0.64,1) ${i * 80}ms`;
      cardRow.appendChild(card);
      candidateCards.push({ card, movie: candidatePool[i] });

      // Spawn particles từ vị trí card
      setTimeout(() => {
        const rect = card.getBoundingClientRect();
        spawnParticles(rect.left + rect.width/2, rect.top + rect.height/2, 12,
          ['#f5c518','#fff','#44ff88']);
      }, i * 80 + 100);
    }

    // Trigger animation
    await sleep(50);
    candidateCards.forEach(({ card }) => {
      card.style.opacity = '1';
      card.style.transform = 'scale(1) rotate(0deg)';
    });

    await sleep(candidatePool.length * 80 + 400);

    // ── BƯỚC 3: Flickering highlight như cũ ──
    phase.textContent = '⚙️ ĐANG LỌC ỨNG VIÊN...';
    phase.classList.add('glitch');

    const FLICKER_COLORS = ['#f5c518','#e50914','#44ff88','#4488ff','#ff44cc'];
    let fi = 0;
    const flickerTimer = setInterval(() => {
      candidateCards.forEach(({ card }) => card.classList.remove('rp-highlighted'));
      const active = Math.floor(Math.random() * candidateCards.length);
      candidateCards[active].card.classList.add('rp-highlighted');
      candidateCards[active].card.style.setProperty('--hl-color', FLICKER_COLORS[fi % FLICKER_COLORS.length]);
      const rect = candidateCards[active].card.getBoundingClientRect();
      spawnParticles(rect.left + rect.width/2, rect.top + rect.height/2, 4, ['#f5c518','#fff']);
      fi++;
    }, 120);

    await sleep(3000);
    clearInterval(flickerTimer);
    candidateCards.forEach(({ card }) => card.classList.remove('rp-highlighted'));

    // ── BƯỚC 4: Loại dần ──
    phase.textContent = '🔥 ĐANG LOẠI DẦN...';
    phase.classList.remove('glitch');

    const order = candidateCards
      .filter(c => (c.movie.tmdb_id || c.movie.title) !== (winner.tmdb_id || winner.title))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const survivors = candidateCards.filter(c => !order.includes(c));

    for (const { card } of order) {
      await sleep(500);
      card.classList.add('rp-eliminated');
      const rect = card.getBoundingClientRect();
      spawnParticles(rect.left + rect.width/2, rect.top + rect.height/2, 10,
        ['#e50914','#ff4444','#aa0000']);
      await sleep(400);
      card.style.visibility = 'hidden';
    }

    survivors.forEach(({ card }) => {
      card.classList.add('rp-highlighted');
      card.style.setProperty('--hl-color', '#f5c518');
    });
    await sleep(1200);

    // ── BƯỚC 5: ROLL button ──
    await new Promise(resolve => {
      const rollBtn = document.createElement('button');
      rollBtn.className = 'rp-roll-btn';
      rollBtn.innerHTML = '🎰 ROLL WINNER';
      overlay.appendChild(rollBtn);
      rollBtn.addEventListener('click', () => { rollBtn.remove(); resolve(); });
    });

    cardRow.classList.add('hidden');
    cardRow.innerHTML = '';
    return survivors.map(c => c.movie);
  }

  // ── PHASE 2: Slot machine spin ──
  async function phase2(survivors) {
    // Dùng đúng 3 survivors thay vì spinPool
    const reelMovies = [...survivors].sort(() => Math.random() - 0.5);
    const winnerReelIdx = reelMovies.findIndex(m => (m.tmdb_id || m.title) === (winner.tmdb_id || winner.title));
    phase.textContent = '🎰 XÁC NHẬN...';
    slotMachine.classList.remove('hidden');
    slotMachine.classList.add('slot-enter');

    

    // Build reel items
    [1, 2, 3].forEach(ri => {
      const inner = $(`slot-inner-${ri}`);
      inner.innerHTML = '';
      const movie = reelMovies[ri - 1];  // ← mỗi reel = 1 survivor
      for (let i = 0; i < 14; i++) {
        const tile = document.createElement('div');
        tile.className = 'slot-tile';
        if (movie.poster) {
          const img = document.createElement('img'); img.src = movie.poster; tile.appendChild(img);
        } else { tile.textContent = '🎬'; }
        inner.appendChild(tile);
      }
    });

    // Spin each reel and stop
    const TILE_H = 220;
    const reelDelays = [1200, 2200, 3400]; // ms before each reel stops

    const spinPromises = [1, 2, 3].map((ri, idx) => new Promise(resolve => {
      const inner = $(`slot-inner-${ri}`);
      const totalTiles = inner.children.length;
      let pos = 0;
      const speed = 18 + Math.random() * 8;
      let decel = 0;
      let isDecelerating = false;
      const targetPos = (totalTiles - 1) * TILE_H;

      function spinTick() {
        if (stopped) { resolve(); return; }
        if (isDecelerating) {
          decel += 0.8;
          pos += Math.max(speed - decel, 0);
          if (decel >= speed || pos >= targetPos) {
            // Snap to last tile
            inner.style.transform = `translateY(-${targetPos}px)`;
            inner.style.transition = 'transform 0.3s cubic-bezier(0.25, 1.5, 0.5, 1)';
            // Flash the reel
            $(`slot-reel-${ri}`).classList.add('slot-locked');
            const cx = $(`slot-reel-${ri}`).getBoundingClientRect();
            spawnParticles(cx.left + cx.width/2, cx.top + cx.height/2, 18,
              ri === winnerReelIdx + 1 ? ['#f5c518','#ffe066','#ffffff','#ffcc00'] : ['#44ff88','#00cc66']);
            resolve();
            return;
          }
        } else {
          pos += speed;
          if (pos >= totalTiles * TILE_H) pos = 0;
        }
        inner.style.transition = 'none';
        inner.style.transform = `translateY(-${pos % (totalTiles * TILE_H)}px)`;
        requestAnimationFrame(spinTick);
      }

      // Start spinning immediately
      requestAnimationFrame(spinTick);

      // Stop after delay
      setTimeout(() => { isDecelerating = true; }, reelDelays[idx]);
    }));

    await Promise.all(spinPromises);
    await sleep(600);

    // Loại reel 1 và 2 (winner luôn ở reel 3)
    const loserReels = [1, 2, 3].filter(ri => ri - 1 !== winnerReelIdx);
    for (const ri of loserReels) {
      await sleep(400);
      const reel = $(`slot-reel-${ri}`);
      // Flash đỏ 3 lần
      for (let f = 0; f < 3; f++) {
        reel.style.transition = 'border-color 0.08s, box-shadow 0.08s';
        reel.style.borderColor = '#ff2222';
        reel.style.boxShadow = '0 0 24px rgba(255,0,0,0.9)';
        await sleep(80);
        reel.style.borderColor = '#2a2a4a';
        reel.style.boxShadow = 'none';
        await sleep(80);
      }
      // Bay ra ngoài
      reel.style.transition = 'transform 0.4s ease, opacity 0.4s ease, filter 0.3s ease';
      reel.style.filter = 'brightness(2) saturate(0)';
      reel.style.transform = ri === 1 ? 'translateX(-300px) rotate(-15deg) scale(0.3)' : 'translateX(300px) rotate(15deg) scale(0.3)';
      reel.style.opacity = '0';
      const rect = reel.getBoundingClientRect();
      spawnParticles(rect.left + rect.width/2, rect.top + rect.height/2, 20,
        ['#ff2222','#ff6644','#aa0000','#fff']);
      await sleep(450);
    }

    // Winner reel (reel 3) phát sáng và di chuyển vào giữa
    const winnerReel = $(`slot-reel-${winnerReelIdx + 1}`);
    winnerReel.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, border-color 0.3s';
    winnerReel.style.borderColor = '#f5c518';
    winnerReel.style.boxShadow = '0 0 40px rgba(245,197,24,0.9), 0 0 80px rgba(245,197,24,0.4)';
    winnerReel.style.transform = 'scale(1.15)';
    const wr = winnerReel.getBoundingClientRect();
    spawnParticles(wr.left + wr.width/2, wr.top + wr.height/2, 40,
      ['#f5c518','#ffe066','#fff','#ffcc00','#44ff88']);
    await sleep(800);

    slotMachine.classList.add('hidden');
    // Reset styles
    [1,2,3].forEach(ri => {
      const r = $(`slot-reel-${ri}`);
      r.classList.remove('slot-locked');
      r.style.transform = ''; r.style.opacity = ''; r.style.filter = '';
      r.style.borderColor = ''; r.style.boxShadow = ''; r.style.transition = '';
      $(`slot-inner-${ri}`).style.transform = '';
      $(`slot-inner-${ri}`).style.transition = '';
    });
    [1,2,3].forEach(ri => {
      $(`slot-reel-${ri}`).classList.remove('slot-locked');
      $(`slot-inner-${ri}`).style.transform = '';
      $(`slot-inner-${ri}`).style.transition = '';
    });
  }

  // ── PHASE 3: WINNER REVEAL ──
  async function phase3() {
    phase.textContent = '';

    // Big center spotlight reveal
    winCard.classList.remove('hidden');
    winCard.innerHTML = '';

    const wc = buildWinnerCard(winner);
    winCard.appendChild(wc);

    // Explosion burst from center
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    spawnParticles(cx, cy, 80, ['#f5c518','#ffe066','#fff','#ffcc00','#ff9900','#44ff88','#4488ff','#ff44cc']);

    // Ring waves on canvas
    let ringTime = 0;
    const ringFrames = 40;
    function drawRing() {
      if (ringTime >= ringFrames) return;
      const progress = ringTime / ringFrames;
      const r = progress * 300;
      const alpha = 1 - progress;
      ctx.save();
      ctx.strokeStyle = `rgba(245,197,24,${alpha * 0.6})`;
      ctx.lineWidth = 3 - progress * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      ringTime++;
      setTimeout(drawRing, 16);
    }
    drawRing();

    await sleep(500);
    winBanner.textContent = `🏆 ${winner.title}`;
    winBanner.classList.remove('hidden');
    winBanner.classList.add('winner-banner-in');

    await sleep(4000);
    if (!stopped) {
      stopped = true;
      closeRandom();
      showDetailPage(winner);
    }
  }

  // ── CLOSE ──
  function closeRandom() {
    cancelAnimationFrame(rafId);
    overlay.classList.add('hidden');
    overlay.classList.remove('random-dim');
    cardRow.innerHTML = '';
    winCard.innerHTML = '';
    winBanner.classList.add('hidden');
    winBanner.classList.remove('winner-banner-in');
    slotMachine.classList.add('hidden');
    phase.textContent = '';
    particles.length = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  $('btn-skip-random').onclick = () => {
    stopped = true;
    closeRandom();
    showDetailPage(winner);
  };

  // ── RUN SEQUENCE ──
  (async () => {
    const survivors = await phase1();
    if (stopped) return;
    await sleep(600);
    await phase2(survivors);
    if (stopped) return;
    await sleep(500);        // ← thêm dòng này
    await phase3();
  })();
}

// ── Build a small candidate card ──
function buildMiniCard(m) {
  const card = document.createElement('div');
  card.className = 'rp-mini-card';

  const poster = document.createElement('div');
  poster.className = 'rp-mini-poster';
  if (m.poster) {
    const img = document.createElement('img');
    img.src = m.poster; img.alt = m.title;
    poster.appendChild(img);
  } else {
    poster.textContent = '🎬';
  }
  card.appendChild(poster);

  const info = document.createElement('div');
  info.className = 'rp-mini-info';

  const t = document.createElement('div');
  t.className = 'rp-mini-title';
  t.textContent = m.title;
  info.appendChild(t);

  const meta = document.createElement('div');
  meta.className = 'rp-mini-meta';
  if (m.rating && m.rating !== '0') {
    const rb = document.createElement('span');
    rb.className = 'rp-mini-rating';
    rb.textContent = `⭐ ${m.rating}`;
    rb.style.cssText = `background:${ratingBg(m.rating)};color:${ratingFg(m.rating)}`;
    meta.appendChild(rb);
  }
  if (m.year) {
    const yr = document.createElement('span');
    yr.className = 'rp-mini-year';
    yr.textContent = m.year;
    meta.appendChild(yr);
  }
  info.appendChild(meta);
  card.appendChild(info);
  return card;
}

// ── Build the big winner card ──
function buildWinnerCard(m) {
  const wrap = document.createElement('div');
  wrap.className = 'rp-winner-wrap';
  wrap.innerHTML = `
    <div class="rp-winner-crown">👑</div>
    <div class="rp-winner-poster-wrap">
      <div class="rp-winner-glow"></div>
      <div class="rp-winner-poster" id="rp-wcard-poster">
        <span style="font-size:3rem">🎬</span>
      </div>
    </div>
    <div class="rp-winner-info">
      <div class="rp-winner-label">WINNER FILM</div>
      <div class="rp-winner-title">${sanitize(m.title)}</div>
      <div class="rp-winner-meta">
        <span class="rp-winner-rating" style="background:${ratingBg(m.rating)};color:${ratingFg(m.rating)}">⭐ ${m.rating}</span>
        <span class="rp-winner-year">📅 ${m.year || '?'}</span>
        ${m.genre ? `<span class="rp-winner-genre">${m.genre.split(',')[0].trim()}</span>` : ''}
      </div>
    </div>`;

  if (m.poster) {
    const pw = wrap.querySelector('#rp-wcard-poster');
    const img = document.createElement('img');
    img.src = m.poster; img.alt = m.title;
    img.onload = () => pw.querySelector('span')?.remove();
    pw.appendChild(img);
  }
  return wrap;
}

/* ══════════════════════════════════════════════════════════════
   SECTION 16 — SEARCH + AUTOCOMPLETE
══════════════════════════════════════════════════════════════ */

let searchDebounce = null, acDebounce = null, acIdx = -1;

function setupSearch() {
  const input = $('search-input');
  const dropdown = $('autocomplete-dropdown');

  input.addEventListener('input', () => {
    const q = input.value.trim();
    // Filter local
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      if (!q) {
        STATE.movies = [...STATE.allMovies];
        if (STATE.tab === 'browse') renderGrid(STATE.movies);
      } else {
        const ql = q.toLowerCase();
        STATE.movies = STATE.allMovies.filter(m =>
          (m.title||'').toLowerCase().includes(ql) ||
          (m.genre||'').toLowerCase().includes(ql) ||
          (m.description||'').toLowerCase().includes(ql));
        if (STATE.tab === 'browse') renderGrid(STATE.movies);
      }
    }, 250);

    // Autocomplete
    clearTimeout(acDebounce);
    if (q.length < 2) { dropdown.classList.add('hidden'); return; }
    acDebounce = setTimeout(async () => {
      const results = await fetchSuggestions(q);
      showAutocomplete(results);
    }, 350);
  });

  input.addEventListener('keydown', e => {
    const items = dropdown.querySelectorAll('.ac-item');
    if (e.key === 'ArrowDown') { acIdx = Math.min(acIdx+1, items.length-1); highlightAc(items); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { acIdx = Math.max(acIdx-1, 0); highlightAc(items); e.preventDefault(); }
    else if (e.key === 'Enter') {
      if (!dropdown.classList.contains('hidden') && acIdx >= 0) {
        items[acIdx]?.click();
      } else {
        searchImdb();
      }
    }
    else if (e.key === 'Escape') { dropdown.classList.add('hidden'); }
  });

  document.addEventListener('click', e => {
    if (!dropdown.contains(e.target) && e.target !== input) {
      dropdown.classList.add('hidden');
    }
  });
}

function showAutocomplete(results) {
  const dropdown = $('autocomplete-dropdown');
  if (!results.length) { dropdown.classList.add('hidden'); return; }
  // Move ra body để thoát khỏi stacking context của .fullpage
  if (dropdown.parentElement !== document.body) {
    document.body.appendChild(dropdown);
  }
  dropdown.innerHTML = '';
  // Tính vị trí theo input
  const inputRect = $('search-input').getBoundingClientRect();
  dropdown.style.top  = (inputRect.bottom + 4) + 'px';
  dropdown.style.left = inputRect.left + 'px';
  dropdown.style.width = Math.max(inputRect.width, 480) + 'px';
  acIdx = -1;
  results.forEach(r => {
    const item = el('div', 'ac-item');
    const t = el('div', 'ac-title', r.title + (r.year ? `  (${r.year})` : ''));
    item.appendChild(t);
    if (r.description) item.appendChild(el('div', 'ac-sub', r.description));
    item.addEventListener('click', () => {
      $('search-input').value = r.title;
      dropdown.classList.add('hidden');
      // Search for this movie
      searchByTitle(r.title, r.tmdb_id, r.mediaType);
    });
    dropdown.appendChild(item);
  });
  dropdown.classList.remove('hidden');
}

function highlightAc(items) {
  items.forEach((it, i) => it.classList.toggle('active', i === acIdx));
}

async function searchByTitle(title, tmdbId, mediaType = 'movie') {
  if (!STATE.tmdbKey) { openTmdbModal(); return; }
  
  // Đóng detail page nếu đang mở
  $('detail-page').classList.add('hidden');
  $('actor-page').classList.add('hidden');
  $('director-page').classList.add('hidden');
  STATE.tab = 'browse';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === 'browse'));
  $('filter-panel').style.display = '';
  $('movie-grid').style.display = '';

  setStatus(`⏳ Tìm "${title}"...`);
  setStatusCount('');
  createSkeletons(12);

  try {
    let results;
    if (tmdbId) {
      const mt = mediaType || 'movie';
      const data = await tmdb(`/discover/${mt}`, {
        with_text_query: title,
        sort_by: 'vote_average.desc',
        'vote_count.gte': 10,
        page: 1,
      });
      results = (data.results || []).map(r => normalizeMovie(r, mt));
      if (!results.length) {
        // fallback: search
        const sd = await tmdb('/search/multi', { query: title });
        results = (sd.results || []).filter(r => r.media_type === 'movie' || r.media_type === 'tv')
                                    .map(r => normalizeMovie(r, r.media_type));
      }
    } else {
      const sd = await tmdb('/search/multi', { query: title });
      results = (sd.results || []).filter(r => r.media_type === 'movie' || r.media_type === 'tv')
                                  .map(r => normalizeMovie(r, r.media_type));
    }
    STATE.movies = results;
    STATE.allMovies = [...results];
    renderGrid(results);
    setStatus(`✅ Kết quả tìm kiếm: "${title}"`);
    setStatusCount(`${results.length} phim`);
  } catch(e) {
    setStatus('⚠️ Lỗi tìm kiếm');
  }
}

function searchImdb() {
  const q = $('search-input').value.trim();
  if (!q) return;
  $('autocomplete-dropdown').classList.add('hidden');
  searchByTitle(q);
}

/* ══════════════════════════════════════════════════════════════
   SECTION 17 — EXPORT
══════════════════════════════════════════════════════════════ */

function exportData(type) {
  let data;
  const isWl = type.includes('watchlist');
  data = isWl ? Object.values(STATE.watchlist) : STATE.movies;
  const fmt = type.includes('csv') ? 'csv' : 'txt';

  if (!data.length) { alert('Không có dữ liệu!'); return; }

  let content, mime, ext;
  const now = new Date().toLocaleDateString('vi-VN');
  if (fmt === 'csv') {
    const rows = [['Tên phim','Năm','Rating','Thể loại','Mô tả','URL']];
    data.forEach(m => rows.push([m.title||'', m.year||'', m.rating||'', m.genre||'', (m.description||'').replace(/\n/g,' '), m.url||'']));
    content = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    mime = 'text/csv;charset=utf-8;'; ext = 'csv';
  } else {
    content = `IMDb Movie List — ${now}\n${'='.repeat(60)}\n\n`;
    data.forEach((m, i) => {
      content += `${i+1}. ${m.title} (${m.year})\n`;
      content += `   ⭐ ${m.rating} | ${m.genre}\n`;
      if (m.description) content += `   ${m.description}\n`;
      if (m.url) content += `   🔗 ${m.url}\n`;
      content += '\n';
    });
    mime = 'text/plain;charset=utf-8;'; ext = 'txt';
  }

  const blob = new Blob(['\ufeff' + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `imdb_${isWl?'watchlist':'movies'}_${new Date().toISOString().slice(0,10)}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ══════════════════════════════════════════════════════════════
   SECTION 18 — TAB SWITCHING
══════════════════════════════════════════════════════════════ */

function switchTab(tab) {
  STATE.tab = tab;
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });

  // Show/hide panels
  const grid = $('movie-grid');
  ['tab-cinema','tab-onthisday','tab-bracket'].forEach(id => $(`${id}`)?.classList.add('hidden'));
  grid.style.display = '';

  // Filter panel
  const fp = $('filter-panel');
  if (tab === 'browse') {
    fp.style.display = '';
    setStatus('');
    renderGrid(STATE.movies);
    setStatusCount(STATE.movies.length ? `${STATE.movies.length} phim` : '');
  } else if (tab === 'watchlist') {
    fp.style.display = 'none';
    showWatchlist();
  } else if (tab === 'cinema') {
    fp.style.display = 'none';
    grid.style.display = 'none';
    $('tab-cinema').classList.remove('hidden');
    loadCinema(STATE.cinemaRegion);
  } else if (tab === 'onthisday') {
    fp.style.display = 'none';
    grid.style.display = 'none';
    $('tab-onthisday').classList.remove('hidden');
    loadOnThisDay();
  } else if (tab === 'bracket') {
    fp.style.display = 'none';
    grid.style.display = 'none';
    $('tab-bracket').classList.remove('hidden');
  }
}

/* ══════════════════════════════════════════════════════════════
   SECTION 19 — FILTER MODE / PANEL
══════════════════════════════════════════════════════════════ */

function switchFilterMode(mode) {
  STATE.filterMode = mode;
  document.querySelectorAll('.fmode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  $('static-row').classList.toggle('hidden', mode !== 'static');
  $('custom-rows').classList.toggle('hidden', mode === 'static');
  saveConfig();
  loadMovies();
}

function toggleFilterCollapse() {
  STATE.filterCollapsed = !STATE.filterCollapsed;
  const body = $('filter-body');
  body.style.display = STATE.filterCollapsed ? 'none' : '';
  $('btn-collapse').textContent = STATE.filterCollapsed ? '▼ Mở rộng' : '▲ Thu gọn';
  saveConfig();
}

function onDecadeChange() {
  const val = $('sel-decade').value;
  STATE.decade = val;
  if (val === '🔧 Tùy chỉnh...') {
    STATE.customDateActive = true;
    $('custom-date-wrap').classList.remove('hidden');
    $('year-from').value = STATE.yearFrom || String(CURRENT_YEAR - 5);
    $('year-to').value   = STATE.yearTo   || String(CURRENT_YEAR);
  } else {
    STATE.customDateActive = false;
    $('custom-date-wrap').classList.add('hidden');
    saveConfig();
    loadMovies();
  }
}

/* ══════════════════════════════════════════════════════════════
   SECTION 20 — TMDB KEY MODAL
══════════════════════════════════════════════════════════════ */

function openTmdbModal() {
  $('tmdb-key-input').value = STATE.tmdbKey;
  $('tmdb-modal').classList.remove('hidden');
  $('tmdb-key-input').focus();
}

function closeTmdbModal() {
  $('tmdb-modal').classList.add('hidden');
}

function saveTmdbKey() {
  STATE.tmdbKey = $('tmdb-key-input').value.trim();
  saveConfig();
  updateKeyBtn();
  closeTmdbModal();
  loadMovies();
}

function updateKeyBtn() {
  const btn = $('btn-tmdb-key');
  if (STATE.tmdbKey) {
    btn.textContent = '🔑 TMDB ✓';
    btn.classList.add('active');
  } else {
    btn.textContent = '🔑 TMDB Key';
    btn.classList.remove('active');
  }
}

/* ══════════════════════════════════════════════════════════════
   SECTION 21 — DAILY PICK
══════════════════════════════════════════════════════════════ */

function showDailyPick() {
  const today = new Date().toISOString().slice(0, 10);
  if (STATE.dailyPickShown === today || !STATE.movies.length) return;

  // Deterministic random using date as seed
  const seed = today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const pick = STATE.movies[seed % STATE.movies.length];
  if (!pick) return;

  STATE.dailyPickShown = today;
  saveConfig();

  $('daily-title').textContent = pick.title || '?';
  $('daily-meta').textContent = `⭐ ${pick.rating}  |  ${pick.year}`;

  const modal = $('daily-modal');
  modal.classList.remove('hidden');

  $('btn-daily-detail').onclick = () => { modal.classList.add('hidden'); showDetailPage(pick); };
  $('btn-daily-skip').onclick   = () => { modal.classList.add('hidden'); };
}

/* ══════════════════════════════════════════════════════════════
   SECTION 22 — SHUFFLE
══════════════════════════════════════════════════════════════ */

async function shuffleMovies() {
  if (!STATE.movies.length) { loadMovies(); return; }
  const copy = [...STATE.allMovies];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  STATE.movies = copy.slice(0, parseInt(STATE.count) || 24);
  renderGrid(STATE.movies);
  setStatus('🔀 Đã xáo trộn danh sách!');
}

/* ══════════════════════════════════════════════════════════════
   SECTION 23 — INFINITE SCROLL
══════════════════════════════════════════════════════════════ */

function setupInfiniteScroll() {
  const sentinel = document.createElement('div');
  sentinel.id = 'load-more-sentinel';
  sentinel.textContent = '';
  $('movie-grid').after(sentinel);

  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && STATE.filterMode === 'static' && !STATE.pageExhausted && STATE.tab === 'browse') {
      loadMoreStatic();
    }
  }, { rootMargin: '300px' });
  io.observe(sentinel);
}

/* ══════════════════════════════════════════════════════════════
   SECTION 24 — THEME
══════════════════════════════════════════════════════════════ */

function applyTheme(name) {
  STATE.theme = name;
  document.documentElement.setAttribute('data-theme', name);
  $('btn-theme').textContent = name === 'dark' ? '☀️ Light' : '🌙 Dark';
  saveConfig();
}

/* ══════════════════════════════════════════════════════════════
   SECTION 25 — EVENT BINDING
══════════════════════════════════════════════════════════════ */

function bindEvents() {
  // Header
  $('btn-theme').addEventListener('click', () => applyTheme(STATE.theme === 'dark' ? 'light' : 'dark'));
  $('btn-refresh').addEventListener('click', () => {
    if (STATE.tab === 'browse')      loadMovies();
    else if (STATE.tab === 'cinema') loadCinema(STATE.cinemaRegion);
    else if (STATE.tab === 'onthisday') { STATE.onThisDayCache = null; loadOnThisDay(); }
  });
  $('btn-random').addEventListener('click', doRandom);

  // Export menu
  $('btn-export').addEventListener('click', e => {
    e.stopPropagation();
    $('export-menu').classList.toggle('hidden');
  });
  document.addEventListener('click', () => $('export-menu').classList.add('hidden'));
  $('export-menu').addEventListener('click', e => {
    const type = e.target.dataset.export;
    if (type) { exportData(type); $('export-menu').classList.add('hidden'); }
  });

  // TMDB key
  $('btn-tmdb-key').addEventListener('click', openTmdbModal);
  $('btn-save-key').addEventListener('click', saveTmdbKey);
  $('btn-cancel-key').addEventListener('click', closeTmdbModal);
  $('tmdb-key-input').addEventListener('keydown', e => { if (e.key === 'Enter') saveTmdbKey(); });
  $('tmdb-modal').addEventListener('click', e => { if (e.target === $('tmdb-modal')) closeTmdbModal(); });

  // Search
  $('btn-search-imdb').addEventListener('click', searchImdb);
  $('btn-search-clear').addEventListener('click', () => {
    $('search-input').value = '';
    $('autocomplete-dropdown').classList.add('hidden');
    STATE.movies = [...STATE.allMovies];
    if (STATE.tab === 'browse') renderGrid(STATE.movies);
  });

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.addEventListener('click', () => switchTab(b.dataset.tab));
  });

  // Filter mode
  document.querySelectorAll('.fmode-btn').forEach(b => {
    b.addEventListener('click', () => switchFilterMode(b.dataset.mode));
  });
  $('btn-collapse').addEventListener('click', toggleFilterCollapse);

  // Filter selects
  $('sel-decade').addEventListener('change', onDecadeChange);
  $('sel-static').addEventListener('change', () => { STATE.staticSrc = $('sel-static').value; saveConfig(); loadMovies(); });
  ['sel-genre','sel-sort','sel-rating','sel-type','sel-language','sel-count'].forEach(id => {
    $(id).addEventListener('change', () => {
      const map = { 'sel-genre':'genre','sel-sort':'sort','sel-rating':'rating','sel-type':'type','sel-language':'language','sel-count':'count' };
      STATE[map[id]] = $(id).value;
      saveConfig();
      loadMovies();
    });
  });
  $('btn-apply-date').addEventListener('click', () => {
    STATE.yearFrom = $('year-from').value;
    STATE.yearTo   = $('year-to').value;
    saveConfig();
    loadMovies();
  });
  $('btn-shuffle').addEventListener('click', shuffleMovies);

  // Back buttons
  $('btn-back-detail').addEventListener('click', () => {
    hideDetailPage();
    const prev = STATE.pageStack.pop();
    if (!prev || prev.type === 'browse') {
      switchTab(STATE.preDetailTab || 'browse');
    } else if (prev.type === 'director') {
      showDirectorPage(prev.name);
    } else if (prev.type === 'actor') {
      showActorPage(prev.actor);
    } else if (prev.type === 'detail') {
      showDetailPage(prev.movie);
    } else if (prev.type === 'watchlist') {
      switchTab('watchlist');
    } else if (prev.type === 'cinema') {
      switchTab('cinema');
    } else if (prev.type === 'onthisday') {
      switchTab('onthisday');
    }
  });
  $('btn-back-actor').addEventListener('click', () => {
    $('actor-page').classList.add('hidden');
    if (STATE.preActorDetailMovie) {
      showDetailPage(STATE.preActorDetailMovie);
    }
  });
  $('btn-back-director').addEventListener('click', () => {
    $('director-page').classList.add('hidden');
    const prev = STATE.pageStack.pop();
    if (!prev || prev.type === 'browse') {
      switchTab(STATE.preDetailTab || 'browse');
    } else if (prev.type === 'detail') {
      showDetailPage(prev.movie);
    }
  });

  // Cinema
  $('btn-cinema-search').addEventListener('click', () => loadCinema($('cinema-region').value));
  $('cinema-region').addEventListener('keydown', e => { if (e.key === 'Enter') loadCinema($('cinema-region').value); });
  document.querySelectorAll('.region-presets button').forEach(b => {
    b.addEventListener('click', () => {
      $('cinema-region').value = b.dataset.region;
      loadCinema(b.dataset.region);
    });
  });

  // OTD controls
  $('otd-year-from').addEventListener('change', () => {
    STATE.otdYearFrom = $('otd-year-from').value;
    STATE.onThisDayCache = null;
    saveConfig();
    loadOnThisDay();
  });
  $('otd-type').addEventListener('change', () => {
    STATE.otdType = $('otd-type').value;
    STATE.onThisDayCache = null;
    saveConfig();
    loadOnThisDay();
  });

  // Bracket
  $('btn-start-bracket').addEventListener('click', startBracket);

  // Auto-hide search + filter + tabs on scroll down
  let lastScrollY = 0;
  let scrollTimer = null;
  const searchBar = $('search-bar');
  const filterPanel = $('filter-panel');
  const tabBar = $('tab-bar');

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;

    if (currentY > lastScrollY && currentY > 60) {
      searchBar.classList.add('bar-hidden');
      filterPanel.classList.add('bar-hidden');
      tabBar.classList.add('bar-hidden');
    } else {
      searchBar.classList.remove('bar-hidden');
      filterPanel.classList.remove('bar-hidden');
      tabBar.classList.remove('bar-hidden');
    }

    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      searchBar.classList.remove('bar-hidden');
      filterPanel.classList.remove('bar-hidden');
      tabBar.classList.remove('bar-hidden');
    }, 800);

    lastScrollY = currentY;
  }, { passive: true });

  // Parallax poster on movie cards
  document.addEventListener('mousemove', e => {
    const card = e.target.closest('.movie-card');
    if (!card) {
      // Reset card đang active nếu chuột rời
      document.querySelectorAll('.movie-card.tilt-active').forEach(c => {
        c.style.transform = '';
        c.style.setProperty('--shine-x', '50%');
        c.style.setProperty('--shine-y', '50%');
        c.style.setProperty('--shine-opacity', '0');
        c.classList.remove('tilt-active');
      });
      return;
    }

    card.classList.add('tilt-active');
    const rect = card.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width;   // 0 → 1
    const cy = (e.clientY - rect.top)  / rect.height;  // 0 → 1
    const rotX = (cy - 0.5) * -16;  // nghiêng trên/dưới
    const rotY = (cx - 0.5) *  16;  // nghiêng trái/phải

    card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.04)`;
    card.style.setProperty('--shine-x', `${cx * 100}%`);
    card.style.setProperty('--shine-y', `${cy * 100}%`);
    card.style.setProperty('--shine-opacity', '0.15');
  });

  document.addEventListener('mouseleave', () => {
    document.querySelectorAll('.movie-card.tilt-active').forEach(c => {
      c.style.transform = '';
      c.style.setProperty('--shine-opacity', '0');
      c.classList.remove('tilt-active');
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   SECTION 26 — INIT
══════════════════════════════════════════════════════════════ */

function init() {
  loadStorage();
  applyTheme(STATE.theme);
  populateSelects();
  setupSearch();
  bindEvents();
  setupInfiniteScroll();

  // Apply collapsed state
  if (STATE.filterCollapsed) {
    $('filter-body').style.display = 'none';
    $('btn-collapse').textContent = '▼ Mở rộng';
  }

  // Apply filter mode
  document.querySelectorAll('.fmode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === STATE.filterMode));
  $('static-row').classList.toggle('hidden', STATE.filterMode !== 'static');
  $('custom-rows').classList.toggle('hidden', STATE.filterMode === 'static');

  // Apply custom date
  if (STATE.customDateActive) {
    $('custom-date-wrap').classList.remove('hidden');
    $('year-from').value = STATE.yearFrom;
    $('year-to').value   = STATE.yearTo;
  }

  // Load initial movies
  loadMovies().then(() => {
    setTimeout(showDailyPick, 2000);
  });
}

document.addEventListener('DOMContentLoaded', init);


// Horizontal scroll with mouse wheel
document.addEventListener('wheel', e => {
  const hScroll = e.target.closest('.cast-scroll, .h-scroll, .known-for-row');
  if (!hScroll) return;
  e.preventDefault();
  hScroll.scrollLeft += e.deltaY;
}, { passive: false });


const tabBar = $('tab-bar');

if (currentY > lastScrollY && currentY > 60) {
  searchBar.classList.add('bar-hidden');
  filterPanel.classList.add('bar-hidden');
  tabBar.style.top = '53px';  // sát header khi search ẩn
} else {
  searchBar.classList.remove('bar-hidden');
  filterPanel.classList.remove('bar-hidden');
  tabBar.style.top = '';
}