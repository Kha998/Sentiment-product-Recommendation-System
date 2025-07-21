from flask import Flask, send_from_directory, jsonify, render_template,request
from flask_cors import CORS
import pandas as pd
import os
import json

app = Flask(__name__, template_folder='frontend', static_folder='frontend/static')

# Load your prepared dataset
df = pd.read_json('backend/data/final_dashboard_dataset.json')

# Home Page – Dashboard
@app.route('/')
def home():
    return render_template("templates/home.html")



# API Route – Product Titles for Datalist
@app.route("/get_product_titles")
def get_product_titles():
    titles = df['productTitle'].dropna().unique().tolist()
    return jsonify(titles)

# Product Detail Page
@app.route("/product_details")
def show_product_details():
    title = request.args.get("productTitle")
    if not title:
        return "No product selected", 400

    # Search for exact match
    product_data = df[df['productTitle'].str.lower() == title.lower()]

    if product_data.empty:
        return "Product not found", 404

    # Take the first matching entry (or you can return all if needed)
    product = product_data.iloc[0].to_dict()

    return render_template("templates/product_details.html", product=product)

@app.route('/api/mostreviewed')  # Returns JSON data to chart
def most_reviewed_api():
    grouped_df = df.groupby('productId').agg({
        'reviewCount': 'sum',
        'rating': 'mean',
        'sentimentLabel': lambda x: x.mode()[0] if not x.mode().empty else 'neutral',
        'sentimentScore': 'mean'
    }).reset_index()

    top_df = grouped_df.sort_values(by='reviewCount', ascending=False).head(10)
    return jsonify(top_df.to_dict(orient='records'))

@app.route('/get_mostreviewed')  # Renders the HTML page
def most_reviewed_page():
    grouped_df = df.groupby('productId').agg({
        'reviewCount': 'sum',
        'rating': 'mean',
        'sentimentLabel': lambda x: x.mode()[0] if not x.mode().empty else 'neutral',
        'sentimentScore': 'mean'
    }).reset_index()

    top_df = grouped_df.sort_values(by='reviewCount', ascending=False).head(10)
    table_data = top_df.to_dict(orient='records')
    
    return render_template('templates/most_reviewed.html', table_data=table_data)

# Data Analysis Summary 
# Data Analysis Summary 
@app.route('/api/data-summary')
def data_summary():
    sentiment_counts = df['sentimentLabel'].value_counts().to_dict()
    return jsonify({
        "total_reviews": len(df),
        "positive": sentiment_counts.get("positive", 0),
        "neutral": sentiment_counts.get("neutral", 0),
        "negative": sentiment_counts.get("negative", 0)
    })

@app.route('/api/count-rating-5')
def count_rating_5():
    count = df[df['averageRating'] == 5]['productTitle'].nunique()
    return jsonify({'count': count})

# Sentiment Analysis
@app.route('/api/sentiment-distribution')
def sentiment_distribution():
    sentiment_counts = df['sentimentLabel'].value_counts().to_dict()
    return jsonify(sentiment_counts)

# Rating Distribution
@app.route('/api/rating-distribution')
def rating_distribution():
    rating_counts = df['rating'].value_counts().sort_index().to_dict()
    return jsonify(rating_counts)


## Overall Review verified-distribution

@app.route('/api/verified-distribution')
def verified_distribution():
    verified_counts = df['verifiedPurchase'].value_counts().to_dict()
    return jsonify({
        "Verified": int(verified_counts.get(True, 0)),
        "Unverified": int(verified_counts.get(False, 0))
    })

@app.route('/api/helpful-votes')
def helpful_votes():
    helpful_bins = pd.cut(df['helpfulVote'], bins=[0, 1, 3, 5, 10, 1000], right=False, labels=["0", "1-2", "3-4", "5-9", "10+"])
    votes_dist = helpful_bins.value_counts().sort_index().to_dict()
    return jsonify(votes_dist)

@app.route('/api/most-reviewed-products')
def most_reviewed_products():
    review_counts = df.groupby(['productId', 'productTitle']).size().sort_values(ascending=False).head(10)
    result = {
        "labels": [productId for productId, _ in review_counts.index],
        "titles": [productTitle for _, productTitle in review_counts.index],
        "values": review_counts.tolist()
    }
    return jsonify(result)

@app.route('/api/top-rated-products')
def top_rated_products():
    grouped = df.groupby(['productId', 'productTitle'])['rating'].mean().sort_values(ascending=False).head(10)
    return jsonify({
        "labels": [productId for productId, _ in grouped.index],
        "titles": [productTitle for _, productTitle in grouped.index],
        "values": [round(val, 2) for val in grouped.values]
    })
    
@app.route('/api/top-positive-average-rating')
def top_positive_average_rating():
    top_rated = (
        df[
            (df['sentimentLabel'] == 'positive') &
            (df['averageRating'] >= 4.5) &
            (df['averageRating'] <= 5)
        ]
        .sort_values(by='averageRating', ascending=False)
        .dropna(subset=['averageRating'])
        .head(5)
    )
    data = top_rated[['productTitle', 'averageRating']].rename(
        columns={'productTitle': 'title', 'averageRating': 'rating'}
    ).to_dict(orient='records')
    return jsonify(data)
    
#Most Positively & Negatively Reviewed Products
@app.route('/api/sentiment-extremes')
def sentiment_extremes():
    sentiment_counts = df[df['sentimentLabel'].isin(['positive', 'negative'])]
    grouped = sentiment_counts.groupby(['productId', 'productTitle', 'sentimentLabel']).size().reset_index(name='count')
    grouped_sorted = grouped.sort_values(by='count', ascending=False).groupby('sentimentLabel').head(5)

    result = {
        "labels": grouped_sorted['productId'].tolist(),
        "titles": grouped_sorted['productTitle'].tolist(),
        "sentiments": grouped_sorted['sentimentLabel'].tolist(),
        "values": grouped_sorted['count'].tolist()
    }
    return jsonify(result)

# Scatter Plot: Price vs Rating
@app.route('/api/price-rating-scatter')
def price_rating_scatter():
    scatter_data = df[['price', 'rating']].dropna()
    return jsonify({
        "price": scatter_data['price'].tolist(),
        "rating": scatter_data['rating'].tolist()
    })

# Average Rating per Price Range
@app.route('/api/rating-by-price-range')
def rating_by_price_range():
    bins = [0, 10, 20, 50, 100, 200, 1000]
    labels = ['0–9', '10–19', '20–49', '50–99', '100–199', '200+']
    df['price_range'] = pd.cut(df['price'], bins=bins, labels=labels, right=False)
    avg_by_range = df.groupby('price_range')['rating'].mean().dropna()
    return jsonify({
        "labels": avg_by_range.index.tolist(),
        "values": avg_by_range.round(2).tolist()
    })
    
@app.route('/api/store-sentiment')
def store_sentiment():
    sentiment_data = df.groupby(['store', 'sentimentLabel']).size().unstack(fill_value=0)
    sentiment_data = sentiment_data.loc[:, ['positive', 'neutral', 'negative']] if 'positive' in sentiment_data else sentiment_data
    return jsonify(sentiment_data.head(10).to_dict(orient='list'))


@app.route('/api/store-review-count')
def store_review_count():
    review_counts = df['store'].value_counts().head(10)
    return jsonify({
        "labels": review_counts.index.tolist(),
        "values": review_counts.tolist()
    })
    

if __name__ == '__main__':
    app.run(debug=True)
