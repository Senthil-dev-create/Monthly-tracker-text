const expenses = [];
let currentPage = 1;
const rowsPerPage = 5;

function loadExpenses() {
    const storedExpenses = localStorage.getItem('expenses');
    if (storedExpenses) {
        expenses.push(...JSON.parse(storedExpenses));
    }
}

function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function showPage(pageId) {
    document.querySelectorAll('.container').forEach((el) => (el.style.display = 'none'));
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById(pageId).style.display = 'block';
}

function formatDate(date) {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

function showMessage(messageId) {
    const message = document.getElementById(messageId);
    message.style.display = 'block';
    setTimeout(() => (message.style.display = 'none'), 3000);
}

document.getElementById('expenseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const description = capitalizeFirstLetter(document.getElementById('description').value);
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;

    expenses.push({ description, amount, date, createdAt: new Date() });
    saveExpenses();
    showMessage('addMessage');
    document.getElementById('expenseForm').reset();
    renderSummary();
});

function renderSummary() {
    const summaryBody = document.getElementById('summaryBody');
    const pagination = document.getElementById('pagination');
    summaryBody.innerHTML = '';
    pagination.innerHTML = '';

    const sortedExpenses = [...expenses].sort((a, b) => b.createdAt - a.createdAt);
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    sortedExpenses.slice(start, end).forEach((expense) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${expense.description}</td><td>${expense.amount.toFixed(2)}</td><td>${formatDate(expense.date)}</td>`;
        summaryBody.appendChild(row);
    });

    for (let i = 1; i <= Math.ceil(expenses.length / rowsPerPage); i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.addEventListener('click', () => {
            currentPage = i;
            renderSummary();
        });
        pagination.appendChild(btn);
    }
}

function searchExpenses() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const searchBody = document.getElementById('searchBody');
    searchBody.innerHTML = '';

    expenses
        .filter((expense) => expense.description.toLowerCase().includes(searchInput) || formatDate(expense.date).includes(searchInput))
        .forEach((expense) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${expense.description}</td><td>${expense.amount.toFixed(2)}</td><td>${formatDate(expense.date)}</td>`;
            searchBody.appendChild(row);
        });

    showMessage('searchMessage');
}

function filterExpensesByDate() {
    const deleteDate = document.getElementById('deleteDate').value;
    const deleteBody = document.getElementById('deleteBody');
    deleteBody.innerHTML = '';

    expenses
        .filter((expense) => expense.date === deleteDate)
        .forEach((expense, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" data-index="${index}"></td>
                <td>${expense.description}</td>
                <td>${expense.amount.toFixed(2)}</td>
                <td>${formatDate(expense.date)}</td>
            `;
            deleteBody.appendChild(row);
        });
}

function deleteSelectedExpenses() {
    const checkboxes = document.querySelectorAll('#deleteBody input[type="checkbox"]:checked');
    const selectedIndexes = Array.from(checkboxes).map((cb) => parseInt(cb.dataset.index));

    selectedIndexes
        .sort((a, b) => b - a)
        .forEach((index) => expenses.splice(index, 1));

    saveExpenses();
    filterExpensesByDate();
    renderSummary();
    showMessage('deleteMessage');
}

function downloadData() {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;

    if (!fromDate || !toDate) {
        alert('Please select both From and To dates.');
        return;
    }

    const filteredExpenses = expenses.filter((expense) => expense.date >= fromDate && expense.date <= toDate);

    if (filteredExpenses.length === 0) {
        alert('No expenses found in the selected date range.');
        return;
    }

    let textData = 'Date (DD-MM-YY)\tAmount\tDescription\n';
    filteredExpenses.forEach((expense) => {
        textData += `${formatDate(expense.date)}\t${expense.amount.toFixed(2)}\t${expense.description}\n`;
    });

    const blob = new Blob([textData], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Expenses.txt';
    link.click();
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

loadExpenses();
renderSummary();
