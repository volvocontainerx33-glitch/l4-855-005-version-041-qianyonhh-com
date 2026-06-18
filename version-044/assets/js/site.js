(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function next() {
            show(current + 1);
        }

        function start() {
            stop();
            timer = window.setInterval(next, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);

        show(0);
        start();
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
        var input = panel.querySelector("[data-filter-input]");
        var year = panel.querySelector("[data-year-filter]");
        var type = panel.querySelector("[data-type-filter]");
        var scope = panel.parentElement;
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
        var emptyState = scope.querySelector("[data-empty-state]");

        function normalize(value) {
            return (value || "").toString().trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(input && input.value);
            var selectedYear = normalize(year && year.value);
            var selectedType = normalize(type && type.value);
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardType = normalize(card.getAttribute("data-type"));
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchYear = !selectedYear || cardYear.indexOf(selectedYear) !== -1;
                var matchType = !selectedType || cardType === selectedType;
                var showCard = matchKeyword && matchYear && matchType;

                card.hidden = !showCard;

                if (showCard) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        [input, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        var query = new URLSearchParams(window.location.search).get("q");

        if (query && input) {
            input.value = query;
        }

        applyFilters();
    });
})();
