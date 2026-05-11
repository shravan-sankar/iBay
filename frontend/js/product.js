// load product data
$(document).ready(function () {

    // Get the id from the URL 
    var urlParams = new URLSearchParams(window.location.search);
    var productId = urlParams.get("id");

    // If there is no id in the URL, show an error and stop
    if (!productId) {
        $(".item-title").text("Product not found.");
        return;
    }

    // Store the product id on the page
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
        displayStars("seller-rating", product.seller_rating);
        $("#product-page").attr("data-seller-id", product.sellerId);

        // images
        var imagePath = "../../product_images/";
        $("#main-image").attr("src", imagePath + product.image_url_1);
        $(".thumbnail").eq(0).attr("src", imagePath + product.image_url_1);
        $(".thumbnail").eq(1).attr("src", imagePath + product.image_url_2);

        console.log(product);

    }).fail(function () {
        $(".item-title").text("Could not load product.");
    });

});

//  Display Star Rating 
function displayStars(elementId, rating) {
    var stars = "";
    for (var i = 1; i <= 5; i++) {
        if (rating >= i) {
            stars += "★";        // full star
        } else if (rating >= i - 0.5) {
            stars += "⯨";        // half star    
        } else {
            stars += "☆";        // empty star
        }
    }
    $("#" + elementId).text(stars);
}

//  Thumbnail Image Swap 
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

                // Fetch the full product details from the backend to get the price, title and image for the basket
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
                        image_url_1: product.image_url_1 || null
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

                    // After adding to basket, show the rating popup to rate the seller
                    showRatingPopup();
                }

            } catch (err) {
                console.error("Failed storing basket item:", err);
                // If something goes wrong, go straight to basket
                window.location.href = "basket.html";
            }
        } else {
            // Show backend error message
            alert(response.message);
        }
    }).fail(function () {
        // Show generic error if AJAX request fails
        alert("Could not add item to basket.");
    });
}

 
// Displays the star rating popup overlay for the user to rate the seller
function showRatingPopup() {
    $("#rating-popup").show();
    $("#rating-overlay").show();
}
 
 

// Gets the selected star rating and sends it to submit_rating.php
function submitRating() {
    console.log("sellerId:", $("#product-page").attr("data-seller-id"));
    console.log("rating:", $("#rating-popup").attr("data-selected-rating"));
    var selectedRating = $("#rating-popup").attr("data-selected-rating");
    var sellerId = $("#product-page").attr("data-seller-id");
 
    // If no star has been selected, remind the user
    if (!selectedRating) {
        alert("Please select a star rating.");
        return;
    }
 
    $.ajax({
        url: "../../backend/submit_rating.php",
        method: "POST",
        data: { sellerId: sellerId, rating: selectedRating },
        dataType: "json",
        xhrFields: { withCredentials: true }
    }).done(function (response) {
        if (response.success) {
            // Hide the popup and go to basket
            $("#rating-popup").hide();
            $("#rating-overlay").hide();
            window.location.href = "basket.html";
        } else {
            alert(response.message);
        }
    }).fail(function () {
        // If rating fails just go to basket anyway
        window.location.href = "basket.html";
    });
}
 
 
// Allows user to skip rating and just go to basket
function skipRating() {
    $("#rating-popup").hide();
    $("#rating-overlay").hide();
    window.location.href = "basket.html";
}
 
 
// Highlights stars when the user hovers over them and sets the selected rating when they click
function starHover(star) {
    var value = $(star).attr("data-value");
    $(".rating-star").each(function () {
        if ($(this).attr("data-value") <= value) {
            $(this).text("★");
        } else {
            $(this).text("☆");
        }
    });
}
 
function starHoverOut() {
    var selected = $("#rating-popup").attr("data-selected-rating");
    $(".rating-star").each(function () {
        if (selected && $(this).attr("data-value") <= selected) {
            $(this).text("★");
        } else {
            $(this).text("☆");
        }
    });
}
 
function starClick(star) {
    var value = $(star).attr("data-value");
    $("#rating-popup").attr("data-selected-rating", value);
    $(".rating-star").each(function () {
        if ($(this).attr("data-value") <= value) {
            $(this).text("★");
        } else {
            $(this).text("☆");
        }
    });
}