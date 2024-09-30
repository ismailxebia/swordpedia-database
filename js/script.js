document.addEventListener('DOMContentLoaded', () => {
    // Handle navigation active state
    const navItems = document.querySelectorAll('.nav-item');

    // Function to clear the active class from all nav items
    function clearActiveStates() {
        navItems.forEach(item => {
            item.classList.remove('active');
            // Toggle idle and active icons visibility
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
        const contentArea = document.getElementById('page-content');
        const pageTitle = document.getElementById('page-title');
    
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
                
                // After loading the page, initialize observer for card animations
                if (page === 'card-database') {
                    initializeCardObserver(); // Call the observer for card animations
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
        } else {
            // If no hash is found, default to the first nav item being active
            if (navItems.length > 0) {
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
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        } else {
            sidebar.classList.add('open');
        }
    });

    // Function to initialize IntersectionObserver for card animations
    function initializeCardObserver() {
        const cards = document.querySelectorAll('.card'); // Select all cards

        const observerOptions = {
            threshold: 0.1 // Trigger when 10% of the card is visible
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show'); // Add show class when card is in viewport
                    observer.unobserve(entry.target); // Stop observing the card after it's visible
                }
            });
        }, observerOptions);

        // Observe all cards
        cards.forEach(card => {
            observer.observe(card);
        });
    }

    // Load the default page when the DOM is fully loaded
    loadPage('card-database');
});
