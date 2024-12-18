document.addEventListener('DOMContentLoaded', () => {
    // Theme switching functionality
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;
    
    // Get saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    root.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '🌞' : '🌙';

    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        root.setAttribute('data-theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '🌞' : '🌙';
        localStorage.setItem('theme', newTheme);
        
        // Update particles with new theme colors
        initParticles();
    });

    // Fetch and render chart data
    fetch('get_chart_data.php')
        .then(response => {
            console.log('Raw response:', response);
            return response.json();
        })
        .then(data => {
            console.log('Parsed data:', data);
            if (data.success) {
                
                console.log("Chart Data:", data);
                renderDashboardChart(data.monthly);
                renderExpenseChart(data.expenses);
                renderIncomeChart(data.income);
            } else {
                console.error('Error fetching chart data:', data.error);
            }
        })
        .catch(error => console.error('Error fetching chart data:', error));

        function checkIncome() {
            fetch('get-total-income.php')
                .then(response => response.json())
                .then(data => {
                    if (data.success && parseFloat(data.total_income) === 0) {
                        incomeNotification.style.display = 'block';
                    }
                    if (totalIncomeElement) {
                        totalIncomeElement.textContent = `$${parseFloat(data.total_income || 0).toFixed(2)}`;
                    }
                })
                .catch(error => console.error('Error fetching total income:', error));
        }

    // Initialize particles.js with theme-aware colors
    function initParticles() {
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: primaryColor },
                shape: { type: 'circle' },
                opacity: { value: 0.5 },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: primaryColor, opacity: 0.4, width: 1 },
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
    }

    // Initialize particles on load
    initParticles();

    // Income notification handling
    const incomeNotification = document.getElementById('income-notification');
    const addIncomeButton = document.getElementById('add-income-btn');
    const totalIncomeElement = document.getElementById('total-income');

    // Function to check income and prompt if it's zero
    

    // Add Income button click handler
    if (addIncomeButton) {
        addIncomeButton.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = 'add-income.html';
        });
    }

    // Initialize income check
    checkIncome();

    // Chart rendering functions
    function generateColors(count) {
        const colors = ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4caf50', '#ff9800'];
        return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
    }

    function renderExpenseChart(expenses) {
        if (!expenses || !expenses.length) {
            console.log('No expense data available');
            return;
        }
    
        const expenseLabels = expenses.map(item => item.category);
        const expenseValues = expenses.map(item => parseFloat(item.total));
    
        const expenseOptions = {
            series: expenseValues,
            chart: {
                type: 'pie',
                height: 350
            },
            labels: expenseLabels,
            title: {
                text: 'Expenses by Category',
                align: 'center'
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 300
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }]
        };
    
        const expenseChart = new ApexCharts(document.querySelector("#expenseChart"), expenseOptions);
        expenseChart.render();
    }

    function renderIncomeChart(income) {
        if (!income || !income.length) {
            console.log('No income data available');
            return;
        }

        const incomeLabels = income.map(item => item.source);
        const incomeValues = income.map(item => parseFloat(item.total));
        const ctx = document.getElementById('incomeChart');

        if (!ctx) {
            console.error('Income chart canvas not found');
            return;
        }

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: incomeLabels,
                datasets: [{
                    label: 'Income by Category',
                    data: incomeValues,
                    backgroundColor: '#4caf50'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                },
                plugins: {
                    title: { display: true, text: 'Income by Category' },
                    legend: {
                        labels: {
                            color: '#000' // Set label font color to black
                        }
                    },
                    tooltip: {
                        backgroundColor: function() {
                            const theme = document.documentElement.getAttribute('data-theme');
                            return theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
                        },
                        callbacks: {
                            labelColor: function(context) {
                                return {
                                    borderColor: 'rgba(0, 0, 0, 0)',
                                    backgroundColor: context.dataset.backgroundColor
                                };
                            },
                            labelTextColor: function() {
                                const theme = document.documentElement.getAttribute('data-theme');
                                return theme === 'dark' ? '#000' : '#fff'; // Adjust tooltip text color based on theme
                            }
                        }
                    }
                }
            }
        });
    }

    function renderDashboardChart(monthlyData) {
        if (!monthlyData || !monthlyData.length) {
            console.log('No monthly data available');
            return;
        }
    
        // Get current theme
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDarkMode ? '#f8fafc' : '#333'; // Use your --text-primary colors
    
        const dashboardOptions = {
            series: [
                {
                    name: 'Income',
                    data: monthlyData.map(item => ({
                        x: item.month,
                        y: parseFloat(item.income)
                    })).reverse()
                },
                {
                    name: 'Expenses',
                    data: monthlyData.map(item => ({
                        x: item.month,
                        y: parseFloat(item.expense)
                    })).reverse()
                }
            ],
            chart: {
                type: 'area',
                height: 350,
                toolbar: {
                    show: true
                },
                foreColor: textColor // This sets the base text color
            },
            title: {
                text: 'Monthly Financial Overview',
                align: 'center',
                style: {
                    color: textColor
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function(value) {
                    return '$' + value.toLocaleString();
                },
                style: {
                    colors: [textColor]
                }
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.3
                }
            },
            xaxis: {
                type: 'category',
                title: {
                    text: 'Month',
                    style: {
                        color: textColor,
                        fontSize: '14px'
                    }
                },
                labels: {
                    style: {
                        colors: textColor
                    }
                }
            },
            yaxis: {
                title: {
                    text: 'Amount ($)',
                    style: {
                        color: textColor,
                        fontSize: '14px'
                    }
                },
                labels: {
                    style: {
                        colors: textColor
                    },
                    formatter: function(value) {
                        return '$' + value.toLocaleString();
                    }
                }
            },
            legend: {
                labels: {
                    colors: textColor
                }
            },
            tooltip: {
                theme: isDarkMode ? 'dark' : 'light',
                y: {
                    formatter: function(value) {
                        return '$' + value.toLocaleString();
                    }
                }
            }
        };
    
        const dashboardChart = new ApexCharts(document.querySelector("#dashboardChart"), dashboardOptions);
        dashboardChart.render();
    }
    
});
