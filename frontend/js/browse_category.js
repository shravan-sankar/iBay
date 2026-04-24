
window.addEventListener('DOMContentLoaded', () => {
    // 1. Get the category from the URL (?cat=Electronics)
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    console.log('User ID from URL:', userId);
    document.getElementById('profile-image-link').href = `upload.html?id=${encodeURIComponent(String(userId))}`;
    document.getElementById('basket-image-link').href = `basket.html?id=${encodeURIComponent(String(userId))}`;


    

});





window.addEventListener('DOMContentLoaded', () => {
    // 1. Get the category from the URL (?cat=Electronics)
    const urlParams = new URLSearchParams(window.location.search);
    const categoryToSelect = urlParams.get('cat');

    if (categoryToSelect == 'all') {
        const checkboxes = document.querySelectorAll(`input[name="category[]"]`);
    
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });

        filterForm.requestSubmit();
    }

    else if (categoryToSelect) {
        // 2. Find the checkbox with the matching value
        // Note: Make sure the value in the URL matches the value="" in your HTML
        const checkbox = document.querySelector(`input[name="category[]"][value="${categoryToSelect}"]`);
    
        if (checkbox) {
            // 3. Check the checkbox
            checkbox.checked = true;

            // 4. (Optional) Trigger the filter function automatically 
            // so the user sees results immediately without clicking 'Apply'
            // Assuming your form submission function is called 'applyFilters()'
            filterForm.requestSubmit();
        }
    }
});


const container = document.getElementById("products-container");

const filterForm = document.getElementById('filters');

filterForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevents the page from refreshing

    const formData = new FormData(filterForm);
    
    // To get all values for a specific group (e.g., Category)
    const selectedCategories = formData.getAll('category[]');

    const selectedPostage = formData.getAll('postage[]');
    const selectedConditions = formData.getAll('item_condition[]');
    const Prices = formData.get('price_range'); 
    const selectedPrices = Prices
            .replace(/[\[\]\s]/g, '')
            .split(',')               
            .map(Number);

    console.log('Categories:', selectedCategories);
    console.log('Prices:', selectedPrices);
    console.log('Postage:', selectedPostage);
    console.log('item_Conditions:', selectedConditions);
});

filterForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevents the page from refreshing

    const formData = new FormData(filterForm);
    
    // 1. You can still log these for debugging
    console.log('Categories:', formData.getAll('category[]'));
    console.log('Prices:', formData.getAll('price[]'));
    console.log('Postage:', formData.getAll('postage[]'));
    console.log('item_Conditions:', formData.getAll('item_condition[]'));

    // 2. Send the data to your PHP file
    fetch('../../backend/filter.php', {
        method: 'POST',
        body: formData // No need to set headers, Fetch handles FormData automatically
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); 
    })
    .then(products => { // Changed 'data' to 'products' to match your loop below
        console.log('Success! Products found:', products);
        
        // 1. Clear the container first so filters don't just stack on top of old results
        const container = document.getElementById('products-container'); // Ensure this ID exists
        container.innerHTML = ""; 

        // 2. Loop through the products
        products.forEach(product => {
            console.log('Product:', product); // Log each product for debugging
            const card = document.createElement("div");
            card.className = "product-card";

            card.innerHTML = `
                <a href="product.html?id=${product.id}" class="product-link">
                    <h2>${product.productName}</h2>
                    <p>£${product.price}</p>
                    <p>Seller: ${product.seller}</p>
                    <p>${product.category}</p>
                    <p>${product.item_condition}</p>
                </a>`;

            container.appendChild(card);
        });
    }) // Removed the extra semicolon that was here
    .catch(error => {
        console.error('Error sending data to PHP:', error);
    });
});

const s1 = document.getElementById('slider-1');
const s2 = document.getElementById('slider-2');
const minTxt = document.getElementById('min-price-display');
const maxTxt = document.getElementById('max-price-display');
const track = document.querySelector('.slider-track');
const hiddenInput = document.getElementById('price-range-input');

function updatePriceRange() {
    let val1 = parseInt(s1.value);
    let val2 = parseInt(s2.value);

    // Swap if they cross
    if (val1 > val2) {
        [val1, val2] = [val2, val1];
    }

    // Move the blue track
    const p1 = (val1 / s1.max) * 100;
    const p2 = (val2 / s2.max) * 100;
    track.style.left = p1 + "%";
    track.style.width = (p2 - p1) + "%";

    // Update displays
    minTxt.textContent = `£${val1}`;
    maxTxt.textContent = (val2 === 500) ? `500+` : `£${val2}`;

    // Update the form data
    hiddenInput.value = `[${val1}, ${val2}]`;
}

s1.addEventListener('input', updatePriceRange);
s2.addEventListener('input', updatePriceRange);
updatePriceRange();