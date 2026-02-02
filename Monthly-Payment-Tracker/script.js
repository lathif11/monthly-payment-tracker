// Monthly Payment Tracker - JavaScript

// Constants
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];
const STORAGE_KEY = 'monthlyPaymentTracker';

// Global state
let currentYear = new Date().getFullYear();
let paymentData = {};

// DOM Elements
const yearSelector = document.getElementById('yearSelector');
const personInput = document.getElementById('personInput');
const addPersonBtn = document.getElementById('addPersonBtn');
const downloadBtn = document.getElementById('downloadBtn');
const paymentTable = document.getElementById('paymentTable');
const tableBody = document.getElementById('tableBody');
const summaryContent = document.getElementById('summaryContent');

// Initialize Application
function init() {
    loadDataFromStorage();
    setupYearSelector();
    buildTable();
    setupEventListeners();
    updateSummary();
}

// Load data from LocalStorage
function loadDataFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            paymentData = JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing stored data:', e);
            paymentData = {};
        }
    }
    
    // Initialize current year if it doesn't exist
    if (!paymentData[currentYear]) {
        paymentData[currentYear] = {};
    }
}

// Save data to LocalStorage
function saveDataToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(paymentData));
    } catch (e) {
        console.error('Error saving data:', e);
        alert('Error saving data. Please try again.');
    }
}

// Setup year selector dropdown
function setupYearSelector() {
    const currentDate = new Date();
    const currentYr = currentDate.getFullYear();
    currentYear = currentYr;
    
    // Populate years (current year ± 5 years)
    yearSelector.innerHTML = '';
    for (let i = currentYr - 5; i <= currentYr + 5; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        if (i === currentYr) {
            option.selected = true;
        }
        yearSelector.appendChild(option);
    }
    
    // Initialize year data if needed
    if (!paymentData[currentYear]) {
        paymentData[currentYear] = {};
    }
}

// Get current month index (0-11)
function getCurrentMonthIndex() {
    return new Date().getMonth();
}

// Get current month name
function getCurrentMonthName() {
    return MONTHS[getCurrentMonthIndex()];
}

// Build the payment table
function buildTable() {
    // Clear existing content
    tableBody.innerHTML = '';
    
    // Build header with months
    const thead = paymentTable.querySelector('thead tr');
    thead.innerHTML = '<th class="person-column">Person</th>';
    
    MONTHS.forEach((month, index) => {
        const th = document.createElement('th');
        th.textContent = month;
        th.className = 'month-header';
        
        // Highlight current month if viewing current year
        const isCurrentYear = currentYear === new Date().getFullYear();
        const isCurrentMonth = isCurrentYear && index === getCurrentMonthIndex();
        if (isCurrentMonth) {
            th.classList.add('current-month');
        }
        
        thead.appendChild(th);
    });
    
    // Get persons for current year
    const persons = Object.keys(paymentData[currentYear] || {});
    
    // Build rows for each person
    persons.forEach(person => {
        addPersonRow(person);
    });
    
    // If no persons, add a message row
    if (persons.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = MONTHS.length + 1;
        cell.textContent = 'No persons added yet. Add a person above to get started!';
        cell.className = 'text-center text-muted py-4';
        row.appendChild(cell);
        tableBody.appendChild(row);
    }
}

// Add a row for a person
function addPersonRow(personName) {
    const row = document.createElement('tr');
    
    // Person name cell
    const personCell = document.createElement('td');
    personCell.className = 'person-cell';
    
    const personContent = document.createElement('div');
    personContent.className = 'person-cell-content';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'person-name';
    nameSpan.textContent = personName;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-person-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.title = 'Delete person';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deletePerson(personName);
    };
    
    personContent.appendChild(nameSpan);
    personContent.appendChild(deleteBtn);
    personCell.appendChild(personContent);
    row.appendChild(personCell);
    
    // Month cells
    MONTHS.forEach((month, index) => {
        const cell = document.createElement('td');
        cell.className = 'payment-cell month-cell';
        
        // Check if current month for highlighting
        const isCurrentYear = currentYear === new Date().getFullYear();
        const isCurrentMonth = isCurrentYear && index === getCurrentMonthIndex();
        if (isCurrentMonth) {
            cell.classList.add('current-month');
        }
        
        // Get payment status
        const isPaid = paymentData[currentYear][personName]?.[month] === true;
        cell.classList.add(isPaid ? 'paid' : 'not-paid');
        cell.textContent = isPaid ? '✔' : '❌';
        
        // Add click handler
        cell.onclick = () => togglePayment(personName, month, cell);
        
        row.appendChild(cell);
    });
    
    tableBody.appendChild(row);
}

// Toggle payment status
function togglePayment(personName, month, cellElement) {
    // Initialize person if needed
    if (!paymentData[currentYear][personName]) {
        paymentData[currentYear][personName] = {};
    }
    
    // Initialize month if needed (defaults to false/not paid)
    if (paymentData[currentYear][personName][month] === undefined) {
        paymentData[currentYear][personName][month] = false;
    }
    
    // Toggle status
    const currentStatus = paymentData[currentYear][personName][month];
    paymentData[currentYear][personName][month] = !currentStatus;
    
    // Update UI
    const newStatus = paymentData[currentYear][personName][month];
    cellElement.classList.remove('paid', 'not-paid');
    cellElement.classList.add(newStatus ? 'paid' : 'not-paid');
    cellElement.textContent = newStatus ? '✔' : '❌';
    
    // Save to storage
    saveDataToStorage();
    
    // Update summary
    updateSummary();
}

// Add new person
function addPerson() {
    const personName = personInput.value.trim();
    
    // Validation
    if (!personName) {
        alert('Please enter a person name.');
        return;
    }
    
    if (personName.length > 50) {
        alert('Person name is too long. Please keep it under 50 characters.');
        return;
    }
    
    // Check if person already exists for current year
    if (paymentData[currentYear][personName]) {
        alert('This person already exists for the selected year.');
        personInput.value = '';
        return;
    }
    
    // Add person to data
    paymentData[currentYear][personName] = {};
    
    // Clear input
    personInput.value = '';
    
    // Save to storage
    saveDataToStorage();
    
    // Rebuild table
    buildTable();
    
    // Update summary
    updateSummary();
}

// Delete person
function deletePerson(personName) {
    if (!confirm(`Are you sure you want to delete "${personName}"?`)) {
        return;
    }
    
    // Remove from data
    if (paymentData[currentYear][personName]) {
        delete paymentData[currentYear][personName];
    }
    
    // Save to storage
    saveDataToStorage();
    
    // Rebuild table
    buildTable();
    
    // Update summary
    updateSummary();
}

// Handle year change
function handleYearChange() {
    const selectedYear = parseInt(yearSelector.value);
    currentYear = selectedYear;
    
    // Initialize year data if needed
    if (!paymentData[currentYear]) {
        paymentData[currentYear] = {};
    }
    
    // Rebuild table for new year
    buildTable();
    
    // Update summary
    updateSummary();
}

// Update summary section
function updateSummary() {
    const persons = Object.keys(paymentData[currentYear] || {});
    
    if (persons.length === 0) {
        summaryContent.innerHTML = '<p class="text-muted mb-0">No data to display. Add persons to track their payments.</p>';
        return;
    }
    
    summaryContent.innerHTML = '';
    
    persons.forEach(personName => {
        const personData = paymentData[currentYear][personName] || {};
        let paidCount = 0;
        
        MONTHS.forEach(month => {
            if (personData[month] === true) {
                paidCount++;
            }
        });
        
        const summaryItem = document.createElement('div');
        summaryItem.className = 'summary-item';
        summaryItem.innerHTML = `
            <strong>${personName}:</strong> 
            ${paidCount} of ${MONTHS.length} months paid
        `;
        
        summaryContent.appendChild(summaryItem);
    });
}

// Download current year data
function downloadYearData() {
    const yearData = paymentData[currentYear] || {};
    const persons = Object.keys(yearData);
    
    if (persons.length === 0) {
        alert(`No data available for year ${currentYear} to download.`);
        return;
    }
    
    // Create CSV content
    let csvContent = 'Person,' + MONTHS.join(',') + ',Total Paid\n';
    
    persons.forEach(personName => {
        const personData = yearData[personName] || {};
        let row = `"${personName}",`;
        let paidCount = 0;
        
        MONTHS.forEach(month => {
            const isPaid = personData[month] === true;
            row += (isPaid ? 'Paid' : 'Not Paid') + ',';
            if (isPaid) paidCount++;
        });
        
        row += paidCount;
        csvContent += row + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Monthly_Payment_Tracker_${currentYear}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL object
    URL.revokeObjectURL(url);
}

// Setup event listeners
function setupEventListeners() {
    // Year selector change
    yearSelector.addEventListener('change', handleYearChange);
    
    // Add person button
    addPersonBtn.addEventListener('click', addPerson);
    
    // Download button
    downloadBtn.addEventListener('click', downloadYearData);
    
    // Add person on Enter key
    personInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addPerson();
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

