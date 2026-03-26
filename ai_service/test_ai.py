import requests
import json

BASE_URL = "http://localhost:8000"

def test_embed():
    print("Testing /embed...")
    try:
        r = requests.post(f"{BASE_URL}/embed", json={"text": "Software development is fun"})
        r.raise_for_status()
        data = r.json()
        print(f"Success! Embedding length: {len(data['embedding'])}")
    except Exception as e:
        print(f"Failed /embed: {e}")

def test_similarity():
    print("Testing /similarity...")
    try:
        r = requests.post(f"{BASE_URL}/similarity", json={
            "text1": "Python developer at Google",
            "text2": "Django engineer at Meta"
        })
        r.raise_for_status()
        data = r.json()
        print(f"Success! Similarity Score: {data['similarity']}")
    except Exception as e:
        print(f"Failed /similarity: {e}")

if __name__ == "__main__":
    test_embed()
    test_similarity()
