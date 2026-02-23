let selectedYear = null;
let selectedMonth = null;
let data = JSON.parse(localStorage.getItem('financialData')) || {};

const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function saveData() {
    localStorage.setItem('financialData', JSON.stringify(data));
}

function showMonths(year) {
    selectedYear = year;
    document.getElementById("yearSection").classList.add("hidden");
    document.getElementById("monthSection").classList.remove("hidden");
    document.getElementById("selectedYearTitle").innerText = "Año " + year;

    const container = document.getElementById("monthsContainer");
    container.innerHTML = "";

    months.forEach(month => {
        const btn = document.createElement("button");
        btn.innerText = month;
        btn.onclick = () => showForm(month);
        container.appendChild(btn);
    });
}

function showForm(month) {
    selectedMonth = month;
    document.getElementById("monthSection").classList.add("hidden");
    document.getElementById("formSection").classList.remove("hidden");
    document.getElementById("selectedMonthTitle").innerText = month + " " + selectedYear;

    updateUI();
}

function goBack(level) {
    if (level === 'year') {
        document.getElementById("monthSection").classList.add("hidden");
        document.getElementById("yearSection").classList.remove("hidden");
    } else {
        document.getElementById("formSection").classList.add("hidden");
        document.getElementById("monthSection").classList.remove("hidden");
    }
}

function getMonthKey() {
    return `${selectedYear}-${selectedMonth}`;
}

function ensureMonthExists() {
    const key = getMonthKey();
    if (!data[key]) {
        data[key] = {
            prevBalance: 0,
            transactions: []
        };
    }
}

function savePrevBalance() {
    ensureMonthExists();
    const val = parseFloat(document.getElementById('prevMonthBalance').value) || 0;
    data[getMonthKey()].prevBalance = val;
    saveData();
    updateUI();
    alert("Saldo actualizado");
}

function addTransaction(type) {
    ensureMonthExists();
    const prefix = type === 'income' ? 'inc' : 'exp';
    
    const desc = document.getElementById(`${prefix}Desc`).value;
    const amount = parseFloat(document.getElementById(`${prefix}Amount`).value);
    const method = document.getElementById(`${prefix}Method`).value;
    const date = document.getElementById(`${prefix}Date`).value;
    
    if (!desc || isNaN(amount)) {
        alert("Por favor completa descripción y valor");
        return;
    }

    const transaction = {
        id: Date.now(),
        type,
        desc,
        amount,
        method,
        date,
    };

    if (type === 'expense') {
        transaction.category = document.getElementById('expType').value;
        transaction.comment = document.getElementById('expComment').value;
    }

    data[getMonthKey()].transactions.push(transaction);
    saveData();
    updateUI();
    
    // Clear inputs
    document.getElementById(`${prefix}Desc`).value = '';
    document.getElementById(`${prefix}Amount`).value = '';
}

function deleteTransaction(id) {
    const key = getMonthKey();
    data[key].transactions = data[key].transactions.filter(t => t.id !== id);
    saveData();
    updateUI();
}

function updateUI() {
    const key = getMonthKey();
    const monthData = data[key] || { prevBalance: 0, transactions: [] };
    
    document.getElementById('prevMonthBalance').value = monthData.prevBalance;

    let income = 0;
    let expense = 0;

    const list = document.getElementById('transactionList');
    list.innerHTML = "";

    monthData.transactions.forEach(t => {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;

        const item = document.createElement('div');
        item.className = 'transaction-item';
        item.innerHTML = `
            <div class="transaction-info">
                <h4>${t.desc}</h4>
                <p>${t.date} - ${t.method} ${t.category ? '| ' + t.category : ''}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <span class="transaction-amount ${t.type === 'income' ? 'amount-income' : 'amount-expense'}">
                    ${t.type === 'income' ? '+' : '-'}$${t.amount.toLocaleString()}
                </span>
                <button class="delete-btn" onclick="deleteTransaction(${t.id})">🗑</button>
            </div>
        `;
        list.appendChild(item);
    });

    const net = monthData.prevBalance + income - expense;

    document.getElementById('totalIncome').innerText = `$${income.toLocaleString()}`;
    document.getElementById('totalExpense').innerText = `$${expense.toLocaleString()}`;
    document.getElementById('netBalance').innerText = `$${net.toLocaleString()}`;
}
