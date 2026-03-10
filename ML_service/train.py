print("➡ Starting train.py...")

import os

# Check files in folder
print("➡ Files in this folder:", os.listdir())

# Check if CSV exists
if not os.path.exists("vawc_dataset.csv"):
    print("❌ ERROR: vawc_dataset.csv NOT FOUND!")
    print("Place it in the SAME FOLDER as train.py")
    exit()
else:
    print("✔ Found vawc_dataset.csv")

# Load libraries
print("➡ Importing libraries...")
from bertopic import BERTopic
from sentence_transformers import SentenceTransformer
import pandas as pd

# Load dataset
print("➡ Loading CSV...")
df = pd.read_csv("vawc_dataset.csv")
print("✔ CSV loaded!")
print(df.head())

# Convert to list
documents = df["text"].astype(str).tolist()
print(f"➡ Total documents loaded: {len(documents)}")

# Load model
print("➡ Loading sentence-transformer model (this may take 10–30 seconds)...")
model = SentenceTransformer("all-MiniLM-L6-v2")
print("✔ Embedding model loaded!")

# Train BERTopic
print("➡ Training BERTopic model... (this may take minutes)")
topic_model = BERTopic(embedding_model=model, verbose=True)
topics, probabilities = topic_model.fit_transform(documents)

print("✔ Training finished!")

# Show top topics
print("➡ Sample topics:")
print(topic_model.get_topic_info().head())

# Save
print("➡ Saving model...")
topic_model.save("vawc_bertopic_model")
print("✔ Model saved successfully!")

print("🎉 TRAINING COMPLETE — CHECK YOUR FOLDER")
