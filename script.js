/**
 * ProFinance - Controlador Principal
 */

window.ProApp = {
    selectedYear: null,
    selectedMonth: null,
    currentEntryType: 'expense',
    editingId: null,
    data: {},

    months: [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ],

    init() {
        this.data = window.ProStorage.loadData();
        this.renderYears();
    },

    renderYears() {
        const container = document.getElementById("yearsContainer");
        if (!container) return;
        container.innerHTML = "";

        const startYear = 2024;
        const endYear = 2030;

        for (let year = startYear; year <= endYear; year++) {
            const btn = document.createElement("button");
            btn.className = "glass-panel p-8 rounded-3xl hover:border-primary/50 transition-all group";
            btn.innerHTML = `
                <h3 class="text-3xl font-bold group-hover:text-primary transition-colors">${year}</h3>
                <p class="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-bold">Gestionar Gestión</p>
            `;
            btn.onclick = () => this.showMonths(year);
            container.appendChild(btn);
        }
    },

    updateActionVisibility(show) {
        const btn = document.getElementById("addTransactionBtn");
        if (btn) {
            if (show) {
                btn.classList.remove("hidden");
                btn.classList.add("flex");
            } else {
                btn.classList.add("hidden");
                btn.classList.remove("flex");
            }
        }
    },

    startApp() {
        const introSection = document.getElementById("introSection");
        const yearSection = document.getElementById("yearSection");

        this.updateActionVisibility(false);
        introSection.classList.replace("visible-section", "hidden-section");
        setTimeout(() => {
            introSection.classList.add("hidden");
            yearSection.classList.remove("hidden");
            yearSection.classList.replace("hidden-section", "visible-section");
        }, 300);
    },

    showMonths(year) {
        this.selectedYear = year;
        const yearSection = document.getElementById("yearSection");
        const monthSection = document.getElementById("monthSection");

        this.updateActionVisibility(false);
        yearSection.classList.replace("visible-section", "hidden-section");
        setTimeout(() => {
            yearSection.classList.add("hidden");
            monthSection.classList.remove("hidden");
            monthSection.classList.replace("hidden-section", "visible-section");
        }, 300);

        document.getElementById("selectedYearTitle").innerText = "Año " + year;

        const container = document.getElementById("monthsContainer");
        container.innerHTML = "";

        this.months.forEach(month => {
            const btn = document.createElement("button");
            btn.className = "glass-panel p-6 rounded-2xl hover:border-primary/50 transition-all group text-left";
            btn.innerHTML = `
                <h4 class="font-bold text-slate-300 group-hover:text-primary transition-colors">${month}</h4>
                <p class="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Ver Reporte</p>
            `;
            btn.onclick = () => this.showForm(month);
            container.appendChild(btn);
        });
    },

    showForm(month) {
        this.selectedMonth = month;
        const monthSection = document.getElementById("monthSection");
        const formSection = document.getElementById("formSection");

        this.updateActionVisibility(true);
        monthSection.classList.replace("visible-section", "hidden-section");
        setTimeout(() => {
            monthSection.classList.add("hidden");
            formSection.classList.remove("hidden");
            formSection.classList.replace("hidden-section", "visible-section");
        }, 300);

        document.getElementById("selectedMonthTitle").innerText = `${month} ${this.selectedYear}`;
        this.updateUI();
    },

    goBack(level) {
        const yearS = document.getElementById("yearSection");
        const monthS = document.getElementById("monthSection");
        const formS = document.getElementById("formSection");

        this.updateActionVisibility(false);

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
    },

    toggleModal(show, editId = null) {
        const modal = document.getElementById('transactionModal');
        const modalTitle = modal.querySelector('h3');

        if (show) {
            modal.classList.remove('hidden');
            if (editId) {
                this.editingId = editId;
                modalTitle.innerText = "Editar Registro";
                this.loadEditData(editId);
            } else {
                this.editingId = null;
                modalTitle.innerText = "Nuevo Registro";
                this.resetModal();
                // Por defecto, sugerir el día de hoy
                document.getElementById('entryDay').value = new Date().getDate();
            }
        } else {
            modal.classList.add('hidden');
        }
    },

    setEntryType(type) {
        this.currentEntryType = type;
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
    },

    savePrevBalance() {
        const monthData = window.ProStorage.ensureMonthExists(this.data, this.selectedYear, this.selectedMonth);
        monthData.prevBalance = parseFloat(document.getElementById('prevMonthBalance').value) || 0;
        window.ProStorage.saveData(this.data);
        this.updateUI();
    },

    executeAdd() {
        const monthData = window.ProStorage.ensureMonthExists(this.data, this.selectedYear, this.selectedMonth);
        const desc = document.getElementById('entryDesc').value;
        const amount = parseFloat(document.getElementById('entryAmount').value);
        const day = parseInt(document.getElementById('entryDay').value);
        const method = document.getElementById('entryMethod').value;
        const category = document.getElementById('entryType').value;

        if (!desc || isNaN(amount) || isNaN(day)) {
            alert("Completa descripción, monto y día.");
            return;
        }

        // Construir fecha completa basada en la selección de navegación
        const monthIndex = this.months.indexOf(this.selectedMonth) + 1;
        const formattedMonth = monthIndex < 10 ? `0${monthIndex}` : monthIndex;
        const formattedDay = day < 10 ? `0${day}` : day;
        const fullDate = `${this.selectedYear}-${formattedMonth}-${formattedDay}`;

        const transaction = {
            id: this.editingId || Date.now(),
            type: this.currentEntryType,
            desc,
            amount,
            date: fullDate,
            method,
            category: this.currentEntryType === 'expense' ? category : 'Ingreso'
        };

        if (this.editingId) {
            const index = monthData.transactions.findIndex(t => t.id === this.editingId);
            monthData.transactions[index] = transaction;
        } else {
            monthData.transactions.push(transaction);
        }

        window.ProStorage.saveData(this.data);
        this.updateUI();
        this.toggleModal(false);
    },

    initEdit(id) {
        this.toggleModal(true, id);
    },

    loadEditData(id) {
        const monthData = window.ProStorage.ensureMonthExists(this.data, this.selectedYear, this.selectedMonth);
        const t = monthData.transactions.find(trans => trans.id === id);
        if (t) {
            this.setEntryType(t.type);
            document.getElementById('entryDesc').value = t.desc;
            document.getElementById('entryAmount').value = t.amount;

            // Extraer el día de la fecha guardada (YYYY-MM-DD)
            const dayPart = t.date.split('-')[2];
            document.getElementById('entryDay').value = parseInt(dayPart);

            document.getElementById('entryMethod').value = t.method;
            if (t.type === 'expense') {
                document.getElementById('entryType').value = t.category;
            }
        }
    },

    confirmDelete(id) {
        if (confirm("¿Estás seguro de eliminar este movimiento?")) {
            const key = window.ProStorage.getMonthKey(this.selectedYear, this.selectedMonth);
            this.data[key].transactions = this.data[key].transactions.filter(t => t.id !== id);
            window.ProStorage.saveData(this.data);
            this.updateUI();
        }
    },

    resetModal() {
        document.getElementById('entryDesc').value = '';
        document.getElementById('entryAmount').value = '';
        document.getElementById('entryMethod').value = '';
        document.getElementById('entryType').value = '';
        this.setEntryType('expense');
    },

    updateUI() {
        const monthData = window.ProStorage.ensureMonthExists(this.data, this.selectedYear, this.selectedMonth);
        const stats = window.ProCalculations.calculateTotals(monthData.transactions);
        const net = window.ProCalculations.getNetBalance(monthData.prevBalance, stats.income, stats.expense);

        // Update dashboard
        document.getElementById('prevMonthBalance').value = monthData.prevBalance;
        document.getElementById('totalIncome').innerText = `$${stats.income.toLocaleString()}`;
        document.getElementById('totalExpense').innerText = `$${stats.expense.toLocaleString()}`;
        document.getElementById('netBalance').innerText = `$${net.toLocaleString()}`;

        // Update progress bar
        const progress = window.ProCalculations.getSavingsProgress(net);
        document.getElementById('balanceProgress').style.width = `${progress}%`;

        // Update UI modules
        window.ProUI.renderTransactionList('transactionList', monthData.transactions);
        window.ProUI.updateStats('statsSummary', stats.categoryStats, stats.expense);
        window.ProUI.renderBalanceChart('balanceChart', stats.income, stats.expense);
        window.ProUI.renderCategoryChart('categoryChart', stats.categoryStats);
    }
};

// Vinculación global de funciones disparadas por HTML
window.startApp = () => window.ProApp.startApp();
window.showMonths = (year) => window.ProApp.showMonths(year);
window.showForm = (month) => window.ProApp.showForm(month);
window.goBack = (level) => window.ProApp.goBack(level);
window.toggleModal = (show) => window.ProApp.toggleModal(show);
window.setEntryType = (type) => window.ProApp.setEntryType(type);
window.savePrevBalance = () => window.ProApp.savePrevBalance();
window.executeAdd = () => window.ProApp.executeAdd();

// Inicio
window.onload = () => window.ProApp.init();
