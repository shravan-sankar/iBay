const BASKET_STORAGE_KEY = "ibay_basket";

function readBasket() {
    try {
        const raw = localStorage.getItem(BASKET_STORAGE_KEY);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function writeBasket(items) {
    localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(items));
}

function formatGBP(n) {
    return "£" + (Math.round(n * 100) / 100).toFixed(2);
}

function renderBasketFromStorage() {
    const listEl = document.getElementById("basket-list");
    const emptyMsg = document.getElementById("basket-empty-msg");
    const summaryPrice = document.getElementById("summary-price");
    const summaryPostage = document.getElementById("summary-postage");
    const summaryTotal = document.getElementById("summary-total");
    if (!listEl || !emptyMsg) {
        return;
    }

    const items = readBasket();
    listEl.innerHTML = "";

    if (items.length === 0) {
        listEl.hidden = true;
        emptyMsg.hidden = false;
        if (summaryPrice) {
            summaryPrice.textContent = "£0.00";
        }
        if (summaryPostage) {
            summaryPostage.textContent = "£0.00";
        }
        if (summaryTotal) {
            summaryTotal.textContent = "£0.00";
        }
        return;
    }

    let totalPrice = 0;
    let totalPostage = 0;

    items.forEach((row) => {
        const q = Math.max(0, parseInt(row.quantity, 10) || 0);
        const p = parseFloat(row.price) || 0;
        const post = parseFloat(row.postage) || 0;
        const line = p * q;
        const linePost = post * q;
        totalPrice += line;
        totalPostage += linePost;

        const article = document.createElement("article");
        article.className = "basket-item";
        article.innerHTML = `
            <div class="basket-item__media">
                <img src="${(row.image || "").replace(/"/g, "&quot;")}" alt="" class="basket-item__img">
            </div>
            <div class="basket-item__body">
                <div class="basket-item__head">
                    <h3 class="basket-item__title">${escapeHtml(row.title || "Item")}</h3>
                </div>
                <p class="basket-item__meta">Qty: ${q} · ${formatGBP(p)} each</p>
            </div>
            <div class="basket-item__line">
                <span class="basket-item__sub">${formatGBP(line)}</span>
                <span class="basket-item__post-note">+ ${formatGBP(linePost)} postage</span>
            </div>
        `;
        const head = article.querySelector(".basket-item__head");
        if (head) {
            const removeBtn = document.createElement("button");
            removeBtn.type = "button";
            removeBtn.className = "basket-item__remove";
            removeBtn.dataset.basketId = String(row.id);
            removeBtn.setAttribute("aria-label", "Remove " + (row.title || "item") + " from basket");
            removeBtn.textContent = "Remove";
            head.appendChild(removeBtn);
        }
        listEl.appendChild(article);
    });

    listEl.hidden = false;
    emptyMsg.hidden = true;

    if (summaryPrice) {
        summaryPrice.textContent = formatGBP(totalPrice);
    }
    if (summaryPostage) {
        summaryPostage.textContent = formatGBP(totalPostage);
    }
    if (summaryTotal) {
        summaryTotal.textContent = formatGBP(totalPrice + totalPostage);
    }
}

function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
    const listEl = document.getElementById("basket-list");
    if (listEl) {
        listEl.addEventListener("click", (e) => {
            const btn = e.target.closest(".basket-item__remove");
            if (!btn) {
                return;
            }
            const id = btn.dataset.basketId;
            if (id == null) {
                return;
            }
            const next = readBasket().filter((row) => String(row.id) !== String(id));
            writeBasket(next);
            renderBasketFromStorage();
        });
    }

    renderBasketFromStorage();

    const track = document.getElementById("track");
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");
    const windowBox = document.querySelector(".carousel-window");
    const searchForm = document.getElementById("search-form");

    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
        });
    }

    if (!track || !prev || !next || !windowBox) {
        return;
    }

    const cards = track.querySelectorAll(".card");
    if (cards.length === 0) {
        return;
    }

    let currentTranslate = 0;

    function getStepSize() {
        const firstCard = cards[0];
        const trackStyle = window.getComputedStyle(track);
        const gap = parseInt(trackStyle.gap, 10) || 0;
        return firstCard.offsetWidth + gap;
    }

    function getMaxTranslate() {
        const lastCard = cards[cards.length - 1];
        const windowStyle = window.getComputedStyle(windowBox);
        const paddingLeft = parseInt(windowStyle.paddingLeft, 10) || 0;
        const paddingRight = parseInt(windowStyle.paddingRight, 10) || 0;
        const usableWidth = windowBox.clientWidth - paddingLeft - paddingRight;
        return Math.max(0, lastCard.offsetLeft + lastCard.offsetWidth - usableWidth);
    }

    function clampTranslate() {
        const maxTranslate = getMaxTranslate();
        if (currentTranslate > maxTranslate) {
            currentTranslate = maxTranslate;
        }
        if (currentTranslate < 0) {
            currentTranslate = 0;
        }
        track.style.transform = `translateX(-${currentTranslate}px)`;
    }

    next.addEventListener("click", () => {
        const step = getStepSize();
        const maxTranslate = getMaxTranslate();
        currentTranslate = Math.min(currentTranslate + step, maxTranslate);
        track.style.transform = `translateX(-${currentTranslate}px)`;
    });

    prev.addEventListener("click", () => {
        const step = getStepSize();
        currentTranslate = Math.max(currentTranslate - step, 0);
        track.style.transform = `translateX(-${currentTranslate}px)`;
    });

    window.addEventListener("resize", () => {
        clampTranslate();
    });
});
