/**
 * Módulo de Almacenamiento
 */
window.ProStorage = {
    STORAGE_KEY: 'financialData',

    loadData() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
    },

    saveData(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },

    getMonthKey(year, month) {
        return `${year}-${month}`;
    },

    ensureMonthExists(data, year, month) {
        const key = this.getMonthKey(year, month);
        if (!data[key]) {
            data[key] = { prevBalance: 0, transactions: [] };
        }
        return data[key];
    }
};
