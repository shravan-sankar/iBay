// iBay - Product Page Scripts


// Thumbnail Image Swap 

function changeImage(thumbnail) {
    var mainImage = document.getElementById("main-image");
    mainImage.src = thumbnail.src;
}


// Runs when the Add to Basket button is clicked
// Checks that the quantity is a valid positive number before submitting
 
function handleAddToBasket() {
 
    var quantityInput = document.getElementById("quantity");
    var quantity = parseInt(quantityInput.value);
 
    var errorMsg = document.getElementById("quantity-error");
 
    if (isNaN(quantity) || quantity < 1) {
        errorMsg.textContent = "Please enter a valid quantity (minimum 1).";
        return; // Stop here, do not submit the form
    }
 
    errorMsg.textContent = "";
    document.getElementById("add-to-basket-form").submit();
}
