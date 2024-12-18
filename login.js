// Initialize particles
particlesJS('particles-js', {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#0891b2' },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: false },
        size: { value: 3, random: true },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#0891b2',
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false
        }
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

// Theme switching
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

if (localStorage.getItem('theme') === 'dark') {
    root.setAttribute('data-theme', 'dark');
}

themeToggle.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
});

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');

let isValid = true;

// Validate email
if (!emailInput.value || !emailInput.value.includes('@')) {
    emailError.textContent = 'Please enter a valid email address.';
    emailError.style.display = 'block';
    isValid = false;
} else {
    emailError.style.display = 'none';
}

// Validate password
if (!passwordInput.value || passwordInput.value.length < 6) {
    passwordError.textContent = 'Password must be at least 6 characters.';
    passwordError.style.display = 'block';
    isValid = false;
} else {
    passwordError.style.display = 'none';
}
if (isValid) {
    var formData = new FormData();
    formData.append('email', emailInput.value);
    formData.append('password', passwordInput.value);
    fetch('login.php', {
        body: formData,
        method: 'POST',     
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Login successful
                window.location.href = data.data.redirect;
            
                // window.location.href = data.redirect;
                } 
                else {
                // Login failed
                alert(data.message);
            }
        })
}

})

// // Button ripple effect
// document.querySelector('.login-button').addEventListener('click', function(e) {
//     e.preventDefault();
    
//     const button = this;
//     const ripple = document.createElement('span');
//     const rect = button.getBoundingClientRect();
//     const size = Math.max(rect.width, rect.height);
//     const x = e.clientX - rect.left - size/2;
//     const y = e.clientY - rect.top - size/2;
    
//     ripple.className = 'ripple';
//     ripple.style.width = ripple.style.height = `${size}px`;
//     ripple.style.left = `${x}px`;
//     ripple.style.top = `${y}px`;
    
//     button.appendChild(ripple);
//     setTimeout(() => ripple.remove(), 600);

//     // Show loading animation
// });
