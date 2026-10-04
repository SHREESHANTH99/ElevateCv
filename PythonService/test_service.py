import io
import json
import requests
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def create_sample_resume_pdf(filename="sample_resume.pdf"):
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter # 612 x 792 pt
    
    y = height - 50
    
    # Name Header
    c.setFont("Helvetica-Bold", 24)
    c.drawString(50, y, "ALEX JOHNSON")
    
    y -= 25
    c.setFont("Helvetica", 10)
    c.drawString(50, y, "alex.johnson@email.com | (555) 019-2834 | San Francisco, CA | linkedin.com/in/alexj")
    
    y -= 30
    # SUMMARY
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "SUMMARY")
    y -= 18
    c.setFont("Helvetica", 10)
    c.drawString(50, y, "Experienced Senior Software Engineer with 7+ years developing scalable cloud systems and AI algorithms.")
    
    y -= 30
    # EXPERIENCE
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "EXPERIENCE")
    
    y -= 20
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, y, "Google DeepMind - Senior Software Engineer")
    c.setFont("Helvetica-Bold", 10)
    c.drawRightString(width - 50, y, "Mountain View, CA | Jan 2021 - Present")
    
    y -= 16
    c.setFont("Helvetica", 10)
    c.drawString(60, y, "- Architected distributed embedding pipelines for LLM context retrieval.")
    y -= 14
    c.drawString(60, y, "- Reduced inference latency by 35% across high-throughput services.")
    
    y -= 25
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, y, "Microsoft - Software Engineer")
    c.setFont("Helvetica-Bold", 10)
    c.drawRightString(width - 50, y, "Redmond, WA | Jun 2017 - Dec 2020")
    
    y -= 16
    c.setFont("Helvetica", 10)
    c.drawString(60, y, "- Built real-time analytics backend using Python, Azure, and Node.js.")
    
    y -= 30
    # EDUCATION
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "EDUCATION")
    
    y -= 20
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, y, "Stanford University - B.S. Computer Science")
    c.setFont("Helvetica-Bold", 10)
    c.drawRightString(width - 50, y, "Stanford, CA | Sept 2013 - May 2017")
    
    y -= 30
    # SKILLS
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "SKILLS")
    y -= 18
    c.setFont("Helvetica", 10)
    c.drawString(50, y, "Python, Node.js, TypeScript, FastAPI, React, PyTorch, Docker, Kubernetes, PostgreSQL, spaCy")
    
    c.save()
    print(f"Sample PDF created: {filename}")

def test_endpoints():
    pdf_path = "sample_resume.pdf"
    create_sample_resume_pdf(pdf_path)
    
    url_layout = "http://127.0.0.1:8000/extract-layout"
    with open(pdf_path, "rb") as f:
        files = {"file": (pdf_path, f, "application/pdf")}
        res_layout = requests.post(url_layout, files=files)
    
    layout_data = res_layout.json()
    
    print("\n========================================================")
    print("--- /extract-layout & Section Segmentation Output ---")
    print("========================================================")
    print(json.dumps(layout_data, indent=2))
    
    # Extract ALL text extracted by pdfplumber layout blocks from the uploaded PDF
    blocks = layout_data.get("blocks", [])
    extracted_text_from_pdf = "\n".join([b["content"] for b in blocks])
    
    print("\n========================================================")
    print("--- Full Text Passed to /extract-entities ---")
    print("========================================================")
    print(extracted_text_from_pdf)
    
    url_ner = "http://127.0.0.1:8000/extract-entities"
    res_ner = requests.post(url_ner, json={"text": extracted_text_from_pdf})
    
    print("\n========================================================")
    print("--- /extract-entities Output (from extracted PDF text) ---")
    print("========================================================")
    print(json.dumps(res_ner.json(), indent=2))

if __name__ == "__main__":
    test_endpoints()
