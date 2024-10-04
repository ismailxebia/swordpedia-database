document.addEventListener('DOMContentLoaded', () => {
    // Handle navigation active state
    const navItems = document.querySelectorAll('.nav-item');

    // Function to clear the active class from all nav items
    function clearActiveStates() {
        navItems.forEach(item => {
            item.classList.remove('active');
            const idleIcon = item.querySelector('.nav-icon.idle');
            const activeIcon = item.querySelector('.nav-icon.active');
            if (idleIcon && activeIcon) {
                idleIcon.style.display = 'block';
                activeIcon.style.display = 'none';
            }
        });
    }

    // Function to load the page dynamically using fetch
    const contentArea = document.getElementById('page-content');
    const pageTitle = document.getElementById('page-title');

    function loadPage(page) {
        if (!contentArea || !pageTitle) {
            console.error('Content area or page title not found in the DOM.');
            return;
        }

        fetch(`./pages/${page}.html`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Page not found: ${page}`);
                }
                return response.text();
            })
            .then(html => {
                contentArea.innerHTML = html; // Replace content area with new page
                pageTitle.textContent = page.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                
                // After loading the page, display cards if on card-database page
                if (page === 'card-database') {
                    displayCards(); // Call the function to display cards
                }
            })
            .catch(error => {
                console.error('Error loading page:', error);
                contentArea.innerHTML = '<p>Page not found.</p>';
            });
    }

    // Function to set the active state based on the current URL hash
    function setActiveStateFromHash() {
        const currentPage = window.location.hash.substring(1); // Get hash value without "#"
        const activeItem = document.querySelector(`.nav-item[data-page="${currentPage}"]`);

        // Clear all active states
        clearActiveStates();

        // If there's a matching nav item for the current hash, make it active
        if (activeItem) {
            activeItem.classList.add('active');
            const idleIcon = activeItem.querySelector('.nav-icon.idle');
            const activeIcon = activeItem.querySelector('.nav-icon.active');
            if (idleIcon && activeIcon) {
                idleIcon.style.display = 'none';
                activeIcon.style.display = 'block';
            }
            loadPage(currentPage); // Load the page content dynamically
        } else if (navItems.length > 0) {
            navItems[0].classList.add('active');
            const idleIcon = navItems[0].querySelector('.nav-icon.idle');
            const activeIcon = navItems[0].querySelector('.nav-icon.active');
            if (idleIcon && activeIcon) {
                idleIcon.style.display = 'none';
                activeIcon.style.display = 'block';
            }
            loadPage('card-database'); // Load the default page
        }
    }

    // Apply active class to clicked nav item and load corresponding page
    navItems.forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default action (page reload)
            clearActiveStates(); // Clear all other active states
            this.classList.add('active'); // Set clicked item as active
            const idleIcon = this.querySelector('.nav-icon.idle');
            const activeIcon = this.querySelector('.nav-icon.active');
            if (idleIcon && activeIcon) {
                idleIcon.style.display = 'none';
                activeIcon.style.display = 'block';
            }
            const page = this.getAttribute('data-page');
            window.location.hash = page; // Update the URL hash
            loadPage(page); // Load the corresponding page
        });
    });

    // Set the active state and load page when the page loads or when the URL hash changes
    setActiveStateFromHash(); // Initial check when the page loads
    window.addEventListener('hashchange', setActiveStateFromHash); // Check on hash change

    // Handle hamburger click event to toggle sidebar
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    
    // Toggle sidebar open/close on mobile when hamburger is clicked
    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Load the default page when the DOM is fully loaded
    loadPage('card-database');

    // Fungsi untuk mengambil data dari Airtable dan menampilkan kartu di grid
    const baseId = 'appTB3JrYRqa7nDw2';  // Base ID Airtable Anda
    const tableId = 'tbl1XJpKap5R06IFU';  // Table ID dari tabel Anda
    const airtableApiKey = 'pat98guwqXUUe67Pg.e781f754561ceb8a97f6875a3040d35df76a52c4c3df92db4b3a5bce7395e796';  // Personal Access Token (PAT) Anda

    const airtableBaseUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;  // URL API untuk Airtable

    // Fungsi untuk mengambil data dari Airtable
    async function fetchCardData() {
        try {
            const response = await fetch(airtableBaseUrl, {
                headers: {
                    Authorization: `Bearer ${airtableApiKey}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Data fetched from Airtable:", data);  // Log data dari Airtable
            return data.records; // Mengambil record dari tabel
        } catch (error) {
            console.error('Error fetching data from Airtable:', error);  // Log jika terjadi error
        }
    }

    // Fungsi untuk menampilkan gambar kartu di grid
    async function displayCards() {
        const cards = await fetchCardData();  // Ambil data dari Airtable
        console.log("Cards data:", cards);  // Log data kartu yang diambil

        const gridContainer = document.querySelector('.grid-container');  // Ambil container grid

        // Pastikan cards ada dan bukan array kosong
        if (!cards || cards.length === 0) {
            console.log("No cards found or data is empty.");
            gridContainer.innerHTML = '<p>No cards available.</p>';  // Tampilkan pesan jika tidak ada kartu
            return;
        }

        // Kosongkan konten grid yang sudah ada
        gridContainer.innerHTML = '';

        // Looping untuk setiap kartu dan tambahkan ke grid
        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');

            // Ambil gambar kartu dari field "Image Card" (URL)
            const cardImageUrl = card.fields['Image Card'];  // Ganti dengan nama field di Airtable
            console.log("Card Image URL:", cardImageUrl);  // Log URL gambar untuk debug

            // Jika URL gambar ada, tambahkan gambar ke dalam elemen kartu
            if (cardImageUrl) {
                const imgElement = document.createElement('img');
                imgElement.src = cardImageUrl;
                imgElement.alt = "Card Image";  // Optional: text alt untuk image
                cardElement.appendChild(imgElement);
            } else {
                console.warn("No image found for card:", card);  // Log jika gambar tidak ditemukan
            }

            // Tambahkan kartu ke grid
            gridContainer.appendChild(cardElement);
        });
    }
});
