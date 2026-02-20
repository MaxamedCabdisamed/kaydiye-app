// FinanceFlow - Personal Finance Manager
// Main Application JavaScript

// Application Configuration
const CONFIG = {
    categories: {
        income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gifts', 'Other Income'],
        expense: ['Food & Dining', 'Transportation', 'Entertainment', 'Shopping', 'Bills & Utilities', 
                 'Healthcare', 'Education', 'Housing', 'Personal Care', 'Travel', 'Other']
    },
    colors: {
        primary: '#4361ee',
        success: '#06d6a0',
        danger: '#ef476f',
        warning: '#ffd166',
        info: '#118ab2'
    }
};

// Application State
let appState = {
    currentUser: null,
    transactions: [],
    budgets: [],
    savings: [],
    categories: [],
    currentTab: 'dashboard',
    charts: {
        incomeExpense: null,
        expenseCategory: null
    }
};

// Authentication System
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('finance_users')) || [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkSession();
    }

    setupEventListeners() {
        // Tab switching
        document.getElementById('login-tab').addEventListener('click', () => this.switchAuthTab('login'));
        document.getElementById('register-tab').addEventListener('click', () => this.switchAuthTab('register'));
        document.getElementById('switch-to-register').addEventListener('click', () => this.switchAuthTab('register'));
        document.getElementById('switch-to-login').addEventListener('click', () => this.switchAuthTab('login'));

        // Form submissions
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogout();
        });
    }

    checkSession() {
        const session = sessionStorage.getItem('finance_session');
        if (session) {
            const user = JSON.parse(session);
            this.setCurrentUser(user);
            this.showApp();
        } else {
            this.showAuth();
        }
    }

    switchAuthTab(tab) {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        this.clearAuthErrors();

        if (tab === 'login') {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        } else {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        }
    }

    clearAuthErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });
    }

    showAuthError(elementId, message) {
        const errorEl = document.getElementById(elementId);
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }

    handleLogin() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        this.clearAuthErrors();

        if (!username) {
            this.showAuthError('login-username-error', 'Username is required');
            return;
        }

        if (!password) {
            this.showAuthError('login-password-error', 'Password is required');
            return;
        }

        const user = this.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            this.setCurrentUser(user);
            sessionStorage.setItem('finance_session', JSON.stringify(user));
            this.showApp();
            this.showNotification('Login successful!', 'success');
        } else {
            this.showAuthError('login-password-error', 'Invalid username or password');
        }
    }

    handleRegister() {
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        this.clearAuthErrors();

        // Validation
        if (!username) {
            this.showAuthError('register-username-error', 'Username is required');
            return;
        }

        if (username.length < 3) {
            this.showAuthError('register-username-error', 'Username must be at least 3 characters');
            return;
        }

        if (!password) {
            this.showAuthError('register-password-error', 'Password is required');
            return;
        }

        if (password.length < 6) {
            this.showAuthError('register-password-error', 'Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            this.showAuthError('confirm-password-error', 'Passwords do not match');
            return;
        }

        // Check if username exists
        if (this.users.some(u => u.username === username)) {
            this.showAuthError('register-username-error', 'Username already exists');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            username: username,
            password: password,
            email: `${username}@example.com`,
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        localStorage.setItem('finance_users', JSON.stringify(this.users));

        // Auto login
        this.setCurrentUser(newUser);
        sessionStorage.setItem('finance_session', JSON.stringify(newUser));
        this.showApp();
        
        this.showNotification('Account created successfully!', 'success');
    }

    handleLogout() {
        appState.currentUser = null;
        sessionStorage.removeItem('finance_session');
        this.showAuth();
        this.showNotification('Logged out successfully!', 'info');
    }

    setCurrentUser(user) {
        appState.currentUser = user;
        document.getElementById('currentUsername').textContent = user.username;
        document.getElementById('userEmail').textContent = user.email;
    }

    showAuth() {
        document.getElementById('authContainer').style.display = 'flex';
        document.getElementById('appContainer').style.display = 'none';
        
        // Clear form fields
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('register-username').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('confirm-password').value = '';
        this.clearAuthErrors();
    }

    showApp() {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('appContainer').style.display = 'flex';
        
        // Initialize app for user
        AppManager.initUserApp();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Add close event
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Main Application Manager
class AppManager {
    static init() {
        this.setupEventListeners();
        this.updateCurrentDate();
        this.loadCategories();
    }

    static initUserApp() {
        this.loadUserData();
        this.setupNavigation();
        this.loadDashboard();
    }

    static setupEventListeners() {
        // Sidebar toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('show');
        });

        // Add transaction button
        document.getElementById('addTransactionBtn').addEventListener('click', () => {
            this.openTransactionModal();
        });

        // View all transactions
        document.querySelectorAll('.view-all').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.target.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        // Filter controls
        document.getElementById('transactionTypeFilter').addEventListener('change', () => {
            this.loadTransactions();
        });

        document.getElementById('transactionMonthFilter').addEventListener('change', () => {
            this.loadTransactions();
        });

        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearTransactionFilters();
        });

        // Chart period
        document.getElementById('chartPeriod').addEventListener('change', () => {
            this.loadDashboardCharts();
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Close modal on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });

        // Save transaction
        document.getElementById('saveTransaction').addEventListener('click', () => {
            this.saveTransaction();
        });

        // Save budget
        document.getElementById('saveBudget').addEventListener('click', () => {
            this.saveBudget();
        });

        // Save savings
        document.getElementById('saveSavings').addEventListener('click', () => {
            this.saveSavingsGoal();
        });

        // Add budget button
        document.getElementById('addBudgetBtn').addEventListener('click', () => {
            this.openBudgetModal();
        });

        // Add savings button
        document.getElementById('addSavingsBtn').addEventListener('click', () => {
            this.openSavingsModal();
        });

        // Report generation
        document.getElementById('generateReportBtn').addEventListener('click', () => {
            this.generateReport();
        });

        // Export buttons
        document.getElementById('exportPdfBtn').addEventListener('click', () => {
            this.exportToPDF();
        });

        document.getElementById('exportExcelBtn').addEventListener('click', () => {
            this.exportToExcel();
        });
    }

    static setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item[data-tab]');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });
    }

    static switchTab(tab) {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelector(`.nav-item[data-tab="${tab}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.getElementById(`${tab}Tab`).classList.add('active');
        
        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        const currentPage = document.getElementById('currentPage');
        
        const tabNames = {
            dashboard: 'Dashboard',
            transactions: 'Transactions',
            budgets: 'Budgets',
            savings: 'Savings Goals',
            reports: 'Reports'
        };
        
        pageTitle.innerHTML = `<i class="fas fa-${this.getTabIcon(tab)}"></i> ${tabNames[tab]}`;
        currentPage.textContent = tabNames[tab];
        
        // Load tab data
        appState.currentTab = tab;
        
        switch(tab) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'transactions':
                this.loadTransactions();
                break;
            case 'budgets':
                this.loadBudgets();
                break;
            case 'savings':
                this.loadSavings();
                break;
            case 'reports':
                this.setupReportDates();
                break;
        }
        
        // Close sidebar on mobile
        if (window.innerWidth <= 992) {
            document.getElementById('sidebar').classList.remove('show');
        }
    }

    static getTabIcon(tab) {
        const icons = {
            dashboard: 'tachometer-alt',
            transactions: 'exchange-alt',
            budgets: 'chart-pie',
            savings: 'piggy-bank',
            reports: 'file-alt'
        };
        return icons[tab] || 'chart-line';
    }

    static updateCurrentDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
    }

    static loadCategories() {
        appState.categories = [...CONFIG.categories.income, ...CONFIG.categories.expense];
    }

    static loadUserData() {
        if (!appState.currentUser) return;
        
        const userId = appState.currentUser.id;
        
        // Load transactions
        appState.transactions = JSON.parse(localStorage.getItem(`finance_transactions_${userId}`)) || [];
        
        // Load budgets
        appState.budgets = JSON.parse(localStorage.getItem(`finance_budgets_${userId}`)) || [];
        
        // Load savings
        appState.savings = JSON.parse(localStorage.getItem(`finance_savings_${userId}`)) || [];
        
        // Initialize sample data if empty
        if (appState.transactions.length === 0 && 
            appState.budgets.length === 0 && 
            appState.savings.length === 0) {
            this.initializeSampleData();
        }
    }

    static saveUserData() {
        if (!appState.currentUser) return;
        
        const userId = appState.currentUser.id;
        
        localStorage.setItem(`finance_transactions_${userId}`, JSON.stringify(appState.transactions));
        localStorage.setItem(`finance_budgets_${userId}`, JSON.stringify(appState.budgets));
        localStorage.setItem(`finance_savings_${userId}`, JSON.stringify(appState.savings));
    }

    static initializeSampleData() {
        // Sample transactions
        const sampleTransactions = [
            {
                id: '1',
                type: 'income',
                title: 'Monthly Salary',
                amount: 3500,
                category: 'Salary',
                date: new Date().toISOString().split('T')[0],
                description: 'Monthly salary from work',
                recurring: 'monthly'
            },
            {
                id: '2',
                type: 'income',
                title: 'Freelance Project',
                amount: 800,
                category: 'Freelance',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                description: 'Website development project',
                recurring: 'none'
            },
            {
                id: '3',
                type: 'expense',
                title: 'Grocery Shopping',
                amount: 120.50,
                category: 'Food & Dining',
                date: new Date().toISOString().split('T')[0],
                description: 'Weekly groceries',
                recurring: 'weekly'
            },
            {
                id: '4',
                type: 'expense',
                title: 'Electricity Bill',
                amount: 85.30,
                category: 'Bills & Utilities',
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                description: 'Monthly electricity bill',
                recurring: 'monthly'
            },
            {
                id: '5',
                type: 'expense',
                title: 'Gas Refill',
                amount: 45.00,
                category: 'Transportation',
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                description: 'Car fuel',
                recurring: 'none'
            }
        ];
        
        // Sample budgets
        const now = new Date();
        const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        
        const sampleBudgets = [
            {
                id: 'b1',
                category: 'Food & Dining',
                amount: 500,
                month: currentMonth,
                color: '#06d6a0'
            },
            {
                id: 'b2',
                category: 'Transportation',
                amount: 200,
                month: currentMonth,
                color: '#4361ee'
            },
            {
                id: 'b3',
                category: 'Entertainment',
                amount: 150,
                month: currentMonth,
                color: '#ffd166'
            },
            {
                id: 'b4',
                category: 'Bills & Utilities',
                amount: 300,
                month: currentMonth,
                color: '#ef476f'
            }
        ];
        
        // Sample savings goals
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 6);
        
        const sampleSavings = [
            {
                id: 's1',
                name: 'Emergency Fund',
                targetAmount: 5000,
                currentAmount: 2300,
                targetDate: futureDate.toISOString().split('T')[0],
                monthlyContribution: 300
            },
            {
                id: 's2',
                name: 'New Laptop',
                targetAmount: 1200,
                currentAmount: 800,
                targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                monthlyContribution: 100
            }
        ];
        
        appState.transactions = sampleTransactions;
        appState.budgets = sampleBudgets;
        appState.savings = sampleSavings;
        
        this.saveUserData();
    }

    // Dashboard Methods
    static loadDashboard() {
        this.updateSummaryCards();
        this.loadDashboardCharts();
        this.loadRecentTransactions();
    }

    static updateSummaryCards() {
        // Calculate totals
        const totalIncome = appState.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpense = appState.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const balance = totalIncome - totalExpense;
        
        // Calculate savings progress
        const totalSavingsTarget = appState.savings.reduce((sum, s) => sum + s.targetAmount, 0);
        const totalSavingsCurrent = appState.savings.reduce((sum, s) => sum + s.currentAmount, 0);
        const savingsProgress = totalSavingsTarget > 0 ? (totalSavingsCurrent / totalSavingsTarget) * 100 : 0;
        
        // Update DOM
        document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
        document.getElementById('totalExpense').textContent = `$${totalExpense.toFixed(2)}`;
        document.getElementById('currentBalance').textContent = `$${balance.toFixed(2)}`;
        document.getElementById('savingsProgress').textContent = `${savingsProgress.toFixed(1)}%`;
        document.getElementById('sidebarBalance').textContent = `$${balance.toFixed(2)}`;
    }

    static loadDashboardCharts() {
        const period = document.getElementById('chartPeriod').value;
        this.renderIncomeExpenseChart(period);
        this.renderExpenseCategoryChart();
    }

    static renderIncomeExpenseChart(period) {
        const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
        
        // Destroy existing chart
        if (appState.charts.incomeExpense) {
            appState.charts.incomeExpense.destroy();
        }
        
        // Filter transactions by period
        let filteredTransactions = [...appState.transactions];
        const now = new Date();
        
        if (period === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= weekAgo);
        } else if (period === 'month') {
            const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
            filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= monthAgo);
        } else if (period === 'year') {
            const yearAgo = new Date(now.getFullYear(), 0, 1);
            filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= yearAgo);
        }
        
        // Group by date
        const transactionsByDate = {};
        filteredTransactions.forEach(transaction => {
            const date = new Date(transaction.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
            
            if (!transactionsByDate[date]) {
                transactionsByDate[date] = { income: 0, expense: 0 };
            }
            
            if (transaction.type === 'income') {
                transactionsByDate[date].income += transaction.amount;
            } else {
                transactionsByDate[date].expense += transaction.amount;
            }
        });
        
        const dates = Object.keys(transactionsByDate);
        const incomeData = dates.map(date => transactionsByDate[date].income);
        const expenseData = dates.map(date => transactionsByDate[date].expense);
        
        appState.charts.incomeExpense = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        backgroundColor: CONFIG.colors.success + '80',
                        borderColor: CONFIG.colors.success,
                        borderWidth: 1
                    },
                    {
                        label: 'Expense',
                        data: expenseData,
                        backgroundColor: CONFIG.colors.danger + '80',
                        borderColor: CONFIG.colors.danger,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    static renderExpenseCategoryChart() {
        const ctx = document.getElementById('expenseCategoryChart').getContext('2d');
        
        // Destroy existing chart
        if (appState.charts.expenseCategory) {
            appState.charts.expenseCategory.destroy();
        }
        
        // Get expense transactions
        const expenseTransactions = appState.transactions.filter(t => t.type === 'expense');
        
        // Group by category
        const expensesByCategory = {};
        expenseTransactions.forEach(transaction => {
            if (!expensesByCategory[transaction.category]) {
                expensesByCategory[transaction.category] = 0;
            }
            expensesByCategory[transaction.category] += transaction.amount;
        });
        
        const categories = Object.keys(expensesByCategory);
        const amounts = Object.values(expensesByCategory);
        
        // Generate colors
        const colors = categories.map((_, index) => {
            const hue = (index * 137.508) % 360; // Golden angle approximation
            return `hsl(${hue}, 70%, 65%)`;
        });
        
        appState.charts.expenseCategory = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }

    static loadRecentTransactions() {
        const tbody = document.querySelector('#recentTransactionsTable tbody');
        tbody.innerHTML = '';
        
        // Get recent transactions (last 5)
        const recentTransactions = [...appState.transactions]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        if (recentTransactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 30px; color: #6c757d;">
                        No transactions yet. Add your first transaction!
                    </td>
                </tr>
            `;
            return;
        }
        
        recentTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${transaction.title}</td>
                <td>${transaction.category}</td>
                <td>
                    <span class="badge ${transaction.type === 'income' ? 'badge-success' : 'badge-danger'}">
                        ${transaction.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                </td>
                <td class="${transaction.type === 'income' ? 'text-success' : 'text-danger'}">
                    ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Transactions Methods
    static loadTransactions() {
        const tbody = document.querySelector('#transactionsTable tbody');
        tbody.innerHTML = '';
        
        // Get filters
        const typeFilter = document.getElementById('transactionTypeFilter').value;
        const monthFilter = document.getElementById('transactionMonthFilter').value;
        
        // Filter transactions
        let filteredTransactions = [...appState.transactions];
        
        if (typeFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
        }
        
        if (monthFilter) {
            filteredTransactions = filteredTransactions.filter(t => {
                const transactionDate = new Date(t.date);
                const transactionMonth = transactionDate.getFullYear() + '-' + 
                    String(transactionDate.getMonth() + 1).padStart(2, '0');
                return transactionMonth === monthFilter;
            });
        }
        
        // Sort by date (newest first)
        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (filteredTransactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #6c757d;">
                        <i class="fas fa-exchange-alt" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5; display: block;"></i>
                        <p>No transactions found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        filteredTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${transaction.title}</td>
                <td>${transaction.category}</td>
                <td>
                    <span class="badge ${transaction.type === 'income' ? 'badge-success' : 'badge-danger'}">
                        ${transaction.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                </td>
                <td class="${transaction.type === 'income' ? 'text-success' : 'text-danger'}">
                    ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" data-id="${transaction.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" data-id="${transaction.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Add event listeners to action buttons
        this.setupTransactionActions();
    }

    static clearTransactionFilters() {
        document.getElementById('transactionTypeFilter').value = 'all';
        document.getElementById('transactionMonthFilter').value = '';
        this.loadTransactions();
    }

    static setupTransactionActions() {
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const transactionId = e.target.closest('button').getAttribute('data-id');
                this.editTransaction(transactionId);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const transactionId = e.target.closest('button').getAttribute('data-id');
                this.deleteTransaction(transactionId);
            });
        });
    }

    // Budgets Methods
    static loadBudgets() {
        const budgetsGrid = document.querySelector('.budgets-grid');
        const progressBars = document.querySelector('.progress-bars');
        
        budgetsGrid.innerHTML = '';
        progressBars.innerHTML = '';
        
        if (appState.budgets.length === 0) {
            budgetsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-pie"></i>
                    <p>No budgets set for this month</p>
                </div>
            `;
            return;
        }
        
        const now = new Date();
        const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        const currentBudgets = appState.budgets.filter(b => b.month === currentMonth);
        
        // Calculate expenses for each category this month
        const currentMonthExpenses = appState.transactions
            .filter(t => t.type === 'expense')
            .filter(t => {
                const transactionDate = new Date(t.date);
                const transactionMonth = transactionDate.getFullYear() + '-' + 
                    String(transactionDate.getMonth() + 1).padStart(2, '0');
                return transactionMonth === currentMonth;
            });
        
        const expensesByCategory = {};
        currentMonthExpenses.forEach(expense => {
            if (!expensesByCategory[expense.category]) {
                expensesByCategory[expense.category] = 0;
            }
            expensesByCategory[expense.category] += expense.amount;
        });
        
        // Create budget cards
        currentBudgets.forEach(budget => {
            const spent = expensesByCategory[budget.category] || 0;
            const remaining = budget.amount - spent;
            const percentage = Math.min((spent / budget.amount) * 100, 100);
            
            const budgetCard = document.createElement('div');
            budgetCard.className = 'budget-card';
            budgetCard.style.borderLeftColor = budget.color;
            
            budgetCard.innerHTML = `
                <h4>${budget.category}</h4>
                <div class="progress-bar">
                    <div class="progress" style="width: ${percentage}%; background: ${budget.color};"></div>
                </div>
                <div class="budget-info">
                    <span>$${spent.toFixed(2)} / $${budget.amount.toFixed(2)}</span>
                    <span style="color: ${remaining >= 0 ? CONFIG.colors.success : CONFIG.colors.danger}">
                        ${remaining >= 0 ? `$${remaining.toFixed(2)} left` : `$${Math.abs(remaining).toFixed(2)} over`}
                    </span>
                </div>
                <div class="action-buttons" style="margin-top: 15px;">
                    <button class="action-btn edit-btn" data-id="${budget.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" data-id="${budget.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            budgetsGrid.appendChild(budgetCard);
            
            // Add progress bar to overview
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-item';
            progressBar.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>${budget.category}</span>
                    <span>${percentage.toFixed(1)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${percentage}%; background: ${budget.color};"></div>
                </div>
            `;
            progressBars.appendChild(progressBar);
        });
        
        // Add event listeners
        this.setupBudgetActions();
    }

    static setupBudgetActions() {
        // Edit budget buttons
        document.querySelectorAll('.budgets-grid .edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const budgetId = e.target.closest('button').getAttribute('data-id');
                this.editBudget(budgetId);
            });
        });
        
        // Delete budget buttons
        document.querySelectorAll('.budgets-grid .delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const budgetId = e.target.closest('button').getAttribute('data-id');
                this.deleteBudget(budgetId);
            });
        });
    }

    // Savings Methods
    static loadSavings() {
        const savingsGrid = document.querySelector('.savings-grid');
        savingsGrid.innerHTML = '';
        
        if (appState.savings.length === 0) {
            savingsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-piggy-bank"></i>
                    <p>No savings goals set yet</p>
                </div>
            `;
            return;
        }
        
        appState.savings.forEach(saving => {
            const percentage = (saving.currentAmount / saving.targetAmount) * 100;
            const remaining = saving.targetAmount - saving.currentAmount;
            const targetDate = new Date(saving.targetDate);
            const today = new Date();
            const daysLeft = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
            
            const savingsCard = document.createElement('div');
            savingsCard.className = 'savings-card';
            
            savingsCard.innerHTML = `
                <h4>${saving.name}</h4>
                <div class="savings-progress">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${percentage}%; background: ${CONFIG.colors.warning};"></div>
                    </div>
                </div>
                <div class="savings-info">
                    <div>
                        <span>Current:</span>
                        <span>$${saving.currentAmount.toFixed(2)}</span>
                    </div>
                    <div>
                        <span>Target:</span>
                        <span>$${saving.targetAmount.toFixed(2)}</span>
                    </div>
                    <div>
                        <span>Remaining:</span>
                        <span>$${remaining.toFixed(2)}</span>
                    </div>
                    <div>
                        <span>Time left:</span>
                        <span>${daysLeft > 0 ? `${daysLeft} days` : 'Completed'}</span>
                    </div>
                </div>
                <div class="action-buttons" style="margin-top: 15px;">
                    <button class="action-btn edit-btn" data-id="${saving.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" data-id="${saving.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            savingsGrid.appendChild(savingsCard);
        });
        
        // Add event listeners
        this.setupSavingsActions();
    }

    static setupSavingsActions() {
        // Edit savings buttons
        document.querySelectorAll('.savings-grid .edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const savingsId = e.target.closest('button').getAttribute('data-id');
                this.editSavings(savingsId);
            });
        });
        
        // Delete savings buttons
        document.querySelectorAll('.savings-grid .delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const savingsId = e.target.closest('button').getAttribute('data-id');
                this.deleteSavings(savingsId);
            });
        });
    }

    // Reports Methods
    static setupReportDates() {
        const now = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        document.getElementById('reportStartDate').value = startDate.toISOString().split('T')[0];
        document.getElementById('reportEndDate').value = now.toISOString().split('T')[0];
    }

    static generateReport() {
        const startDate = document.getElementById('reportStartDate').value;
        const endDate = document.getElementById('reportEndDate').value;
        
        if (!startDate || !endDate) {
            this.showNotification('Please select date range', 'error');
            return;
        }
        
        const filteredTransactions = appState.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            
            return transactionDate >= start && transactionDate <= end;
        });
        
        // Calculate totals
        const totalIncome = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpense = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const netBalance = totalIncome - totalExpense;
        
        // Update summary
        document.getElementById('reportTotalIncome').textContent = `$${totalIncome.toFixed(2)}`;
        document.getElementById('reportTotalExpense').textContent = `$${totalExpense.toFixed(2)}`;
        document.getElementById('reportNetBalance').textContent = `$${netBalance.toFixed(2)}`;
        document.getElementById('reportTransactionCount').textContent = filteredTransactions.length;
        document.getElementById('reportItemsCount').textContent = `${filteredTransactions.length} transactions`;
        
        // Update table
        const tbody = document.querySelector('#reportTable tbody');
        tbody.innerHTML = '';
        
        if (filteredTransactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: #6c757d;">
                        <i class="fas fa-chart-bar" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5; display: block;"></i>
                        <p>No transactions found for the selected date range.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Sort by date (newest first)
        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        filteredTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>
                    <span class="badge ${transaction.type === 'income' ? 'badge-success' : 'badge-danger'}">
                        ${transaction.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                </td>
                <td>${transaction.title}</td>
                <td>${transaction.category}</td>
                <td class="${transaction.type === 'income' ? 'text-success' : 'text-danger'}">
                    ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                </td>
            `;
            tbody.appendChild(row);
        });
        
        this.showNotification(`Report generated: ${filteredTransactions.length} transactions found`, 'success');
    }

    static exportToPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Get report data
        const startDate = document.getElementById('reportStartDate').value;
        const endDate = document.getElementById('reportEndDate').value;
        const totalIncome = document.getElementById('reportTotalIncome').textContent;
        const totalExpense = document.getElementById('reportTotalExpense').textContent;
        const netBalance = document.getElementById('reportNetBalance').textContent;
        
        // Title
        doc.setFontSize(20);
        doc.text('FinanceFlow Report', 105, 20, { align: 'center' });
        
        // Date range
        doc.setFontSize(12);
        doc.text(`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`, 105, 30, { align: 'center' });
        
        // Summary
        doc.setFontSize(14);
        doc.text('Financial Summary', 20, 50);
        
        doc.setFontSize(12);
        doc.text(`Total Income: ${totalIncome}`, 20, 60);
        doc.text(`Total Expenses: ${totalExpense}`, 20, 70);
        doc.text(`Net Balance: ${netBalance}`, 20, 80);
        
        // Save the PDF
        doc.save(`FinanceFlow_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        
        this.showNotification('PDF exported successfully!', 'success');
    }

    static exportToExcel() {
        const startDate = document.getElementById('reportStartDate').value;
        const endDate = document.getElementById('reportEndDate').value;
        
        // Get filtered transactions
        const filteredTransactions = appState.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            
            return transactionDate >= start && transactionDate <= end;
        });
        
        if (filteredTransactions.length === 0) {
            this.showNotification('No data to export', 'error');
            return;
        }
        
        // Prepare data for Excel
        const excelData = filteredTransactions.map(transaction => ({
            'Date': new Date(transaction.date).toLocaleDateString(),
            'Type': transaction.type === 'income' ? 'Income' : 'Expense',
            'Title': transaction.title,
            'Category': transaction.category,
            'Amount': transaction.amount,
            'Description': transaction.description || ''
        }));
        
        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
        
        // Generate Excel file
        XLSX.writeFile(wb, `FinanceFlow_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
        
        this.showNotification('Excel file exported successfully!', 'success');
    }

    // Modal Methods
    static openTransactionModal(transactionId = null) {
        const modal = document.getElementById('transactionModal');
        const title = document.getElementById('modalTitle');
        
        // Populate category select
        const categorySelect = document.getElementById('transactionCategory');
        categorySelect.innerHTML = '';
        
        // Add income categories
        const incomeGroup = document.createElement('optgroup');
        incomeGroup.label = 'Income';
        CONFIG.categories.income.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            incomeGroup.appendChild(option);
        });
        
        // Add expense categories
        const expenseGroup = document.createElement('optgroup');
        expenseGroup.label = 'Expenses';
        CONFIG.categories.expense.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            expenseGroup.appendChild(option);
        });
        
        categorySelect.appendChild(incomeGroup);
        categorySelect.appendChild(expenseGroup);
        
        if (transactionId) {
            // Edit mode
            title.textContent = 'Edit Transaction';
            const transaction = appState.transactions.find(t => t.id === transactionId);
            
            if (transaction) {
                document.getElementById('transactionId').value = transaction.id;
                document.querySelector(`input[name="type"][value="${transaction.type}"]`).checked = true;
                document.getElementById('transactionTitle').value = transaction.title;
                document.getElementById('transactionAmount').value = transaction.amount;
                document.getElementById('transactionCategory').value = transaction.category;
                document.getElementById('transactionDate').value = transaction.date;
                document.getElementById('transactionRecurring').value = transaction.recurring || 'none';
                document.getElementById('transactionDescription').value = transaction.description || '';
            }
        } else {
            // Add mode
            title.textContent = 'Add Transaction';
            document.getElementById('transactionForm').reset();
            document.getElementById('transactionId').value = '';
            document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
        }
        
        modal.classList.add('show');
    }

    static openBudgetModal(budgetId = null) {
        const modal = document.getElementById('budgetModal');
        const title = document.getElementById('budgetModalTitle');
        
        // Populate category select
        const categorySelect = document.getElementById('budgetCategory');
        categorySelect.innerHTML = '';
        
        CONFIG.categories.expense.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
        
        if (budgetId) {
            // Edit mode
            title.textContent = 'Edit Budget';
            const budget = appState.budgets.find(b => b.id === budgetId);
            
            if (budget) {
                document.getElementById('budgetId').value = budget.id;
                document.getElementById('budgetCategory').value = budget.category;
                document.getElementById('budgetAmount').value = budget.amount;
                document.getElementById('budgetColor').value = budget.color || CONFIG.colors.primary;
            }
        } else {
            // Add mode
            title.textContent = 'Add Budget';
            document.getElementById('budgetForm').reset();
            document.getElementById('budgetId').value = '';
            document.getElementById('budgetColor').value = CONFIG.colors.primary;
        }
        
        modal.classList.add('show');
    }

    static openSavingsModal(savingsId = null) {
        const modal = document.getElementById('savingsModal');
        const title = document.getElementById('savingsModalTitle');
        
        if (savingsId) {
            // Edit mode
            title.textContent = 'Edit Savings Goal';
            const savings = appState.savings.find(s => s.id === savingsId);
            
            if (savings) {
                document.getElementById('savingsId').value = savings.id;
                document.getElementById('savingsGoalName').value = savings.name;
                document.getElementById('savingsTargetAmount').value = savings.targetAmount;
                document.getElementById('savingsCurrentAmount').value = savings.currentAmount;
                document.getElementById('savingsTargetDate').value = savings.targetDate;
                document.getElementById('savingsMonthlyContribution').value = savings.monthlyContribution || '';
            }
        } else {
            // Add mode
            title.textContent = 'Add Savings Goal';
            document.getElementById('savingsForm').reset();
            document.getElementById('savingsId').value = '';
            
            // Set default target date to 6 months from now
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + 6);
            document.getElementById('savingsTargetDate').value = futureDate.toISOString().split('T')[0];
        }
        
        modal.classList.add('show');
    }

    static closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    // CRUD Operations
    static saveTransaction() {
        const id = document.getElementById('transactionId').value || Date.now().toString();
        const type = document.querySelector('input[name="type"]:checked').value;
        const title = document.getElementById('transactionTitle').value.trim();
        const amount = parseFloat(document.getElementById('transactionAmount').value);
        const category = document.getElementById('transactionCategory').value;
        const date = document.getElementById('transactionDate').value;
        const recurring = document.getElementById('transactionRecurring').value;
        const description = document.getElementById('transactionDescription').value.trim();
        
        // Validation
        if (!title || !amount || !category || !date) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        const transaction = {
            id,
            type,
            title,
            amount,
            category,
            date,
            recurring,
            description
        };
        
        // Check if editing or adding
        const existingIndex = appState.transactions.findIndex(t => t.id === id);
        if (existingIndex > -1) {
            appState.transactions[existingIndex] = transaction;
        } else {
            appState.transactions.push(transaction);
        }
        
        // Save to localStorage
        this.saveUserData();
        
        // Update UI
        this.updateSummaryCards();
        
        if (appState.currentTab === 'dashboard') {
            this.loadDashboardCharts();
            this.loadRecentTransactions();
        } else if (appState.currentTab === 'transactions') {
            this.loadTransactions();
        }
        
        // Close modal
        this.closeAllModals();
        
        this.showNotification(`Transaction ${existingIndex > -1 ? 'updated' : 'added'} successfully!`, 'success');
    }

    static editTransaction(id) {
        this.openTransactionModal(id);
    }

    static deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            appState.transactions = appState.transactions.filter(t => t.id !== id);
            this.saveUserData();
            this.updateSummaryCards();
            
            if (appState.currentTab === 'dashboard') {
                this.loadDashboardCharts();
                this.loadRecentTransactions();
            } else if (appState.currentTab === 'transactions') {
                this.loadTransactions();
            }
            
            this.showNotification('Transaction deleted successfully!', 'success');
        }
    }

    static saveBudget() {
        const id = document.getElementById('budgetId').value || Date.now().toString();
        const category = document.getElementById('budgetCategory').value;
        const amount = parseFloat(document.getElementById('budgetAmount').value);
        const color = document.getElementById('budgetColor').value;
        
        // Validation
        if (!category || !amount) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Get current month
        const now = new Date();
        const month = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        
        const budget = {
            id,
            category,
            amount,
            month,
            color
        };
        
        // Check if editing or adding
        const existingIndex = appState.budgets.findIndex(b => b.id === id);
        if (existingIndex > -1) {
            appState.budgets[existingIndex] = budget;
        } else {
            appState.budgets.push(budget);
        }
        
        // Save to localStorage
        this.saveUserData();
        
        // Update UI
        if (appState.currentTab === 'budgets') {
            this.loadBudgets();
        }
        
        // Close modal
        this.closeAllModals();
        
        this.showNotification(`Budget ${existingIndex > -1 ? 'updated' : 'added'} successfully!`, 'success');
    }

    static editBudget(id) {
        this.openBudgetModal(id);
    }

    static deleteBudget(id) {
        if (confirm('Are you sure you want to delete this budget?')) {
            appState.budgets = appState.budgets.filter(b => b.id !== id);
            this.saveUserData();
            
            if (appState.currentTab === 'budgets') {
                this.loadBudgets();
            }
            
            this.showNotification('Budget deleted successfully!', 'success');
        }
    }

    static saveSavingsGoal() {
        const id = document.getElementById('savingsId').value || Date.now().toString();
        const name = document.getElementById('savingsGoalName').value.trim();
        const targetAmount = parseFloat(document.getElementById('savingsTargetAmount').value);
        const currentAmount = parseFloat(document.getElementById('savingsCurrentAmount').value);
        const targetDate = document.getElementById('savingsTargetDate').value;
        const monthlyContribution = document.getElementById('savingsMonthlyContribution').value || 0;
        
        // Validation
        if (!name || !targetAmount || !currentAmount || !targetDate) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (currentAmount > targetAmount) {
            this.showNotification('Current amount cannot exceed target amount', 'error');
            return;
        }
        
        const savings = {
            id,
            name,
            targetAmount,
            currentAmount,
            targetDate,
            monthlyContribution: parseFloat(monthlyContribution)
        };
        
        // Check if editing or adding
        const existingIndex = appState.savings.findIndex(s => s.id === id);
        if (existingIndex > -1) {
            appState.savings[existingIndex] = savings;
        } else {
            appState.savings.push(savings);
        }
        
        // Save to localStorage
        this.saveUserData();
        
        // Update UI
        if (appState.currentTab === 'savings') {
            this.loadSavings();
        }
        this.updateSummaryCards();
        
        // Close modal
        this.closeAllModals();
        
        this.showNotification(`Savings goal ${existingIndex > -1 ? 'updated' : 'added'} successfully!`, 'success');
    }

    static editSavings(id) {
        this.openSavingsModal(id);
    }

    static deleteSavings(id) {
        if (confirm('Are you sure you want to delete this savings goal?')) {
            appState.savings = appState.savings.filter(s => s.id !== id);
            this.saveUserData();
            
            if (appState.currentTab === 'savings') {
                this.loadSavings();
            }
            this.updateSummaryCards();
            
            this.showNotification('Savings goal deleted successfully!', 'success');
        }
    }

    static showNotification(message, type = 'info') {
        const auth = new AuthSystem();
        auth.showNotification(message, type);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize auth system
    const authSystem = new AuthSystem();
    
    // Initialize app manager
    AppManager.init();
});

// Helper function for badge styling
const style = document.createElement('style');
style.textContent = `
    .badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
    }
    
    .badge-success {
        background: rgba(6, 214, 160, 0.1);
        color: #06d6a0;
    }
    
    .badge-danger {
        background: rgba(239, 71, 111, 0.1);
        color: #ef476f;
    }
    
    .text-success {
        color: #06d6a0;
        font-weight: 600;
    }
    
    .text-danger {
        color: #ef476f;
        font-weight: 600;
    }
    
    .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #6c757d;
        grid-column: 1 / -1;
    }
    
    .empty-state i {
        font-size: 48px;
        margin-bottom: 15px;
        opacity: 0.5;
        display: block;
    }
`;
document.head.appendChild(style);