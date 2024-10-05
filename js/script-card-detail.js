document.addEventListener('DOMContentLoaded', function () {
    // Tambahkan event listener untuk tombol back
    document.querySelector('.back-button').addEventListener('click', function() {
        window.history.back();
    });

    const urlParams = new URLSearchParams(window.location.search);
    const cardId = urlParams.get('id');

    if (!cardId) {
        console.error('Card ID not found in URL.');
        return;
    }

    // Set your Airtable API details
    const baseId = 'appTB3JrYRqa7nDw2';
    const tableId = 'tbl1XJpKap5R06IFU'; 
    const airtableApiKey = 'pat98guwqXUUe67Pg.e781f754561ceb8a97f6875a3040d35df76a52c4c3df92db4b3a5bce7395e796';
    const airtableBaseUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;

    // Fetch the specific card data using the card ID
    fetch(`${airtableBaseUrl}/${cardId}`, {
        headers: {
            Authorization: `Bearer ${airtableApiKey}`,
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Card data:', data);
            const cardFields = data.fields;

            // Populate the HTML elements with card data
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
            document.getElementById('card-number').textContent = `01 / ${cardFields['Total Cards'] || 'N/A'}`;

            // Set the card image
            const cardImageUrl = cardFields['Image Card'];
            if (cardImageUrl) {
                document.getElementById('card-image').src = cardImageUrl;
            } else {
                document.getElementById('card-image').src = '../assets/placeholder-image.png'; // Placeholder jika tidak ada gambar
            }
        })
        .catch(error => {
            console.error('Error fetching card data:', error);
            alert('Failed to load card details.');
        });
});
