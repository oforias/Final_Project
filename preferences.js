document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('preferences-form');
    const notificationField = document.getElementById('notification');
    const budgetField = document.getElementById('budget-limit');
    const themeField = document.getElementById('theme');
    const successMessage = document.querySelector('.success-message');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;

    // Initialize particles.js
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#0891b2' },
            shape: { type: 'circle' },
            opacity: { value: 0.5 },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: '#0891b2', opacity: 0.4, width: 1 },
            move: { enable: true, speed: 2 }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: { enable: true, mode: 'grab' },
                onclick: { enable: true, mode: 'push' },
                resize: true
            }
        },
        retina_detect: true
    });

    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    root.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    themeField.value = savedTheme;

    // Theme dropdown change handler
    themeField.addEventListener('change', () => {
        const newTheme = themeField.value;
        root.setAttribute('data-theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', newTheme);
    });

    // Theme toggle button handler
    themeToggle.addEventListener('click', () => {
        const newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', newTheme);
        themeField.value = newTheme;
    });

    // Form Submission
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const preferences = {
            notification: notificationField.value,
            budget_limit: budgetField.value,
            theme: themeField.value
        };

        // Validate budget limit
        if (isNaN(preferences.budget_limit) || preferences.budget_limit <= 0) {
            alert('Please enter a valid budget limit (greater than 0).');
            return;
        }

        // Show loading animation
        loadingOverlay.style.display = 'flex';

        // Submit preferences via AJAX
        fetch('update_preferences.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(preferences)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadingOverlay.style.display = 'none';
                    successMessage.style.display = 'block';
                    
                    setTimeout(() => {
                        window.location.href = 'add-expense.html';
                    }, 1500);
                } else {
                    alert(`Error saving preferences: ${data.error}`);
                    loadingOverlay.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error saving preferences:', error);
                alert('An error occurred while saving preferences. Please try again.');
                loadingOverlay.style.display = 'none';
            });
    });
});