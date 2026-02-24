/**
 * Módulo de Interfaz (UI)
 */
window.ProUI = {
    charts: {},

    renderTransactionList(containerId, transactions, onDelete, onEdit) {
        const container = document.getElementById(containerId);
        container.innerHTML = "";

        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-10 text-slate-500">
                    <span class="material-symbols-outlined text-4xl mb-2">inventory_2</span>
                    <p class="text-xs uppercase tracking-widest font-bold">Sin movimientos este mes</p>
                </div>
            `;
            return;
        }

        transactions.forEach(t => {
            const icon = t.type === 'income' ? 'payments' :
                (t.category === 'Comida' ? 'restaurant' :
                    (t.category === 'Transporte' ? 'commute' : 'shopping_bag'));

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
                        <p class="font-bold ${t.type === 'income' ? 'text-neon-emerald' : 'text-slate-100'}">${t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</p>
                        <p class="text-[8px] text-slate-500 font-bold uppercase tracking-widest">${t.category}</p>
                    </div>
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="window.ProApp.initEdit(${t.id})" class="text-slate-600 hover:text-primary transition-colors">
                            <span class="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button onclick="window.ProApp.confirmDelete(${t.id})" class="text-slate-600 hover:text-red-500 transition-colors">
                            <span class="material-symbols-outlined text-lg">delete</span>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(item);
        });
    },

    updateStats(containerId, categoryStats, totalExpense) {
        const container = document.getElementById(containerId);
        container.innerHTML = "";

        Object.keys(categoryStats).forEach(cat => {
            const perc = ((categoryStats[cat] / totalExpense) * 100).toFixed(0);
            container.innerHTML += `
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
    },

    renderBalanceChart(canvasId, income, expense) {
        const ctx = document.getElementById(canvasId).getContext('2d');

        if (this.charts.balance) this.charts.balance.destroy();

        this.charts.balance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Ingresos', 'Egresos'],
                datasets: [{
                    data: [income, expense],
                    backgroundColor: ['#10b981', '#ef4444'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                cutout: '70%'
            }
        });
    }
};
