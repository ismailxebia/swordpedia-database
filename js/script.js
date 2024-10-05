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
                    loadFilters();  // Load filters dynamically from Airtable
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
    const filterTableId = 'tbl8CiUaI5ltH4ftB';  // Table ID untuk filters
    const airtableApiKey = 'pat98guwqXUUe67Pg.e781f754561ceb8a97f6875a3040d35df76a52c4c3df92db4b3a5bce7395e796';  // Personal Access Token (PAT) Anda

    const airtableBaseUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;  // URL API untuk Airtable
    const airtableFilterUrl = `https://api.airtable.com/v0/${baseId}/${filterTableId}`;  // URL API untuk filters

    let filteredSeriesName = null;  // Simpan nama filter aktif saat ini

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

    // Fungsi untuk mengambil data filters dari Airtable
    async function loadFilters() {
        try {
            const response = await fetch(airtableFilterUrl, {
                headers: {
                    Authorization: `Bearer ${airtableApiKey}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Filters fetched from Airtable:", data);  // Log data dari Airtable
            displayFilters(data.records); // Menampilkan filter yang diambil
        } catch (error) {
            console.error('Error fetching filter data from Airtable:', error);
        }
    }

    // Fungsi untuk menampilkan filters di UI
    function displayFilters(filters) {
        const filterContainer = document.querySelector('.filter'); // Select container filter
        filterContainer.innerHTML = '';  // Clear previous filters

        // Looping untuk setiap filter dan tampilkan
        filters.forEach(filter => {
            const filterButton = document.createElement('button');
            filterButton.classList.add('filter-button', 'idle');
            
            const seriesName = filter.fields['Series Name'];
            const totalCard = filter.fields['Total Card'];

            filterButton.innerHTML = `
                <span class="title">${seriesName}</span>
                <span class="divider"></span>
                <span class="total">${totalCard}</span>
            `;
            
            if (seriesName === 'NEW') {
                const badge = document.createElement('span');
                badge.classList.add('badge');
                badge.textContent = 'NEW';
                filterButton.prepend(badge);  // Add badge if series is new
            }

            // Tambahkan tombol filter ke dalam filter container
            filterContainer.appendChild(filterButton);

            // Tambahkan event listener untuk klik pada tombol filter
            filterButton.addEventListener('click', function () {
                // Jika sudah aktif, batalkan pilihan
                if (filterButton.classList.contains('active')) {
                    filterButton.classList.remove('active');
                    filteredSeriesName = null;  // Set kembali ke null jika tidak ada filter yang aktif
                } else {
                    // Nonaktifkan semua filter
                    const allFilterButtons = document.querySelectorAll('.filter-button');
                    allFilterButtons.forEach(btn => btn.classList.remove('active'));

                    // Aktifkan filter yang diklik
                    filterButton.classList.add('active');
                    filteredSeriesName = seriesName;  // Set filter aktif ke nama series ini
                }

                // Setelah filter diubah, panggil kembali displayCards untuk menerapkan filter
                displayCards();
            });
        });
    }

    // Fungsi untuk menampilkan gambar kartu di grid
    async function displayCards() {
        const gridContainer = document.querySelector('.grid-container');  // Ambil container grid
    
        // Tampilkan skeleton cards terlebih dahulu
        gridContainer.innerHTML = '';
        gridContainer.classList.add('skeleton'); // Tambahkan kelas skeleton ke grid container
    
        // Tambahkan beberapa skeleton card untuk efek loading
        for (let i = 0; i < 6; i++) {  // Menampilkan 6 skeleton sebagai contoh
            const skeletonElement = document.createElement('div');
            skeletonElement.classList.add('skeleton-card');
            gridContainer.appendChild(skeletonElement);
        }
    
        // Ambil data dari Airtable
        const cards = await fetchCardData();  
        console.log("Cards data:", cards);  
    
        // Hapus skeleton dan tampilkan data asli jika ada
        gridContainer.classList.remove('skeleton');  // Hapus kelas skeleton
        gridContainer.innerHTML = '';  // Kosongkan kembali untuk menampilkan data kartu
    
        // Pastikan cards ada dan bukan array kosong
        if (!cards || cards.length === 0) {
            console.log("No cards found or data is empty.");
            gridContainer.innerHTML = '<p>No cards available.</p>';  // Tampilkan pesan jika tidak ada kartu
            return;
        }
    
        // Jika ada filter aktif, filter kartu sesuai Card Series
        let filteredCards = cards;
        if (filteredSeriesName) {
            filteredCards = cards.filter(card => {
                const seriesName = card.fields['Card Series Name'] ? card.fields['Card Series Name'][0] : null;
                console.log("Series Name from card:", seriesName);
                return seriesName === filteredSeriesName;
            });
        }
        console.log("Filtered cards:", filteredCards);
    
        // Jika tidak ada kartu yang cocok dengan filter
        if (filteredCards.length === 0) {
            gridContainer.innerHTML = '<p>No cards available for this series.</p>';
            return;
        }
    
        // Looping untuk setiap kartu dan tambahkan ke grid
        filteredCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
    
            // Ambil gambar kartu dari field "Image Card" (URL)
            const cardImageUrl = card.fields['Image Card'];
            const cardId = card.id; // Dapatkan ID kartu
            console.log("Card Image URL:", cardImageUrl);
    
            // Jika URL gambar ada, tambahkan gambar ke dalam elemen kartu
            if (cardImageUrl) {
                const imgElement = document.createElement('img');
                imgElement.src = cardImageUrl;
                imgElement.alt = "Card Image";
                cardElement.appendChild(imgElement);
            } else {
                console.warn("No image found for card:", card);  
            }

            // Tambahkan event listener pada setiap cardElement untuk navigasi ke card-detail.html dengan ID kartu
            cardElement.addEventListener('click', function() {
                window.location.href = `./card-detail.html?id=${cardId}`;
            });
    
            // Tambahkan kartu ke grid
            gridContainer.appendChild(cardElement);
        });
    }

});
