<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Start session for user data
session_start();
include 'config.php';

// Redirect to login if the user is not logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.html');
    exit;
}

// Include functions for database interaction
// include 'functions.php';

// Get user data
$user_id = $_SESSION['user_id'];
$full_name = $_SESSION['full_name'];

// Fetch total expenses
$query = "SELECT SUM(amount) as total_expenses FROM expenses WHERE user_id = :user_id";
$stmt = $pdo->prepare($query);
$stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
$stmt->execute();
$total_expenses = $stmt->fetch(PDO::FETCH_ASSOC)['total_expenses'] ?? 0;

// Fetch total income
$query = "SELECT SUM(amount) as total_income FROM income WHERE user_id = :user_id";
$stmt = $pdo->prepare($query);
$stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
$stmt->execute();
$total_income = $stmt->fetch(PDO::FETCH_ASSOC)['total_income'] ?? 0;



// Calculate balance
$balance = $total_income - $total_expenses;

// Get chart data for expenses by category
$query = "SELECT 
    c.category_name,
    SUM(e.amount) as total_amount 
FROM expenses e
JOIN categories c ON e.category_id = c.category_id
WHERE e.user_id = :user_id 
AND c.type = 'expense'
AND (c.user_id = :user_id OR c.is_default = 1)
GROUP BY c.category_name";
$stmt = $pdo->prepare($query);
$stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
$stmt->execute();
$expense_categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Get monthly data for overall financial overview
$query = "SELECT 
    DATE_FORMAT(expense_date, '%Y-%m') as month,
    SUM(amount) as total_expenses
FROM expenses 
WHERE user_id = :user_id 
GROUP BY DATE_FORMAT(expense_date, '%Y-%m')
ORDER BY month DESC
LIMIT 6";
$stmt = $pdo->prepare($query);
$stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
$stmt->execute();
$monthly_expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Get income sources data
$query = "SELECT 
    c.category_name as source,
    SUM(i.amount) as total_amount 
FROM income i
JOIN categories c ON i.category_id = c.category_id
WHERE i.user_id = :user_id 
AND c.type = 'income'
AND (c.user_id = :user_id OR c.is_default = 1)
GROUP BY c.category_name";
$stmt = $pdo->prepare($query);
$stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
$stmt->execute();
$income_sources = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Prepare data for JavaScript
$chartData = [
    'expenseCategories' => $expense_categories,
    'monthlyExpenses' => $monthly_expenses,
    'incomeSources' => $income_sources
];



// Fetch recent expenses

$query = "SELECT * FROM expenses WHERE user_id = :user_id ORDER BY expense_date DESC LIMIT 5";
$stmt = $pdo->prepare($query);
$stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
$stmt->execute();
$recent_expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - ExpenseFlow</title>
    <link rel="icon" type="image/svg+xml" href="pictures/favicon-updated.svg">
    <link rel="alternate icon" type="image/x-icon" href="pictures/favicon-new.ico">
    <link rel="stylesheet" href="dashboard.css">
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="dashboard.js" defer></script>
</head>
<body>
    <div id="particles-js"></div>
    <div class="theme-switch" id="themeToggle">🌙</div>
    <div class="onboarding-container">
        <h1>Welcome, <?php echo htmlspecialchars($full_name); ?>!</h1>
        <p>Here’s an overview of your financial activity.</p>
        

  <!-- Income Notification -->
    <div id="income-notification">
        <span>Do you want to add some income to your account? </span>
        <a href="add-income.html" style="text-decoration: none;">
            <button id="add-income-btn" class="btn-small">Add Income</button>
        </a>
    </div>


        <!-- Horizontal Scroll Section -->
        <div class="onboarding-steps">
            <div class="step">
                <div class="step-icon">📈</div>
                <h3>Total Income</h3>
                <p>$<?php echo number_format($total_income, 2); ?></p>
            </div>
            <div class="step">
                <div class="step-icon">📉</div>
                <h3>Total Expenses</h3>
                <p>$<?php echo number_format($total_expenses, 2); ?></p>
            </div>
            <div class="step">
                <div class="step-icon">💰</div>
                <h3>Balance</h3>
                <p>$<?php echo number_format($balance, 2); ?></p>
            </div>
        </div>

        <section class="charts">
    <h2>Financial Insights</h2>

    <!-- Dashboard Chart -->
    <div class="chart-container">
        <h3>Overall Financial Overview</h3>
        <div id="dashboardChart"></div>
    </div>

    <!-- Expense Chart -->
    <div class="chart-container">
        <h3>Expenses by Category</h3>
        <div id="expenseChart"></div>
    </div>

    <!-- Income Chart -->
    <div class="chart-container">
        <h3>Income Sources</h3>
        <div id="incomeChart"></div>
    </div>
</section>

        <!-- Navigation Links -->
        <nav class="dashboard-nav">
            <a href="add_expense.html">Add Expense</a>
            <a href="reports.html">View Reports</a>
            <a href="preferences.html">Manage Preferences</a>
            <a href="logout.php" class="logout-btn">Logout</a>
        </nav>
    </div>
    <div class="logout-message" id="logoutMessage"></div>
    <script src="dashboard-charts.js"></script>


    <script>
// Parse PHP data
const chartData = <?php echo json_encode($chartData); ?>;

// Dashboard Chart (Area Chart)
// Dashboard Chart (Area Chart)
const dashboardOptions = {
    series: [{
        name: 'Monthly Expenses',
        data: chartData.monthlyExpenses.map(item => ({
            x: item.month,
            y: parseFloat(item.total_expenses)
        })).reverse()
    }],
    chart: {
        type: 'area',
        height: 350,
        toolbar: {
            show: true
        }
    },
    title: {
        text: 'Monthly Expense Trends',
        align: 'center'
    },
    dataLabels: {
        enabled: true,
        formatter: function(value) {
            return '$' + value.toLocaleString();
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
                fontSize: '14px'
            }
        }
    },
    yaxis: {
        title: {
            text: 'Amount ($)',
            style: {
                fontSize: '14px'
            }
        },
        labels: {
            formatter: function(value) {
                return '$' + value.toLocaleString();
            }
        }
    },
    tooltip: {
        y: {
            formatter: function(value) {
                return '$' + value.toLocaleString();
            }
        }
    },
    theme: {
        palette: 'palette1'
    }
};

// Expense Chart (Donut)
const expenseOptions = {
    series: chartData.expenseCategories.map(item => parseFloat(item.total_amount)),
    chart: {
        type: 'donut',
        height: 350
    },
    title: {
        text: 'Expense Distribution by Category',
        align: 'center'
    },
    labels: chartData.expenseCategories.map(item => item.category_name),
    dataLabels: {
        enabled: true,
        formatter: function (val, opts) {
            return opts.w.config.labels[opts.seriesIndex] + ' - ' + val.toFixed(1) + '%';
        }
    },
    responsive: [{
        breakpoint: 480,
        options: {
            chart: {
                width: 300
            },
            legend: {
                position: 'bottom',
                fontSize: '14px',
                labels: {
                    colors: undefined,
                    useSeriesColors: false
                },
                markers: {
                    width: 12,
                    height: 12,
                    strokeWidth: 0,
                    strokeColor: '#fff',
                    radius: 12
                },
            }
        }
    }],
    tooltip: {
        y: {
            formatter: function(value) {
                return '$' + value.toLocaleString();
            }
        }
    },
    plotOptions: {
        pie: {
            donut: {
                labels: {
                    show: true,
                    name: {
                        show: true,
                        fontSize: '14px'
                    },
                    value: {
                        show: true,
                        fontSize: '14px',
                        formatter: function(val) {
                            return '$' + val.toLocaleString();
                        }
                    },
                    total: {
                        show: true,
                        label: 'Total Expenses',
                        fontSize: '14px',
                        formatter: function(w) {
                            const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                            return '$' + total.toLocaleString();
                        }
                    }
                }
            }
        }
    }
};

// Income Chart (Bar)
const incomeOptions = {
    series: [{
        name: 'Income',
        data: chartData.incomeSources.map(item => parseFloat(item.total_amount))
    }],
    chart: {
        type: 'bar',
        height: 350,
        toolbar: {
            show: true
        }
    },
    title: {
        text: 'Income Sources',
        align: 'center'
    },
    plotOptions: {
        bar: {
            borderRadius: 4,
            horizontal: true,
            dataLabels: {
                position: 'center',
            },
        }
    },
    dataLabels: {
        enabled: true,
        formatter: function(value) {
            return '$' + value.toLocaleString();
        },
        style: {
            fontSize: '12px',
            colors: ['#fff']
        }
    },
    xaxis: {
        categories: chartData.incomeSources.map(item => item.source),
        title: {
            text: 'Amount ($)',
            style: {
                fontSize: '14px'
            }
        },
        labels: {
            formatter: function(value) {
                return '$' + parseFloat(value).toLocaleString();
            }
        }
    },
    yaxis: {
        title: {
            text: 'Source',
            style: {
                fontSize: '14px'
            }
        }
    },
    tooltip: {
        y: {
            formatter: function(value) {
                return '$' + value.toLocaleString();
            }
        }
    },
    theme: {
        palette: 'palette1'
    }
};
document.addEventListener('DOMContentLoaded', function() {
    <?php
    session_start();
    if(isset($_SESSION['logout_message'])) {
        echo "document.getElementById('logoutMessage').textContent = '" . htmlspecialchars($_SESSION['logout_message']) . "';";
        echo "document.getElementById('logoutMessage').style.display = 'block';";
        unset($_SESSION['logout_message']);
    }
    ?>
});

const incomeChart = new ApexCharts(document.querySelector("#incomeChart"), incomeOptions);
incomeChart.render();
</script>

</body>
</html>
