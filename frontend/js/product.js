// ===========================
// iBay - Product Page Scripts
// ===========================


// --- Load Product Data ---
// Runs as soon as the page is ready
// Gets the product id from the URL and calls get_product.php to fetch the data

$(document).ready(function () {

    // Get the id from the URL e.g. product.html?id=1
    var urlParams = new URLSearchParams(window.location.search);
    var productId = urlParams.get("id");

    // If there is no id in the URL, show an error and stop
    if (!productId) {
        $(".item-title").text("Product not found.");
        return;
    }

    // Store the product id on the page for use when adding to basket
    $("#product-page").attr("data-product-id", productId);

    // Call get_product.php in the background passing the product id
    $.ajax({
        url: "../../backend/get_product.php",
        method: "GET",
        data: { id: productId },
        dataType: "json",
        xhrFields: { withCredentials: true }
    }).done(function (product) {

        // Fill in all the product details with the data returned from PHP
        $(".item-title").text(product.productName);
        $("#item-condition").text(product.item_condition);
        $("#item-price").text(product.price);
        $("#item-postage").text(product.postage);
        $("#item-description").text(product.description);

        // Seller details
        $("#seller-email-header").text(product.seller_email);
        $("#seller-email").text(product.seller_email);
        $("#seller-since").text(product.seller_since);

        // Images
        $("#main-image").attr("src", product.image_url_1);
        $(".thumbnail").eq(0).attr("src", product.image_url_1);
        $(".thumbnail").eq(1).attr("src", product.image_url_2);

        console.log(product);

    }).fail(function () {
        $(".item-title").text("Could not load product.");
    });

});


// --- Thumbnail Image Swap ---
// When a thumbnail is clicked, this function runs
// 'thumbnail' is the image element that was clicked
// We grab the main image by its id and update its src to match the thumbnail

function changeImage(thumbnail) {
    var mainImage = document.getElementById("main-image");
    mainImage.src = thumbnail.src;
}

// Adds the current product to the user's basket
async function addToBasket() {

    // Get the product ID stored on the page
    const productId = $("#product-page").attr("data-product-id");

    // Stop if the product ID cannot be found
    if (!productId) {
        alert("Missing product ID");
        return;
    }

    // Send the product ID to the backend to update the database basket
    $.ajax({
        url: "../../backend/add_to_cart.php",
        method: "POST",
        data: {
            productId: productId
        },
        dataType: "json",

        // Include login session cookies
        xhrFields: {
            withCredentials: true
        }

    }).done(async function (response) {

        // Continue only if the backend successfully updated the basket
        if (response.success) {

            try {

                // Fetch the full product details from the backend
                // so the item can also be stored in localStorage
                const res = await fetch(
                    `../../backend/get_product.php?id=${encodeURIComponent(productId)}`,
                    {
                        credentials: "include"
                    }
                );

                // Make sure the request succeeded
                if (res.ok) {
                    // Convert the returned JSON into a JavaScript object
                    const product = await res.json();
                    // Create a basket item object
                    const item = {
                        id: String(productId),
                        title: product.productName || "Item",
                        price: parseFloat(product.price) || 0,
                        postage: parseFloat(product.postage) || 0,
                        image: product.image_url_1 || "../images/placeholder.jpg"
                    };
                    // LocalStorage key used across the basket system
                    const KEY = "ibay_basket";
                    let basket = [];
                    try {
                        // Read existing basket from localStorage
                        const raw = localStorage.getItem(KEY);
                        // Parse basket JSON into an array
                        basket = raw ? JSON.parse(raw) : [];
                        // Reset basket if the stored data is invalid
                        if (!Array.isArray(basket)) {
                            basket = [];
                        }
                    } catch (e) {
                        basket = [];
                    }

                    // Check whether this product already exists in the basket
                    const exists = basket.some(
                        item => String(item.id) === String(productId)
                    );

                    // Only add the product if it is not already present
                    if (!exists) {
                        basket.push(item);
                    }

                    // Save the updated basket back into localStorage
                    localStorage.setItem(
                        KEY,
                        JSON.stringify(basket)
                    );
                }

            } catch (err) {
                // Log any localStorage or fetch errors
                console.error(
                    "Failed storing basket item:",
                    err
                );
            }
            // Redirect the user to the basket page
            window.location.href = "basket.html";
        } else {
            // Show backend error message
            alert(response.message);
        }
    }).fail(function () {
        // Show generic error if AJAX request fails
        alert("Could not add item to basket.");
    });
}