import pandas as pd
import json

# Load JSON file
with open('Health_and_Personal_Care.jsonl', 'r') as file:
    data = json.load(file)

# Convert to DataFrame
df = pd.DataFrame(data)

# Export to CSV
df.to_csv('amazon_reviews.csv', index=False)
