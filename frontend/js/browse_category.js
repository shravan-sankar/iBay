const container = document.getElementById("products-container");

const filterForm = document.getElementById('filters');

filterForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevents the page from refreshing

    const formData = new FormData(filterForm);
    
    // To get all values for a specific group (e.g., Category)
    const selectedCategories = formData.getAll('category[]');
    const selectedPrices = formData.getAll('price[]');
    const selectedPostage = formData.getAll('postage[]');
    const selectedConditions = formData.getAll('item_condition[]');


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
            const card = document.createElement("div");
            card.className = "product-card";

            card.innerHTML = `
                <a href="product.html?id=${product.id}" class="product-link">
                    <h2>${product.name}</h2>
                    <p>£${product.price}</p>
                    <p>Seller: ${product.seller}</p>
                    <p>${product.category}</p>
                </a>`;

            container.appendChild(card);
        });
    }) // Removed the extra semicolon that was here
    .catch(error => {
        console.error('Error sending data to PHP:', error);
    });
});