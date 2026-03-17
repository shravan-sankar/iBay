document.addEventListener("DOMContentLoaded", () => {
    const track = document.getElementById("track");
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");
    const windowBox = document.querySelector(".carousel-window");
    const cards = track.querySelectorAll(".card");

    let currentTranslate = 0;

    function getStepSize() {
        const firstCard = cards[0];
        const trackStyle = window.getComputedStyle(track);
        const gap = parseInt(trackStyle.gap) || 0;
        return firstCard.offsetWidth + gap;
    }

    function getMaxTranslate() {
        const lastCard = cards[cards.length - 1];
        const windowStyle = window.getComputedStyle(windowBox);

        const paddingLeft = parseInt(windowStyle.paddingLeft) || 0;
        const paddingRight = parseInt(windowStyle.paddingRight) || 0;

        const usableWidth = windowBox.clientWidth - paddingLeft - paddingRight;

        return lastCard.offsetLeft + lastCard.offsetWidth - usableWidth;
    }

    next.addEventListener("click", () => {
        const step = getStepSize();
        const maxTranslate = Math.max(0, getMaxTranslate());

        currentTranslate += step;
        if (currentTranslate > maxTranslate) {
            currentTranslate = maxTranslate;
        }

        track.style.transform = `translateX(-${currentTranslate}px)`;
    });

    prev.addEventListener("click", () => {
        const step = getStepSize();

        currentTranslate -= step;
        if (currentTranslate < 0) {
            currentTranslate = 0;
        }

        track.style.transform = `translateX(-${currentTranslate}px)`;
    });
});