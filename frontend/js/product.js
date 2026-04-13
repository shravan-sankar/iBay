// iBay - Product Page Scripts
 
 
// --- Thumbnail Image Swap ---
// Changes the main product image when a thumbnail is clicked
 
function changeImage(thumbnail) {
    var mainImage = document.getElementById("main-image");
    mainImage.src = thumbnail.src;
}
 
 
// --- Buy Now Validation ---
// Runs when the Buy Now button is clicked
// Checks that the quantity is a valid positive number before proceeding
 
function handleBuyNow() {
 
    // Get the quantity input element and read its value
    var quantityInput = document.getElementById("quantity");
    var quantity = parseInt(quantityInput.value);
 
    // Get the error message paragraph so we can show/hide messages
    var errorMsg = document.getElementById("quantity-error");
 
    // Check if the quantity is not a number or is less than 1
    if (isNaN(quantity) || quantity < 1) {
        errorMsg.textContent = "Please enter a valid quantity (minimum 1).";
        return; // Stop here, do not proceed
    }
 
    // If validation passes, clear any error and continue
    errorMsg.textContent = "";
    alert("Proceeding to checkout with quantity: " + quantity);
    // In the real version this would redirect to a checkout page
}