document.addEventListener('DOMContentLoaded', function () {
    // Event listener untuk tombol back
    document.querySelector('.back-button').addEventListener('click', function() {
        window.history.back();
    });

    const urlParams = new URLSearchParams(window.location.search);
    const cardId = urlParams.get('id');

    if (!cardId) {
        console.error('Card ID not found in URL.');
        return;
    }

    // Key cache untuk kartu yang spesifik
    const cacheKey = `card_${cardId}`;
    const cacheExpiryKey = `${cacheKey}_expiry`;

    // Cek apakah cache sudah kedaluwarsa
    function isCacheExpired() {
        const expiryTime = localStorage.getItem(cacheExpiryKey);
        if (!expiryTime) return true; // Jika tidak ada waktu expiry, anggap sudah kadaluarsa
        const now = Date.now();
        return now > parseInt(expiryTime, 10); // Bandingkan waktu sekarang dengan waktu kedaluwarsa
    }

    // Fungsi untuk menyimpan data ke cache
    function cacheData(data) {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        const expiryTime = Date.now() + 5 * 60 * 1000; // Set 5 menit expiry
        localStorage.setItem(cacheExpiryKey, expiryTime.toString());
    }

    // Fungsi untuk mengambil data dari cache
    function getCachedData() {
        const cachedData = localStorage.getItem(cacheKey);
        return cachedData ? JSON.parse(cachedData) : null;
    }

    // Cek apakah pengguna melakukan refresh halaman
    if (performance.navigation.type === 1) {
        console.log('Page was refreshed, clearing cache...');
        localStorage.removeItem(cacheKey); // Hapus cache
        localStorage.removeItem(cacheExpiryKey); // Hapus waktu expiry cache
    }

    // Jika ada data di cache dan belum kedaluwarsa, gunakan data cache
    const cachedData = getCachedData();
    if (cachedData && !isCacheExpired()) {
        console.log('Using cached card data:', cachedData);
        populateCardDetails(cachedData.fields);
    } else {
        // Fetch data dari Airtable jika tidak ada cache atau cache sudah kadaluwarsa
        fetchCardData(cardId)
            .then(data => {
                console.log('Fetched card data:', data);
                cacheData(data); // Simpan ke cache
                populateCardDetails(data.fields); // Isi detail kartu ke halaman
            })
            .catch(error => {
                console.error('Error fetching card data:', error);
                alert('Failed to load card details.');
            });
    }

    // Fungsi untuk mengambil data dari Airtable
    function fetchCardData(cardId) {
        const baseId = 'appTB3JrYRqa7nDw2';
        const tableId = 'tbl1XJpKap5R06IFU'; 
        const airtableApiKey = 'pat98guwqXUUe67Pg.e781f754561ceb8a97f6875a3040d35df76a52c4c3df92db4b3a5bce7395e796';
        const airtableBaseUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;

        return fetch(`${airtableBaseUrl}/${cardId}`, {
            headers: {
                Authorization: `Bearer ${airtableApiKey}`,
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
    }

    // Fungsi untuk mengisi detail kartu ke dalam elemen HTML
    function populateCardDetails(cardFields) {
        document.getElementById('weapon-name').textContent = cardFields['Sword Name'] || 'N/A';
        document.getElementById('weapon-name-title').textContent = cardFields['Sword Name'] || 'N/A';
        document.getElementById('rarity').textContent = cardFields['Rarity'] || 'N/A';
        document.getElementById('card-type').textContent = cardFields['Card Type Name'] || 'N/A';
        document.getElementById('element').textContent = cardFields['Elements Name'] || 'N/A';
        document.getElementById('action').textContent = cardFields['Action'] || 'N/A';
        document.getElementById('action-point').textContent = cardFields['Card Action Point'] || 'N/A';
        document.getElementById('location').textContent = cardFields['Location'] || 'N/A';
        document.getElementById('abilities').textContent = cardFields['Abilities'] || 'N/A';

        // Set series name and card number
        document.getElementById('series-name').textContent = cardFields['Card Series Name'] || 'N/A';
        document.getElementById('card-number').textContent = `${cardFields['Card No'] || 'N/A'} / ${cardFields['Total Card'] || 'N/A'}`;

        // Set the card image
        const cardImageUrl = cardFields['Image Card'];
        if (cardImageUrl) {
            document.getElementById('card-image').src = cardImageUrl;
        } else {
            document.getElementById('card-image').src = '../assets/placeholder-image.png'; // Placeholder jika tidak ada gambar
        }
    }
});
