(function () {
  var searchToggle = document.querySelector('[data-search-toggle]');
  var searchPanel = document.querySelector('[data-header-search]');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', function () {
      searchPanel.classList.toggle('is-open');
      var input = searchPanel.querySelector('input');
      if (searchPanel.classList.contains('is-open') && input) {
        input.focus();
      }
    });
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var showSlide = function (index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5600);
    }
  }

  var player = document.querySelector('[data-player]');
  if (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var source = video ? video.getAttribute('data-src') : '';
    var started = false;

    var loadVideo = function () {
      if (!video || !source || started) {
        return;
      }
      started = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    };

    var startPlay = function () {
      loadVideo();
      player.classList.add('is-started');
      if (video) {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
    };

    if (button) {
      button.addEventListener('click', startPlay);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlay();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-started');
      });
    }
  }

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && window.SEARCH_MOVIES) {
    var input = searchPage.querySelector('[data-search-input]');
    var results = searchPage.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    var render = function (query) {
      var q = (query || '').trim().toLowerCase();
      var items = window.SEARCH_MOVIES.filter(function (movie) {
        if (!q) {
          return movie.hot;
        }
        return movie.text.indexOf(q) !== -1;
      }).slice(0, 80);

      if (!items.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配内容，可以换一个关键词继续搜索。</div>';
        return;
      }

      results.innerHTML = items.map(function (movie) {
        return '<a class="search-result-item" href="./' + movie.url + '">' +
          '<span class="compact-thumb" style="' + movie.style + '"></span>' +
          '<span class="compact-info">' +
          '<strong>' + movie.title + '</strong>' +
          '<em>' + movie.meta + '</em>' +
          '<p>' + movie.desc + '</p>' +
          '</span>' +
          '</a>';
      }).join('');
    };

    if (input) {
      input.value = initial;
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
    render(initial);
  }
})();
