document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('mostreviewedData');
    if (!canvas) {
        console.warn("Canvas 'mostreviewedData' not found.");
        return;
    }

    const ctx = canvas.getContext('2d');

    fetch('/api/mostreviewed')
        .then(response => response.json())
        .then(chartData => {
        new Chart(ctx, {
            type: 'bar',
            data: {
            labels: chartData.map(item => item.productId),
            datasets: [{
                label: 'Review Count',
                data: chartData.map(item => item.reviewCount),
                backgroundColor: 'orange'
            }]
            },
            options: {
            responsive: true
            }
        });
    })
    .catch(err => console.error("Chart data fetch error:", err));
});