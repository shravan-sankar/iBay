document.addEventListener('DOMContentLoaded', async function () {
    
    const emptyState = document.getElementById('no_listing');
    const viewState = document.getElementById('existing_listing');
    const addState = document.getElementById('adding_listing');
    const form = document.querySelector('form');
    let currentListingId = null;
    let isLoggedIn = false;

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
                isLoggedIn = false; 

                instructionText.innerHTML = `
                Please <a href="main-G06.html">log in</a> 
                or <a href="register.html">sign up</a> 
                to add/view listings
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
                to add/view listings
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
            to add/view listings
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
            const track = document.getElementById('carousel_track');

            if (!track) return;
            track.innerHTML = '';

            const listings = await response.json();

            // Not logged in
            if (!response.ok || listings.success === false) {
                track.innerHTML = '';
                return;
            }

            // User has no listings yet 
            if (!Array.isArray(listings) || listings.length === 0) {
                track.innerHTML = '<div class="no-listings">No listings yet</div>';
                return;
            }

            // Adding existing listings slides
            listings.forEach((listing) => {
                const slide = document.createElement('div');
                slide.className = 'slide';
                slide.dataset.id = listing.id;
                const safeTitle = document.createElement('div');
                safeTitle.textContent = listing.productName;
                
                slide.innerHTML = `
                                    <div class="slide_content">
                                        <div class="product_image"><img src="../../product_images/${listing.image_url_1}" alt="listing_image"></div>
                                        <div class="product_details">
                                            <strong>${safeTitle.innerHTML}</strong>
                                            <p>${listing.category}</p>
                                            <p>£${listing.price}</p>
                                        </div>
                                    </div>`;

                // Makes slides clickable
                slide.addEventListener('click', function () {
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
        
        document.getElementById('edit_submit_error').textContent = '';
        document.getElementById('edit_submit_error').style.color = '#d93025';

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
        document.getElementById('delete_listing').disabled = true;
    }
    ///

    /// Edit mode for existing products
    function enableEditMode() {
        document.querySelectorAll('#existing_listing input, #existing_listing textarea')
        .forEach(el => el.disabled = false);

        document.getElementById('existing_listing').classList.add('editing');
        document.getElementById('save_listing').style.display = 'inline-block';
        document.getElementById('edit_listing').style.display = 'none';
        document.getElementById('delete_listing').disabled = false;
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
            const text = box.querySelector('.upload-text');

            if (!file) {
                box.style.backgroundImage = '';

                if (text) {
                    text.style.display = 'block';
                }

                return;
            }

            const imageUrl = URL.createObjectURL(file);

            box.style.backgroundImage = `url('${imageUrl}')`;
            box.style.border = 'none';
            box.style.backgroundColor = 'transparent';

            if (text) {
                text.style.display = 'none';
            }
        });
    }
    ///

    /// Reset add listing form
    function resetAddListingForm() {

        form.reset();

        // Reset image previews
        document.getElementById('imageBox1').style.backgroundImage = '';
        document.getElementById('imageBox1').style.border = '2px dashed #aaa';
        document.getElementById('imageBox1').style.backgroundColor = '#e0e0e0';

        document.getElementById('imageBox2').style.backgroundImage = '';
        document.getElementById('imageBox2').style.border = '2px dashed #aaa';
        document.getElementById('imageBox2').style.backgroundColor = '#e0e0e0';

        // Show upload text again
        document.querySelector('#imageBox1 .upload-text').style.display = 'block';
        document.querySelector('#imageBox2 .upload-text').style.display = 'block';

        // Clear all error messages
        document.querySelectorAll('#adding_listing .field-error')
        .forEach(el => el.textContent = '');
    }
    ///

    ///
    document.getElementById('clear_listing').addEventListener('click', function () {
        resetAddListingForm();
    });
    ///

    /// Form sumbission handling
    form.addEventListener('submit', async function(e) {

        e.preventDefault();
        const formData = new FormData(form);

        let valid = true;

        const titleError = document.getElementById('title_error');
        const image1Error = document.getElementById('upload_1_error');
        const image2Error = document.getElementById('upload_2_error');
        const categoryError = document.getElementById('category_error');
        const conditionError = document.getElementById('condition_error');
        const descError = document.getElementById('desc_error');
        const priceError = document.getElementById('price_error');
        const postageError = document.getElementById('postage_error');
        const submitError = document.getElementById('submit_error');
        submitError.style.color = '#d93025';

        [titleError, image1Error, image2Error, categoryError, conditionError,
            descError, priceError, postageError, submitError].forEach(el => el.textContent = '');

        const title = document.getElementById('itemName').value.trim();
        const img1 = document.getElementById('imgUpload1').files[0];
        const img2 = document.getElementById('imgUpload2').files[0];
        const desc = document.getElementById('desc').value.trim();
        const price = document.getElementById('price').value;
        const postage = document.getElementById('postage').value;
        const selectedCategory = document.querySelector('input[name="category"]:checked');
        const selectedCondition = document.querySelector('input[name="condition"]:checked');
        
        if (!title) {
            titleError.textContent = 'Please enter a listing title.';
            valid = false;
        }

        if (!img1) {
            image1Error.textContent = 'Please upload the first image.';
            valid = false;
        }

        if (!img2) {
            image2Error.textContent = 'Please upload the second image.';
            valid = false;
        }

        if (!selectedCategory) {
            categoryError.textContent = 'Please choose a category.';
            valid = false;
        }

        if (!selectedCondition) {
            conditionError.textContent = 'Please choose a condition.';
            valid = false;
        }

        if (!desc) {
            descError.textContent = 'Please enter a description.';
            valid = false;
        }

        if (!price || Number(price) <= 0) {
            priceError.textContent = 'Please enter a valid price.';
            valid = false;
        }

        if (!postage || Number(postage) < 0) {
            postageError.textContent = 'Please enter valid postage.';
            valid = false;
        }

        if (!valid) {
            submitError.textContent = 'Please fill in all fields.';
            return;
        }

        try {
            const response = await fetch('../../backend/upload_product.php', {
                method: 'POST', 
                body: formData
            });

            const data = await response.json();

            if (data.success) {

                resetAddListingForm();

                submitError.style.color = 'green';
                submitError.textContent = data.message;

                setTimeout(() => {
                    showState('empty');
                    loadListings();
                }, 1500);
            }

            else {
                submitError.textContent = data.message;
            }
        }

        catch (error) {

            console.error('Upload error:', error);
            submitError.textContent = 'Something went wrong';
        }

    });
    ///

    /// Clears error feedback for fields if correction detected
    function clearError(selector, errorId, event = 'input') {
        const elements = document.querySelectorAll(selector);
        const error = document.getElementById(errorId);

        // Clear error box
        elements.forEach(el => {
            el.addEventListener(event, () => {
                error.textContent = '';
            });
        });
    }
    ///

    /// Editing Existing Listings
    document.getElementById('save_listing').addEventListener('click', async function () {
        if (!currentListingId) {
            alert('No listing selected.');
            return;
        }

        // Editing Validation
        let valid = true;

        const viewTitleError = document.getElementById('view_title_error');
        const viewCategoryError = document.getElementById('view_category_error');
        const viewConditionError = document.getElementById('view_condition_error');
        const viewDescError = document.getElementById('view_desc_error');
        const viewPriceError = document.getElementById('view_price_error');
        const viewPostageError = document.getElementById('view_postage_error');
        const editSumbitError = document.getElementById('edit_submit_error');
        editSumbitError.style.color = '#d93025';

        [viewTitleError, viewCategoryError, viewConditionError, viewDescError,
            viewPriceError, viewPostageError, editSumbitError].forEach(el => el.textContent = '');

        const title = document.getElementById('view_itemName').value.trim();
        const desc = document.getElementById('view_desc').value.trim();
        const price = document.getElementById('view_price').value;
        const postage = document.getElementById('view_postage').value;
        const selectedCategory = document.querySelector('input[name="v_category"]:checked');
        const selectedCondition = document.querySelector('input[name="v_condition"]:checked');

        if (!title) {
            viewTitleError.textContent = 'Please enter a listing title.';
            valid = false;
        }

        if (!selectedCategory) {
            viewCategoryError.textContent = 'Please choose a category.';
            valid = false;
        }

        if (!selectedCondition) {
            viewConditionError.textContent = 'Please choose a condition.';
            valid = false;
        }

        if (!desc) {
            viewDescError.textContent = 'Please enter a description.';
            valid = false;
        }

        if (!price || Number(price) <= 0) {
            viewPriceError.textContent = 'Please enter a valid price.';
            valid = false;
        }

        if (!postage || Number(postage) < 0) {
            viewPostageError.textContent = 'Please enter valid postage.';
            valid = false;
        }

        if (!valid) {
            editSumbitError.textContent = 'Please fill in all fields.';
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
                editSumbitError.style.color = 'green';
                editSumbitError.textContent = data.message;
                disableEditMode();

                setTimeout(() => {
                    showState('empty');
                    loadListings();
                }, 1500);

            } else {
                editSumbitError.textContent = data.message;
            }

        } catch (error) {
            console.error('Update error:', error);
            editSumbitError.textContent = 'Something went wrong';
        }
    });
    ///

    /// Delete Listing Handler
    document.getElementById('delete_listing').addEventListener('click', async function () {
        const editSumbitError = document.getElementById('edit_submit_error');

        try {
            const formData = new FormData();
            formData.append('id', currentListingId);

            const response = await fetch('../../backend/delete_product.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                editSumbitError.style.color = 'green';
                editSumbitError.textContent = data.message;
                disableEditMode();

                setTimeout(() => {
                    currentListingId = null;
                    showState('empty');
                    loadListings();
                }, 1500);

            } else {
                editSumbitError.textContent = data.message;
            }

        } catch (error) {
            console.error('Delete error:', error);
            editSumbitError.textContent = 'Something went wrong.';
        }
    });

    document.querySelectorAll('.return_btn').forEach(btn => {
        btn.addEventListener('click', function () {
            showState('empty');
        });
    });
    
    document.getElementById('edit_listing').addEventListener('click', enableEditMode);
    ///

    setupImagePreview('view_imgUpload1', 'view_img1');
    setupImagePreview('view_imgUpload2', 'view_img2');
    setupImagePreview('imgUpload1', 'imageBox1');
    setupImagePreview('imgUpload2', 'imageBox2');

    clearError('#itemName', 'title_error');
    clearError('#desc', 'desc_error');
    clearError('#price', 'price_error');
    clearError('#postage', 'postage_error');

    clearError('#view_itemName', 'view_title_error');
    clearError('#view_desc', 'view_desc_error');
    clearError('#view_price', 'view_price_error');
    clearError('#view_postage', 'view_postage_error');

    clearError('#imgUpload1', 'upload_1_error', 'change');
    clearError('#imgUpload2', 'upload_2_error', 'change');

    clearError('input[name="v_category"]', 'view_category_error', 'change');
    clearError('input[name="v_condition"]', 'view_condition_error', 'change');

    clearError('input[name="category"]', 'category_error', 'change');
    clearError('input[name="condition"]', 'condition_error', 'change');

    showState('empty');
    await loadUser();
    loadListings();

});