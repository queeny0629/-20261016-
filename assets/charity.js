(() => {
  'use strict';
  const stage = document.getElementById('filmIntro');
  const frame = document.getElementById('charityPlayer');
  const content = stage.querySelector('.film-content');
  const topline = stage.querySelector('.film-topline');
  const status = document.getElementById('videoStatus');
  const play = document.getElementById('togglePlay');
  const mute = document.getElementById('toggleMute');
  const start = document.getElementById('startVideo');
  const layout = document.getElementById('toggleLayout');
  const focus = document.getElementById('toggleFocus');
  const fullscreen = document.getElementById('toggleFullscreen');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let player;
  let ready = false;
  let failed = false;
  let userPaused = reducedMotion;
  let pausedForVisibility = false;
  function announce(text) { if (status.textContent !== text) status.textContent = text; }
  function updateFraming() {
    const rect = stage.getBoundingClientRect();
    stage.style.setProperty('--cover-size', Math.ceil(Math.max(rect.width, rect.height)) + 'px');
    stage.style.setProperty('--contain-size', Math.floor(Math.min(rect.width, rect.height)) + 'px');
  }
  if ('ResizeObserver' in window) new ResizeObserver(updateFraming).observe(stage);
  else window.addEventListener('resize', updateFraming);
  updateFraming();
  // The HTTPS/HTTP origin is required for reliable IFrame API messaging.
  const embed = new URL(frame.dataset.src);
  if (/^https?:$/.test(location.protocol)) embed.searchParams.set('origin', location.origin);
  if (reducedMotion) embed.searchParams.set('autoplay', '0');
  if (embed.href !== frame.src) frame.src = embed.href;
  function setPlayControl(playing) {
    play.setAttribute('aria-label', playing ? '暫停影片' : '播放影片');
    play.querySelector('span').textContent = playing ? '暫停' : '播放';
    play.querySelector('i').className = 'fa-solid ' + (playing ? 'fa-pause' : 'fa-play');
  }
  function setMuteControl() {
    const hasSound = !player.isMuted();
    mute.setAttribute('aria-pressed', String(hasSound));
    mute.setAttribute('aria-label', hasSound ? '關閉影片聲音' : '開啟影片聲音');
    mute.querySelector('span').textContent = hasSound ? '關閉聲音' : '開啟聲音';
    mute.querySelector('i').className = 'fa-solid ' + (hasSound ? 'fa-volume-high' : 'fa-volume-xmark');
  }
  function manualStart() {
    if (!ready || failed) return;
    userPaused = false;
    start.hidden = true;
    player.playVideo();
  }
  function showPlayPrompt(message) {
    if (failed) return;
    start.hidden = false;
    setPlayControl(false);
    announce(message);
  }
  function unavailable() {
    if (failed) return;
    failed = true;
    ready = false;
    play.disabled = true;
    mute.disabled = true;
    start.hidden = true;
    stage.classList.add('is-unavailable');
    frame.src = 'about:blank';
    announce('影片暫時無法載入，請前往 YouTube 觀看。');
  }
  const apiTimeout = window.setTimeout(() => { if (!ready) unavailable(); }, 15000);
  function createPlayer() {
    if (player || failed) return;
    player = new window.YT.Player('charityPlayer', {
      events: {
        onReady: event => {
          window.clearTimeout(apiTimeout);
          if (failed) return;
          ready = true;
          frame.tabIndex = -1;
          event.target.mute();
          play.disabled = false;
          mute.disabled = false;
          setMuteControl();
          if (reducedMotion) {
            event.target.pauseVideo();
            showPlayPrompt('已依減少動態偏好暫停，可點擊播放。');
          } else if (document.hidden) {
            pausedForVisibility = true;
            event.target.pauseVideo();
            announce('影片已暫停');
          } else {
            event.target.playVideo();
            announce('影片準備播放 · 靜音');
            window.setTimeout(() => {
              if (ready && !userPaused && player.getPlayerState() !== 1) showPlayPrompt('點擊「播放影片」開始觀看。');
            }, 5000);
          }
        },
        onStateChange: event => {
          if (failed) return;
          const state = event.data;
          setPlayControl(state === 1);
          if (state === 1) {
            stage.classList.add('is-playing', 'has-started');
            start.hidden = true;
            announce(player.isMuted() ? '循環播放中 · 靜音' : '循環播放中 · 聲音已開啟');
          } else if (state === 2) {
            stage.classList.remove('is-playing');
            if (userPaused) announce('影片已暫停');
          } else if (state === 0 && !userPaused && !document.hidden) {
            // Extra restart protection in addition to loop=1 & playlist=VIDEO_ID.
            event.target.seekTo(0, true);
            event.target.playVideo();
          }
        },
        onAutoplayBlocked: () => showPlayPrompt('瀏覽器暫停自動播放，點擊即可觀看。'),
        onError: unavailable
      }
    });
  }
  play.addEventListener('click', () => {
    if (!ready || failed) return;
    if (player.getPlayerState() === 1) {
      userPaused = true;
      player.pauseVideo();
    } else manualStart();
  });
  start.addEventListener('click', manualStart);
  mute.addEventListener('click', () => {
    if (!ready || failed) return;
    if (player.isMuted()) { player.unMute(); player.setVolume(70); }
    else player.mute();
    setMuteControl();
    if (player.getPlayerState() === 1) announce(player.isMuted() ? '循環播放中 · 靜音' : '循環播放中 · 聲音已開啟');
  });
  layout.addEventListener('click', () => {
    const complete = stage.dataset.videoLayout !== 'contain';
    stage.dataset.videoLayout = complete ? 'contain' : 'cover';
    layout.setAttribute('aria-pressed', String(complete));
    layout.setAttribute('aria-label', complete ? '切換為滿版影片畫面' : '切換為完整影片畫面');
    layout.querySelector('span').textContent = complete ? '滿版畫面' : '完整畫面';
  });
  focus.addEventListener('click', () => {
    const focused = !content.hidden;
    content.hidden = focused;
    topline.hidden = focused;
    stage.classList.toggle('is-focused', focused);
    focus.setAttribute('aria-pressed', String(focused));
    focus.setAttribute('aria-label', focused ? '顯示活動介紹文字' : '隱藏介紹文字，專注觀看影片');
    focus.querySelector('span').textContent = focused ? '顯示介紹' : '專注觀看';
    updateFraming();
  });
  if (!document.fullscreenEnabled || !stage.requestFullscreen) fullscreen.hidden = true;
  else {
    fullscreen.setAttribute('aria-pressed', 'false');
    fullscreen.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement === stage) await document.exitFullscreen();
        else await stage.requestFullscreen();
      } catch { announce('此瀏覽器無法切換全螢幕，仍可在頁面觀看。'); }
    });
    document.addEventListener('fullscreenchange', () => {
      const expanded = document.fullscreenElement === stage;
      fullscreen.setAttribute('aria-pressed', String(expanded));
      fullscreen.setAttribute('aria-label', expanded ? '離開全螢幕' : '全螢幕觀看影片');
      fullscreen.querySelector('span').textContent = expanded ? '離開全螢幕' : '全螢幕';
      updateFraming();
    });
  }
  document.addEventListener('visibilitychange', () => {
    if (!ready || failed) return;
    if (document.hidden) {
      pausedForVisibility = player.getPlayerState() === 1;
      if (pausedForVisibility) player.pauseVideo();
    } else if (pausedForVisibility && !userPaused) {
      pausedForVisibility = false;
      player.playVideo();
    }
  });
  window.addEventListener('pagehide', () => { if (ready && !failed) player.pauseVideo(); });
  if (window.YT?.Player) createPlayer();
  else {
    window.onYouTubeIframeAPIReady = createPlayer;
    const api = document.createElement('script');
    api.src = 'https://www.youtube.com/iframe_api';
    api.async = true;
    api.addEventListener('error', () => { window.clearTimeout(apiTimeout); unavailable(); });
    document.head.append(api);
  }
})();
