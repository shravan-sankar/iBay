const BASKET_STORAGE_KEY = "ibay_basket";
const API_BASE = "../../backend";

// Reads basket rows from localStorage, returning a safe empty array on parse errors
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

// Formats numeric prices as GBP values for modularity
function formatGBP(n) {
    return "£" + (Math.round(n * 100) / 100).toFixed(2);
}

// Renders basket rows and summary totals from localStorage state if page reloaded
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
        const p = parseFloat(row.price) || 0;
        const post = parseFloat(row.postage) || 0;
        const line = p;
        const linePost = post;
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
                <p class="basket-item__meta">${formatGBP(p)}</p>
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

// Attempts to read user id from query string first for double authentication
function getUserIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("id");
    return userId ? String(userId) : "";
}

// Falls back to sessionStorage user object if no query id exists
function getUserIdFromSession() {
    try {
        const raw = sessionStorage.getItem("iBayCurrentUser");
        if (!raw) {
            return "";
        }
        const parsed = JSON.parse(raw);
        return parsed && parsed.id != null ? String(parsed.id) : "";
    } catch (e) {
        return "";
    }
}

// Resolves active user id from URL or session
function getActiveUserId() {
    return getUserIdFromUrl() || getUserIdFromSession();
}

// Builds browse URL while preserving user and optional query
function buildBrowseUrl(query) {
    const params = new URLSearchParams();
    const userId = getActiveUserId();
    if (userId) {
        params.set("id", userId);
    }
    if (query) {
        params.set("q", query);
    }
    const suffix = params.toString();
    return suffix ? `browse.html?${suffix}` : "browse.html";
}

// Builds category search URL while preserving user and optional query
function buildCategorySearchUrl(query) {
    const params = new URLSearchParams();
    const userId = getActiveUserId();
    if (userId) {
        params.set("id", userId);
    }
    if (query) {
        params.set("search_query", query);
    }
    const suffix = params.toString();
    return suffix ? `Browse_category.html?${suffix}` : "Browse_category.html";
}

// Updates shared header links to keep user context
function setupHeaderLinks() {
    const userId = getActiveUserId();
    if (!userId) {
        return;
    }

    const logoLink = document.getElementById("logo-link");
    if (logoLink) {
        logoLink.href = buildBrowseUrl("");
    }
}

// Handles search submit and routes to category browse page
function setupSearchRedirect() {
    const searchForm = document.getElementById("search-form");
    if (!searchForm) {
        return;
    }
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(searchForm);
        const query = String(formData.get("q") || "").trim();
        window.location.assign(buildCategorySearchUrl(query));
    });
}

// Handles checkout action: purchase call, basket clear, and redirect to browse page
function setupBuyNowFlow() {
    const buyNowBtn = document.getElementById("buy-now-btn");
    if (!buyNowBtn) {
        return;
    }
    buyNowBtn.addEventListener("click", async () => {
        const basketItems = readBasket();
        if (basketItems.length === 0) {
            return;
        }

        const itemIds = basketItems
            .map((item) => Number.parseInt(item.id, 10))
            .filter((id) => Number.isInteger(id));

        if (itemIds.length > 0) {
            try {
                await fetch(`${API_BASE}/purchase_items.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ item_ids: itemIds })
                });
            } catch (e) {
                // Continue checkout flow even if server call fails
            }
        }

        writeBasket([]);
        const nextUrl = new URL(buildBrowseUrl(""), window.location.href);
        nextUrl.searchParams.set("purchased", "1");
        window.location.assign(nextUrl.toString());
    });
}

// Chooses a usable product image field with a placeholder fallback
function getProductImage(product) {
    return product.image || product.image_url || product.imageUrl || "../images/placeholder.jpg";
}

// Renders carousel product cards from API response objects to give real product suggestions to user
function renderCarouselProducts(products) {
    const track = document.getElementById("track");
    if (!track) {
        return;
    }
    const userId = getUserIdFromUrl();
    track.innerHTML = "";

    products.forEach((product) => {
        const card = document.createElement("div");
        card.className = "card";
        const image = escapeHtml(getProductImage(product));
        const name = escapeHtml(product.productName || product.title || "Item");
        const price = parseFloat(product.price) || 0;
        const id = encodeURIComponent(String(product.id || ""));
        const href = userId ? `product.html?id=${id}&user_id=${encodeURIComponent(userId)}` : `product.html?id=${id}`;
        card.innerHTML = `
            <a href="${href}" class="product-link">
                <img src="${image}" alt="${name}">
                <p>${name}</p>
                <p>${formatGBP(price)}</p>
            </a>
        `;
        track.appendChild(card);
    });
}

// Loads latest products used in the "You may also like" carousel
async function loadCarouselItems() {
    const track = document.getElementById("track");
    if (!track) {
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/get_latest_products.php`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });
        const data = await res.json();
        if (!data.success || !Array.isArray(data.products)) {
            track.innerHTML = "";
            return;
        }
        renderCarouselProducts(data.products.slice(0, 12));
    } catch (e) {
        track.innerHTML = "";
    }
}

// Adds previous/next controls and resize handling for the carousel track
function setupCarouselControls() {
    const track = document.getElementById("track");
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");
    const windowBox = document.querySelector(".carousel-window");

    if (!track || !prev || !next || !windowBox) {
        return;
    }

    let currentTranslate = 0;

    function getCards() {
        return track.querySelectorAll(".card");
    }

    function getStepSize() {
        const cards = getCards();
        if (cards.length === 0) {
            return 0;
        }
        const firstCard = cards[0];
        const trackStyle = window.getComputedStyle(track);
        const gap = parseInt(trackStyle.gap, 10) || 0;
        return firstCard.offsetWidth + gap;
    }

    function getMaxTranslate() {
        const cards = getCards();
        if (cards.length === 0) {
            return 0;
        }
        const lastCard = cards[cards.length - 1];
        const windowStyle = window.getComputedStyle(windowBox);
        const paddingLeft = parseInt(windowStyle.paddingLeft, 10) || 0;
        const paddingRight = parseInt(windowStyle.paddingRight, 10) || 0;
        const usableWidth = windowBox.clientWidth - paddingLeft - paddingRight;
        return Math.max(0, lastCard.offsetLeft + lastCard.offsetWidth - usableWidth);
    }

    function applyTranslate() {
        track.style.transform = `translateX(-${currentTranslate}px)`;
    }

    function clampTranslate() {
        const maxTranslate = getMaxTranslate();
        if (currentTranslate > maxTranslate) {
            currentTranslate = maxTranslate;
        }
        if (currentTranslate < 0) {
            currentTranslate = 0;
        }
        applyTranslate();
    }

    next.addEventListener("click", () => {
        const step = getStepSize();
        const maxTranslate = getMaxTranslate();
        currentTranslate = Math.min(currentTranslate + step, maxTranslate);
        applyTranslate();
    });

    prev.addEventListener("click", () => {
        const step = getStepSize();
        currentTranslate = Math.max(currentTranslate - step, 0);
        applyTranslate();
    });

    window.addEventListener("resize", clampTranslate);
    clampTranslate();
}

document.addEventListener("DOMContentLoaded", () => {
    // Handle remove clicks centrally on the list container so dynamically rendered buttons still work
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
    setupHeaderLinks();
    setupSearchRedirect();
    setupBuyNowFlow();
    setupCarouselControls();
    loadCarouselItems().then(() => {
        window.dispatchEvent(new Event("resize"));
    });
});
