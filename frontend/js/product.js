// iBay - Product Page Scripts
 
 
// Changes the main product image when a thumbnail is clicked
 
function changeImage(thumbnail) {
    var mainImage = document.getElementById("main-image");
    mainImage.src = thumbnail.src;
}
 
 
// --- Buy Now Validation ---
 
function handleBuyNow() {
 
    // Get the quantity input
    var quantityInput = document.getElementById("quantity");
    var quantity = parseInt(quantityInput.value);
 
    var errorMsg = document.getElementById("quantity-error");
 
    // Check the quantity
    if (isNaN(quantity) || quantity < 1) {
        errorMsg.textContent = "Please enter a valid quantity (minimum 1).";
        return; // Stop here, do not proceed
    }
 
    // If validation passes, clear any error and continue
    errorMsg.textContent = "";
    alert("Proceeding to checkout with quantity: " + quantity);

}