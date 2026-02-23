let selectedYear = null;
let selectedMonth = null;
let currentEntryType = 'expense';
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
    const yearSection = document.getElementById("yearSection");
    const monthSection = document.getElementById("monthSection");

    yearSection.classList.replace("visible-section", "hidden-section");
    setTimeout(() => {
        yearSection.classList.add("hidden");
        monthSection.classList.remove("hidden");
        monthSection.classList.replace("hidden-section", "visible-section");
    }, 300);

    document.getElementById("selectedYearTitle").innerText = "Año " + year;

    const container = document.getElementById("monthsContainer");
    container.innerHTML = "";

    months.forEach(month => {
        const btn = document.createElement("button");
        btn.className = "glass-panel p-6 rounded-2xl hover:border-primary/50 transition-all group text-left";
        btn.innerHTML = `
            <h4 class="font-bold text-slate-300 group-hover:text-primary transition-colors">${month}</h4>
            <p class="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Ver Reporte</p>
        `;
        btn.onclick = () => showForm(month);
        container.appendChild(btn);
    });
}

function showForm(month) {
    selectedMonth = month;
    const monthSection = document.getElementById("monthSection");
    const formSection = document.getElementById("formSection");

    monthSection.classList.replace("visible-section", "hidden-section");
    setTimeout(() => {
        monthSection.classList.add("hidden");
        formSection.classList.remove("hidden");
        formSection.classList.replace("hidden-section", "visible-section");
    }, 300);

    document.getElementById("selectedMonthTitle").innerText = `${month} ${selectedYear}`;
    updateUI();
}

function goBack(level) {
    const yearS = document.getElementById("yearSection");
    const monthS = document.getElementById("monthSection");
    const formS = document.getElementById("formSection");

    if (level === 'year') {
        monthS.classList.replace("visible-section", "hidden-section");
        setTimeout(() => {
            monthS.classList.add("hidden");
            yearS.classList.remove("hidden");
            yearS.classList.replace("hidden-section", "visible-section");
        }, 300);
    } else {
        formS.classList.replace("visible-section", "hidden-section");
        setTimeout(() => {
            formS.classList.add("hidden");
            monthS.classList.remove("hidden");
            monthS.classList.replace("hidden-section", "visible-section");
        }, 300);
    }
}

function toggleModal(show) {
    const modal = document.getElementById('transactionModal');
    if (show) {
        modal.classList.remove('hidden');
        document.getElementById('entryDate').valueAsDate = new Date();
    } else {
        modal.classList.add('hidden');
    }
}

function setEntryType(type) {
    currentEntryType = type;
    const btnExp = document.getElementById('typeExp');
    const btnInc = document.getElementById('typeInc');
    const catCont = document.getElementById('categoryContainer');

    if (type === 'expense') {
        btnExp.className = "flex-1 py-2 text-xs font-bold rounded-lg bg-primary text-background-dark";
        btnInc.className = "flex-1 py-2 text-xs font-bold rounded-lg text-slate-400 hover:text-white transition-all";
        catCont.classList.remove('hidden');
    } else {
        btnInc.className = "flex-1 py-2 text-xs font-bold rounded-lg bg-primary text-background-dark";
        btnExp.className = "flex-1 py-2 text-xs font-bold rounded-lg text-slate-400 hover:text-white transition-all";
        catCont.classList.add('hidden');
    }
}

function getMonthKey() {
    return `${selectedYear}-${selectedMonth}`;
}

function ensureMonthExists() {
    const key = getMonthKey();
    if (!data[key]) {
        data[key] = { prevBalance: 0, transactions: [] };
    }
}

function savePrevBalance() {
    ensureMonthExists();
    const val = parseFloat(document.getElementById('prevMonthBalance').value) || 0;
    data[getMonthKey()].prevBalance = val;
    saveData();
    updateUI();
}

function executeAdd() {
    ensureMonthExists();
    const desc = document.getElementById('entryDesc').value;
    const amount = parseFloat(document.getElementById('entryAmount').value);
    const date = document.getElementById('entryDate').value;
    const method = document.getElementById('entryMethod').value;
    const category = document.getElementById('entryType').value;

    if (!desc || isNaN(amount)) {
        alert("Completa descripción y monto.");
        return;
    }

    const transaction = {
        id: Date.now(),
        type: currentEntryType,
        desc,
        amount,
        date,
        method,
        category: currentEntryType === 'expense' ? category : 'Ingreso'
    };

    data[getMonthKey()].transactions.push(transaction);
    saveData();
    updateUI();
    toggleModal(false);

    // Reset
    document.getElementById('entryDesc').value = '';
    document.getElementById('entryAmount').value = '';
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
    const categoryStats = {};

    const list = document.getElementById('transactionList');
    list.innerHTML = "";

    monthData.transactions.forEach(t => {
        if (t.type === 'income') income += t.amount;
        else {
            expense += t.amount;
            categoryStats[t.category] = (categoryStats[t.category] || 0) + t.amount;
        }

        const icon = t.type === 'income' ? 'payments' : (t.category === 'Comida' ? 'restaurant' : (t.category === 'Transporte' ? 'commute' : 'shopping_bag'));

        const item = document.createElement('div');
        item.className = "flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/10";
        item.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="size-12 rounded-xl bg-slate-800 flex items-center justify-center border border-white/10 shadow-lg">
                    <span class="material-symbols-outlined ${t.type === 'income' ? 'text-neon-emerald' : 'text-slate-300'}">${icon}</span>
                </div>
                <div>
                    <h5 class="font-bold text-slate-100">${t.desc}</h5>
                    <p class="text-xs text-slate-400 font-body uppercase tracking-tighter">${t.date} • ${t.method}</p>
                </div>
            </div>
            <div class="flex items-center gap-6">
                <div class="text-right">
                    <p class="font-bold ${t.type === 'income' ? 'text-neon-emerald' : 'text-slate-100'}">${t.type === 'income' ? '+' : '-'}$${t.amount.toLocaleString()}</p>
                    <p class="text-[8px] text-slate-500 font-bold uppercase tracking-widest">${t.category}</p>
                </div>
                <button onclick="deleteTransaction(${t.id})" class="text-slate-600 hover:text-red-500 transition-colors">
                    <span class="material-symbols-outlined text-lg">delete</span>
                </button>
            </div>
        `;
        list.appendChild(item);
    });

    const net = monthData.prevBalance + income - expense;

    document.getElementById('totalIncome').innerText = `$${income.toLocaleString()}`;
    document.getElementById('totalExpense').innerText = `$${expense.toLocaleString()}`;
    document.getElementById('netBalance').innerText = `$${net.toLocaleString()}`;

    // Progress bar logic
    const progress = Math.min(100, (net / 1000000) * 100); // Ex: base on 1M goal or just visual
    document.getElementById('balanceProgress').style.width = `${Math.max(0, progress === 0 && net > 0 ? 10 : progress)}%`;

    // Stats
    const statsContainer = document.getElementById('statsSummary');
    statsContainer.innerHTML = "";
    Object.keys(categoryStats).forEach(cat => {
        const perc = ((categoryStats[cat] / expense) * 100).toFixed(0);
        statsContainer.innerHTML += `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="size-2 rounded-full bg-primary"></div>
                    <span class="text-sm font-bold text-slate-300">${cat}</span>
                </div>
                <div class="text-right">
                    <p class="text-sm font-bold">$${categoryStats[cat].toLocaleString()}</p>
                    <p class="text-[10px] text-slate-500">${perc}% del gasto</p>
                </div>
            </div>
        `;
    });
}

// Initial call if hash or storage state exists could go here
window.onload = () => {
    // Optional: detect if returning to a specific view
};
