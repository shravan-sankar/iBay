
 
// --- Load Product Data ---
// Runs as soon as the page is ready
// Gets the product id from the URL and calls get_product.php to fetch the data
 
$(document).ready(function () {
 
    // Get the id from the URL e.g. product.html?id=1
    var urlParams = new URLSearchParams(window.location.search);
    var productId = urlParams.get("id");
 
    // If there is no id in the URL, stop here
    if (!productId) {
        $(".item-title").text("Product not found.");
        return;
    }
 
    // Call get_product.php in the background passing the product id
    $.ajax({
        url: "../../backend/get_product.php",
        method: "GET",
        data: { id: productId },
        xhrFields: { withCredentials: true }
    }).done(function (product) {
 
        // Fill in the product details using the data returned from PHP
        $(".item-title").text(product.productName);
        $(".item-category span").text(product.item_condition);
        $("#item-price").text(product.price);
        $("#item-postage").text(product.postage);
 
        // Fill in the description section
        $(".section p").first().text(product.description);
 
        // Set the main image and both thumbnails
        $("#main-image").attr("src", product.image_url_1);
        $(".thumbnail").eq(0).attr("src", product.image_url_1);
        $(".thumbnail").eq(1).attr("src", product.image_url_2);
 
        // Store the product id on the page for use when adding to basket
        $("#product-page").attr("data-product-id", productId);
 
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
 
 
// --- Add to Basket ---
// Gets the product id from the page and posts it to add_to_cart.php
 
function addToBasket() {
    var productId = $("#product-page").attr("data-product-id");
 
    $.ajax({
        url: "../../backend/add_to_cart.php",
        method: "POST",
        data: { productId: productId },
        xhrFields: { withCredentials: true }
    }).done(function () {
        // Redirect to basket page once item is added
        window.location.href = "basket.html";
    }).fail(function () {
        alert("Could not add item to basket. Please make sure you are logged in.");
    });
}