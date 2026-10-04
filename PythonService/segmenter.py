import re

SECTION_PATTERNS = {
    "Summary": r"^(summary|profile|about\s*me|objective|professional\s*summary|overview)$",
    "Experience": r"^(experience|work\s*experience|employment\s*history|work\s*history|professional\s*experience|career\s*history)$",
    "Education": r"^(education|academic\s*background|qualifications|academic\s*history)$",
    "Skills": r"^(skills|technical\s*skills|technologies|core\s*competencies|expertise|skills\s*&\s*tools)$",
    "Projects": r"^(projects|personal\s*projects|key\s*projects|academic\s*projects|portfolio)$",
    "Certifications": r"^(certifications|licenses|certifications\s*&\s*licenses|courses)$"
}

def identify_section_heading(text: str):
    clean = re.sub(r"[^a-zA-Z\s]", "", text.strip()).strip().lower()
    for section_name, pattern in SECTION_PATTERNS.items():
        if re.search(pattern, clean):
            return section_name
    return None

def segment_layout_blocks(blocks: list):
    if not blocks:
        return {
            "sections": {},
            "unmapped": []
        }

    # 1. Determine baseline font size
    font_sizes = [b["font_size"] for b in blocks if b.get("font_size")]
    if font_sizes:
        sorted_sizes = sorted(font_sizes)
        median_font_size = sorted_sizes[len(sorted_sizes) // 2]
    else:
        median_font_size = 10.0

    sections = {
        "Contact": [],
        "Summary": [],
        "Experience": [],
        "Education": [],
        "Skills": [],
        "Projects": [],
        "Certifications": [],
        "Other": []
    }

    current_section = "Contact"

    for block in blocks:
        text = block.get("content", "").strip()
        if not text:
            continue

        font_size = block.get("font_size", 10.0)
        is_bold = block.get("is_bold", False)

        # Check if line looks like a heading:
        # 1. Short text (< 40 chars)
        # 2. Matches section keyword pattern
        # 3. Font size >= baseline or is bold
        matched_section = identify_section_heading(text)
        is_heading_style = (font_size > median_font_size * 1.15) or (is_bold and len(text) < 40)

        if matched_section and is_heading_style:
            current_section = matched_section
            continue
        elif matched_section and len(text.split()) <= 3:
            # Fallback for exact section names even if font size is close
            current_section = matched_section
            continue

        sections[current_section].append(block)

    # Clean up empty sections
    active_sections = {k: v for k, v in sections.items() if len(v) > 0}

    return {
        "sections": active_sections,
        "median_font_size": median_font_size
    }
