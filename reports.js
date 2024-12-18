document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle Functionality
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    root.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    
    themeToggle.addEventListener('click', () => {
        const newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', newTheme);
    });

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

    // Function to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Function to update summary section
    const updateSummary = (data) => {
        document.getElementById('income-summary').textContent = `Total Income: ${formatCurrency(data.total_income)}`;
        document.getElementById('expense-summary').textContent = `Total Expenses: ${formatCurrency(data.total_expenses)}`;
        document.getElementById('balance-summary').textContent = `Balance: ${formatCurrency(data.balance)}`;
        document.getElementById('advice').textContent = `Advice: ${data.advice}`;
    };

    // Function to create monthly comparison graph
    const createMonthlyComparisonGraph = (data) => {
        const months = [...new Set([
            ...data.monthly_expenses.map(item => item.month),
            ...data.monthly_income.map(item => item.month)
        ])].sort((a, b) => {
            const [monthA, yearA] = a.split(' ').reverse();
            const [monthB, yearB] = b.split(' ').reverse();
            return yearA === yearB ? 
                new Date(Date.parse(monthA + " 1, 2000")) - new Date(Date.parse(monthB + " 1, 2000")) :
                yearA - yearB;
        });

        const expenseData = months.map(month => {
            const expense = data.monthly_expenses.find(e => e.month === month);
            return expense ? parseFloat(expense.total) : 0;
        });

        const incomeData = months.map(month => {
            const income = data.monthly_income.find(i => i.month === month);
            return income ? parseFloat(income.total) : 0;
        });

        const ctx = document.getElementById('expenseGraph').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => formatCurrency(value)
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: context => {
                                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                }
            }
        });
    };

    // Function to create expense categories pie chart
    const createExpenseCategoriesPie = (data) => {
        const ctx = document.getElementById('expenseCategoriesPie').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.expense_categories.map(cat => cat.category),
                datasets: [{
                    data: data.expense_categories.map(cat => parseFloat(cat.total)),
                    backgroundColor: [
                        '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
                        '#10b981', '#06b6d4', '#6366f1', '#8b5cf6'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: context => {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    };

    // Function to create income vs expenses pie chart
    const createIncomeExpensePie = (data) => {
        const ctx = document.getElementById('incomeExpensePie').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    data: [data.total_income, data.total_expenses],
                    backgroundColor: ['#10b981', '#ef4444']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: context => {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    };

    // Check login status first
    fetch('check_login.php')
        .then(response => response.json())
        .then(loginData => {
            if (!loginData.logged_in) {
                window.location.href = 'login.html';
                return;
            }
            
            // If logged in, fetch and display data
            return fetch('get-graph-data.php')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        updateSummary(data);
                        createMonthlyComparisonGraph(data);
                        createExpenseCategoriesPie(data);
                        createIncomeExpensePie(data);
                    } else {
                        throw new Error(data.error || 'Failed to load data');
                    }
                });
        })
        .catch(error => {
            console.error('Error:', error);
            const errorMessage = document.getElementById('error-message');
            errorMessage.textContent = 'Error loading data. Please try refreshing the page.';
            errorMessage.style.display = 'block';
        });

        // Add this to your reports.js file

// Function to generate PDF from charts
async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    let yPosition = 20;

    // Add title
    doc.setFontSize(20);
    doc.text('Financial Report', 105, yPosition, { align: 'center' });
    yPosition += 20;

    // Add summary section
    doc.setFontSize(14);
    doc.text('Summary', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    const summaryTexts = [
        document.getElementById('income-summary').textContent,
        document.getElementById('expense-summary').textContent,
        document.getElementById('balance-summary').textContent,
        document.getElementById('advice').textContent
    ];

    for (let text of summaryTexts) {
        doc.text(text, 20, yPosition);
        yPosition += 8;
    }
    yPosition += 10;

    // Function to add chart to PDF
    async function addChartToPDF(chartId, title) {
        const canvas = document.getElementById(chartId);
        const imgData = canvas.toDataURL('image/png');
        
        doc.setFontSize(14);
        doc.text(title, 20, yPosition);
        yPosition += 10;
        
        doc.addImage(imgData, 'PNG', 20, yPosition, 170, 80);
        yPosition += 90;
    }

    // Add charts
    await addChartToPDF('expenseGraph', 'Monthly Income vs Expenses');
    
    // Check if we need a new page
    if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
    }
    
    await addChartToPDF('incomeExpensePie', 'Income vs Expenses Overview');
    
    if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
    }
    
    await addChartToPDF('expenseCategoriesPie', 'Expense Categories');

    // Add footer with date
    const date = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Report generated on ${date}`, 105, 290, { align: 'center' });

    // Save the PDF
    doc.save('financial-report.pdf');
}

// Add event listener to download button
document.getElementById('download-report').addEventListener('click', async () => {
    try {
        await downloadPDF();
    } catch (error) {
        console.error('Error generating PDF:', error);
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = 'Error generating PDF. Please try again.';
        errorMessage.style.display = 'block';
    }
});
});
