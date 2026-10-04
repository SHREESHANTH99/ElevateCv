import pdfplumber
import io

def extract_pdf_layout(pdf_bytes: bytes):
    layout_blocks = []
    has_tables = False
    image_count = 0
    pages_count = 0
    x0_positions = []

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        pages_count = len(pdf.pages)
        for page_idx, page in enumerate(pdf.pages):
            page_num = page_idx + 1
            
            # 1. Detect Tables & Images
            tables = page.find_tables()
            if tables and len(tables) > 0:
                has_tables = True

            if hasattr(page, "images") and page.images:
                image_count += len(page.images)

            # 2. Extract Words with Granular Layout & Typography Data
            words = page.extract_words(
                extra_attrs=["fontname", "size"],
                keep_blank_chars=False,
                use_text_flow=True
            )

            # Group words into line blocks based on vertical top proximity
            lines = []
            words_sorted = sorted(words, key=lambda w: (round(w["top"], 1), w["x0"]))
            
            current_line = []
            last_top = None

            for w in words_sorted:
                top = round(w["top"], 1)
                if last_top is None or abs(top - last_top) < 3.0:
                    current_line.append(w)
                else:
                    lines.append(current_line)
                    current_line = [w]
                last_top = top
            if current_line:
                lines.append(current_line)

            # 3. Process Line Blocks
            for line in lines:
                text = " ".join([w["text"] for w in line]).strip()
                if not text:
                    continue

                avg_font_size = sum([w.get("size", 10) for w in line]) / len(line)
                font_names = [str(w.get("fontname", "")).lower() for w in line]
                is_bold = any(b in fn for fn in font_names for b in ["bold", "heavy", "black", "semibold", "medium"])

                min_x0 = min([w["x0"] for w in line])
                max_x1 = max([w["x1"] for w in line])
                min_top = min([w["top"] for w in line])
                max_bottom = max([w["bottom"] for w in line])

                x0_positions.append(min_x0)

                layout_blocks.append({
                    "content": text,
                    "font_size": round(avg_font_size, 2),
                    "is_bold": is_bold,
                    "x0": round(min_x0, 2),
                    "y0": round(min_top, 2),
                    "x1": round(max_x1, 2),
                    "y1": round(max_bottom, 2),
                    "page_number": page_num
                })

    # 4. Multi-Column Layout Detection (x0 position clustering)
    is_multi_column = False
    if len(x0_positions) > 10:
        left_margin_count = sum(1 for x in x0_positions if x < 100)
        mid_margin_count = sum(1 for x in x0_positions if 250 <= x <= 450)
        if mid_margin_count >= 5 and left_margin_count >= 5:
            is_multi_column = True

    return {
        "blocks": layout_blocks,
        "summary": {
            "page_count": pages_count,
            "block_count": len(layout_blocks),
            "is_multi_column": is_multi_column,
            "has_tables": has_tables,
            "image_count": image_count
        }
    }
