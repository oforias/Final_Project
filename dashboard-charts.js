document.addEventListener('DOMContentLoaded', () => {
    const expenseChartCtx = document.getElementById('expenseChart').getContext('2d');
    const incomeChartCtx = document.getElementById('incomeChart').getContext('2d');
    const dashboardChartCtx = document.getElementById('dashboardChart').getContext('2d');

    // Fetch chart data
    fetch('get_chart_data.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const { expenseData, incomeData, overviewData } = data;

                // Expenses Chart
                new Chart(expenseChartCtx, {
                    type: 'pie',
                    data: {
                        labels: expenseData.categories,
                        datasets: [{
                            data: expenseData.amounts,
                            backgroundColor: generateColors(expenseData.categories.length),
                        }]
                    },
                    options: {
                        plugins: { title: { display: true, text: 'Expenses by Category' } }
                    }
                });

                // Income Chart
                new Chart(incomeChartCtx, {
                    type: 'bar',
                    data: {
                        labels: incomeData.sources,
                        datasets: [{
                            data: incomeData.amounts,
                            backgroundColor: '#4caf50'
                        }]
                    },
                    options: {
                        plugins: { title: { display: true, text: 'Income Sources' } },
                        scales: { y: { beginAtZero: true } }
                    }
                });

                // Dashboard Overview Chart
                new Chart(dashboardChartCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Income', 'Expenses', 'Balance'],
                        datasets: [{
                            data: [
                                overviewData.total_income,
                                overviewData.total_expenses,
                                overviewData.balance
                            ],
                            backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
                        }]
                    },
                    options: {
                        plugins: { title: { display: true, text: 'Financial Overview' } }
                    }
                });
            } else {
                console.error('Error fetching chart data:', data.error);
            }
        })
        .catch(error => console.error('Error fetching chart data:', error));

    // Function to generate colors dynamically
    function generateColors(count) {
        const colors = ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4caf50', '#f44336'];
        return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
    }
});
