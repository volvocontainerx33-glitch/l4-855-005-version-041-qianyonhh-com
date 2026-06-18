function ready(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

ready(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        var show = function (nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === index);
            });
        };

        var restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        };

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener('click', function () {
                show(itemIndex);
                restart();
            });
        });

        show(0);
        restart();
    }

    var filterForm = document.querySelector('[data-filter-form]');
    if (filterForm) {
        var keywordInput = filterForm.querySelector('[data-filter-keyword]');
        var regionInput = filterForm.querySelector('[data-filter-region]');
        var yearInput = filterForm.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var empty = document.querySelector('[data-empty-state]');

        var applyFilter = function () {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
            var region = regionInput ? regionInput.value : '';
            var year = yearInput ? yearInput.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-genre')).toLowerCase();
                var cardRegion = card.getAttribute('data-region');
                var cardYear = card.getAttribute('data-year');
                var matched = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (region && cardRegion !== region) {
                    matched = false;
                }

                if (year && cardYear !== year) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        };

        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });

        [keywordInput, regionInput, yearInput].forEach(function (input) {
            if (input) {
                input.addEventListener('input', applyFilter);
                input.addEventListener('change', applyFilter);
            }
        });
    }
});

function setupMoviePlayer(source) {
    ready(function () {
        var box = document.querySelector('[data-player-box]');
        var video = document.querySelector('[data-player-video]');
        var layer = document.querySelector('[data-play-layer]');
        var started = false;
        var hlsInstance = null;

        if (!box || !video || !source) {
            return;
        }

        var hideLayer = function () {
            if (layer) {
                layer.classList.add('is-hidden');
            }
        };

        var start = function () {
            if (started) {
                video.play();
                hideLayer();
                return;
            }

            started = true;
            hideLayer();

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.play();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play();
                });
                return;
            }

            video.src = source;
            video.play();
        };

        if (layer) {
            layer.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (!started || video.paused) {
                start();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', hideLayer);

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}
