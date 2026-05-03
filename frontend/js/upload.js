document.addEventListener('DOMContentLoaded', function () {
    
    const emptyState = document.getElementById('no_listing');
    const viewState = document.getElementById('existing_listing');
    const addState = document.getElementById('adding_listing');
    const form = document.querySelector('form');
    let currentListingId = null;
    let isLogginIn = false;

    /// Displaying different page states
    function showState(stateName) {

        //Hiding all page states
        emptyState.classList.remove('active');
        viewState.classList.remove('active');
        addState.classList.remove('active');

        // Showing the wanted page state
        if (stateName === 'empty') {emptyState.classList.add('active')}
        else if (stateName === 'view'){viewState.classList.add('active')}
        else {addState.classList.add('active')}

    }
    ///

    /// Getting user info for account details display
    async function loadUser() {
        const instructionText = document.querySelector('#listing_instruction p');
        const addListingBtn = document.getElementById('add_listing');

        try {
            const response = await fetch('../../backend/me.php');

            if (!response.ok) {
                isLogginIn = false; 

                instructionText.innerHTML = `
                Please <a href="main-G06.html">log in</a> 
                or <a href="register.html">sign up</a> 
                to add listings
                `;
                addListingBtn.style.display = 'none';

                console.log('User not logged in or not found');
                return;
            }

            const user = await response.json();

            if (!user) {
                isLoggedIn = false;

                instructionText.innerHTML = `
                Please <a href="main-G06.html">log in</a> 
                or <a href="register.html">sign up</a> 
                to add listings
                `;
                addListingBtn.style.display = 'none';

                console.log('No user data');
                return;
            }

            isLoggedIn = true;

            instructionText.textContent = 'Select existing listing to view or add new one below';
            addListingBtn.style.display = 'inline-block';

            // Updating account details display with user info
            const full_name = document.getElementById('full_name');
            if (full_name) {
                full_name.textContent = `${user.firstName} ${user.lastName}`;
            }

            const email = document.getElementById('email');
            if (email) {
                email.textContent = user.email;
            }

        } catch (error) {
            isLoggedIn = false;

            instructionText.innerHTML = `
            Please <a href="main-G06.html">log in</a> 
            or <a href="register.html">sign up</a> 
            to add listings
            `;
            addListingBtn.style.display = 'none';

            console.error('Failed to load user:', error);
        }
    }
    ///

    /// Add Listing button only displayed if logged in
    document.getElementById('add_listing').addEventListener('click', function () {
        if (!isLoggedIn) {
            alert('Please log in or sign up to add listings.');
            return;
        }

        showState('add');
    });

    /// Loading the listings for the 'Existing listings' slides
    async function loadListings() {
        try {
            const response = await fetch('../../backend/my_products.php');

            if (!response.ok) {
                console.log('Failed to load listings');
                return;
            }

            const listings = await response.json();
            const track = document.getElementById('carousel_track');

            if (!track) return; 
            track.innerHTML = '';

            // User has no listings yet 
            if (!Array.isArray(listings) || listings.length === 0) {
                track.innerHTML = '<div class="slide">No listings yet </div>';
                return;
            }

            // Adding existing listings slides
            listings.forEach((listing) => {
                const slide = document.createElement('div');
                slide.className = 'slide';
                slide.dataset.id = listing.id;
                slide.innerHTML = `
                                    <div class="slide_content">
                                        <div class="product_image"><img src="../../product_images/${listing.image_url_1}" alt="listing_image"></div>
                                        <div class="product_details">
                                            <strong>${listing.productName}</strong>
                                            <p>${listing.category}</p>
                                            <p>£${listing.price}</p>
                                        </div>
                                    </div>`;

                // Makes slides clickable
                slide.addEventListener('click', function () {
                    console.log('Clicked listing:', listing.id);
                    showState('view');
                    displayListing(listing);
                });

                track.appendChild(slide);
            });

        } catch (error) {console.error('Failed to load listings:', error);}
    }
    ///

    /// Displaying a selected existing listing
    function displayListing(listing) {
        
        currentListingId = listing.id;
        document.getElementById('view_itemName').value = listing.productName;

        // Checking if radio options have been checked
        const categoryRadio = document.querySelector(`input[name="v_category"][value="${listing.category}"]`);
        if (categoryRadio) categoryRadio.checked = true;

        const conditionRadio = document.querySelector(`input[name="v_condition"][value="${listing.item_condition}"]`);
        if (conditionRadio) conditionRadio.checked = true;

        document.getElementById('view_desc').value = listing.description;
        document.getElementById('view_price').value = listing.price;
        document.getElementById('view_postage').value = listing.postage;
        document.getElementById('view_imgUpload1').value = '';
        document.getElementById('view_imgUpload2').value = '';

        // Displaying the existing listing images
        document.getElementById('view_img1').style.backgroundImage =
        `url('../../product_images/${listing.image_url_1}')`;
        document.getElementById('view_img1').style.border = 'none';

        document.getElementById('view_img2').style.backgroundImage =
        `url('../../product_images/${listing.image_url_2}')`;
        document.getElementById('view_img2').style.border = 'none';

        disableEditMode();
    }
    ///

    /// View only mode for existing products
    function disableEditMode() {
        document.querySelectorAll('#existing_listing input, #existing_listing textarea')
        .forEach(el => el.disabled = true);

        document.getElementById('existing_listing').classList.remove('editing');
        document.getElementById('save_listing').style.display = 'none';
        document.getElementById('edit_listing').style.display = 'inline-block';
    }
    ///

    /// Edit mode for existing products
    function enableEditMode() {
        document.querySelectorAll('#existing_listing input, #existing_listing textarea')
        .forEach(el => el.disabled = false);

        document.getElementById('existing_listing').classList.add('editing');
        document.getElementById('save_listing').style.display = 'inline-block';
        document.getElementById('edit_listing').style.display = 'none';
    }
    ///

    /// Prevent form submission by entering field value & hitting enter key
    form.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    });
    ///

    /// Form Image Upload Preview Handling
    function setupImagePreview(inputId, boxId) {
        const input = document.getElementById(inputId);
        const box = document.getElementById(boxId);

        input.addEventListener('change', function () {
            const file = input.files[0];

            if (!file) {
                box.style.backgroundImage = '';
                return;
            }

            const imageUrl = URL.createObjectURL(file);

            box.style.backgroundImage = `url('${imageUrl}')`;
            box.style.border = 'none';
            box.style.backgroundColor = 'transparent';
        });
    }
    ///

    /// Form sumbission handling
    form.addEventListener('submit', async function(e) {

        e.preventDefault();
        const formData = new FormData(form);

        try {
            const response = await fetch('../../backend/upload_product.php', {
                method: 'POST', 
                body: formData
            });

            const data = await response.json();

            if (data.success) {

                alert(data.message);
                form.reset();

                // Reset product images display to blank
                document.getElementById('imageBox1').style.backgroundImage = '';
                document.getElementById('imageBox1').style.border = '2px dashed #aaa';
                document.getElementById('imageBox1').style.backgroundColor = '#e0e0e0';

                document.getElementById('imageBox2').style.backgroundImage = '';
                document.getElementById('imageBox2').style.border = '2px dashed #aaa';
                document.getElementById('imageBox2').style.backgroundColor = '#e0e0e0';

                showState('empty');
                loadListings();
            }

            else {
                alert(data.message || 'Item upload failed.');
            }
        }

        catch (error) {

            console.error('Upload error:', error);
            alert('Something went wrong.');
        }

    });
    ///

    /// Editing Existing Listings
    document.getElementById('save_listing').addEventListener('click', async function () {
        if (!currentListingId) {
            alert('No listing selected.');
            return;
        }

        // Constructing form submission
        const formData = new FormData();

        formData.append('id', currentListingId);
        formData.append('itemName', document.getElementById('view_itemName').value);
        formData.append('category', document.querySelector('input[name="v_category"]:checked')?.value || '');
        formData.append('condition', document.querySelector('input[name="v_condition"]:checked')?.value || '');
        formData.append('desc', document.getElementById('view_desc').value);
        formData.append('price', document.getElementById('view_price').value);
        formData.append('postage', document.getElementById('view_postage').value);

        const img1 = document.getElementById('view_imgUpload1').files[0];
        const img2 = document.getElementById('view_imgUpload2').files[0];

        // Only edit images if new files selected
        if (img1) formData.append('imgUpload1', img1);
        if (img2) formData.append('imgUpload2', img2);

        // Submit to PHP
        try {
            const response = await fetch('../../backend/update_product.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert('Listing updated successfully.');
                disableEditMode();
                loadListings();
                showState('empty');
            } else {
                alert(data.message || 'Update failed.');
            }

        } catch (error) {
            console.error('Update error:', error);
            alert('Something went wrong.');
        }
    });
    ///

    /// Button behaviour
    document.getElementById('add_listing').addEventListener('click', function () {
        showState('add');
    });

    document.getElementById('return').addEventListener('click', function () {
        showState('empty');
    });

    document.getElementById('edit_listing').addEventListener('click', enableEditMode);
    ///

    setupImagePreview('view_imgUpload1', 'view_img1');
    setupImagePreview('view_imgUpload2', 'view_img2');
    setupImagePreview('imgUpload1', 'imageBox1');
    setupImagePreview('imgUpload2', 'imageBox2');

    showState('empty');
    loadUser();
    loadListings();

});