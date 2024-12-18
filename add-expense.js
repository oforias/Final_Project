document.addEventListener('DOMContentLoaded', () => {
    // Initialize particles.js with consistent settings
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

    // Fetch categories dynamically
    const categorySelect = document.getElementById('category');
    fetch('get_categories.php')
        .then(response => response.json())
        .then(data => {
            data.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching categories:', error));

    // Fetch payment methods dynamically
    const paymentMethodSelect = document.getElementById('payment-method');
    fetch('get_payment_methods.php')
        .then(response => response.json())
        .then(data => {
            data.forEach(method => {
                const option = document.createElement('option');
                option.value = method.id;
                option.textContent = method.name;
                paymentMethodSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching payment methods:', error));

    // Handle form submission
    const expenseForm = document.getElementById('expense-form');
    const amountField = document.getElementById('amount');
    const amountError = document.createElement('span');
    amountError.classList.add('error-message');
    amountField.parentNode.appendChild(amountError); // Append error message span to the form

    expenseForm.addEventListener('submit', event => {
        event.preventDefault();

        // Clear previous error messages
        amountError.textContent = '';

        // Validate the amount field
        const amountValue = parseFloat(amountField.value);
        if (isNaN(amountValue) || amountValue <= 0) {
            amountError.textContent = 'Amount must be greater than 0';
            return;
        }

        // Collect form data
        const expenseData = {
            amount: amountField.value,
            date: document.getElementById('date').value,
            description: document.getElementById('description').value,
            category: document.getElementById('category').value,
            payment_method: document.getElementById('payment-method').value
        };

        // Submit the form via Fetch API
        fetch('save-expenses.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expenseData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Display success message
                    const successMessage = document.querySelector('.success-message');
                    successMessage.textContent = 'Expense added successfully! Redirecting to Dashboard...';
                    successMessage.classList.add('show');

                    // Redirect after a short delay
                    setTimeout(() => {
                        successMessage.classList.remove('show');
                        window.location.href = 'dashboard.php';
                    }, 1500);

                    expenseForm.reset();
                } else {
                    alert('Error adding expense: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error submitting expense:', error);
            });
    });

    // Theme switching
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const root = document.documentElement;

    // Initialize theme from localStorage or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    root.setAttribute('data-theme', savedTheme);
    themeIcon.textContent = savedTheme === 'dark' ? '🌞' : '🌙';

    themeToggle.addEventListener('click', () => {
        const newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', newTheme);
        themeIcon.textContent = newTheme === 'dark' ? '🌞' : '🌙';
        localStorage.setItem('theme', newTheme);
    });

    // Add a logout button to the expense page and load the logout.js script.
    const header = document.querySelector('header');
    const logoutButton = document.createElement('button');
    logoutButton.id = 'logout-button';
    logoutButton.textContent = 'Logout';
    header.appendChild(logoutButton);

    const script = document.createElement('script');
    script.src = 'logout.js';
    document.body.appendChild(script);

    // Fetch data and render simple bar charts
    fetch('get-expense-data.php')
        .then(response => response.json())
        .then(data => {
            const expenseChart = document.getElementById('expenseBarChart');
            expenseChart.innerHTML = '';
            data.expenses.forEach(value => {
                const bar = document.createElement('div');
                bar.className = 'bar';
                bar.style.height = `${value}%`;
                bar.textContent = `${value}%`;
                expenseChart.appendChild(bar);
            });
        })
        .catch(error => console.error('Error fetching expense data:', error));

    fetch('get-income-expense-comparison.php')
        .then(response => response.json())
        .then(data => {
            const comparisonChart = document.getElementById('incomeExpenseComparison');
            comparisonChart.innerHTML = '';
            ['income', 'expenses'].forEach(type => {
                const bar = document.createElement('div');
                bar.className = 'bar';
                bar.style.height = `${data[type]}%`;
                bar.textContent = `${data[type]}%`;
                comparisonChart.appendChild(bar);
            });
        })
        .catch(error => console.error('Error fetching income vs. expense data:', error));
});

document.addEventListener('DOMContentLoaded', () => {
    const expenseListContainer = document.getElementById('expense-list');

    // Function to fetch expenses
    function fetchExpenses() {
        fetch('get_expenses.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    populateExpenses(data.expenses);
                } else {
                    console.error('Error fetching expenses:', data.error);
                }
            })
            .catch(error => console.error('Error fetching expenses:', error));
    }

    // Function to populate expenses in the UI
    function populateExpenses(expenses) {
        expenseListContainer.innerHTML = ''; // Clear existing content

        if (expenses.length === 0) {
            expenseListContainer.innerHTML = '<p>No expenses recorded yet.</p>';
            return;
        }

        expenses.forEach(expense => {
            const expenseItem = document.createElement('div');
            expenseItem.classList.add('expense-item');
            expenseItem.innerHTML = `
                <div class="expense-header">
                    <h3>${expense.category_name || 'Uncategorized'}</h3>
                    <p>${expense.expense_date}</p>
                </div>
                <div class="expense-body">
                    <p><strong>Amount:</strong> $${parseFloat(expense.amount).toFixed(2)}</p>
                    <p><strong>Notes:</strong> ${expense.notes || 'None'}</p>
                    <p><strong>Payment Method:</strong> ${expense.method_name || 'Unknown'}</p>
                </div>
            `;
            expenseListContainer.appendChild(expenseItem);
        });
    }

    // Initial fetch
    fetchExpenses();
});
document.addEventListener('DOMContentLoaded', () => {
    const paymentMethodSelect = document.getElementById('payment-method');

    // Function to fetch payment methods
    function fetchPaymentMethods() {
        fetch('get_payment_methods.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    populatePaymentMethods(data.payment_methods);
                } else {
                    console.error('Error fetching payment methods:', data.error);
                }
            })
            .catch(error => console.error('Error fetching payment methods:', error));
    }

    // Function to populate payment methods in the dropdown
    function populatePaymentMethods(paymentMethods) {
        paymentMethodSelect.innerHTML = '<option value="">Select Payment Method</option>'; // Default option

        if (paymentMethods.length === 0) {
            paymentMethodSelect.innerHTML = '<option value="">No Payment Methods Available</option>';
            return;
        }

        paymentMethods.forEach(method => {
            const option = document.createElement('option');
            option.value = method.payment_method_id;
            option.textContent = method.name;
            paymentMethodSelect.appendChild(option);
        });
    }
    // Initial fetch
    fetchPaymentMethods();
});
