document.addEventListener('DOMContentLoaded', () => {
    // Handle card animation with IntersectionObserver specific for card-database.html
    const cards = document.querySelectorAll('.card');
    
    const observerOptions = {
        root: null, // viewport as the root
        threshold: 0.1 // 10% of the card is visible before triggering animation
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log('Card in viewport:', entry.target);
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe each card for animation
    cards.forEach(card => observer.observe(card));
});
