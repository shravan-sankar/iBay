document.addEventListener('DOMContentLoaded', function () {
    
    const emptyState = document.getElementById('no_listing');
    const viewState = document.getElementById('existing_listing');
    const addState = document.getElementById('adding_listing');
    const form = document.querySelector('form');

    // Displaying different page states
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

    // Getting user info for account details display
    async function loadUser() {
        try {
            const response = await fetch('../../backend/me.php');

            if (!response.ok) {
                console.log('User not logged in or not found');
                return;
            }

            const user = await response.json();
            if (!user) {
                console.log('No user data');
                return;
            }

            console.log(user);

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
            console.error('Failed to load user:', error);
        }
    }

    // Stop form submit just by entering field value & hitting enter key
    form.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    });

    //Form sumbission handling
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
                showState('empty');
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

    // Changing to add new listing
    document.getElementById('add_listing').addEventListener('click', function () {
        showState('add');
    });

    showState('empty');
    loadUser();

});