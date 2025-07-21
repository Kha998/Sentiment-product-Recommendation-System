// app.js
// ✅ Load product titles into the datalist when the page loads
function loadProductTitles() {
    fetch('http://127.0.0.1:5000/get_product_titles')
        .then(response => response.json())
        .then(data => {
        const datalist = document.getElementById("productList");
        datalist.innerHTML = ""; // Clear any existing options
        data.forEach(title => {
            const option = document.createElement("option");
            option.value = title;
            datalist.appendChild(option);
        });
        })
    .catch(err => console.error("Error loading product titles:", err));
}


// ✅ Initialize when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    loadProductTitles();
});





fetch('http://127.0.0.1:5000/api/data-summary') // Create this route in Flask
    .then(res => res.json())
    .then(data => {
        const tc = document.getElementById('totalReviews');
        if(tc){
        tc.textContent = data.total_reviews;
        }
        document.getElementById('positiveReviews').textContent = data.positive;
        document.getElementById('neutralReviews').textContent = data.neutral;
        document.getElementById('negativeReviews').textContent = data.negative;
    });


fetch('http://127.0.0.1:5000/api/count-rating-5')
    .then(res => res.json())
    .then(data => {
        document.getElementById('rating5Count').textContent = data.count;
    })
    .catch(error => console.error('Error fetching rating 5 count:', error));

// Export Chart Button 
function downloadChart(canvasId, filename) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error("Canvas not found:", canvasId);
        return;
    }

    const url = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// Fetch and render sentiment distribution pie chart
fetch('http://127.0.0.1:5000/api/sentiment-distribution')
    .then(res => res.json())
    .then(data => {
        const ctx = document.getElementById('sentimentChart');
        new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(data),
            datasets: [{
            label: 'Sentiment Distribution',
            data: Object.values(data),
            backgroundColor: ['#dc3545', '#ffc107', '#28a745']
            }]
        },
        options: {
        responsive: true,
        plugins: {
            tooltip: {
                enabled: true
            },
            legend: {
                position: 'bottom'
            }
            }
        }
        });
    })
        .catch(error => console.error("Error fetching sentiment data:", error));


// Fetch and render rating distribution bar chart
fetch('http://127.0.0.1:5000/api/rating-distribution')
    .then(res => res.json())
    .then(data => {
        const ctx = document.getElementById('ratingChart');
        new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(data),  // Ratings (1-5)
            datasets: [{
            label: 'Review Count per Rating',
            data: Object.values(data),  // Count of each rating
            backgroundColor: '#007bff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
            tooltip: {
                enabled: true
            },
            legend: {
                position: 'bottom'
            }
        },
            scales: {
            y: {
                beginAtZero: true,
                title: {
                display: true,
                text: 'Number of Reviews'
                }
            },
            x: {
                title: {
                display: true,
                text: 'Rating'
                }
            }
            }
        }
        });
    })
    .catch(error => console.error("Error fetching rating data:", error));

    // Average Rating per Product


// Verified vs Unverified
fetch('http://127.0.0.1:5000/api/verified-distribution')
    .then(res => res.json())
    .then(data => {
        new Chart(document.getElementById('verifiedChart'), {
        type: 'pie',
        data: {
            labels: Object.keys(data),
            datasets: [{
            label: 'Review Verification',
            data: Object.values(data),
            backgroundColor: ['#2196f3', '#ff9800']
            }]
        },
        options: {
        responsive: true,
        plugins: {
            tooltip: {
                enabled: true
            },
            legend: {
                position: 'bottom'
            }
            }
        }
        });
    });

// Helpful Votes Distribution
fetch('http://127.0.0.1:5000/api/helpful-votes')
    .then(res => res.json())
    .then(data => {
        new Chart(document.getElementById('helpfulChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
            label: 'Helpful Vote Count',
            data: Object.values(data),
            backgroundColor: '#9c27b0'
            }]
        },
        options: {
            responsive: true,
            plugins: {
            tooltip: {
                enabled: true
            },
            legend: {
                position: 'bottom'
            }
            },
        
            scales: { y: { beginAtZero: true } }
        }
        });
    });



// Top Rated Products Chart
fetch('http://127.0.0.1:5000/api/top-rated-products')
    .then(res => res.json())
    .then(data => {
        new Chart(document.getElementById('topRatedChart'), {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
            label: 'Average Rating',
            data: data.values,
            backgroundColor: '#4caf50'
            }]
        },
        options: {
            plugins: {
            tooltip: {
                callbacks: {
                title: ctx => data.titles[ctx[0].dataIndex]
                }
            },
            legend: { display: false }
            },
            scales: {
            y: { beginAtZero: true, max: 5 },
            x: { ticks: { maxRotation: 0, minRotation: 0 } }
            }
        }
        });
    });



// Sentiment Extremes Chart (Grouped by Positive/Negative)
fetch('http://127.0.0.1:5000/api/sentiment-extremes')
    .then(res => res.json())
    .then(data => {
        const posData = [], negData = [], labels = [];

        data.labels.forEach((asin, i) => {
        if (!labels.includes(asin)) labels.push(asin);
        });

        labels.forEach(asin => {
        let pos = 0, neg = 0;
        for (let i = 0; i < data.labels.length; i++) {
            if (data.labels[i] === asin) {
            if (data.sentiments[i] === 'positive') pos = data.values[i];
            if (data.sentiments[i] === 'negative') neg = data.values[i];
            }
        }
        posData.push(pos);
        negData.push(neg);
        });

        new Chart(document.getElementById('sentimentExtremesChart'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
            {
                label: 'Positive Reviews',
                data: posData,
                backgroundColor: '#4caf50'
            },
            {
                label: 'Negative Reviews',
                data: negData,
                backgroundColor: '#f44336'
            }
            ]
        },
        options: {
            responsive: true,
            plugins: {
            legend: { position: 'top' }
            },
            scales: {
            y: { beginAtZero: true },
            x: { stacked: false }
            }
        }
        });
    });

    fetch('http://127.0.0.1:5000/api/price-rating-scatter')
    .then(res => res.json())
    .then(data => {
        const scatterPoints = data.price.map((p, i) => ({ x: p, y: data.rating[i] }));
        new Chart(document.getElementById('priceRatingScatterChart'), {
        type: 'scatter',
        data: {
            datasets: [{
            label: 'Price vs Rating',
            data: scatterPoints,
            backgroundColor: '#2196f3'
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
            x: {
                title: { display: true, text: 'Price ($)' }
            },
            y: {
                title: { display: true, text: 'Rating' },
                min: 0, max: 5
            }
            }
        }
        });
    });

fetch('http://127.0.0.1:5000/api/rating-by-price-range')
    .then(res => res.json())
    .then(data => {
        new Chart(document.getElementById('ratingByPriceRangeChart'), {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
            label: 'Avg Rating',
            data: data.values,
            backgroundColor: '#673ab7'
            }]
        },
        options: {
            scales: {
            y: {
                beginAtZero: true,
                max: 5,
                title: { display: true, text: 'Average Rating' }
            },
            x: {
                title: { display: true, text: 'Price Range ($)' }
            }
            }
        }
        });
    });
// Review Count by Sentiment per Store
fetch('http://127.0.0.1:5000/api/store-sentiment')
    .then(res => res.json())
    .then(data => {
        const labels = Object.keys(data.positive || data.neutral || data.negative);
        const positive = data.positive || new Array(labels.length).fill(0);
        const neutral = data.neutral || new Array(labels.length).fill(0);
        const negative = data.negative || new Array(labels.length).fill(0);

        new Chart(document.getElementById('storeSentimentChart'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
            { label: 'Positive', data: positive, backgroundColor: '#4caf50' },
            { label: 'Neutral', data: neutral, backgroundColor: '#ffc107' },
            { label: 'Negative', data: negative, backgroundColor: '#f44336' }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true } }
        }
        });
    });


fetch('http://127.0.0.1:5000/api/store-review-count')
    .then(res => res.json())
    .then(data => {
        new Chart(document.getElementById('storeAvgRatingChart'), {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
            label: 'Review Count',
            data: data.values,
            backgroundColor: '#3f51b5'
            }]
        },
        options: {
            plugins: {
            legend: { display: false }
            },
            scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Number of Reviews' }
            },
            x: {
                title: { display: true, text: 'Store/Brand' },
                ticks: {
                maxRotation: 45,
                minRotation: 0
                }
            }
            }
        }
        });
    });

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Additional API calls and chart rendering can be added here
