/**
 * Módulo de Cálculos
 */
window.ProCalculations = {
    calculateTotals(transactions) {
        let income = 0;
        let expense = 0;
        const categoryStats = {};

        transactions.forEach(t => {
            if (t.type === 'income') {
                income += t.amount;
            } else {
                expense += t.amount;
                categoryStats[t.category] = (categoryStats[t.category] || 0) + t.amount;
            }
        });

        return { income, expense, categoryStats };
    },

    getNetBalance(prevBalance, income, expense) {
        return (prevBalance + income) - expense;
    },

    getSavingsProgress(netBalance, goal = 1000000) {
        const progress = Math.min(100, (netBalance / goal) * 100);
        return Math.max(0, progress);
    }
};
