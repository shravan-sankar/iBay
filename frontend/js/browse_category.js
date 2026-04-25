const filterForm = document.getElementById("filters");
const container = document.getElementById("products-container");
const searchInput = document.getElementById("search-bar");
const s1 = document.getElementById("slider-1");
const s2 = document.getElementById("slider-2");
const minTxt = document.getElementById("min-price-display");
const maxTxt = document.getElementById("max-price-display");
const track = document.querySelector(".slider-track");
const hiddenInput = document.getElementById("price-range-input");

let requestCounter = 0;
let searchDebounceTimer = null;

function escapeHtml(text) {
    const node = document.createElement("div");
    node.textContent = String(text || "");
    return node.innerHTML;
}

function getUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
}

function updateHeaderLinks() {
    const userId = getUserIdFromUrl();
    const profileLink = document.getElementById("profile-image-link");
    const basketLink = document.getElementById("basket-image-link");
    if (!profileLink || !basketLink || !userId) {
        return;
    }
    profileLink.href = `upload.html?id=${encodeURIComponent(userId)}`;
    basketLink.href = `basket.html?id=${encodeURIComponent(userId)}`;
}

function updatePriceRange() {
    let val1 = parseInt(s1.value, 10);
    let val2 = parseInt(s2.value, 10);

    if (val1 > val2) {
        [val1, val2] = [val2, val1];
    }

    const p1 = (val1 / s1.max) * 100;
    const p2 = (val2 / s2.max) * 100;
    track.style.left = `${p1}%`;
    track.style.width = `${p2 - p1}%`;

    minTxt.textContent = `£${val1}`;
    maxTxt.textContent = val2 === 500 ? "500+" : `£${val2}`;
    hiddenInput.value = `[${val1}, ${val2}]`;
}

function setInitialFiltersFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryToSelect = urlParams.get("cat");
    const searchQuery = urlParams.get("search_query");

    if (searchInput && searchQuery) {
        searchInput.value = searchQuery;
    }

    if (categoryToSelect === "all") {
        const checkboxes = document.querySelectorAll('input[name="category[]"]');
        checkboxes.forEach((checkbox) => {
            checkbox.checked = true;
        });
    } else if (categoryToSelect) {
        const checkbox = document.querySelector(`input[name="category[]"][value="${categoryToSelect}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    }
}

function setLoadingState(isLoading) {
    container.classList.toggle("is-loading", isLoading);
}

function buildFormData() {
    return new FormData(filterForm);
}

function updateUrlFromCurrentFilters() {
    const params = new URLSearchParams(window.location.search);
    const userId = getUserIdFromUrl();
    params.delete("cat");

    const query = String(searchInput.value || "").trim();
    if (query) {
        params.set("search_query", query);
    } else {
        params.delete("search_query");
    }

    if (userId) {
        params.set("id", userId);
    }

    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", nextUrl);
}

function renderProducts(products) {
    container.innerHTML = "";

    if (!Array.isArray(products) || products.length === 0) {
        container.innerHTML = `<p class="products-empty-msg">No products match these filters.</p>`;
        return;
    }

    const userId = getUserIdFromUrl();
    products.forEach((product) => {
        const card = document.createElement("div");
        card.className = "product-card";
        const productName = escapeHtml(product.productName);
        const price = escapeHtml(product.price);
        const seller = escapeHtml(product.seller);
        const category = escapeHtml(product.category);
        const condition = escapeHtml(product.item_condition);
        const href = userId
            ? `product.html?id=${encodeURIComponent(String(product.id))}&user_id=${encodeURIComponent(userId)}`
            : `product.html?id=${encodeURIComponent(String(product.id))}`;

        card.innerHTML = `
            <a href="${href}" class="product-link">
                <h2>${productName}</h2>
                <p>£${price}</p>
                <p>Seller: ${seller}</p>
                <p>${category}</p>
                <p>${condition}</p>
            </a>`;
        container.appendChild(card);
    });
}

async function fetchAndRenderProducts() {
    requestCounter += 1;
    const currentRequest = requestCounter;
    setLoadingState(true);

    try {
        const response = await fetch("../../backend/filter.php", {
            method: "POST",
            body: buildFormData()
        });
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const products = await response.json();
        if (currentRequest !== requestCounter) {
            return;
        }
        renderProducts(products);
        updateUrlFromCurrentFilters();
    } catch (error) {
        if (currentRequest !== requestCounter) {
            return;
        }
        container.innerHTML = `<p class="products-empty-msg">Unable to load products right now.</p>`;
        console.error("Error loading filtered products:", error);
    } finally {
        if (currentRequest === requestCounter) {
            setLoadingState(false);
        }
    }
}

function handleSearchInput() {
    window.clearTimeout(searchDebounceTimer);
    searchDebounceTimer = window.setTimeout(() => {
        fetchAndRenderProducts();
    }, 250);
}

function setupFormEvents() {
    filterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        fetchAndRenderProducts();
    });

    searchInput.addEventListener("input", handleSearchInput);

    const autoInputs = filterForm.querySelectorAll(
        'input[name="category[]"], input[name="postage[]"], input[name="item_condition[]"]'
    );
    autoInputs.forEach((input) => {
        input.addEventListener("change", () => {
            fetchAndRenderProducts();
        });
    });
}

function setupPriceSliderEvents() {
    s1.addEventListener("input", updatePriceRange);
    s2.addEventListener("input", updatePriceRange);
    s1.addEventListener("change", fetchAndRenderProducts);
    s2.addEventListener("change", fetchAndRenderProducts);
    updatePriceRange();
}

window.addEventListener("DOMContentLoaded", () => {
    updateHeaderLinks();
    setInitialFiltersFromUrl();
    setupPriceSliderEvents();
    setupFormEvents();
    fetchAndRenderProducts();
});