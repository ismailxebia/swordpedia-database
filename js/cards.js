// Konfigurasi Airtable API
const baseId = 'appTB3JrYRqa7nDw2';  // Base ID Airtable Anda
const tableName = 'Card Properties';  // Nama tabel di Airtable
const tableId = 'tbl1XJpKap5R06IFU'
const viewId = 'viw0N8zzwyq4kHLLl'
const airtableApiKey = 'pat98guwqXUUe67Pg';  // Personal Access Token (PAT) Anda

const airtableBaseUrl = `https://api.airtable.com/v0/${baseId}/${tableId}/${viewId}`;  // URL API untuk Airtable

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

    // Inisialisasi observer untuk animasi
    initializeCardObserver();  // Memanggil fungsi observer untuk animasi kartu
}

// Fungsi untuk memulai observer animasi kartu
function initializeCardObserver() {
    const cards = document.querySelectorAll('.card');  // Select semua elemen kartu

    const observerOptions = {
        threshold: 0.1  // Animasi dimulai saat 10% dari kartu terlihat
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');  // Tambahkan kelas "show" saat kartu terlihat
                observer.unobserve(entry.target);  // Hentikan observasi setelah kartu terlihat
            }
        });
    }, observerOptions);

    // Observasi semua kartu
    cards.forEach(card => {
        observer.observe(card);
    });
}

// Panggil fungsi untuk menampilkan kartu saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    displayCards();  // Tampilkan data kartu dari Airtable
});
