document.addEventListener('DOMContentLoaded', () => {
    const steps = {
        step1: { next: 'preferences.html', nextButton: 'step2' },
        step2: { next: 'add-expense.html', nextButton: 'step3' },
        step3: { next: 'dashboard.php' }
    };

    Object.keys(steps).forEach((stepId) => {
        const button = document.getElementById(stepId);
        button.addEventListener('click', () => {
            const { next, nextButton } = steps[stepId];

            const loadingOverlay = document.querySelector('.loading-overlay');
            const successMessage = document.querySelector('.success-message');

            // Show loading animation
            loadingOverlay.style.display = 'flex';

            setTimeout(() => {
                loadingOverlay.style.display = 'none';
                successMessage.textContent = `Redirecting to ${next.replace('.html', '')}...`;
                successMessage.classList.add('show');

                setTimeout(() => {
                    successMessage.classList.remove('show');
                    // Enable the next step
                    if (nextButton) {
                        document.getElementById(nextButton).removeAttribute('disabled');
                    }
                    // Redirect to the next page
                    window.location.href = next;
                }, 1500);
            }, 2000);
        });
    });

    // Theme switching
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;

    const savedTheme = localStorage.getItem('theme') || 'light';
    root.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Initialize particles
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
            events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true }
        },
        retina_detect: true
    });
});
