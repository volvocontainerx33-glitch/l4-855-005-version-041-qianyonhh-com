(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobile = document.querySelector('[data-mobile-nav]');

    if (toggle && mobile) {
        toggle.addEventListener('click', function () {
            mobile.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(active + 1);
                restart();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterGrid = document.querySelector('[data-filter-grid]');
    var emptyState = document.querySelector('[data-empty-state]');

    if (filterInput && filterGrid) {
        if (filterInput.hasAttribute('data-url-query')) {
            var params = new URLSearchParams(window.location.search);
            var key = filterInput.getAttribute('data-url-query');
            var value = params.get(key);

            if (value) {
                filterInput.value = value;
            }
        }

        var filterItems = Array.prototype.slice.call(filterGrid.children);

        function applyFilter() {
            var query = filterInput.value.trim().toLowerCase();
            var visible = 0;

            filterItems.forEach(function (item) {
                var haystack = ((item.getAttribute('data-title') || '') + ' ' + (item.getAttribute('data-keywords') || '') + ' ' + item.textContent).toLowerCase();
                var matched = !query || haystack.indexOf(query) !== -1;
                item.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        filterInput.addEventListener('input', applyFilter);
        applyFilter();
    }

    function setupPlayer(player) {
        var video = player.querySelector('video');
        var cover = player.querySelector('.player-cover');
        var stream = player.getAttribute('data-stream');
        var attached = false;
        var hls = null;

        if (!video || !stream) {
            return;
        }

        function attachStream() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                return;
            }

            video.src = stream;
        }

        function startPlayback() {
            attachStream();

            if (cover) {
                cover.classList.add('is-hidden');
            }

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', startPlayback);
        }

        video.addEventListener('click', function () {
            if (!attached || video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
