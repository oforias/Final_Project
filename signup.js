// Particles configuration
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

// Profile picture preview
const profileInput = document.getElementById('profilePhoto');
const previewContainer = document.getElementById('profilePreview');

profileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert('File is too large. Please choose an image under 5MB.');
            this.value = ''; // Clear the input
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            previewContainer.innerHTML = `<img src="${e.target.result}" alt="Profile Preview">`;
        }
        reader.readAsDataURL(file);
    }
});

// Get all form elements
const form = document.getElementById('signupForm');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const email = document.getElementById('email');
const strengthMeter = document.getElementById('strengthMeter');
const hints = {
    length: document.getElementById('lengthHint'),
    case: document.getElementById('caseHint'),
    number: document.getElementById('numberHint'),
    special: document.getElementById('specialHint')
};

// Password strength checker
function checkPasswordStrength(value) {
    const checks = {
        length: value.length >= 8,
        case: /[a-z]/.test(value) && /[A-Z]/.test(value),
        number: /\d/.test(value),
        special: /[^a-zA-Z\d]/.test(value)
    };

    // Update hints
    Object.keys(checks).forEach(key => {
        hints[key].classList.toggle('valid', checks[key]);
    });

    // Calculate strength (0-4)
    const strength = Object.values(checks).filter(Boolean).length;
    
    // Update strength meter
    strengthMeter.style.width = `${(strength / 4) * 100}%`;
    
    // Update color based on strength
    const colors = ['#ff4444', '#ffaa00', '#2196f3', '#00c853'];
    strengthMeter.style.backgroundColor = colors[strength - 1] || '#eee';
    
    return strength;
}

// Password input handler
password.addEventListener('input', function() {
    checkPasswordStrength(this.value);
});

// Confirm password handler
confirmPassword.addEventListener('input', function() {
    const confirmError = document.getElementById('confirmError');
    if (this.value !== password.value) {
        confirmError.classList.add('show');
    } else {
        confirmError.classList.remove('show');
    }
});

// Email validation
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// Form submission
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    let isValid = true;

    // Reset all error messages
    document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));

    // Email validation
    if (!isValidEmail(email.value)) {
        document.getElementById('emailError').classList.add('show');
        isValid = false;
    }

    // Password strength validation
    if (checkPasswordStrength(password.value) < 3) {
        document.getElementById('passwordError').classList.add('show');
        isValid = false;
    }

    // Password matching validation
    if (password.value !== confirmPassword.value) {
        document.getElementById('confirmError').classList.add('show');
        isValid = false;
    }

    // Terms validation
    if (!document.getElementById('terms').checked) {
        alert('Please accept the Terms and Conditions');
        isValid = false;
    }

    if (isValid) {
        try {
            const submitButton = form.querySelector('.submit-button');
            submitButton.disabled = true;
            submitButton.textContent = 'Creating Account...';

            const formData = new FormData(form);
            const response = await fetch('signup.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                submitButton.textContent = 'Success!';
                window.location.href = result.data.redirect;
            } else {
                submitButton.disabled = false;
                submitButton.textContent = 'Create Account';
                alert(result.message || 'Signup failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            submitButton.disabled = false;
            submitButton.textContent = 'Create Account';
            alert('An error occurred. Please try again.');
        }
    }
});

// Button ripple effect
const button = document.querySelector('.submit-button');
button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size/2;
    const y = e.clientY - rect.top - size/2;
    
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
});