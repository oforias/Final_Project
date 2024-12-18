document.addEventListener('DOMContentLoaded', () => {
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

    // Theme switching logic
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const root = document.documentElement;

    const savedTheme = localStorage.getItem('theme') || 'light';
    root.setAttribute('data-theme', savedTheme);
    themeIcon.textContent = savedTheme === 'dark' ? '🌞' : '🌙';

    themeToggle.addEventListener('click', () => {
        const newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', newTheme);
        themeIcon.textContent = newTheme === 'dark' ? '🌞' : '🌙';
        localStorage.setItem('theme', newTheme);
    });

    // Select elements for dynamic dropdowns
    const CategorySelect = document.getElementById('income-category');
    const paymentMethodSelect = document.getElementById('payment-method');
    const incomeForm = document.getElementById('income-form');
    const successMessage = document.querySelector('.success-message');

    // Fetch income categories
    function fetchIncomeCategories() {
        fetch('fetch_income_categories.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    populateDropdown(CategorySelect, data.categories);
                } else {
                    console.error('Error fetching income categories:', data.error);
                }
            })
            .catch(error => console.error('Error fetching income categories:', error));
    }

    // Fetch payment methods
    function fetchPaymentMethods() {
        fetch('get_payment_methods.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    populateDropdown(paymentMethodSelect, data.payment_methods);
                } else {
                    console.error('Error fetching payment methods:', data.error);
                }
            })
            .catch(error => console.error('Error fetching payment methods:', error));
    }

    // Populate dropdown utility function
    function populateDropdown(selectElement, items) {
        selectElement.innerHTML = '<option value="">Select</option>';
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.category_id || item.payment_method_id;  // Handle both category and payment method IDs
            option.textContent = item.category_name || item.name;  // Handle both category and payment method names
            selectElement.appendChild(option);
        });
    }

    // Fetch dropdown data on page load
    fetchIncomeCategories();
    fetchPaymentMethods();

    // Handle form submission
    incomeForm.addEventListener('submit', event => {
        event.preventDefault();

        // Validate form fields
        const amount = document.getElementById('amount').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;
        const incomeCategoryId = CategorySelect.value;
        const paymentMethodId = paymentMethodSelect.value;

        if (!amount || !date || !incomeCategoryId || !paymentMethodId) {
            alert('Please fill in all required fields.');
            return;
        }

        const incomeData = {
            amount,
            date,
            description,
            category_id: incomeCategoryId,
            payment_method_id: paymentMethodId
        };

        // Send data to save_income.php
        fetch('save_income.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(incomeData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    successMessage.textContent = 'Income added successfully!';
                    successMessage.classList.add('show');
                    setTimeout(() => successMessage.classList.remove('show'), 1500);
                    incomeForm.reset();
                } else {
                    console.error('Error:', data.error);
                    alert('Error: ' + data.error);
                }
            })
            .catch(error => console.error('Error saving income:', error));
    });
});
