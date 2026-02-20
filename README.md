# kaydiye-app
# FinanceFlow - Personal Finance Manager

Personal Finance web Application
 

Concise Documentation

Project Overview
FinanceFlow is a client-side personal finance web app that helps users track income, expenses, budgets, and savings goals. All data stays in your browser - no server required.

#Core Features
 Authentication
•	Register/login with username/password
•	Session management via browser storage
•	User-specific data isolation
 Dashboard
•	Summary Cards: Total income, expenses, balance, savings progress
•	Interactive Charts: Income vs expenses (bar), expense categories (doughnut)
•	Recent Transactions: Last 5 entries quick view
 Transactions (CRUD)
•	Add/edit/delete income & expense records
•	15+ categories with type filtering
•	Date tracking & descriptions
•	Filter by type, category, month
Budgets
•	Monthly budget per category
•	Visual progress bars with color coding
•	Over-budget alerts
•	Category limits tracking
 Savings Goals
•	Multiple goal tracking
•	Progress percentages & days remaining
•	Target date & monthly contribution suggestions
 Reports
•	Custom date range reports
•	Summary statistics & transaction details
•	Export: PDF & Excel formats
 UI/UX
•	Fully responsive (mobile/tablet/desktop)
•	Sidebar navigation with icons
•	Modal forms for data entry
•	Smooth animations & notifications

 #Tech Stack
Component	Technology
Structure	HTML5
Styling	CSS3 (Flexbox/Grid)
Logic	JavaScript ES6+
Charts	Chart.js
Icons	Font Awesome
PDF Export	jsPDF
Excel Export	SheetJS (XLSX)
Storage	localStorage / sessionStorage

#File Structure text
financeflow/
├── index.html      # Main HTML
├── style.css       # All styling
├── app.js          # Complete logic
└── README.md       # Documentation

#Quick Setup
1. Download
bash
git clone https://github.com/username/financeflow.git
# OR download ZIP & extract
2. Run
Simply open index.html in any modern browser.
3. Start
•	Register → Login → Add transactions
No build tools, no dependencies, no server required.

#User Guide
First Time
1.	Click Sign Up
2.	Enter username & password (min 6 chars)
3.	Login with credentials
Add Transaction
1.	Click "Add Transaction"
2.	Choose Income/Expense
3.	Fill title, amount, category, date
4.	Save
#Create Budget
1.	Go to Budgets tab
2.	Click "Add Budget"
3.	Select category & monthly amount
4.	Save
Set Savings Goal
1.	Go to Savings tab
2.	Click "Add Goal"
3.	Enter name, target amount, current amount, target date
4.	Save
Generate Report
1.	Go to Reports tab
2.	Select date range
3.	Click "Generate Report"
4.	Export as PDF or Excel

Data Storage Options
Type	Behavior	Use Case
localStorage	Persists after browser close	Default - permanent storage
sessionStorage	Cleared when tab closes	Temporary sessions
Memory only	Lost on refresh	Testing only
To change: Replace localStorage with sessionStorage in app.js

Customization
Change Colors
Edit CSS variables in style.css:
css
:root {
    --primary: #4361ee;      /* Main color */
    --success: #06d6a0;      /* Income */
    --danger: #ef476f;        /* Expense */
}
Add Categories
Modify in app.js:
javascript
categories: {
    income: ['Salary', 'Freelance', 'Business'],
    expense: ['Food', 'Transport', 'Bills']
}

Deployment Options
Static Hosting (Free)
•	GitHub Pages: Push repo → Settings → Pages
•	Netlify: Drag & drop folder
•	Vercel: vercel CLI command
Traditional Hosting
Upload all files to public_html via FTP/cPanel
 

<img width="468" height="648" alt="image" src="https://github.com/user-attachments/assets/8aec9c5b-25e2-40f0-9dca-abbd7fba051f" />
