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
      .sort((a,b) => parseFloat(b.rating) - parseFloat(a.rating));
      // bỏ .slice(0, 20) — hiển thị toàn bộ

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
      filmography: castMovies.concat(castTV),
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

  // Trailer preview layer
  const previewLayer = el('div', 'card-trailer-preview');
  const closeBtn = el('button', 'card-trailer-close', '✕');
  closeBtn.addEventListener('click', e => {
    e.stopPropagation();
    hideTrailerPreview(card, previewLayer);
  });
  banner.appendChild(previewLayer);
  banner.appendChild(closeBtn);

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

  let hoverTimer = null;
  card.addEventListener('mouseenter', () => {
    hoverTimer = setTimeout(() => showTrailerPreview(m, card, previewLayer), 900);
  });
  card.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimer);
    hideTrailerPreview(card, previewLayer);
  });
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
  STATE.currentActor = actor;
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
    const best = films
      .filter(m => (m.vote_count || 0) >= 10)
      .reduce((a, b) => 
        bayesianRating(b.rating, b.vote_count) > bayesianRating(a.rating, a.vote_count) ? b : a
      , films[0]);
    const newest = films.reduce((a,b) => (parseInt(b.year)||0) > (parseInt(a.year)||0) ? b : a);
    [
      ['🎬 Tổng phim', String(films.length)],
      ['⭐ Rating TB', avgR],
      ['🏆 Hay nhất', (best.title||'').slice(0,22)],
      ['📅 Mới nhất', newest.year || ''],
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

  

  // Filmography — nhóm theo thập kỷ nếu nhiều phim
  if (films?.length && !isDirector) {
    if (films.length > 15) {
      // Nhóm theo thập kỷ
      const filmSec = el('div', '');
      filmSec.appendChild(el('h4', '', `🎬 Filmography — ${films.length} phim`));
      const byDecade = {};
      films.forEach(m => {
        const dec = m.year ? Math.floor(parseInt(m.year)/10)*10 + 's' : 'Unknown';
        if (!byDecade[dec]) byDecade[dec] = [];
        byDecade[dec].push(m);
      });
      Object.entries(byDecade).sort((a,b) => parseInt(b[0]) - parseInt(a[0])).forEach(([dec, decFilms]) => {
        filmSec.appendChild(el('div', 'decade-label', `📅 ${dec}`));
        const scroll = el('div', 'h-scroll');
        decFilms.sort((a,b) => (parseInt(b.year)||0) - (parseInt(a.year)||0)).forEach(fm => {
          const card = el('div','sim-card');
          const poster = el('div','sim-poster', fm.poster ? '' : '🎬');
          if (fm.poster) { const img = document.createElement('img'); img.src = fm.poster; poster.appendChild(img); }
          card.appendChild(poster);
          const info = el('div','sim-info');
          info.appendChild(el('div','sim-title', fm.title));
          info.appendChild(el('div','sim-meta', `⭐${fm.rating}  ${fm.year}` + (fm.character ? `  "${fm.character.slice(0,16)}"` : '')));
          card.appendChild(info);
          card.addEventListener('click', () => showDetailPage({ ...fm }));
          scroll.appendChild(card);
        });
        filmSec.appendChild(scroll);
      });
      body.appendChild(filmSec);
    } else {
      // Ít phim → scroll ngang như cũ
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
        info.appendChild(el('div','sim-meta', `⭐${fm.rating}  ${fm.year}`));
        card.appendChild(info);
        card.addEventListener('click', () => showDetailPage({ ...fm }));
        scroll.appendChild(card);
      });
      filmSec.appendChild(scroll);
      body.appendChild(filmSec);
    }
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
  ['tab-cinema','tab-onthisday','tab-bracket','tab-newspaper','tab-screening', 'tab-livefeed'].forEach(id => $(`${id}`)?.classList.add('hidden'));
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
  } else if (tab === 'newspaper') {
    fp.style.display = 'none';
    grid.style.display = 'none';
    $('tab-newspaper').classList.remove('hidden');
    loadNewspaper();
  } else if (tab === 'screening') {
    fp.style.display = 'none';
    grid.style.display = 'none';
    $('tab-screening').classList.remove('hidden');
    loadScreeningRoom();
  } else if (tab === 'livefeed') {
    fp.style.display = 'none';
    grid.style.display = 'none';
    $('tab-livefeed').classList.remove('hidden');
    loadLiveFeed();
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
  $('btn-recommend').addEventListener('click', showRecommendPanel);

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

  $('btn-universe-actor').addEventListener('click', () => {
    if (STATE.currentActor) showCinematicUniverse(STATE.currentActor.name, 'person');
  });
  $('btn-universe-director').addEventListener('click', () => {
    if (STATE.currentDirectorName) showCinematicUniverse(STATE.currentDirectorName, 'person');
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
   SECTION 26B — FILM NEWSPAPER
══════════════════════════════════════════════════════════════ */

async function loadNewspaper() {
  const root = $('newspaper-root');
  root.innerHTML = `
    <div class="np-loading-screen">
      <div class="np-loading-inner">
        <div class="np-loading-press">
          <div class="np-press-roll"></div>
          <div class="np-press-paper"></div>
        </div>
        <div class="np-loading-title">THE FILM GAZETTE</div>
        <div class="np-loading-sub">Đang in ấn số báo hôm nay...</div>
        <div class="np-loading-dots"><span></span><span></span><span></span></div>
      </div>
    </div>`;

  if (!STATE.tmdbKey) {
    root.innerHTML = `<div class="np-empty-key">
      <div class="np-empty-icon">🔑</div>
      <p>Cần TMDB Key để xuất bản báo hôm nay.</p>
      <button onclick="openTmdbModal()" class="np-key-btn">🔑 Nhập TMDB Key</button>
    </div>`;
    return;
  }

  try {
    const today = new Date();
    // Seed theo ngày để xoay chủ đề
    const daySeed = today.getFullYear() * 10000 + (today.getMonth()+1) * 100 + today.getDate();
    const seededRand = (arr, offset=0) => arr[(daySeed + offset) % arr.length];

    const ASIA_THEMES = [
      { label: '🇰🇷 Điện Ảnh Hàn Quốc',   lang: 'ko', flag: '🇰🇷' },
      { label: '🇯🇵 Điện Ảnh Nhật Bản',    lang: 'ja', flag: '🇯🇵' },
      { label: '🇨🇳 Điện Ảnh Trung Quốc',  lang: 'zh', flag: '🇨🇳' },
      { label: '🇹🇭 Điện Ảnh Thái Lan',    lang: 'th', flag: '🇹🇭' },
      { label: '🇮🇳 Điện Ảnh Ấn Độ',       lang: 'hi', flag: '🇮🇳' },
      { label: '🇻🇳 Điện Ảnh Việt Nam',    lang: 'vi', flag: '🇻🇳' },
    ];

    const GENRE_B2_THEMES = [
      { label: '💥 Hành Động & Kinh Dị',   genres: ['28', '27'] },
      { label: '🚀 Sci-Fi & Thriller',      genres: ['878', '53'] },
      { label: '🕵️ Crime & Mystery',        genres: ['80', '9648'] },
      { label: '⚔️ War & Western',          genres: ['10752', '37'] },
      { label: '🦸 Superhero & Adventure',  genres: ['28', '12'] },
      { label: '🌀 Mind-Bending & Fantasy', genres: ['9648', '14'] },
    ];

    const GENRE_C1_THEMES = [
      { label: '🎨 Hoạt Hình & Tài Liệu',  genres: ['16', '99'] },
      { label: '💕 Tình Cảm & Gia Đình',    genres: ['10749', '10751'] },
      { label: '😂 Hài Hước & Âm Nhạc',    genres: ['35', '10402'] },
      { label: '📖 Tiểu Sử & Lịch Sử',     genres: ['36', '10749'] },
      { label: '🧪 Khoa Học & Tài Liệu',   genres: ['878', '99'] },
      { label: '👻 Kinh Dị & Bí Ẩn',       genres: ['27', '9648'] },
    ];

    const SPOTLIGHT_THEMES = [
      { label: '🏆 Phim Đoạt Oscar', sort: 'vote_average.desc', minVotes: 1000, keyword: '10181' },
      { label: '💰 Bom Tấn Phòng Vé',       sort: 'revenue.desc',      minVotes: 10000 },
      { label: '🆕 Phim Độc Lập Hay',       sort: 'vote_average.desc', minVotes: 1000, maxVotes: 10000 },
      { label: '📼 Phim Cult Classic',      sort: 'vote_average.desc', minVotes: 5000, yearTo: 1999 },
      { label: '🌍 Phim Nước Ngoài Hay',    sort: 'vote_average.desc', minVotes: 10000, excludeLang: 'en' },
      { label: '🎭 Drama Xuất Sắc',         sort: 'vote_average.desc', minVotes: 20000, genre: '18' },
    ];

    const todayAsiaTheme    = seededRand(ASIA_THEMES, 0);
    const todayB2Theme      = seededRand(GENRE_B2_THEMES, 1);
    const todayC1Theme      = seededRand(GENRE_C1_THEMES, 2);
    const todaySpotlight    = seededRand(SPOTLIGHT_THEMES, 3);
    const todayStr = today.toLocaleDateString('vi-VN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const edition = `SỐ ${today.getDate()}/${today.getMonth()+1}/${today.getFullYear()}`;

    // ── Fetch tất cả data song song ──
    const [
      trending, nowPlaying, topRated, tvPopular,
      upcoming, genre1Movies, genre2Movies,
      asiaMovies, genre3Movies, genre4Movies,
      spotlightMovies, dramaMovies
    ] = await Promise.all([
      tmdb('/trending/movie/day').catch(() => ({ results: [] })),
      tmdb('/movie/now_playing', { region: STATE.cinemaRegion || 'US' }).catch(() => ({ results: [] })),
      tmdb('/movie/top_rated').catch(() => ({ results: [] })),
      tmdb('/tv/popular').catch(() => ({ results: [] })),
      tmdb('/movie/upcoming', { region: STATE.cinemaRegion || 'US' }).catch(() => ({ results: [] })),
      // B2: genre 1 theo ngày
      tmdb('/discover/movie', { with_genres: todayB2Theme.genres[0], sort_by: 'popularity.desc', 'vote_count.gte': 500 }).catch(() => ({ results: [] })),
      // B2: genre 2 theo ngày
      tmdb('/discover/movie', { with_genres: todayB2Theme.genres[1], sort_by: 'popularity.desc', 'vote_count.gte': 200 }).catch(() => ({ results: [] })),
      // B1: Asia theo ngày
      tmdb('/discover/movie', { with_original_language: todayAsiaTheme.lang, sort_by: 'vote_average.desc', 'vote_count.gte': 1000 }).catch(() => ({ results: [] })),
      // C1: genre 3 theo ngày
      tmdb('/discover/movie', { with_genres: todayC1Theme.genres[0], sort_by: 'vote_average.desc', 'vote_count.gte': 500 }).catch(() => ({ results: [] })),
      // C1: genre 4 theo ngày
      tmdb('/discover/movie', { with_genres: todayC1Theme.genres[1], sort_by: 'vote_average.desc', 'vote_count.gte': 300 }).catch(() => ({ results: [] })),
      // Spotlight theo ngày
      tmdb('/discover/movie', {
      sort_by: todaySpotlight.sort,
      'vote_count.gte': todaySpotlight.minVotes,
      ...(todaySpotlight.genre   ? { with_genres: todaySpotlight.genre } : {}),
      ...(todaySpotlight.yearTo  ? { 'primary_release_date.lte': todaySpotlight.yearTo+'-12-31' } : {}),
      ...(todaySpotlight.keyword ? { with_keywords: todaySpotlight.keyword } : {}),
      ...(todaySpotlight.excludeLang ? { without_original_language: todaySpotlight.excludeLang } : {}),
    }).catch(() => ({ results: [] })),
      tmdb('/discover/movie', { with_genres: '18', sort_by: 'vote_average.desc', 'vote_count.gte': 3000 }).catch(() => ({ results: [] })),
    ]);

    const norm = (obj, type = 'movie') => (obj.results || []).map(r => normalizeMovie(r, type));

    const trendList    = norm(trending);
    const cinemaList   = norm(nowPlaying).slice(0, 8);
    const topRatedList = norm(topRated).slice(0, 6);
    const tvList       = norm(tvPopular, 'tv').slice(0, 5);
    const upcomingList = norm(upcoming).slice(0, 5);
    const genre1List   = norm(genre1Movies).slice(0, 5);
    const genre2List   = norm(genre2Movies).slice(0, 4);
    const asiaList     = norm(asiaMovies).slice(0, 4);
    const genre3List   = norm(genre3Movies).slice(0, 4);
    const genre4List   = norm(genre4Movies).slice(0, 4);
    const spotlightList= norm(spotlightMovies).slice(0, 4);
    const dramaList    = norm(dramaMovies).slice(0, 4);

    // Lưu pool để click
    window._npAllMovies = [
      ...trendList, ...cinemaList, ...topRatedList, ...tvList,
      ...upcomingList, ...genre1List, ...genre2List, ...asiaList,
      ...genre3List, ...genre4List, ...spotlightList, ...dramaList
    ].filter(Boolean);

    const getMovie = (m) => window._npAllMovies.find(x =>
      x.tmdb_id === m.tmdb_id || x.title === m.title
    ) || m;

    // ── Quotes xoay vòng ──
    const QUOTES = [
      { text: 'Điện ảnh là giấc mơ mà ta không cần nhắm mắt.', author: 'Federico Fellini' },
      { text: 'Phim ảnh dạy ta đồng cảm với những người chưa từng gặp.', author: 'Roger Ebert' },
      { text: 'Mỗi bộ phim là một cuộc đời khác ta được sống.', author: 'Martin Scorsese' },
      { text: 'Ánh đèn tắt, màn hình sáng — phép màu bắt đầu.', author: 'Alfred Hitchcock' },
      { text: 'Cinema là môn nghệ thuật biến thời gian thành cảm xúc.', author: 'Andrei Tarkovsky' },
    ];
    const quote = QUOTES[today.getDate() % QUOTES.length];

    const headline   = trendList[0];
    const feature1   = trendList[1];
    const feature2   = trendList[2];
    const belowFold  = trendList.slice(3, 7);
    const rawHeadline = trending.results?.[0];

    // ────────────────────────────────────────────
    // BUILD NEWSPAPER HTML
    // ────────────────────────────────────────────
    root.innerHTML = '';
    const paper = document.createElement('div');
    paper.className = 'np2-paper';

    // ── TICKER TAPE ──
    const ticker = document.createElement('div');
    ticker.className = 'np2-ticker';
    const tickerItems = [headline, ...cinemaList.slice(0,4), ...upcomingList.slice(0,3)]
      .filter(Boolean).map(m => `📽️ ${m.title} (${m.year}) — ⭐${m.rating}`).join('  ✦  ');
    ticker.innerHTML = `<div class="np2-ticker-label">🔴 TIN NÓNG</div>
      <div class="np2-ticker-track"><div class="np2-ticker-inner">${tickerItems}&nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp;${tickerItems}</div></div>`;
    paper.appendChild(ticker);

    // ── MASTHEAD ──
    const masthead = document.createElement('div');
    masthead.className = 'np2-masthead';
    masthead.innerHTML = `
      <div class="np2-mast-top-bar">
        <span class="np2-mast-info">${edition} · NHẬT BÁO ĐIỆN ẢNH · ${todayStr.toUpperCase()}</span>
        <span class="np2-mast-price">🎬 ON LIVE</span>
      </div>
      <div class="np2-mast-ornament">❧ ✦ ❧</div>
      <h1 class="np2-mast-title">The Film Gazette</h1>
      <div class="np2-mast-subtitle">Tờ Báo Điện Ảnh Uy Tín Hàng Đầu — Phê Bình · Phân Tích · Tin Tức</div>
      <div class="np2-mast-quote">"${quote.text}" <span class="np2-mast-quote-author">— ${quote.author}</span></div>
      <div class="np2-mast-rule-double"></div>`;
    paper.appendChild(masthead);

    // ── FRONT PAGE — 5 col broadsheet ──
    const front = document.createElement('div');
    front.className = 'np2-front';

    // LEFT sidebar: index + weather mood
    const leftSidebar = document.createElement('div');
    leftSidebar.className = 'np2-sidebar-left';
    leftSidebar.innerHTML = `
    <div class="np2-sidebar-section">
      <div class="np2-sidebar-label">MỤC LỤC HÔM NAY</div>
      <div class="np2-toc">
        <div class="np2-toc-item"><span class="np2-toc-pg">A1</span> Phim Nổi Bật</div>
        <div class="np2-toc-item"><span class="np2-toc-pg">A2</span> Đang Chiếu Rạp</div>
        <div class="np2-toc-item"><span class="np2-toc-pg">B1</span> ${todayAsiaTheme.label}</div>
        <div class="np2-toc-item"><span class="np2-toc-pg">B2</span> ${todayB2Theme.label}</div>
        <div class="np2-toc-item"><span class="np2-toc-pg">C1</span> ${todayC1Theme.label}</div>
        <div class="np2-toc-item"><span class="np2-toc-pg">C2</span> Sắp Ra Mắt</div>
        <div class="np2-toc-item"><span class="np2-toc-pg">D1</span> TV Series</div>
        <div class="np2-toc-item"><span class="np2-toc-pg">D2</span> ${todaySpotlight.label}</div>
      </div>
    </div>`;
    front.appendChild(leftSidebar);

    // CENTER: Headline article
    const centerCol = document.createElement('div');
    centerCol.className = 'np2-center-col';

    if (headline) {
      const raw = rawHeadline;
      const headlineArt = document.createElement('div');
      headlineArt.className = 'np2-headline-art np2-clickable';
      headlineArt.innerHTML = `
        <div class="np2-section-kicker">⭐ PHIM NỔI BẬT SỐ MỘT HÔM NAY</div>
        <h2 class="np2-headline-h">${headline.title}</h2>
        <div class="np2-byline">Bởi Ban Biên Tập · ${todayStr}</div>
        <div class="np2-headline-img">
          ${raw?.backdrop_path
            ? `<img src="${TMDB_IMG}/w780${raw.backdrop_path}" alt="${headline.title}" />`
            : `<div class="np2-no-img">🎬</div>`}
          <div class="np2-img-caption">Cảnh trong phim <em>${headline.title}</em> (${headline.year})</div>
        </div>
        <div class="np2-headline-cols">
          <p class="np2-drop-cap">${(headline.description || 'Một tác phẩm điện ảnh đang gây chú ý toàn cầu').slice(0, 300)}...</p>
          <div class="np2-read-more-pill">✦ Nhấn để đọc bài phê bình đầy đủ ✦</div>
        </div>
        <div class="np2-article-meta">
          <span>⭐ ${headline.rating}/10</span>
          <span>📅 ${headline.year}</span>
          <span>🎭 ${headline.genre || 'Drama'}</span>
          <span>🗳️ Đang trending toàn cầu</span>
        </div>`;
      headlineArt.addEventListener('click', () => openNewspaperArticle(getMovie(headline)));
      centerCol.appendChild(headlineArt);

      // Below-fold mini articles
      if (belowFold.length) {
        const bfRule = document.createElement('div');
        bfRule.className = 'np2-rule-single';
        bfRule.innerHTML = '<span>TIN THÊM</span>';
        centerCol.appendChild(bfRule);

        const bfGrid = document.createElement('div');
        bfGrid.className = 'np2-below-fold';
        belowFold.forEach(m => {
          const rawM = trending.results?.find(r => String(r.id) === m.tmdb_id);
          const item = document.createElement('div');
          item.className = 'np2-bf-item np2-clickable';
          item.innerHTML = `
            <div class="np2-bf-kicker">TRENDING</div>
            <div class="np2-bf-title">${m.title}</div>
            <div class="np2-bf-meta">⭐ ${m.rating} · ${m.year} · ${(m.genre||'').split(',')[0]}</div>
            <div class="np2-bf-desc">${(m.description||'').slice(0,90)}...</div>`;
          item.addEventListener('click', () => openNewspaperArticle(getMovie(m)));
          bfGrid.appendChild(item);
        });
        centerCol.appendChild(bfGrid);
      }
    }
    front.appendChild(centerCol);

    // RIGHT sidebar: feature articles + top rated
    const rightSidebar = document.createElement('div');
    rightSidebar.className = 'np2-sidebar-right';

    [feature1, feature2].filter(Boolean).forEach((m, i) => {
      const rawM = trending.results?.find(r => String(r.id) === m.tmdb_id);
      const art = document.createElement('div');
      art.className = 'np2-feature-art np2-clickable';
      art.innerHTML = `
        <div class="np2-section-kicker">${i === 0 ? 'THỨ HAI' : 'THỨ BA'} NỔI BẬT</div>
        ${rawM?.poster_path ? `<img class="np2-feat-poster" src="${TMDB_IMG}/w342${rawM.poster_path}" alt="${m.title}" />` : ''}
        <div class="np2-feat-title">${m.title}</div>
        <div class="np2-feat-meta">⭐ ${m.rating} · ${m.year}</div>
        <div class="np2-feat-body">${(m.description||'').slice(0,120)}...</div>`;
      art.addEventListener('click', () => openNewspaperArticle(getMovie(m)));
      rightSidebar.appendChild(art);
      if (i === 0) {
        const d = document.createElement('div');
        d.className = 'np2-sidebar-divider';
        rightSidebar.appendChild(d);
      }
    });

    // Top Rated mini ranking
    const rankBox = document.createElement('div');
    rankBox.className = 'np2-rank-box';
    rankBox.innerHTML = `<div class="np2-sidebar-label">${todaySpotlight.label.toUpperCase()}</div>`;
    spotlightList.slice(0, 5).forEach((m, i) => {
      const row = document.createElement('div');
      row.className = 'np2-rank-row np2-clickable';
      row.innerHTML = `<span class="np2-rank-n">${i+1}</span>
        <div><div class="np2-rank-title">${m.title}</div>
        <div class="np2-rank-meta">⭐ ${m.rating} · ${m.year}</div></div>`;
      row.addEventListener('click', () => openNewspaperArticle(getMovie(m)));
      rankBox.appendChild(row);
    });
    rightSidebar.appendChild(rankBox);
    front.appendChild(rightSidebar);

    paper.appendChild(front);

    // ── SECTION DIVIDER: CINEMA ──
    paper.appendChild(makeSectionBanner('🎬 TRANG A2 — RẠP CHIẾU PHIM'));

    // ── CINEMA ROW ──
    const cinemaSection = document.createElement('div');
    cinemaSection.className = 'np2-section-body';
    const cinLabel = document.createElement('div');
    cinLabel.className = 'np2-col-label';
    cinLabel.textContent = `Đang Chiếu Rạp — ${STATE.cinemaRegion || 'US'}`;
    cinemaSection.appendChild(cinLabel);

    const cinGrid = document.createElement('div');
    cinGrid.className = 'np2-cinema-grid';
    cinemaList.forEach(m => {
      const rawM = nowPlaying.results?.find(r => String(r.id) === m.tmdb_id);
      const card = document.createElement('div');
      card.className = 'np2-cinema-card np2-clickable';
      card.innerHTML = `
        <div class="np2-cinema-poster">
          ${rawM?.poster_path ? `<img src="${TMDB_IMG}/w342${rawM.poster_path}" alt="${m.title}" />` : '<div class="np2-no-img-sm">🎬</div>'}
          <div class="np2-cinema-badge">ĐC</div>
        </div>
        <div class="np2-cinema-info">
          <div class="np2-cinema-kicker">ĐANG CHIẾU</div>
          <div class="np2-cinema-title">${m.title}</div>
          <div class="np2-cinema-meta">⭐ ${m.rating} · ${m.year} · ${(m.genre||'').split(',')[0]}</div>
          <div class="np2-cinema-desc">${(m.description||'').slice(0,80)}...</div>
        </div>`;
      card.addEventListener('click', () => openNewspaperArticle(getMovie(m)));
      cinGrid.appendChild(card);
    });
    cinemaSection.appendChild(cinGrid);
    paper.appendChild(cinemaSection);

    // ── SECTION DIVIDER: ASIA ──
    paper.appendChild(makeSectionBanner(`🌏 TRANG B1 — ${todayAsiaTheme.label.toUpperCase()}`));

    // ── ASIA: Korean + Animation ──
    const asiaBody = document.createElement('div');
    asiaBody.className = 'np2-two-col-body';

    // Korean col
    const korCol = document.createElement('div');
    korCol.className = 'np2-two-col-item';
    korCol.innerHTML = `<div class="np2-col-label">${todayAsiaTheme.label}</div>`;
    if (asiaList[0]) {
      const rawTop = asiaMovies.results?.[0];
      const feat = document.createElement('div');
      feat.className = 'np2-col-feature np2-clickable';
      feat.innerHTML = `
        ${rawTop?.poster_path ? `<img class="np2-col-feat-img" src="${TMDB_IMG}/w342${rawTop.poster_path}" alt="${asiaList[0].title}" />` : ''}
        <div class="np2-col-feat-title">${asiaList[0].title}</div>
        <div class="np2-col-feat-meta">⭐ ${asiaList[0].rating} · ${asiaList[0].year}</div>
        <div class="np2-col-feat-body">${(asiaList[0].description||'').slice(0,130)}...</div>`;
      feat.addEventListener('click', () => openNewspaperArticle(getMovie(asiaList[0])));
      korCol.appendChild(feat);
      korCol.appendChild(makeThinRule());
    }
    asiaList.slice(1).forEach((m, i) => {
      const row = makeSmallRow(i+2, m, () => openNewspaperArticle(getMovie(m)));
      korCol.appendChild(row);
    });
    asiaBody.appendChild(korCol);

    // Animation col
    const animCol = document.createElement('div');
    animCol.className = 'np2-two-col-item';
    animCol.innerHTML = `<div class="np2-col-label">${todayC1Theme.genres[0] === todayC1Theme.genres[0] ? todayC1Theme.label.split('&')[0].trim() : todayC1Theme.label}</div>`;
    if (genre3List[0]) {
      const rawTop = genre3Movies.results?.[0];
      const feat = document.createElement('div');
      feat.className = 'np2-col-feature np2-clickable';
      feat.innerHTML = `
        ${rawTop?.poster_path ? `<img class="np2-col-feat-img" src="${TMDB_IMG}/w342${rawTop.poster_path}" alt="${genre3List[0].title}" />` : ''}
        <div class="np2-col-feat-title">${genre3List[0].title}</div>
        <div class="np2-col-feat-meta">⭐ ${genre3List[0].rating} · ${genre3List[0].year}</div>
        <div class="np2-col-feat-body">${(genre3List[0].description||'').slice(0,130)}...</div>`;
      feat.addEventListener('click', () => openNewspaperArticle(getMovie(genre3List[0])));
      animCol.appendChild(feat);
      animCol.appendChild(makeThinRule());
    }
    genre3List.slice(1).forEach((m, i) => {
      const row = makeSmallRow(i+2, m, () => openNewspaperArticle(getMovie(m)));
      animCol.appendChild(row);
    });
    asiaBody.appendChild(animCol);
    paper.appendChild(asiaBody);

    // ── SECTION DIVIDER: ACTION & HORROR ──
    paper.appendChild(makeSectionBanner(`⚔️ TRANG B2 — ${todayB2Theme.label.toUpperCase()}`));

    const ahBody = document.createElement('div');
    ahBody.className = 'np2-two-col-body';

    const actCol = document.createElement('div');
    actCol.className = 'np2-two-col-item';
    actCol.innerHTML = `<div class="np2-col-label">${todayB2Theme.label.split('&')[0].trim()}</div>`;
    if (genre1List[0]) {
      const rawTop = genre1Movies.results?.[0];
      const feat = document.createElement('div');
      feat.className = 'np2-col-feature np2-clickable';
      feat.innerHTML = `
        ${rawTop?.poster_path ? `<img class="np2-col-feat-img" src="${TMDB_IMG}/w342${rawTop.poster_path}" alt="${genre1List[0].title}" />` : ''}
        <div class="np2-col-feat-title">${genre1List[0].title}</div>
        <div class="np2-col-feat-meta">⭐ ${genre1List[0].rating} · ${genre1List[0].year}</div>
        <div class="np2-col-feat-body">${(genre1List[0].description||'').slice(0,130)}...</div>`;
      feat.addEventListener('click', () => openNewspaperArticle(getMovie(genre1List[0])));
      actCol.appendChild(feat);
      actCol.appendChild(makeThinRule());
    }
    genre1List.slice(1).forEach((m, i) => {
      const row = makeSmallRow(i+2, m, () => openNewspaperArticle(getMovie(m)));
      actCol.appendChild(row);
    });
    ahBody.appendChild(actCol);

    const horCol = document.createElement('div');
    horCol.className = 'np2-two-col-item';
    horCol.innerHTML = `<div class="np2-col-label">${todayB2Theme.label.split('&')[1]?.trim() || todayB2Theme.label}</div>`;
    if (genre2List[0]) {
      const rawTop = genre2Movies.results?.[0];
      const feat = document.createElement('div');
      feat.className = 'np2-col-feature np2-clickable';
      feat.innerHTML = `
        ${rawTop?.poster_path ? `<img class="np2-col-feat-img" src="${TMDB_IMG}/w342${rawTop.poster_path}" alt="${genre2List[0].title}" />` : ''}
        <div class="np2-col-feat-title">${genre2List[0].title}</div>
        <div class="np2-col-feat-meta">⭐ ${genre2List[0].rating} · ${genre2List[0].year}</div>
        <div class="np2-col-feat-body">${(genre2List[0].description||'').slice(0,130)}...</div>`;
      feat.addEventListener('click', () => openNewspaperArticle(getMovie(genre2List[0])));
      horCol.appendChild(feat);
      horCol.appendChild(makeThinRule());
    }
    genre2List.slice(1).forEach((m, i) => {
      const row = makeSmallRow(i+2, m, () => openNewspaperArticle(getMovie(m)));
      horCol.appendChild(row);
    });
    ahBody.appendChild(horCol);
    paper.appendChild(ahBody);

    // ── SECTION DIVIDER: SCI-FI & DRAMA ──
    paper.appendChild(makeSectionBanner(`🎭 TRANG C1 — ${todayC1Theme.label.toUpperCase()}`));

    const sdBody = document.createElement('div');
    sdBody.className = 'np2-two-col-body';

    const sfCol = document.createElement('div');
    sfCol.className = 'np2-two-col-item';
    sfCol.innerHTML = `<div class="np2-col-label">${todayC1Theme.label.split('&')[0].trim()}</div>`;
    genre3List.forEach((m, i) => {
      const row = makeSmallRow(i+1, m, () => openNewspaperArticle(getMovie(m)));
      sfCol.appendChild(row);
    });
    sdBody.appendChild(sfCol);

    const drCol = document.createElement('div');
    drCol.className = 'np2-two-col-item';
    drCol.innerHTML = `<div class="np2-col-label">${todayC1Theme.label.split('&')[1]?.trim() || todayC1Theme.label}</div>`;
    genre4List.forEach((m, i) => {
      const row = makeSmallRow(i+1, m, () => openNewspaperArticle(getMovie(m)));
      drCol.appendChild(row);
    });
    sdBody.appendChild(drCol);
    paper.appendChild(sdBody);

    // ── SECTION DIVIDER: DOCUMENTARY & TV ──
    paper.appendChild(makeSectionBanner('📺 TRANG D1 — TÀI LIỆU & TV SERIES'));

    const dtBody = document.createElement('div');
    dtBody.className = 'np2-two-col-body';

    const docCol = document.createElement('div');
    docCol.className = 'np2-two-col-item';
    docCol.innerHTML = `<div class="np2-col-label">🌍 Phim Tài Liệu Đặc Sắc</div>`;
    genre4List.forEach((m, i) => {
      const row = makeSmallRow(i+1, m, () => openNewspaperArticle(getMovie(m)));
      docCol.appendChild(row);
    });
    dtBody.appendChild(docCol);

    const tvCol = document.createElement('div');
    tvCol.className = 'np2-two-col-item';
    tvCol.innerHTML = `<div class="np2-col-label">📺 TV Series Đang Hot</div>`;
    tvList.forEach((m, i) => {
      const rawM = tvPopular.results?.find(r => String(r.id) === m.tmdb_id);
      const row = document.createElement('div');
      row.className = 'np2-small-row np2-clickable';
      row.innerHTML = `
        <span class="np2-small-n">${i+1}</span>
        ${rawM?.poster_path ? `<img class="np2-small-thumb" src="${TMDB_IMG}/w92${rawM.poster_path}" />` : ''}
        <div><div class="np2-small-title">${m.title}</div>
        <div class="np2-small-meta">⭐ ${m.rating} · ${m.year}</div></div>`;
      row.addEventListener('click', () => openNewspaperArticle(getMovie(m)));
      tvCol.appendChild(row);
    });
    dtBody.appendChild(tvCol);
    paper.appendChild(dtBody);

    // ── SECTION DIVIDER: UPCOMING ──
    paper.appendChild(makeSectionBanner('🗓️ TRANG C2 — SẮP RA MẮT'));

    const upSection = document.createElement('div');
    upSection.className = 'np2-section-body';
    const upLabel = document.createElement('div');
    upLabel.className = 'np2-col-label';
    upLabel.textContent = 'Phim Sắp Ra Mắt — Đánh Dấu Lịch Của Bạn';
    upSection.appendChild(upLabel);

    const upGrid = document.createElement('div');
    upGrid.className = 'np2-upcoming-grid';
    upcomingList.forEach(m => {
      const rawM = upcoming.results?.find(r => String(r.id) === m.tmdb_id);
      const card = document.createElement('div');
      card.className = 'np2-upcoming-card np2-clickable';
      card.innerHTML = `
        <div class="np2-upcoming-poster">
          ${rawM?.poster_path ? `<img src="${TMDB_IMG}/w342${rawM.poster_path}" alt="${m.title}" />` : '<div class="np2-no-img-sm">🎬</div>'}
        </div>
        <div class="np2-upcoming-label">SẮP RA MẮT</div>
        <div class="np2-upcoming-title">${m.title}</div>
        <div class="np2-upcoming-date">📅 ${m.release_date || m.year}</div>
        <div class="np2-upcoming-genre">${(m.genre||'').split(',')[0]}</div>`;
      card.addEventListener('click', () => openNewspaperArticle(getMovie(m)));
      upGrid.appendChild(card);
    });
    upSection.appendChild(upGrid);
    paper.appendChild(upSection);

    // ── FOOTER ──
    const footer = document.createElement('div');
    footer.className = 'np2-footer';
    footer.innerHTML = `
      <div class="np2-footer-rule"></div>
      <div class="np2-footer-content">
        <div class="np2-footer-left">
          <div class="np2-footer-title">THE FILM GAZETTE</div>
          <div class="np2-footer-sub">Nhật Báo Điện Ảnh • Powered by TMDB & Wi</div>
        </div>
        <div class="np2-footer-center">
          ❧ Mọi bài phê bình được tạo bởi TFG ❧<br>
          <em>Nhấn vào bất kỳ bài nào để đọc review đầy đủ</em>
        </div>
        <div class="np2-footer-right">
          <button class="np2-refresh-btn" onclick="(function(){document.getElementById('newspaper-root').innerHTML='';loadNewspaper();})()">Xuất bản lại</button>
        </div>
      </div>`;
    paper.appendChild(footer);

    root.appendChild(paper);

  } catch(e) {
    console.error('[loadNewspaper]', e);
    root.innerHTML = `<div class="np-empty-key"><p>⚠️ Lỗi tải báo: ${e.message}</p></div>`;
  }
}

// ─── Helper: Section Banner ───
function makeSectionBanner(text) {
  const div = document.createElement('div');
  div.className = 'np2-section-banner';
  div.innerHTML = `<div class="np2-banner-rule"></div>
    <div class="np2-banner-text">${text}</div>
    <div class="np2-banner-rule"></div>`;
  return div;
}

// ─── Helper: Thin rule ───
function makeThinRule() {
  const div = document.createElement('div');
  div.className = 'np2-thin-rule';
  return div;
}

// ─── Helper: Small ranking row ───
function makeSmallRow(n, m, onClick) {
  const rawEl = document.createElement('div');
  rawEl.className = 'np2-small-row np2-clickable';
  rawEl.innerHTML = `
    <span class="np2-small-n">${n}</span>
    <div>
      <div class="np2-small-title">${m.title}</div>
      <div class="np2-small-meta">⭐ ${m.rating} · ${m.year} · ${(m.genre||'').split(',')[0]}</div>
    </div>`;
  rawEl.addEventListener('click', onClick);
  return rawEl;
}

// ══════════════════════════════════════════════════════════════
//  OPEN NEWSPAPER ARTICLE — AI-generated review page
// ══════════════════════════════════════════════════════════════

async function openNewspaperArticle(movie) {
  // Tạo overlay trang báo
  const overlay = document.createElement('div');
  overlay.id = 'np2-article-overlay';
  overlay.className = 'np2-article-overlay';

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  overlay.innerHTML = `
    <div class="np2-article-page">
      <!-- Back bar -->
      <div class="np2-article-topbar">
        <button class="np2-article-back" id="np2-back-btn">← Quay lại tờ báo</button>
        <span class="np2-article-topbar-title">THE FILM GAZETTE</span>
        <span class="np2-article-date">${today}</span>
      </div>

      <!-- Article content -->
      <div class="np2-article-body" id="np2-article-body">
        <!-- Header -->
        <div class="np2-art-header">
          <div class="np2-art-section-label">PHÊ BÌNH ĐIỆN ẢNH</div>
          <h1 class="np2-art-title" id="np2-art-title">${movie.title}</h1>
          <div class="np2-art-subtitle" id="np2-art-subtitle">${movie.year} · ${movie.genre || ''} · ⭐ ${movie.rating}/10</div>
          <div class="np2-art-byline">Bởi <em>Phóng Viên Điện Ảnh</em> · Ban Biên Tập THE FILM GAZETTE · ${today}</div>
          <div class="np2-art-rule-double"></div>
        </div>

        <!-- Poster + AI content layout -->
        <div class="np2-art-layout">
          <!-- Poster sidebar -->
          <div class="np2-art-sidebar">
            <div class="np2-art-poster">
              ${movie.poster ? `<img src="${movie.poster}" alt="${movie.title}" />` : '<div class="np2-art-no-poster">🎬</div>'}
            </div>
            <div class="np2-art-info-box">
              <div class="np2-info-box-title">THÔNG TIN PHIM</div>
              <div class="np2-info-box-row"><span>Tên phim</span><strong>${movie.title}</strong></div>
              <div class="np2-info-box-row"><span>Năm</span><strong>${movie.year || 'N/A'}</strong></div>
              <div class="np2-info-box-row"><span>Thể loại</span><strong>${movie.genre || 'N/A'}</strong></div>
              <div class="np2-info-box-row"><span>Đánh giá</span><strong>⭐ ${movie.rating}/10</strong></div>
            </div>
            <button class="np2-art-detail-btn" id="np2-art-detail-btn">🎬 Xem chi tiết đầy đủ</button>
          </div>

          <!-- Main article text -->
          <div class="np2-art-main" id="np2-art-main">
            <div class="np2-art-loading">
              <div class="np2-art-loading-icon">✍️</div>
              <div class="np2-art-loading-text">Phóng viên đang viết bài...</div>
              <div class="np2-art-loading-sub">Đang soạn bài phê bình chuyên nghiệp cho <em>${movie.title}</em></div>
              <div class="np2-art-loading-dots"><span>.</span><span>.</span><span>.</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('np2-overlay-in'));
  overlay.scrollTop = 0;

  // Back button
  overlay.querySelector('#np2-back-btn').addEventListener('click', () => {
    overlay.classList.add('np2-overlay-out');
    setTimeout(() => overlay.remove(), 400);
  });

  // Detail button
  overlay.querySelector('#np2-art-detail-btn').addEventListener('click', () => {
    overlay.remove();
    showDetailPage(movie);
  });

  // ── Generate AI article ──
  const mainEl = overlay.querySelector('#np2-art-main');
  try {
    const prompt = buildArticlePrompt(movie);
    const articleHTML = await generateArticleWithClaude(prompt, movie);
    mainEl.innerHTML = articleHTML;

    // Animate paragraphs in
    mainEl.querySelectorAll('p, h3, blockquote').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      el.style.transition = `opacity 0.4s ease ${i * 60}ms, transform 0.4s ease ${i * 60}ms`;
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 100 + i * 60);
    });

  } catch(e) {
    mainEl.innerHTML = `
      <div class="np2-art-error">
        <p>⚠️ Không thể tải bài phê bình lúc này.</p>
        <p style="font-size:0.85rem;color:var(--gray);margin-top:8px;">Lỗi: ${e.message}</p>
        <p style="margin-top:12px;">${movie.description || ''}</p>
      </div>`;
  }

  // Show overlay with animation
  
}

// ─── Build prompt for Claude ───
function buildArticlePrompt(movie) {
  return `Bạn là một nhà phê bình điện ảnh chuyên nghiệp, viết cho tờ báo "The Film Gazette" — một nhật báo điện ảnh uy tín viết bằng tiếng Việt.

Hãy viết một bài phê bình/review đầy đủ về bộ phim sau theo phong cách báo chí điện ảnh chuyên nghiệp:

**Tên phim:** ${movie.title}
**Năm phát hành:** ${movie.year || 'N/A'}
**Thể loại:** ${movie.genre || 'N/A'}
**Đánh giá TMDB:** ${movie.rating}/10
**Tóm tắt:** ${movie.description || 'Không có thông tin'}
**Loại:** ${movie.mediaType === 'tv' ? 'TV Series' : 'Phim điện ảnh'}

**Yêu cầu bài viết:**
- Viết bằng tiếng Việt, giọng văn chuyên nghiệp như nhà phê bình điện ảnh thật sự
- Dài khoảng 600-800 từ
- Chia thành các phần rõ ràng với tiêu đề
- Bao gồm: giới thiệu/bối cảnh, phân tích nội dung & thông điệp, điểm mạnh, điểm yếu/hạn chế (nếu có), so sánh với các phim cùng thể loại, và verdict/kết luận
- Không spoil cốt truyện chi tiết
- Có thể suy đoán/phân tích dựa trên thể loại và rating nếu không biết phim
- Kết thúc bằng một câu verdict ngắn gọn và rating từ nhà phê bình

**Format output:** Trả về HTML thuần với các thẻ <h3>, <p>, <blockquote> (cho pull quote ấn tượng), không dùng thẻ html/body/head. Không dùng markdown.`;
}

// ─── Call Claude API ───
async function translateToVietnamese(text) {
  if (!text || text.trim().length < 10) return text;
  try {
    const encoded = encodeURIComponent(text.slice(0, 4500));
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encoded}`
    );
    const json = await res.json();
    return json[0].map(p => p[0]).join('');
  } catch(e) { return text; }
}

async function generateArticleWithClaude(prompt, movie) {
  // ── 1. Thử Wikipedia ──
  try {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(movie.title + ' film ' + (movie.year||''))}&format=json&origin=*&srlimit=5`
    );
    const searchData = await searchRes.json();
    const pages = searchData.query?.search || [];
    const best = pages.find(p =>
      p.title.toLowerCase().includes(movie.title.toLowerCase())
    );

    if (best) {
      const contentRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=false&explaintext=true&titles=${encodeURIComponent(best.title)}&format=json&origin=*`
      );
      const contentData = await contentRes.json();
      const pageObj = Object.values(contentData.query.pages)[0];
      const wikiText = pageObj.extract || '';

      if (wikiText.length >= 300) {
        return await buildArticleFromWiki(wikiText, best.title, movie);
      }
    }
  } catch(e) {}

  // ── 2. Fallback: TMDB reviews ──
  try {
    if (movie.tmdb_id && STATE.tmdbKey) {
      const mt = movie.mediaType || 'movie';
      const data = await tmdb(`/${mt}/${movie.tmdb_id}/reviews`);
      const reviews = (data.results || []).slice(0, 4);
      if (reviews.length) {
        return await buildArticleFromTMDB(reviews, movie);
      }
    }
  } catch(e) {}

  // ── 3. Fallback cuối: description ──
  return buildArticleFromDescription(movie);
}

async function buildArticleFromWiki(wikiText, wikiTitle, movie) {
  // Fetch danh sách sections
  let sectionsMap = {};
  try {
    const secRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(wikiTitle)}&prop=sections&format=json&origin=*`
    );
    const secData = await secRes.json();
    const sections = secData.parse?.sections || [];

    // Fetch nội dung từng section quan trọng song song
    const wanted = ['Plot','Synopsis','Cast','Production','Reception','Critical reception','Box office','Music','Soundtrack','Development','Filming','Accolades','Awards','Budget','Release'];
    const targets = sections.filter(s => wanted.some(w => s.line.toLowerCase().includes(w.toLowerCase())));

    await Promise.all(targets.map(async (sec) => {
      try {
        const r = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=true&titles=${encodeURIComponent(wikiTitle)}&exsectionformat=plain&format=json&origin=*&exchars=2000`
        );
      } catch(e) {}
    }));

    // Fetch từng section bằng index
    const fetched = await Promise.all(targets.slice(0, 6).map(async (sec) => {
      try {
        const r = await fetch(
          `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(wikiTitle)}&prop=wikitext&section=${sec.index}&format=json&origin=*`
        );
        const d = await r.json();
        const raw = d.parse?.wikitext?.['*'] || '';
        // Strip wikitext markup
        const clean = raw
          .replace(/\{\{[^}]*\}\}/g, '')           // {{templates}}
          .replace(/\{\{[\s\S]*?\}\}/g, '')        // {{nested templates}}
          .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1') // [[link|text]] → text
          .replace(/\[https?:\/\/[^\s\]]*\s?([^\]]*)\]/g, '$1') // [url text] → text
          .replace(/'{2,5}/g, '')                  // bold/italic markers
          .replace(/==+[^=]*==+/g, '')             // == headings ==
          .replace(/<ref[^>]*\/>|<ref[^>]*>[\s\S]*?<\/ref>/gi, '') // <ref>
          .replace(/<[^>]+>/g, '')                 // HTML tags
          .replace(/^\*+\s*/gm, '')               // * bullet points
          .replace(/^:+\s*/gm, '')                // : indents
          .replace(/^#+\s*/gm, '')                // # numbered lists
          .replace(/\|[^|]*=[^|\n]*/g, '')        // |param=value
          .replace(/^\s*\|.*$/gm, '')             // table rows
          .replace(/\}\}/g, '')                   // stray }}
          .replace(/\{\{/g, '')                   // stray {{
          .replace(/\n{3,}/g, '\n\n')
          .trim();
        sectionsMap[sec.line.toLowerCase()] = clean.slice(0, 1500);
      } catch(e) {}
    }));
  } catch(e) {
    console.warn('[WIKI SECTIONS FETCH ERROR]', e);
  }

  console.log('[SECTIONS MAP]', Object.keys(sectionsMap));

  // Lấy đúng section theo priority
  const getSection = (...keys) => {
    for (const k of keys) {
      const found = Object.entries(sectionsMap).find(([key]) => key.includes(k.toLowerCase()));
      if (found?.[1]?.length > 80) return found[1];
    }
    return '';
  };

  const plot       = getSection('plot', 'synopsis', 'story');
  const cast       = getSection('cast', 'voice');
  const production = getSection('production', 'development', 'filming', 'writing');
  const reception  = getSection('reception', 'critical', 'box office', 'accolades');
  const music      = getSection('music', 'soundtrack', 'score');

  // Intro = đoạn đầu wikiText (luôn có)
  const intro = wikiText.slice(0, 1500).trim();

  // Dịch song song
  // Fetch TMDB data song song với dịch
const awardText  = getSection('accolades', 'awards');
const boxOffText = getSection('box office', 'budget', 'release');

let tmdbCrew = [], tmdbBackdrops = [];
try {
  if (movie.tmdb_id && STATE.tmdbKey) {
    const mt = movie.mediaType || 'movie';
    const [creditsData, imagesData] = await Promise.all([
      tmdb(`/${mt}/${movie.tmdb_id}/credits`),
      tmdb(`/${mt}/${movie.tmdb_id}/images`),
    ]);
    tmdbCrew = (creditsData.crew || [])
      .filter(p => ['Director','Producer','Executive Producer','Screenplay','Writer','Story'].includes(p.job))
      .slice(0, 8);
    tmdbBackdrops = (imagesData.backdrops || [])
      .sort((a,b) => b.vote_average - a.vote_average)
      .slice(0, 6)
      .map(b => `${TMDB_IMG}/w780${b.file_path}`);
  }
} catch(e) {}

setStep('🌐 Đang dịch sang tiếng Việt...');
const [introVi, plotVi, castVi, productionVi, receptionVi, musicVi, awardVi, boxOffVi] = await Promise.all([
  translateToVietnamese(intro),
  translateToVietnamese(plot),
  translateToVietnamese(cast),
  translateToVietnamese(production),
  translateToVietnamese(reception),
  translateToVietnamese(music),
  translateToVietnamese(awardText),
  translateToVietnamese(boxOffText),
]);

const ratingNum = parseFloat(movie.rating) || 0;
const stars   = ratingNum >= 8 ? '★★★★★' : ratingNum >= 7 ? '★★★★☆' : ratingNum >= 6 ? '★★★☆☆' : '★★☆☆☆';
const verdict = ratingNum >= 8 ? 'Kiệt tác không thể bỏ qua'
              : ratingNum >= 7 ? 'Đáng xem, để lại nhiều dư vị'
              : ratingNum >= 6 ? 'Tròn vai, đáng một lần thưởng thức'
              : 'Dành cho khán giả dễ tính';

// Rating bar visual
const ratingBar = `
  <div class="np2-rating-visual">
    <div class="np2-rating-score">${movie.rating}<span>/10</span></div>
    <div class="np2-rating-stars">${stars}</div>
    <div class="np2-rating-bar-wrap">
      <div class="np2-rating-bar-fill" style="width:${ratingNum * 10}%;background:${ratingBg(movie.rating)}"></div>
    </div>
    <div class="np2-rating-label">Điểm TMDB</div>
  </div>`;

// Crew section
let crewHtml = '';
if (tmdbCrew.length) {
  const grouped = {};
  tmdbCrew.forEach(p => {
    if (!grouped[p.job]) grouped[p.job] = [];
    grouped[p.job].push(p.name);
  });
  crewHtml = `<h3>🎬 Đoàn Làm Phim</h3>
    <div class="np2-crew-grid">
      ${Object.entries(grouped).map(([job, names]) => `
        <div class="np2-crew-item">
          <div class="np2-crew-job">${job}</div>
          <div class="np2-crew-name">${names.join(', ')}</div>
        </div>`).join('')}
    </div>`;
}

// Backdrops gallery
let backdropHtml = '';
if (tmdbBackdrops.length) {
  backdropHtml = `<h3>🖼️ Hình Ảnh Từ Phim</h3>
    <div class="np2-backdrops-grid">
      ${tmdbBackdrops.map(url => `
        <div class="np2-backdrop-thumb" onclick="window.open('${url}','_blank')">
          <img src="${url}" loading="lazy" />
        </div>`).join('')}
    </div>`;
}

let html = '';
html += ratingBar;
if (introVi)      html += `<p>${sanitize(introVi)}</p>`;
if (plotVi)       html += `<h3>📖 Nội Dung Phim</h3><p>${sanitize(plotVi)}</p>`;
if (crewHtml)     html += crewHtml;
if (castVi)       html += `<h3>🎭 Dàn Diễn Viên</h3><p>${sanitize(castVi)}</p>`;
if (productionVi) html += `<h3>🎬 Quá Trình Sản Xuất</h3><p>${sanitize(productionVi)}</p>`;
if (musicVi)      html += `<h3>🎵 Âm Nhạc</h3><p>${sanitize(musicVi)}</p>`;
if (boxOffVi)     html += `<h3>💰 Doanh Thu Phòng Vé</h3><p>${sanitize(boxOffVi)}</p>`;
if (receptionVi)  html += `<h3>🗣️ Phản Hồi Giới Phê Bình</h3><blockquote>${sanitize(receptionVi)}</blockquote>`;
if (awardVi)      html += `<h3>🏆 Giải Thưởng & Đề Cử</h3><p>${sanitize(awardVi)}</p>`;
if (backdropHtml) html += backdropHtml;

html += `
  <h3>🎯 Verdict của The Film Gazette</h3>
  <blockquote>${verdict} — ${stars} (${movie.rating}/10)</blockquote>
  <p style="font-size:0.78rem;color:var(--gray);margin-top:16px;border-top:1px solid var(--border);padding-top:10px;">
    📚 Nguồn: <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(wikiTitle)}" 
    target="_blank" style="color:var(--gold);">Wikipedia — ${sanitize(wikiTitle)}</a>
  </p>`;

  return wrapArticle(html, 'Wikipedia');
}

async function buildArticleFromTMDB(reviews, movie) {
  const ratingNum = parseFloat(movie.rating) || 0;
  const stars     = ratingNum >= 8 ? '★★★★★' : ratingNum >= 7 ? '★★★★☆' : ratingNum >= 6 ? '★★★☆☆' : '★★☆☆☆';
  const verdict   = ratingNum >= 8 ? 'Kiệt tác không thể bỏ qua'
                  : ratingNum >= 7 ? 'Đáng xem, để lại nhiều dư vị'
                  : ratingNum >= 6 ? 'Tròn vai, đáng một lần thưởng thức'
                  : 'Dành cho khán giả dễ tính';

  // Fetch crew + backdrops song song
  let tmdbCrew = [], tmdbBackdrops = [], tmdbDetail = null, tmdbKeywords = [];
  try {
    if (movie.tmdb_id && STATE.tmdbKey) {
      const mt = movie.mediaType || 'movie';
      const [creditsData, imagesData, detailData, keywordData] = await Promise.all([
        tmdb(`/${mt}/${movie.tmdb_id}/credits`),
        tmdb(`/${mt}/${movie.tmdb_id}/images`),
        tmdb(`/${mt}/${movie.tmdb_id}`, { append_to_response: 'release_dates' }),
        tmdb(`/${mt}/${movie.tmdb_id}/keywords`),
      ]);
      tmdbDetail  = detailData;
      tmdbKeywords = (keywordData.keywords || keywordData.results || []).slice(0, 10).map(k => k.name);
      tmdbCrew = (creditsData.crew || [])
        .filter(p => ['Director','Producer','Executive Producer','Screenplay','Writer','Story'].includes(p.job))
        .slice(0, 8);
      tmdbBackdrops = (imagesData.backdrops || [])
        .sort((a,b) => b.vote_average - a.vote_average)
        .slice(0, 6)
        .map(b => `${TMDB_IMG}/w780${b.file_path}`);
    }
  } catch(e) {}

  // Lấy full overview từ TMDB thay vì dùng description ngắn
  let fullDesc = movie.description || '';
  try {
    if (movie.tmdb_id && STATE.tmdbKey) {
      const mt = movie.mediaType || 'movie';
      const overviewData = await tmdb(`/${mt}/${movie.tmdb_id}`);
      if (overviewData.overview && overviewData.overview.length > fullDesc.length) {
        fullDesc = overviewData.overview;
      }
    }
  } catch(e) {}
  const descVi = await translateToVietnamese(fullDesc);
  // Tìm thêm từ Wikipedia dù ngắn
  let wikiExtra = '';
  try {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(movie.title + ' film ' + (movie.year||''))}&format=json&origin=*&srlimit=3`
    );
    const searchData = await searchRes.json();
    const pages = searchData.query?.search || [];
    const best = pages.find(p => p.title.toLowerCase().includes(movie.title.toLowerCase())) || pages[0];
    if (best) {
      const contentRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(best.title)}&format=json&origin=*`
      );
      const contentData = await contentRes.json();
      const pageObj = Object.values(contentData.query.pages)[0];
      const raw = pageObj.extract || '';
      if (raw.length > 100) {
        wikiExtra = await translateToVietnamese(raw.slice(0, 2000));
      }
    }
  } catch(e) {}

  // Rating bar
  const ratingBar = `
    <div class="np2-rating-visual">
      <div class="np2-rating-score">${movie.rating}<span>/10</span></div>
      <div class="np2-rating-stars">${stars}</div>
      <div class="np2-rating-bar-wrap">
        <div class="np2-rating-bar-fill" style="width:${ratingNum*10}%;background:${ratingBg(movie.rating)}"></div>
      </div>
      <div class="np2-rating-label">Điểm TMDB</div>
    </div>`;

  // Crew
  let crewHtml = '';
  if (tmdbCrew.length) {
    const grouped = {};
    tmdbCrew.forEach(p => {
      if (!grouped[p.job]) grouped[p.job] = [];
      grouped[p.job].push(p.name);
    });
    crewHtml = `<h3>🎬 Đoàn Làm Phim</h3>
      <div class="np2-crew-grid">
        ${Object.entries(grouped).map(([job, names]) => `
          <div class="np2-crew-item">
            <div class="np2-crew-job">${job}</div>
            <div class="np2-crew-name">${names.join(', ')}</div>
          </div>`).join('')}
      </div>`;
  }

  // Backdrops
  let backdropHtml = '';
  if (tmdbBackdrops.length) {
    backdropHtml = `<h3>🖼️ Hình Ảnh Từ Phim</h3>
      <div class="np2-backdrops-grid">
        ${tmdbBackdrops.map(url => `
          <div class="np2-backdrop-thumb" onclick="window.open('${url}','_blank')">
            <img src="${url}" loading="lazy" />
          </div>`).join('')}
      </div>`;
  }

  // Dịch reviews song song
  const translated = await Promise.all(
    reviews.map(r => translateToVietnamese(r.content || ''))
  );

  // Build thêm các section từ tmdbDetail
let productionHtml = '';
if (tmdbDetail) {
  const budget   = tmdbDetail.budget   ? `💵 Kinh phí: $${tmdbDetail.budget.toLocaleString()}` : '';
  const revenue  = tmdbDetail.revenue  ? `💰 Doanh thu: $${tmdbDetail.revenue.toLocaleString()}` : '';
  const runtime  = tmdbDetail.runtime  ? `⏱️ Thời lượng: ${Math.floor(tmdbDetail.runtime/60)}h ${tmdbDetail.runtime%60}m` : '';
  const status   = tmdbDetail.status   ? `📡 Trạng thái: ${tmdbDetail.status}` : '';
  const country  = (tmdbDetail.production_countries||[]).map(c=>c.name).join(', ');
  const companies= (tmdbDetail.production_companies||[]).slice(0,4).map(c=>c.name).join(', ');
  const langs    = (tmdbDetail.spoken_languages||[]).map(l=>l.name).join(', ');

  const facts = [runtime, status, budget, revenue, country && `🌍 Quốc gia: ${country}`, companies && `🏢 Hãng sản xuất: ${companies}`, langs && `🗣️ Ngôn ngữ: ${langs}`].filter(Boolean);

  if (facts.length) {
    productionHtml = `<h3>🎬 Thông Tin Sản Xuất</h3>
      <div class="np2-crew-grid">
        ${facts.map(f => `<div class="np2-crew-item"><div class="np2-crew-name">${f}</div></div>`).join('')}
      </div>`;
  }
}

let keywordsHtml = '';
if (tmdbKeywords.length) {
  keywordsHtml = `<h3>🏷️ Chủ Đề</h3>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">
      ${tmdbKeywords.map(k => `<span style="background:var(--bg-card);border:1px solid var(--border);border-radius:4px;padding:3px 10px;font-size:0.78rem;color:var(--light);">${k}</span>`).join('')}
    </div>`;
}

let html = ratingBar;
// Ưu tiên wiki nếu dài hơn, không thì ghép cả hai
if (wikiExtra && wikiExtra.length > descVi.length) {
  html += `<p>${sanitize(wikiExtra)}</p>`;
} else if (wikiExtra) {
  html += `<p>${sanitize(descVi)}</p><p>${sanitize(wikiExtra)}</p>`;
} else {
  html += `<p>${sanitize(descVi)}</p>`;
}
if (productionHtml) html += productionHtml;
if (crewHtml) html += crewHtml;
if (keywordsHtml) html += keywordsHtml;
  html += `<h3>🗣️ Đánh Giá Từ Khán Giả</h3>`;
  reviews.forEach((r, i) => {
    const rating = r.author_details?.rating ? ` · ⭐ ${r.author_details.rating}/10` : '';
    html += `<blockquote>
      <strong>${sanitize(r.author)}${rating}</strong><br>
      ${sanitize(translated[i] || '')}
    </blockquote>`;
  });
  if (backdropHtml) html += backdropHtml;
  html += `
    <h3>🎯 Verdict của The Film Gazette</h3>
    <blockquote>${verdict} — ${stars} (${movie.rating}/10)</blockquote>
    <p style="font-size:0.78rem;color:var(--gray);margin-top:16px;border-top:1px solid var(--border);padding-top:10px;">
      📚 Nguồn: TMDB User Reviews
    </p>`;

  return wrapArticle(html, 'TMDB');
}

function buildArticleFromDescription(movie) {
  const ratingNum = parseFloat(movie.rating) || 0;
  const stars     = ratingNum >= 8 ? '★★★★★' : ratingNum >= 7 ? '★★★★☆' : ratingNum >= 6 ? '★★★☆☆' : '★★☆☆☆';
  const verdict   = ratingNum >= 8 ? 'Kiệt tác không thể bỏ qua'
                  : ratingNum >= 7 ? 'Đáng xem, để lại nhiều dư vị'
                  : ratingNum >= 6 ? 'Tròn vai, đáng một lần thưởng thức'
                  : 'Dành cho khán giả dễ tính';

  const html = `
    <p>${sanitize(movie.description || 'Chưa có mô tả cho bộ phim này.')}</p>
    <h3>📊 Thông Tin</h3>
    <p><strong>${sanitize(movie.title)}</strong> là tác phẩm ${movie.mediaType === 'tv' ? 'truyền hình' : 'điện ảnh'} 
    thuộc thể loại <em>${movie.genre || 'N/A'}</em>, ra mắt năm ${movie.year || 'N/A'}, 
    được đánh giá <strong>${movie.rating}/10</strong> trên TMDB.</p>
    <h3>🎯 Verdict</h3>
    <blockquote>${verdict} — ${stars} (${movie.rating}/10)</blockquote>`;

  return wrapArticle(html, 'TMDB');
}

function wrapArticle(html, source) {
  return `<div class="np2-art-content">${html}</div>
    <div class="np2-art-footer-sig">
      <div class="np2-sig-rule">— ✦ —</div>
      <div class="np2-sig-text"><em>Nội dung tổng hợp từ ${source} cho The Film Gazette</em></div>
    </div>`;
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


// const tabBar = $('tab-bar');

// if (currentY > lastScrollY && currentY > 60) {
//   searchBar.classList.add('bar-hidden');
//   filterPanel.classList.add('bar-hidden');
//   tabBar.style.top = '53px';  // sát header khi search ẩn
// } else {
//   searchBar.classList.remove('bar-hidden');
//   filterPanel.classList.remove('bar-hidden');
//   tabBar.style.top = '';
// }

async function showTrailerPreview(movie, card, layer) {
  if (!STATE.tmdbKey || layer.classList.contains('visible')) return;
  card.classList.add('trailer-active');
  layer.innerHTML = '<div class="card-trailer-loading visible"><div class="trailer-spinner"></div></div>';

  let key = STATE.detailCache[movie.tmdb_id]?.trailerKey;
  if (!key && movie.tmdb_id) {
    try {
      const data = await tmdb(`/${movie.mediaType || 'movie'}/${movie.tmdb_id}/videos`);
      const list = (data.results || []).filter(v => v.site === 'YouTube');
      const t = list.find(v => v.type === 'Trailer') || list[0];
      key = t?.key || '';
    } catch(e) {}
  }

  if (!key) { card.classList.remove('trailer-active'); layer.innerHTML = ''; return; }

  layer.innerHTML = `<iframe
    src="https://www.youtube.com/embed/${key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${key}&modestbranding=1&rel=0"
    allow="autoplay; encrypted-media"
    allowfullscreen></iframe>`;
  layer.classList.add('visible');
}

function hideTrailerPreview(card, layer) {
  card.classList.remove('trailer-active');
  layer.classList.remove('visible');
  setTimeout(() => { if (!layer.classList.contains('visible')) layer.innerHTML = ''; }, 300);
}


/* ══════════════════════════════════════════════════════════════
   SMART RECOMMENDATION ENGINE
══════════════════════════════════════════════════════════════ */

function analyzeWatchlistDNA() {
  const movies = Object.values(STATE.watchlist);
  if (!movies.length) return null;

  const genres = {}, decades = {};
  let ratingSum = 0, ratingCount = 0;

  movies.forEach(m => {
    (m.genre || '').split(',').map(g => g.trim()).filter(Boolean)
      .forEach(g => { genres[g] = (genres[g] || 0) + 1; });

    const yr = parseInt(m.year);
    if (!isNaN(yr)) {
      const dec = Math.floor(yr / 10) * 10 + 's';
      decades[dec] = (decades[dec] || 0) + 1;
    }

    const r = parseFloat(m.rating);
    if (!isNaN(r) && r > 0) { ratingSum += r; ratingCount++; }
  });

  const avgRating = ratingCount ? (ratingSum / ratingCount) : 7.0;
  const topGenres = Object.entries(genres).sort((a,b) => b[1]-a[1]).slice(0,3).map(([g]) => g);
  const topDecades = Object.entries(decades).sort((a,b) => b[1]-a[1]).slice(0,2).map(([d]) => d);

  return { genres, decades, avgRating, topGenres, topDecades };
}

function scoreMovie(movie, dna) {
  let score = 0;
  const wlIds = new Set(Object.keys(STATE.watchlist));
  if (wlIds.has(movie.tmdb_id || movie.title)) return -1; // đã có trong watchlist

  (movie.genre || '').split(',').map(g => g.trim()).forEach(g => {
    if (dna.genres[g]) score += dna.genres[g] * 10;
  });

  const yr = parseInt(movie.year);
  if (!isNaN(yr)) {
    const dec = Math.floor(yr / 10) * 10 + 's';
    if (dna.decades[dec]) score += dna.decades[dec] * 5;
  }

  const r = parseFloat(movie.rating);
  if (!isNaN(r)) score += r * 3;

  return score;
}

async function fetchRecommendations() {
  const dna = analyzeWatchlistDNA();
  if (!dna || !STATE.tmdbKey) return [];

  // Lấy genre ID của top genre
  const genreNameToId = Object.fromEntries(
    Object.entries(TMDB_GENRE_MAP).map(([id, name]) => [name.toLowerCase(), id])
  );

  const topGenreId = dna.topGenres[0]
    ? genreNameToId[dna.topGenres[0].toLowerCase()]
    : null;

  const params = {
    sort_by: 'vote_average.desc',
    'vote_count.gte': 500,
    'vote_average.gte': Math.max(dna.avgRating - 0.5, 6.0).toFixed(1),
  };
  if (topGenreId) params['with_genres'] = topGenreId;

  try {
    const data = await tmdb('/discover/movie', params);
    const candidates = (data.results || []).map(r => normalizeMovie(r, 'movie'));
    return candidates
      .map(m => ({ ...m, _score: scoreMovie(m, dna) }))
      .filter(m => m._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 12);
  } catch(e) { return []; }
}

async function showRecommendPanel() {
  // Nếu panel đã tồn tại thì toggle
  const existing = document.getElementById('recommend-panel');
  if (existing) { existing.remove(); return; }

  const dna = analyzeWatchlistDNA();
  if (!dna) {
    showToast('Thêm phim vào Watchlist trước để nhận gợi ý!', 'info', '💡');
    return;
  }

  const panel = el('div', '');
  panel.id = 'recommend-panel';
  panel.style.cssText = `
    position:fixed; inset:0; z-index:400;
    background:rgba(0,0,0,0.85); backdrop-filter:blur(6px);
    display:flex; flex-direction:column; align-items:center;
    overflow-y:auto; padding:20px;
  `;

  // Header
  const hdr = el('div', '');
  hdr.style.cssText = 'width:100%;max-width:1100px;display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;';
  hdr.innerHTML = `
    <div>
      <h2 style="color:#f5c518;font-size:1.4rem;font-weight:700;">🤖 Gợi ý dành riêng cho bạn</h2>
      <p style="color:#888;font-size:0.85rem;margin-top:4px;">
        Dựa trên ${dna.totalMovies || Object.keys(STATE.watchlist).length} phim trong Watchlist •
        Thể loại yêu thích: <b style="color:#f5c518">${dna.topGenres.join(', ') || 'N/A'}</b> •
        Rating TB: <b style="color:#00cc66">${dna.avgRating.toFixed(1)}⭐</b>
      </p>
    </div>`;
  const closeBtn = el('button', '', '✕ Đóng');
  closeBtn.style.cssText = 'background:#1a1a2e;color:#aaa;border:none;border-radius:6px;padding:8px 16px;cursor:pointer;font-size:0.9rem;';
  closeBtn.onclick = () => panel.remove();
  hdr.appendChild(closeBtn);
  panel.appendChild(hdr);

  // Loading
  const loadEl = el('div', '');
  loadEl.style.cssText = 'color:#888;font-size:1rem;padding:40px;';
  loadEl.textContent = '⏳ Đang phân tích và tìm phim phù hợp...';
  panel.appendChild(loadEl);

  document.body.appendChild(panel);

  const recs = await fetchRecommendations();
  loadEl.remove();

  if (!recs.length) {
    panel.appendChild(Object.assign(el('p',''), { textContent: '⚠️ Không tìm thấy gợi ý phù hợp.', style: 'color:#888;padding:40px;' }));
    return;
  }

  const grid = el('div', '');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;width:100%;max-width:1100px;';

  recs.forEach(m => {
    const card = createMovieCard(m);
    // Score badge
    const badge = el('div', '');
    badge.style.cssText = `
      position:absolute;bottom:8px;right:8px;
      background:rgba(0,0,0,0.85);color:#f5c518;
      font-size:0.7rem;font-weight:700;
      padding:2px 6px;border-radius:4px;
      border:1px solid rgba(245,197,24,0.4);
    `;
    badge.textContent = `🎯 Match ${Math.min(Math.round(m._score / 2), 99)}%`;
    card.querySelector('.card-banner').appendChild(badge);
    grid.appendChild(card);
  });

  panel.appendChild(grid);

  // Click outside to close
  panel.addEventListener('click', e => { if (e.target === panel) panel.remove(); });
}


/* ══════════════════════════════════════════════════════════════
   SECTION 27 — PHÒNG CHIẾU RIÊNG (Private Screening Room)
══════════════════════════════════════════════════════════════ */

const SCREENING_DAYS = [
  {
    day: 1, // Thứ 2
    label: 'Thứ Hai',
    theme: '💪 Motivational Monday',
    mood: 'Khởi đầu tuần mới với những câu chuyện truyền cảm hứng',
    emoji: '💪',
    color: '#e67e22',
    genres: ['18', '36'], // Drama, History
    sort: 'vote_average.desc',
    minVotes: 5000,
    hour: '20:00',
    tagline: 'Bắt đầu tuần mới với nguồn cảm hứng mạnh mẽ',
  },
  {
    day: 2, // Thứ 3
    label: 'Thứ Ba',
    theme: '🕵️ Thriller Tuesday',
    mood: 'Đêm thứ 3 hồi hộp với những bộ phim giật gân',
    emoji: '🕵️',
    color: '#2c3e50',
    genres: ['53', '9648'], // Thriller, Mystery
    sort: 'popularity.desc',
    minVotes: 3000,
    hour: '21:00',
    tagline: 'Giữ nhịp tim với những bí ẩn chưa được giải đáp',
  },
  {
    day: 3, // Thứ 4
    label: 'Thứ Tư',
    theme: '🌿 Chill Wednesday',
    mood: 'Giữa tuần thư giãn với phim nhẹ nhàng, hài hước',
    emoji: '🌿',
    color: '#27ae60',
    genres: ['35', '10751'], // Comedy, Family
    sort: 'vote_average.desc',
    minVotes: 2000,
    hour: '19:30',
    tagline: 'Xả hơi với những khoảnh khắc vui vẻ, ấm áp',
  },
  {
    day: 4, // Thứ 5
    label: 'Thứ Năm',
    theme: '🚀 Sci-Fi Thursday',
    mood: 'Khám phá vũ trụ và tương lai với Sci-Fi đỉnh cao',
    emoji: '🚀',
    color: '#2980b9',
    genres: ['878', '14'], // Sci-Fi, Fantasy
    sort: 'vote_average.desc',
    minVotes: 4000,
    hour: '20:30',
    tagline: 'Vượt giới hạn trí tưởng tượng với Khoa học viễn tưởng',
  },
  {
    day: 5, // Thứ 6
    label: 'Thứ Sáu',
    theme: '🌏 World Cinema Friday',
    mood: 'Cuối tuần khám phá điện ảnh thế giới — Á Đông, Âu',
    emoji: '🌏',
    color: '#8e44ad',
    langs: ['ko', 'ja', 'fr', 'it', 'es'],
    sort: 'vote_average.desc',
    minVotes: 3000,
    hour: '20:00',
    tagline: 'Hành trình qua những nền điện ảnh tinh tế nhất thế giới',
  },
  {
    day: 6, // Thứ 7
    label: 'Thứ Bảy',
    theme: '🔥 Blockbuster Saturday',
    mood: 'Thứ 7 bom tấn! Action, Adventure không ngừng nghỉ',
    emoji: '🔥',
    color: '#e50914',
    genres: ['28', '12'], // Action, Adventure
    sort: 'popularity.desc',
    minVotes: 5000,
    hour: '21:30',
    tagline: 'Tiệc bom tấn cuối tuần — màn ảnh cháy hết mình',
  },
  {
    day: 0, // Chủ nhật
    label: 'Chủ Nhật',
    theme: '❤️ Classic Sunday',
    mood: 'Chủ nhật bình yên với những kiệt tác điện ảnh mọi thời đại',
    emoji: '❤️',
    color: '#c0392b',
    sort: 'vote_average.desc',
    minVotes: 20000,
    yearTo: 2005,
    hour: '20:00',
    tagline: 'Cảm nhận sức sống vĩnh cửu của những tác phẩm bất hủ',
  },
];

// Seed random dựa theo ngày để mỗi ngày có 1 phim cố định
function seededRandIdx(seed, max) {
  let x = seed;
  x = ((x >> 16) ^ x) * 0x45d9f3b;
  x = ((x >> 16) ^ x) * 0x45d9f3b;
  x = (x >> 16) ^ x;
  return Math.abs(x) % max;
}

async function fetchScreeningMovie(cfg, dateSeed) {
  if (!STATE.tmdbKey) return null;
  try {
    const params = {
      sort_by: cfg.sort,
      'vote_count.gte': cfg.minVotes || 1000,
      page: 1,
    };
    if (cfg.genres) params['with_genres'] = cfg.genres.join(',');
    if (cfg.yearTo) params['primary_release_date.lte'] = cfg.yearTo + '-12-31';

    let mediaType = 'movie';

    // World Cinema: pick a random language for the day
    if (cfg.langs) {
      const langIdx = seededRandIdx(dateSeed + 77, cfg.langs.length);
      params['with_original_language'] = cfg.langs[langIdx];
    }

    const data = await tmdb(`/discover/${mediaType}`, params);
    const results = data.results || [];
    if (!results.length) return null;

    // Pick deterministically using date seed
    const idx = seededRandIdx(dateSeed, Math.min(results.length, 20));
    return normalizeMovie(results[idx], mediaType);
  } catch(e) {
    return null;
  }
}

async function loadScreeningRoom() {
  const root = $('screening-root');
  if (!root) return;

  root.innerHTML = `
    <div class="sr-loading">
      <div class="sr-loading-reel">🎞️</div>
      <div class="sr-loading-text">Đang chọn phim cho tuần này...</div>
    </div>`;

  if (!STATE.tmdbKey) {
    root.innerHTML = `
      <div class="sr-no-key">
        <div class="sr-no-key-icon">🎬</div>
        <h3>Cần TMDB Key</h3>
        <p>Nhập TMDB Key để kích hoạt Phòng Chiếu Riêng</p>
        <button onclick="openTmdbModal()" class="sr-key-btn">🔑 Nhập TMDB Key</button>
      </div>`;
    return;
  }

  const today = new Date();
  const todayDow = today.getDay(); // 0=Sun, 1=Mon...

  // Build date seed cho mỗi ngày trong tuần (dựa theo tuần hiện tại)
  // Monday = start of week
  const monday = new Date(today);
  const diffToMon = (todayDow === 0 ? -6 : 1 - todayDow);
  monday.setDate(today.getDate() + diffToMon);

  // Fetch tất cả 7 ngày song song
  const weekMovies = await Promise.all(
    SCREENING_DAYS.map(async (cfg) => {
      const d = new Date(monday);
      const daysFromMon = cfg.day === 0 ? 6 : cfg.day - 1;
      d.setDate(monday.getDate() + daysFromMon);
      const dateSeed = d.getFullYear() * 10000 + (d.getMonth()+1) * 100 + d.getDate() + cfg.day * 999;
      const movie = await fetchScreeningMovie(cfg, dateSeed);
      return { cfg, movie, date: new Date(d) };
    })
  );

  // Sort by day of week starting from Monday
  const ordered = [1,2,3,4,5,6,0].map(dow =>
    weekMovies.find(w => w.cfg.day === dow)
  ).filter(Boolean);

  renderScreeningRoom(root, ordered, today);
}

function renderScreeningRoom(root, weekData, today) {
  root.innerHTML = '';

  // ── HEADER ──
  const header = document.createElement('div');
  header.className = 'sr-header';
  const weekStr = (() => {
    const mon = weekData[0]?.date;
    const sun = weekData[6]?.date;
    if (!mon || !sun) return '';
    return `${mon.getDate()}/${mon.getMonth()+1} — ${sun.getDate()}/${sun.getMonth()+1}/${sun.getFullYear()}`;
  })();
  header.innerHTML = `
    <div class="sr-header-left">
      <div class="sr-header-icon">🎬</div>
      <div>
        <h2 class="sr-header-title">Phòng Chiếu Riêng</h2>
        <div class="sr-header-sub">Lịch chiếu tuần này · ${weekStr}</div>
      </div>
    </div>
    <button class="sr-refresh-btn" id="sr-refresh-btn">🔄 Đổi danh sách</button>`;
  root.appendChild(header);


  // ── TODAY'S SPOTLIGHT ──
  const todayEntry = weekData.find(w => w.date.toDateString() === today.toDateString());
  if (todayEntry?.movie) {
    const spotlight = document.createElement('div');
    spotlight.className = 'sr-spotlight';
    spotlight.style.setProperty('--spot-color', todayEntry.cfg.color);

    const m = todayEntry.movie;
    const raw = null; // we don't have backdrop here

    spotlight.innerHTML = `
      <div class="sr-spot-inner">
        <div class="sr-spot-left">
          ${m.poster ? `<img class="sr-spot-poster" src="${m.poster}" alt="${m.title}" />` : '<div class="sr-spot-no-poster">🎬</div>'}
        </div>
        <div class="sr-spot-right">
          <div class="sr-spot-kicker">🎬 PHIM HÔM NAY · ${todayEntry.cfg.theme}</div>
          <h3 class="sr-spot-title">${m.title}</h3>
          <div class="sr-spot-meta">
            <span class="sr-spot-rating" style="background:${ratingBg(m.rating)};color:${ratingFg(m.rating)}">⭐ ${m.rating}/10</span>
            <span>${m.year}</span>
            <span>${(m.genre||'').split(',')[0]}</span>
          </div>
          <div class="sr-spot-mood">${todayEntry.cfg.mood}</div>
          <p class="sr-spot-desc">${(m.description||'').slice(0, 200)}...</p>
          <div class="sr-spot-showtime">
            <span class="sr-spot-time-icon">🕐</span>
            Suất chiếu gợi ý hôm nay: <strong>${todayEntry.cfg.hour}</strong>
          </div>
          <button class="sr-spot-btn" id="sr-spot-read">📰 Đọc bài phê bình</button>
        </div>
      </div>`;

    root.appendChild(spotlight);

    spotlight.querySelector('#sr-spot-read').addEventListener('click', () => {
      openNewspaperArticle(todayEntry.movie);
    });
  }

  // ── WEEK GRID ──
  const grid = document.createElement('div');
  grid.className = 'sr-week-grid';

  weekData.forEach(({ cfg, movie, date }) => {
    const isToday = date.toDateString() === today.toDateString();
    const isPast = date < today && !isToday;
    const isFuture = date > today && !isToday;

    const col = document.createElement('div');
    col.className = `sr-day-col${isToday ? ' sr-today' : ''}${isPast ? ' sr-past' : ''}`;

    // Day header
    const dayHdr = document.createElement('div');
    dayHdr.className = 'sr-day-header';
    dayHdr.style.setProperty('--day-color', cfg.color);
    dayHdr.innerHTML = `
      <div class="sr-day-emoji">${cfg.emoji}</div>
      <div class="sr-day-label">${cfg.label}</div>
      <div class="sr-day-date">${date.getDate()}/${date.getMonth()+1}</div>
      ${isToday ? '<div class="sr-today-badge">HÔM NAY</div>' : ''}`;
    col.appendChild(dayHdr);

    // Theme strip
    const theme = document.createElement('div');
    theme.className = 'sr-theme-strip';
    theme.style.background = cfg.color + '22';
    theme.style.borderColor = cfg.color + '44';
    theme.innerHTML = `<span style="color:${cfg.color}">${cfg.theme}</span>`;
    col.appendChild(theme);

    // Movie card
    if (movie) {
      const card = document.createElement('div');
      card.className = 'sr-movie-card';
      card.style.setProperty('--day-color', cfg.color);

      const posterWrap = document.createElement('div');
      posterWrap.className = 'sr-poster-wrap';
      if (movie.poster) {
        const img = document.createElement('img');
        img.src = movie.poster;
        img.alt = movie.title;
        posterWrap.appendChild(img);
      } else {
        posterWrap.innerHTML = '<div class="sr-no-poster">🎬</div>';
      }

      // Overlay khi hover
      const overlay = document.createElement('div');
      overlay.className = 'sr-poster-overlay';
      overlay.innerHTML = `<div class="sr-play-btn">▶ Đọc bài</div>`;
      posterWrap.appendChild(overlay);
      card.appendChild(posterWrap);

      const info = document.createElement('div');
      info.className = 'sr-movie-info';

      const titleEl = document.createElement('div');
      titleEl.className = 'sr-movie-title';
      titleEl.textContent = movie.title;
      info.appendChild(titleEl);

      const metaEl = document.createElement('div');
      metaEl.className = 'sr-movie-meta';
      metaEl.innerHTML = `<span class="sr-rating" style="background:${ratingBg(movie.rating)};color:${ratingFg(movie.rating)}">⭐ ${movie.rating}</span>
        <span class="sr-year">${movie.year || ''}</span>`;
      info.appendChild(metaEl);

      const genreEl = document.createElement('div');
      genreEl.className = 'sr-movie-genre';
      genreEl.textContent = (movie.genre || '').split(',')[0].trim();
      info.appendChild(genreEl);

      // Giờ chiếu gợi ý
      const timeEl = document.createElement('div');
      timeEl.className = 'sr-showtime';
      timeEl.innerHTML = `<span class="sr-showtime-icon">🕐</span> Giờ chiếu gợi ý: <strong>${cfg.hour}</strong>`;
      info.appendChild(timeEl);

      card.appendChild(info);

      // Click → mở newspaper article
      card.addEventListener('click', () => {
        openNewspaperArticle(movie);
      });

      col.appendChild(card);

      // Tagline
      const tagEl = document.createElement('div');
      tagEl.className = 'sr-tagline';
      tagEl.textContent = cfg.tagline;
      col.appendChild(tagEl);

    } else {
      // No movie found
      const empty = document.createElement('div');
      empty.className = 'sr-no-movie';
      empty.innerHTML = `<div>🎬</div><p>Đang tìm phim...</p>`;
      col.appendChild(empty);
    }

    grid.appendChild(col);
  });

  root.appendChild(grid);

  
  // Refresh button
  root.querySelector('#sr-refresh-btn')?.addEventListener('click', async () => {
    // Bump a re-roll seed stored in memory
    STATE._srRerollCount = (STATE._srRerollCount || 0) + 1;
    await loadScreeningRoomWithOffset(STATE._srRerollCount);
  });
}

async function loadScreeningRoomWithOffset(offset) {
  const root = $('screening-root');
  root.innerHTML = `
    <div class="sr-loading">
      <div class="sr-loading-reel">🎞️</div>
      <div class="sr-loading-text">Đang chọn danh sách phim mới...</div>
    </div>`;

  const today = new Date();
  const todayDow = today.getDay();
  const monday = new Date(today);
  const diffToMon = (todayDow === 0 ? -6 : 1 - todayDow);
  monday.setDate(today.getDate() + diffToMon);

  const weekMovies = await Promise.all(
    SCREENING_DAYS.map(async (cfg) => {
      const d = new Date(monday);
      const daysFromMon = cfg.day === 0 ? 6 : cfg.day - 1;
      d.setDate(monday.getDate() + daysFromMon);
      // Offset changes the seed to get different movies
      const dateSeed = d.getFullYear() * 10000 + (d.getMonth()+1) * 100 + d.getDate() + cfg.day * 999 + offset * 1337;
      const movie = await fetchScreeningMovie(cfg, dateSeed);
      return { cfg, movie, date: new Date(d) };
    })
  );

  const ordered = [1,2,3,4,5,6,0].map(dow =>
    weekMovies.find(w => w.cfg.day === dow)
  ).filter(Boolean);

  renderScreeningRoom(root, ordered, today);
}



/* ══════════════════════════════════════════════════════════════
   SECTION 28 — LIVE FILM FEED (Stock Market Dashboard)
   Real-time global film trending tracker
══════════════════════════════════════════════════════════════ */

const FEED_REGIONS = [
  { code: 'US', name: 'United States',   flag: '🇺🇸', lang: 'en', color: '#4488ff' },
  { code: 'GB', name: 'United Kingdom',  flag: '🇬🇧', lang: 'en', color: '#5599ff' },
  { code: 'KR', name: 'South Korea',     flag: '🇰🇷', lang: 'ko', color: '#ff4466' },
  { code: 'JP', name: 'Japan',           flag: '🇯🇵', lang: 'ja', color: '#ff6644' },
  { code: 'CN', name: 'China',           flag: '🇨🇳', lang: 'zh', color: '#ffaa00' },
  { code: 'FR', name: 'France',          flag: '🇫🇷', lang: 'fr', color: '#44aaff' },
  { code: 'DE', name: 'Germany',         flag: '🇩🇪', lang: 'de', color: '#ffcc00' },
  { code: 'IT', name: 'Italy',           flag: '🇮🇹', lang: 'it', color: '#44cc88' },
  { code: 'ES', name: 'Spain',           flag: '🇪🇸', lang: 'es', color: '#ff8844' },
  { code: 'IN', name: 'India',           flag: '🇮🇳', lang: 'hi', color: '#ff9933' },
  { code: 'TH', name: 'Thailand',        flag: '🇹🇭', lang: 'th', color: '#3366ff' },
  { code: 'VN', name: 'Vietnam',         flag: '🇻🇳', lang: 'vi', color: '#dd0000' },
  { code: 'BR', name: 'Brazil',          flag: '🇧🇷', lang: 'pt', color: '#44bb44' },
  { code: 'MX', name: 'Mexico',          flag: '🇲🇽', lang: 'es', color: '#cc3333' },
  { code: 'AU', name: 'Australia',       flag: '🇦🇺', lang: 'en', color: '#3399cc' },
  { code: 'RU', name: 'Russia',          flag: '🇷🇺', lang: 'ru', color: '#cc4444' },
  { code: 'TR', name: 'Turkey',          flag: '🇹🇷', lang: 'tr', color: '#cc2200' },
  { code: 'SA', name: 'Saudi Arabia',    flag: '🇸🇦', lang: 'ar', color: '#228833' },
];

const FEED_GENRE_COLORS = {
  'Action':'#e50914','Adventure':'#f5a623','Animation':'#44cc88',
  'Comedy':'#ffcc00','Crime':'#8844aa','Documentary':'#44aaff',
  'Drama':'#9b59b6','Fantasy':'#3498db','History':'#e67e22',
  'Horror':'#2c3e50','Music':'#e91e63','Mystery':'#455a64',
  'Romance':'#ff6b9d','Sci-Fi':'#00bcd4','Thriller':'#6d4c41',
  'War':'#78909c','Western':'#ff7043','Family':'#66bb6a',
};

// State cho feed
const FEED_STATE = {
  data: {},          // { regionCode: { movies, nowPlaying, fetchedAt } }
  selected: null,    // region đang xem chi tiết
  ticker: [],        // global ticker items
  refreshInterval: null,
  lastRefresh: null,
  nextRefresh: null,
  refreshCountdown: 3600,
  prevRankings: {},  // để tính tăng/giảm
};

async function loadLiveFeed() {
  const root = $('feed-root');
  if (!root) return;

  root.innerHTML = `
    <div class="lf-boot">
      <div class="lf-boot-logo">📡</div>
      <div class="lf-boot-title">LIVE FILM FEED</div>
      <div class="lf-boot-sub">Đang kết nối các thị trường điện ảnh toàn cầu...</div>
      <div class="lf-boot-bars">
        ${FEED_REGIONS.map(r => `<div class="lf-boot-bar" style="--bar-color:${r.color}"></div>`).join('')}
      </div>
    </div>`;

  if (!STATE.tmdbKey) {
    root.innerHTML = `
      <div class="lf-no-key">
        <div>📡</div>
        <p>Cần TMDB Key để kết nối Live Feed</p>
        <button onclick="openTmdbModal()" class="lf-key-btn">🔑 Nhập TMDB Key</button>
      </div>`;
    return;
  }

  // Fetch tất cả markets song song
  await refreshFeedData(root);

  // Auto-refresh mỗi giờ
  if (FEED_STATE.refreshInterval) clearInterval(FEED_STATE.refreshInterval);
  FEED_STATE.refreshCountdown = 3600;
  FEED_STATE.refreshInterval = setInterval(() => {
    FEED_STATE.refreshCountdown--;
    updateFeedCountdown();
    if (FEED_STATE.refreshCountdown <= 0) {
      FEED_STATE.refreshCountdown = 3600;
      refreshFeedData(root);
    }
  }, 1000);
}

async function refreshFeedData(root) {
  FEED_STATE.lastRefresh = new Date();
  FEED_STATE.nextRefresh = new Date(Date.now() + 3600000);

  // Save previous for delta
  FEED_REGIONS.forEach(r => {
    if (FEED_STATE.data[r.code]?.movies?.[0]) {
      FEED_STATE.prevRankings[r.code] = FEED_STATE.data[r.code].movies[0].tmdb_id;
    }
  });

  // Strategy per region:
  // - Unique language countries → /discover with original_language = bản địa
  //   to get locally produced popular films
  // - Anglophone countries (US/GB/AU) → /movie/now_playing?region + /discover sort popularity
  // - Mixed markets (FR/DE/IT/ES/MX/BR/TR/SA) → discover region + language mix

  const fetchRegion = async (region) => {
    try {
      const isAnglophone = ['US', 'GB', 'AU'].includes(region.code);
      const hasUniqueLanguage = !['en', 'es', 'pt'].includes(region.lang);
      // es/pt shared between multiple countries — add region filter too
      const isSharedLang = ['es', 'pt'].includes(region.lang);

      let discoverParams = {
        sort_by: 'popularity.desc',
        'vote_count.gte': 50,
        page: 1,
        region: region.code,
      };

      let discoverParams2 = null; // second fetch for mix

      if (hasUniqueLanguage) {
        // Pure local: Korean films for KR, Japanese for JP etc.
        discoverParams['with_original_language'] = region.lang;
        discoverParams['vote_count.gte'] = 20;
        // Also fetch english popular in that region
        discoverParams2 = {
          sort_by: 'popularity.desc',
          'vote_count.gte': 200,
          page: 1,
          region: region.code,
          // no language filter = mix of everything popular in region
        };
      } else if (isSharedLang) {
        // Spanish/Portuguese: filter by region to differentiate MX vs ES, BR vs PT
        discoverParams['with_original_language'] = region.lang;
        discoverParams['vote_count.gte'] = 30;
        discoverParams2 = {
          sort_by: 'popularity.desc',
          'vote_count.gte': 300,
          region: region.code,
          page: 1,
        };
      } else {
        // Anglophone/European: just use region-based popularity
        discoverParams['vote_count.gte'] = 100;
      }

      const [nowPlaying, discoverRes, discoverRes2] = await Promise.all([
        tmdb('/movie/now_playing', { region: region.code, page: 1 }).catch(() => ({ results: [] })),
        tmdb('/discover/movie', discoverParams).catch(() => ({ results: [] })),
        discoverParams2 ? tmdb('/discover/movie', discoverParams2).catch(() => ({ results: [] })) : Promise.resolve({ results: [] }),
      ]);

      // Merge: local language first, then mix, deduplicate
      const seen = new Set();
      const merged = [];
      const addMovies = (list) => {
        (list || []).forEach(m => {
          if (!seen.has(m.id) && merged.length < 10) {
            seen.add(m.id);
            merged.push(normalizeMovie(m, 'movie'));
          }
        });
      };
      addMovies(discoverRes.results);
      addMovies(discoverRes2.results);
      // Fill remaining slots with now_playing if needed
      addMovies(nowPlaying.results);

      FEED_STATE.data[region.code] = {
        movies: merged.slice(0, 10),
        nowPlaying: (nowPlaying.results || []).slice(0, 5).map(r => normalizeMovie(r, 'movie')),
        fetchedAt: new Date(),
      };
    } catch(e) {
      FEED_STATE.data[region.code] = { movies: [], nowPlaying: [], fetchedAt: new Date() };
    }
  };

  // Fetch in batches of 4 to avoid rate limiting
  const batches = [];
  for (let i = 0; i < FEED_REGIONS.length; i += 4) {
    batches.push(FEED_REGIONS.slice(i, i + 4));
  }
  for (const batch of batches) {
    await Promise.all(batch.map(fetchRegion));
  }

  // Global trending (this one is fine — it's genuinely global)
  try {
    const globalTrend = await tmdb('/trending/movie/day');
    FEED_STATE.globalTrending = (globalTrend.results || []).slice(0, 20).map(r => normalizeMovie(r, 'movie'));
  } catch(e) { FEED_STATE.globalTrending = []; }

  renderLiveFeed(root);
}

function renderLiveFeed(root) {
  root.innerHTML = '';

  // ── TOPBAR ──
  const topbar = document.createElement('div');
  topbar.className = 'lf-topbar';
  const now = new Date();
  topbar.innerHTML = `
    <div class="lf-topbar-left">
      <span class="lf-live-dot"></span>
      <span class="lf-topbar-title">LIVE FILM FEED</span>
      <span class="lf-topbar-sub">Global Cinema Markets · ${now.toLocaleTimeString('vi-VN')}</span>
    </div>
    <div class="lf-topbar-right">
      <span class="lf-refresh-info">🔄 Refresh sau: <strong id="lf-countdown">${formatCountdown(FEED_STATE.refreshCountdown)}</strong></span>
      <button class="lf-manual-refresh" id="lf-manual-refresh">⚡ Refresh ngay</button>
    </div>`;
  root.appendChild(topbar);

  // ── GLOBAL TICKER ──
  const ticker = buildFeedTicker();
  root.appendChild(ticker);

  // ── MAIN LAYOUT ──
  const main = document.createElement('div');
  main.className = 'lf-main';

  // LEFT: Market grid (stock board style)
  const board = buildMarketBoard();
  main.appendChild(board);

  // RIGHT: Detail panel
  const detail = document.createElement('div');
  detail.className = 'lf-detail-panel';
  detail.id = 'lf-detail-panel';
  const firstRegion = FEED_STATE.selected || FEED_REGIONS[0].code;
  renderDetailPanel(detail, firstRegion);
  main.appendChild(detail);

  root.appendChild(main);

  // ── BOTTOM: Global Charts ──
  const charts = buildGlobalCharts();
  root.appendChild(charts);

  // Events
  root.querySelector('#lf-manual-refresh')?.addEventListener('click', () => {
    FEED_STATE.refreshCountdown = 3600;
    refreshFeedData(root);
  });
}

function buildFeedTicker() {
  const ticker = document.createElement('div');
  ticker.className = 'lf-ticker';

  const items = [];
  FEED_REGIONS.forEach(r => {
    const d = FEED_STATE.data[r.code];
    if (d?.movies?.[0]) {
      const m = d.movies[0];
      items.push(`${r.flag} ${r.name.toUpperCase()}: <b>${m.title}</b> #1 ⭐${m.rating}`);
    }
  });
  // Global trending
  if (FEED_STATE.globalTrending?.[0]) {
    items.unshift(`🌍 GLOBAL #1: <b>${FEED_STATE.globalTrending[0].title}</b> ⭐${FEED_STATE.globalTrending[0].rating}`);
  }

  const inner = items.join('  ·  ');
  ticker.innerHTML = `
    <div class="lf-ticker-label">📡 LIVE</div>
    <div class="lf-ticker-track">
      <div class="lf-ticker-inner">${inner}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;${inner}</div>
    </div>`;
  return ticker;
}

function buildMarketBoard() {
  const board = document.createElement('div');
  board.className = 'lf-board';

  // Board header
  const hdr = document.createElement('div');
  hdr.className = 'lf-board-header';
  hdr.innerHTML = `
    <div class="lf-board-title">📊 THỊ TRƯỜNG ĐIỆN ẢNH</div>
    <div class="lf-board-cols">
      <span>THỊ TRƯỜNG</span><span>#1 TRENDING</span><span>RATING</span><span>THAY ĐỔI</span>
    </div>`;
  board.appendChild(hdr);

  // Market rows
  const rows = document.createElement('div');
  rows.className = 'lf-market-rows';

  FEED_REGIONS.forEach((region, idx) => {
    const d = FEED_STATE.data[region.code];
    const top = d?.movies?.[0];
    const prevId = FEED_STATE.prevRankings[region.code];
    const isNew = top && prevId && top.tmdb_id !== prevId;
    const hasData = !!top;

    const row = document.createElement('div');
    row.className = `lf-market-row${FEED_STATE.selected === region.code ? ' lf-row-active' : ''}`;
    row.style.setProperty('--region-color', region.color);
    row.style.animationDelay = `${idx * 40}ms`;

    // Mock mini sparkline (random for visual)
    const spark = generateSparkline(region.code);

    row.innerHTML = `
      <div class="lf-row-market">
        <span class="lf-row-flag">${region.flag}</span>
        <div>
          <div class="lf-row-name">${region.name}</div>
          <div class="lf-row-code">${region.code} · ${d?.movies?.length || 0} titles</div>
        </div>
      </div>
      <div class="lf-row-top">
        ${hasData ? `
          <div class="lf-row-poster">
            ${top.poster ? `<img src="${top.poster}" />` : '🎬'}
          </div>
          <div class="lf-row-title-wrap">
            <div class="lf-row-film-title">${top.title}</div>
            <div class="lf-row-film-genre">${(top.genre||'').split(',')[0]}</div>
          </div>
        ` : '<div class="lf-row-no-data">—</div>'}
      </div>
      <div class="lf-row-rating">
        ${hasData ? `
          <div class="lf-rating-val" style="color:${ratingBg(top.rating)}">${top.rating}</div>
          <div class="lf-spark">${spark}</div>
        ` : '—'}
      </div>
      <div class="lf-row-change">
        ${isNew ? '<span class="lf-badge-new">🔺 NEW #1</span>' : (hasData ? '<span class="lf-badge-hold">— HOLD</span>' : '')}
      </div>`;

    row.addEventListener('click', () => {
      FEED_STATE.selected = region.code;
      // Update active states
      document.querySelectorAll('.lf-market-row').forEach(r => r.classList.remove('lf-row-active'));
      row.classList.add('lf-row-active');
      // Update detail panel
      const panel = $('lf-detail-panel');
      if (panel) renderDetailPanel(panel, region.code);
    });

    rows.appendChild(row);
  });

  board.appendChild(rows);
  return board;
}

function renderDetailPanel(panel, regionCode) {
  FEED_STATE.selected = regionCode;
  const region = FEED_REGIONS.find(r => r.code === regionCode);
  const d = FEED_STATE.data[regionCode];

  if (!region || !d) { panel.innerHTML = '<div class="lf-detail-empty">Chọn một thị trường để xem chi tiết</div>'; return; }

  panel.innerHTML = '';

  // Header
  const hdr = document.createElement('div');
  hdr.className = 'lf-detail-hdr';
  hdr.style.setProperty('--region-color', region.color);
  hdr.innerHTML = `
    <div class="lf-detail-flag">${region.flag}</div>
    <div>
      <div class="lf-detail-country">${region.name}</div>
      <div class="lf-detail-time">Cập nhật: ${d.fetchedAt?.toLocaleTimeString('vi-VN') || 'N/A'}</div>
    </div>
    <div class="lf-detail-badge" style="background:${region.color}22;color:${region.color};border-color:${region.color}44">${region.code}</div>`;
  panel.appendChild(hdr);

  // Genre breakdown
  const genreCount = {};
  (d.movies || []).forEach(m => {
    (m.genre || '').split(',').map(g => g.trim()).filter(Boolean).forEach(g => {
      genreCount[g] = (genreCount[g] || 0) + 1;
    });
  });
  const topGenres = Object.entries(genreCount).sort((a,b) => b[1]-a[1]).slice(0, 4);
  if (topGenres.length) {
    const genreBar = document.createElement('div');
    genreBar.className = 'lf-genre-strip';
    genreBar.innerHTML = topGenres.map(([g, n]) =>
      `<span class="lf-genre-pill" style="background:${FEED_GENRE_COLORS[g]||'#444'}22;color:${FEED_GENRE_COLORS[g]||'#888'};border-color:${FEED_GENRE_COLORS[g]||'#444'}44">${g} <b>${n}</b></span>`
    ).join('');
    panel.appendChild(genreBar);
  }

  // Top 10 list
  const listLabel = document.createElement('div');
  listLabel.className = 'lf-detail-label';
  listLabel.textContent = `🔥 TOP TRENDING — ${region.name.toUpperCase()}`;
  panel.appendChild(listLabel);

  const list = document.createElement('div');
  list.className = 'lf-top-list';
  (d.movies || []).forEach((m, i) => {
    const item = document.createElement('div');
    item.className = 'lf-top-item';
    item.style.setProperty('--region-color', region.color);
    item.innerHTML = `
      <div class="lf-top-rank" style="color:${i < 3 ? region.color : 'var(--gray)'}">${i+1}</div>
      <div class="lf-top-poster">
        ${m.poster ? `<img src="${m.poster}" />` : '🎬'}
      </div>
      <div class="lf-top-info">
        <div class="lf-top-title">${m.title}</div>
        <div class="lf-top-meta">
          <span style="background:${ratingBg(m.rating)};color:${ratingFg(m.rating)}" class="lf-top-rating">⭐ ${m.rating}</span>
          <span class="lf-top-year">${m.year}</span>
          <span class="lf-top-genre">${(m.genre||'').split(',')[0]}</span>
        </div>
      </div>
      ${i === 0 ? `<div class="lf-top-crown">👑</div>` : ''}`;
    item.addEventListener('click', () => showDetailPage(m));
    list.appendChild(item);
  });
  panel.appendChild(list);

  // Now Playing
  if (d.nowPlaying?.length) {
    const npLabel = document.createElement('div');
    npLabel.className = 'lf-detail-label';
    npLabel.style.marginTop = '16px';
    npLabel.textContent = `🎬 ĐANG CHIẾU RẠP — ${region.code}`;
    panel.appendChild(npLabel);

    const npRow = document.createElement('div');
    npRow.className = 'lf-np-row';
    d.nowPlaying.forEach(m => {
      const card = document.createElement('div');
      card.className = 'lf-np-card';
      card.innerHTML = `
        <div class="lf-np-poster">
          ${m.poster ? `<img src="${m.poster}" />` : '🎬'}
        </div>
        <div class="lf-np-title">${m.title}</div>
        <div class="lf-np-rating" style="color:${ratingBg(m.rating)}">⭐ ${m.rating}</div>`;
      card.addEventListener('click', () => showDetailPage(m));
      npRow.appendChild(card);
    });
    panel.appendChild(npRow);
  }
}

function buildGlobalCharts() {
  const section = document.createElement('div');
  section.className = 'lf-global-section';

  // ── Section 1: East vs West ──
  const ewWrap = document.createElement('div');
  ewWrap.className = 'lf-ew-wrap';

  const eastRegions = ['KR','JP','CN','TH','VN','IN'];
  const westRegions = ['US','GB','FR','DE','IT','ES'];

  const eastMovies = getTopMoviesForRegions(eastRegions, 5);
  const westMovies = getTopMoviesForRegions(westRegions, 5);

  ewWrap.innerHTML = `<div class="lf-ew-title">⚔️ ĐÔNG vs TÂY — Top Phim Theo Khu Vực</div>`;
  const ewGrid = document.createElement('div');
  ewGrid.className = 'lf-ew-grid';

  // East
  const eastCol = document.createElement('div');
  eastCol.className = 'lf-ew-col';
  eastCol.innerHTML = `<div class="lf-ew-col-label" style="color:#ff6644">🌏 ĐIỆN ẢNH CHÂU Á</div>`;
  eastMovies.forEach((m, i) => {
    const row = document.createElement('div');
    row.className = 'lf-ew-row';
    row.innerHTML = `
      <span class="lf-ew-n" style="color:#ff6644">${i+1}</span>
      ${m.poster ? `<img class="lf-ew-thumb" src="${m.poster}" />` : ''}
      <div>
        <div class="lf-ew-film">${m.title}</div>
        <div class="lf-ew-meta">⭐${m.rating} · ${m.year}</div>
      </div>`;
    row.addEventListener('click', () => showDetailPage(m));
    eastCol.appendChild(row);
  });
  ewGrid.appendChild(eastCol);

  // Divider
  const div = document.createElement('div');
  div.className = 'lf-ew-divider';
  div.innerHTML = '<div class="lf-ew-vs">VS</div>';
  ewGrid.appendChild(div);

  // West
  const westCol = document.createElement('div');
  westCol.className = 'lf-ew-col';
  westCol.innerHTML = `<div class="lf-ew-col-label" style="color:#4488ff">🌎 ĐIỆN ẢNH PHƯƠNG TÂY</div>`;
  westMovies.forEach((m, i) => {
    const row = document.createElement('div');
    row.className = 'lf-ew-row';
    row.innerHTML = `
      <span class="lf-ew-n" style="color:#4488ff">${i+1}</span>
      ${m.poster ? `<img class="lf-ew-thumb" src="${m.poster}" />` : ''}
      <div>
        <div class="lf-ew-film">${m.title}</div>
        <div class="lf-ew-meta">⭐${m.rating} · ${m.year}</div>
      </div>`;
    row.addEventListener('click', () => showDetailPage(m));
    westCol.appendChild(row);
  });
  ewGrid.appendChild(westCol);

  ewWrap.appendChild(ewGrid);
  section.appendChild(ewWrap);

  // ── Section 2: Genre Heatmap ──
  const heatWrap = document.createElement('div');
  heatWrap.className = 'lf-heat-wrap';
  heatWrap.innerHTML = `<div class="lf-heat-title">🌡️ THỂ LOẠI ĐANG HOT TOÀN CẦU</div>`;
  heatWrap.appendChild(buildGenreHeatmap());
  section.appendChild(heatWrap);

  // ── Section 3: Global Top 20 ──
  if (FEED_STATE.globalTrending?.length) {
    const globalWrap = document.createElement('div');
    globalWrap.className = 'lf-global-top-wrap';
    globalWrap.innerHTML = `<div class="lf-global-top-title">🌍 GLOBAL TOP 20 — TRENDING HÔM NAY</div>`;
    const globalGrid = document.createElement('div');
    globalGrid.className = 'lf-global-top-grid';
    FEED_STATE.globalTrending.forEach((m, i) => {
      const card = document.createElement('div');
      card.className = 'lf-global-card';
      card.innerHTML = `
        <div class="lf-global-rank">#${i+1}</div>
        <div class="lf-global-poster">
          ${m.poster ? `<img src="${m.poster}" />` : '<div class="lf-global-no-poster">🎬</div>'}
        </div>
        <div class="lf-global-info">
          <div class="lf-global-title">${m.title}</div>
          <div class="lf-global-meta">
            <span style="background:${ratingBg(m.rating)};color:${ratingFg(m.rating)}" class="lf-global-rating">⭐ ${m.rating}</span>
            <span class="lf-global-year">${m.year}</span>
          </div>
          <div class="lf-global-genre">${(m.genre||'').split(',')[0]}</div>
        </div>`;
      card.addEventListener('click', () => showDetailPage(m));
      globalGrid.appendChild(card);
    });
    globalWrap.appendChild(globalGrid);
    section.appendChild(globalWrap);
  }

  return section;
}

function buildGenreHeatmap() {
  const allGenres = {};
  FEED_REGIONS.forEach(r => {
    const d = FEED_STATE.data[r.code];
    (d?.movies || []).forEach(m => {
      (m.genre || '').split(',').map(g => g.trim()).filter(Boolean).forEach(g => {
        if (!allGenres[g]) allGenres[g] = { count: 0, regions: [] };
        allGenres[g].count++;
        if (!allGenres[g].regions.includes(r.flag)) allGenres[g].regions.push(r.flag);
      });
    });
  });

  const sorted = Object.entries(allGenres).sort((a,b) => b[1].count - a[1].count).slice(0, 12);
  const maxCount = sorted[0]?.[1].count || 1;

  const wrap = document.createElement('div');
  wrap.className = 'lf-heat-grid';
  sorted.forEach(([genre, data]) => {
    const pct = Math.round(data.count / maxCount * 100);
    const cell = document.createElement('div');
    cell.className = 'lf-heat-cell';
    const color = FEED_GENRE_COLORS[genre] || '#888';
    cell.style.setProperty('--heat-color', color);
    cell.style.setProperty('--heat-pct', pct + '%');
    cell.innerHTML = `
      <div class="lf-heat-bar-bg">
        <div class="lf-heat-bar-fill" style="width:${pct}%;background:${color}"></div>
      </div>
      <div class="lf-heat-label">
        <span class="lf-heat-genre" style="color:${color}">${genre}</span>
        <span class="lf-heat-count">${data.count} films</span>
      </div>
      <div class="lf-heat-flags">${data.regions.slice(0,6).join(' ')}</div>`;
    wrap.appendChild(cell);
  });
  return wrap;
}

// ── Helpers ──
function getTopMoviesForRegions(codes, limit) {
  const seen = new Set();
  const result = [];
  codes.forEach(code => {
    const d = FEED_STATE.data[code];
    (d?.movies || []).slice(0, 3).forEach(m => {
      if (!seen.has(m.tmdb_id) && result.length < limit) {
        seen.add(m.tmdb_id);
        result.push(m);
      }
    });
  });
  return result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
}

function generateSparkline(code) {
  // Visual-only sparkline SVG
  const seed = code.charCodeAt(0) * 31 + code.charCodeAt(1);
  const points = [];
  let y = 50;
  for (let i = 0; i < 8; i++) {
    y = Math.max(10, Math.min(90, y + (((seed * (i+1) * 7919) % 40) - 20)));
    points.push(`${i * 14},${y}`);
  }
  const isUp = parseInt(points[points.length-1]) < parseInt(points[0]);
  const color = isUp ? '#44ff88' : '#ff4444';
  return `<svg width="98" height="30" viewBox="0 0 98 100" preserveAspectRatio="none">
    <polyline points="${points.join(' ')}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function formatCountdown(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function updateFeedCountdown() {
  const el = document.getElementById('lf-countdown');
  if (el) el.textContent = formatCountdown(FEED_STATE.refreshCountdown);
}



/* ══════════════════════════════════════════════════════════════
   CINEMATIC UNIVERSE BUILDER — Web Graph 3 Layers
══════════════════════════════════════════════════════════════ */

async function showCinematicUniverse(centerName, centerType = 'person') {
  // Tạo overlay
  const overlay = document.createElement('div');
  overlay.id = 'universe-overlay';
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:500;
    background:#04080f;
    display:flex;flex-direction:column;
    font-family:'DM Sans',sans-serif;
  `;

  overlay.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;
      padding:12px 20px;background:#080c14;border-bottom:1px solid #1e2d45;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-size:1.1rem;font-weight:700;color:#44ff88;">🕸️ Cinematic Universe</span>
        <span id="univ-center-label" style="color:#7a8fa8;font-size:0.88rem;"></span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <span style="font-size:0.78rem;color:#7a8fa8;" id="univ-status">Đang xây dựng...</span>
        <button id="univ-close" style="background:#1a1a2e;border:1px solid #1e2d45;
          color:#aaa;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:0.85rem;">✕ Đóng</button>
      </div>
    </div>
    <div style="display:flex;gap:8px;padding:8px 16px;background:#060a11;
      border-bottom:1px solid #1e2d45;flex-shrink:0;flex-wrap:wrap;align-items:center;">
      <span style="font-size:0.75rem;color:#7a8fa8;">Chú thích:</span>
      <span style="display:flex;align-items:center;gap:4px;font-size:0.75rem;color:#e8302a;">
        <svg width="14" height="14"><circle cx="7" cy="7" r="6" fill="#e8302a"/></svg> Trung tâm
      </span>
      <span style="display:flex;align-items:center;gap:4px;font-size:0.75rem;color:#e8a020;">
        <svg width="14" height="14"><circle cx="7" cy="7" r="5" fill="#e8a020"/></svg> Diễn viên / Đạo diễn
      </span>
      <span style="display:flex;align-items:center;gap:4px;font-size:0.75rem;color:#2980d4;">
        <svg width="14" height="14"><rect x="2" y="2" width="10" height="10" rx="2" fill="#2980d4"/></svg> Phim
      </span>
      <span style="font-size:0.75rem;color:#7a8fa8;margin-left:8px;">
        🖱️ Drag để di chuyển · Scroll để zoom · Click node để mở chi tiết
      </span>
    </div>
    <svg id="univ-svg" style="flex:1;width:100%;cursor:grab;"></svg>
    <div id="univ-tooltip" style="position:fixed;pointer-events:none;z-index:600;
      background:#0f1623;border:1px solid #1e2d45;border-radius:8px;
      padding:10px 14px;font-size:0.82rem;color:#e8edf5;
      box-shadow:0 8px 32px rgba(0,0,0,.8);opacity:0;transition:opacity .15s;
      max-width:220px;"></div>
  `;

  document.body.appendChild(overlay);
  document.getElementById('univ-close').addEventListener('click', () => overlay.remove());

  // Fetch data
  const person = await fetchPersonDetail(centerName);
  if (!person) {
    document.getElementById('univ-status').textContent = '⚠️ Không tìm thấy dữ liệu';
    return;
  }

  document.getElementById('univ-center-label').textContent =
    `${person.name} · ${person.isDirector ? 'Đạo diễn' : 'Diễn viên'}`;

  // ── XÂY DỰNG GRAPH DATA (3 lớp) ──
  const nodes = [], links = [];
  const nodeMap = {};

  const addNode = (id, data) => {
    if (!nodeMap[id]) {
      nodeMap[id] = data;
      nodes.push(data);
    }
    return nodeMap[id];
  };

  // Layer 0: Center
  const centerNode = addNode(`person_${person.id}`, {
    id: `person_${person.id}`,
    type: 'center',
    label: person.name,
    img: person.avatar,
    layer: 0,
    data: { name: person.name, avatar: person.avatar, tmdb_id: person.tmdb_id },
    r: 32,
  });

  // Layer 1: Phim của người này
  const films = (person.isDirector ? person.directed : person.filmography)
    .filter(m => m.tmdb_id)
    .sort((a, b) => bayesianRating(b.rating, b.vote_count) - bayesianRating(a.rating, a.vote_count))
    .slice(0, 30); // layer 1: tối đa 30 phim

  const layer1Films = films.filter(m => m.tmdb_id);

  for (const film of layer1Films) {
    const fid = `movie_${film.tmdb_id}`;
    const fNode = addNode(fid, {
      id: fid,
      type: 'movie',
      label: film.title,
      img: film.poster,
      layer: 1,
      data: film,
      r: 22,
      rating: parseFloat(film.rating) || 0,
    });
    links.push({ source: centerNode.id, target: fid, layer: 1 });
  }

  document.getElementById('univ-status').textContent =
    `Lớp 1: ${layer1Films.length} phim · Đang tải lớp 2...`;

  // Layer 2 & 3: Diễn viên của từng phim → phim khác của họ
  const castFetches = layer1Films.slice(0, 15).map(async (film) => {
    if (!STATE.tmdbKey || !film.tmdb_id) return;
    try {
      const mt = film.mediaType || 'movie';
      const credits = await tmdb(`/${mt}/${film.tmdb_id}/credits`);
      const cast = (credits.cast || []).slice(0, 3);

      for (const actor of cast) {
        const aid = `person_${actor.id}`;
        if (nodeMap[aid]) {
          // Đã có → chỉ thêm link
          links.push({ source: `movie_${film.tmdb_id}`, target: aid, layer: 2 });
          continue;
        }

        const aNode = addNode(aid, {
          id: aid,
          type: 'person',
          label: actor.name,
          img: actor.profile_path ? `${TMDB_IMG}/w185${actor.profile_path}` : '',
          layer: 2,
          data: { name: actor.name, avatar: actor.profile_path ? `${TMDB_IMG}/w185${actor.profile_path}` : '', tmdb_id: String(actor.id) },
          r: 18,
        });
        links.push({ source: `movie_${film.tmdb_id}`, target: aid, layer: 2 });

        // Layer 3: 2 phim nổi tiếng nhất của actor này
        try {
          const actorCredits = await tmdb(`/person/${actor.id}/movie_credits`);
          const topFilms = (actorCredits.cast || [])
            .filter(m => m.vote_count >= 500 && m.poster_path)
            .sort((a, b) => b.vote_count - a.vote_count)
            .slice(0, 1);

          for (const af of topFilms) {
            const afid = `movie_${af.id}`;
            if (!nodeMap[afid]) {
              addNode(afid, {
                id: afid,
                type: 'movie',
                label: af.title || af.name || '',
                img: af.poster_path ? `${TMDB_IMG}/w185${af.poster_path}` : '',
                layer: 3,
                data: normalizeMovie(af, 'movie'),
                r: 15,
                rating: af.vote_average || 0,
              });
            }
            links.push({ source: aid, target: afid, layer: 3 });
          }
        } catch(e) {}
      }
    } catch(e) {}
  });

  await Promise.all(castFetches);

  document.getElementById('univ-status').textContent =
    `${nodes.length} nodes · ${links.length} kết nối · Click để xem chi tiết`;

  // ── RENDER D3 FORCE GRAPH ──
  renderUniverseGraph(overlay, nodes, links, centerNode);
}

function renderUniverseGraph(overlay, nodes, links, centerNode) {
  const svg = d3.select('#univ-svg');
  const tooltip = document.getElementById('univ-tooltip');
  const W = overlay.querySelector('svg').clientWidth || window.innerWidth;
  const H = overlay.querySelector('svg').clientHeight || (window.innerHeight - 120);

  svg.selectAll('*').remove();

  // Deduplicate links
  const linkSet = new Set();
  const cleanLinks = links.filter(l => {
    const k = [l.source, l.target].sort().join('|');
    if (linkSet.has(k)) return false;
    linkSet.add(k);
    return true;
  });

  // Force simulation
  const sim = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(cleanLinks).id(d => d.id).distance(d => {
      if (d.layer === 1) return 120;
      if (d.layer === 2) return 90;
      return 70;
    }).strength(0.4))
    .force('charge', d3.forceManyBody().strength(d => {
      if (d.type === 'center') return -800;
      if (d.layer === 1) return -300;
      if (d.layer === 2) return -150;
      return -80;
    }))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide(d => d.r + 8))
    .alphaDecay(0.025);

  // Zoom
  const zoomG = svg.append('g');
  svg.call(d3.zoom()
    .scaleExtent([0.15, 4])
    .on('zoom', e => zoomG.attr('transform', e.transform))
  );

  // Gradient defs
  const defs = svg.append('defs');

  // Glow filter
  const filter = defs.append('filter').attr('id', 'univ-glow');
  filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
  const feMerge = filter.append('feMerge');
  feMerge.append('feMergeNode').attr('in', 'coloredBlur');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

  // Image patterns for nodes
  nodes.forEach(n => {
    if (n.img) {
      const pat = defs.append('pattern')
        .attr('id', `univ-img-${n.id.replace(/[^a-z0-9]/gi, '_')}`)
        .attr('patternUnits', 'objectBoundingBox')
        .attr('width', 1).attr('height', 1);
      pat.append('image')
        .attr('href', n.img)
        .attr('width', n.r * 2)
        .attr('height', n.r * 2)
        .attr('preserveAspectRatio', 'xMidYMid slice');
    }
  });

  // Link color by layer
  const linkColor = l => l.layer === 1 ? 'rgba(232,160,32,0.5)'
    : l.layer === 2 ? 'rgba(41,128,212,0.3)'
    : 'rgba(100,180,100,0.2)';

  // Draw links
  const link = zoomG.append('g').selectAll('line')
    .data(cleanLinks).enter().append('line')
    .attr('stroke', d => linkColor(d))
    .attr('stroke-width', d => d.layer === 1 ? 1.5 : d.layer === 2 ? 1 : 0.7)
    .attr('stroke-dasharray', d => d.layer === 3 ? '4,3' : null);

  // Node groups
  const nodeG = zoomG.append('g').selectAll('g')
    .data(nodes).enter().append('g')
    .style('cursor', 'pointer')
    .call(d3.drag()
      .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
    );

  // Node circles / rects
  nodeG.each(function(d) {
    const g = d3.select(this);
    const patId = `url(#univ-img-${d.id.replace(/[^a-z0-9]/gi, '_')})`;

    if (d.type === 'movie') {
      // Rounded rect for movies
      g.append('rect')
        .attr('width', d.r * 2).attr('height', d.r * 2)
        .attr('x', -d.r).attr('y', -d.r)
        .attr('rx', 4).attr('ry', 4)
        .attr('fill', d.img ? patId : '#1a2a3a')
        .attr('stroke', d.layer === 1 ? '#2980d4' : d.layer === 3 ? '#1a4a2a' : '#1a3a4a')
        .attr('stroke-width', d.layer === 1 ? 2 : 1);
    } else {
      // Circle for people
      g.append('circle')
        .attr('r', d.r)
        .attr('fill', d.img ? patId : (d.type === 'center' ? '#3a0a0a' : '#2a1a0a'))
        .attr('stroke', d.type === 'center' ? '#e8302a' : '#e8a020')
        .attr('stroke-width', d.type === 'center' ? 3 : 1.5)
        .attr('filter', d.type === 'center' ? 'url(#univ-glow)' : null);
    }

    // Label
    const labelY = d.r + 12;
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', labelY)
      .attr('fill', d.type === 'center' ? '#e8302a'
        : d.type === 'movie' ? '#a0c4e8'
        : '#e8c88a')
      .attr('font-size', d.type === 'center' ? '12px' : d.layer === 1 ? '10px' : '8px')
      .attr('font-weight', d.type === 'center' ? '700' : '400')
      .text(d.label.length > 16 ? d.label.slice(0, 14) + '…' : d.label);

    // Rating badge for movies
    if (d.type === 'movie' && d.rating >= 7) {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', -d.r - 4)
        .attr('fill', '#f5c518')
        .attr('font-size', '8px')
        .text(`⭐ ${d.rating.toFixed(1)}`);
    }
  });

  // Tooltip
  nodeG
    .on('mouseover', (e, d) => {
      tooltip.style.opacity = '1';
      tooltip.innerHTML = d.type === 'movie'
        ? `<b>${d.label}</b><br>⭐ ${d.data?.rating || '?'} · ${d.data?.year || ''}<br><small style="color:#7a8fa8">${(d.data?.genre || '').split(',')[0]}</small>`
        : `<b>${d.label}</b><br><small style="color:#7a8fa8">${d.type === 'center' ? '🎬 Trung tâm' : (d.layer === 2 ? '🎭 Diễn viên' : '👤 Liên kết')}</small>`;
    })
    .on('mousemove', e => {
      tooltip.style.left = (e.clientX + 14) + 'px';
      tooltip.style.top  = (e.clientY - 10) + 'px';
    })
    .on('mouseout', () => { tooltip.style.opacity = '0'; })
    .on('click', (e, d) => {
      e.stopPropagation();
      overlay.remove();
      if (d.type === 'movie' && d.data) {
        showDetailPage(d.data);
      } else if (d.type !== 'center' && d.data?.name) {
        // Tìm xem là diễn viên hay đạo diễn
        if (d.data.name) showActorPage({ name: d.data.name, avatar: d.data.avatar || '' });
      }
    });

  // Tick
  sim.on('tick', () => {
    link
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    nodeG.attr('transform', d => `translate(${d.x},${d.y})`);
  });
}

function bayesianRating(rating, voteCount, minVotes = 1000, avgRating = 6.5) {
  const v = voteCount || 0;
  const R = parseFloat(rating) || 0;
  return (v / (v + minVotes)) * R + (minVotes / (v + minVotes)) * avgRating;
}
