import pandas as pd

# Load the JSONL file (each line is a JSON object)
df = pd.read_json('Health_and_Personal_Care.jsonl', lines=True)

# Save to CSV
df.to_csv('Health_and_Personal_Care.csv', index=False)

print("✅ Conversion complete! CSV saved.")
