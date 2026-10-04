import spacy
import re

# Load spaCy model once at startup
try:
    nlp = spacy.load("en_core_web_sm")
except Exception as e:
    nlp = None
    print(f"Warning: Failed to load spacy model en_core_web_sm: {e}")

TECH_SKILL_BLACKLIST = {
    "python", "node.js", "nodejs", "typescript", "javascript", "fastapi", "react",
    "pytorch", "tensorflow", "docker", "kubernetes", "postgresql", "postgres",
    "spacy", "ai", "llm", "azure", "aws", "gcp", "sql", "nosql", "java", "c++",
    "html", "css", "git", "github", "gitlab", "rest api", "graphql", "mongodb"
}

US_STATE_ABBREVS = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
}

def clean_segment(segment: str) -> str:
    # Strip bullet symbols and excess spaces
    cleaned = re.sub(r"^[•\-\*\(\s\d\)]+", "", segment).strip()
    return cleaned

def extract_entities(text: str):
    if not nlp or not text or not text.strip():
        return {
            "dates": [],
            "organizations": [],
            "locations": []
        }

    dates = []
    organizations = []
    locations = []

    # 1. Pre-process text by splitting on newlines and pipe / dash delimiters
    lines = text.split("\n")
    segments = []
    
    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue
            
        parts = re.split(r"\s+[\|–—]\s+|\s+-\s+(?![0-9])", line_clean)
        for p in parts:
            p_clean = clean_segment(p)
            if p_clean and len(p_clean) > 1:
                segments.append(p_clean)

    # 2. Run spaCy NER on each segment individually
    for seg in segments:
        doc = nlp(seg)
        for ent in doc.ents:
            clean_ent = ent.text.strip().strip(",.-| ")
            upper_ent = clean_ent.upper()
            lower_ent = clean_ent.lower()

            if not clean_ent or lower_ent in TECH_SKILL_BLACKLIST:
                continue

            if ent.label_ == "DATE":
                if clean_ent not in dates and any(char.isdigit() for char in clean_ent):
                    dates.append(clean_ent)
            elif ent.label_ == "ORG":
                # Drop 2-char tokens or state abbreviations from ORG list
                if len(clean_ent) <= 2 or upper_ent in US_STATE_ABBREVS:
                    continue
                if clean_ent not in organizations:
                    organizations.append(clean_ent)
            elif ent.label_ in ["GPE", "LOC"]:
                if clean_ent not in locations:
                    locations.append(clean_ent)

    return {
        "dates": dates,
        "organizations": organizations,
        "locations": locations
    }
