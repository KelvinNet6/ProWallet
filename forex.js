function closeTrade(tradeID) {
    const trade = activeTrades.find(t => t.id === tradeID);
    if (trade && trade.status === 'Open') {
        const closeRate = currentRate;

        let profitLoss = 0;
        let resultMessage = '';
        
        if (trade.action === 'Buy') {
            profitLoss = (closeRate - trade.openRate) * trade.amount;
            if (profitLoss > 0) {
                resultMessage = `Profit of $${profitLoss.toFixed(2)}`;
            } else {
                resultMessage = `Loss of $${Math.abs(profitLoss).toFixed(2)}`;
            }
        } else if (trade.action === 'Sell') {
            profitLoss = (trade.openRate - closeRate) * trade.amount;
            if (profitLoss > 0) {
                resultMessage = `Profit of $${profitLoss.toFixed(2)}`;
            } else {
                resultMessage = `Loss of $${Math.abs(profitLoss).toFixed(2)}`;
            }
        }
        
        trade.status = 'Closed';
        trade.closeRate = closeRate;
        trade.profitLoss = profitLoss;

        // Update the balance
        balance += profitLoss; // Add profit or subtract loss

        // Display updated balance
        balanceElement.innerText = balance.toFixed(2);

        // Display the result message
        alert(`Trade Closed! ${resultMessage}`);

        // Update the table with the latest information
        updateTradeHistory();

        // Update the chart area
        updateCloseArea();
    }
}
