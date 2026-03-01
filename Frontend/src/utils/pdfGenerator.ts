import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export interface PDFOptions {
  elementId: string;
  fileName: string;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

interface LinkData {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const generatePDF = async (options: PDFOptions) => {
  const {
    elementId,
    fileName = "resume",
    onStart,
    onSuccess,
    onError,
    onComplete,
  } = options;
  let clone: HTMLElement | null = null;
  try {
    onStart?.();
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    // Create clone for rendering
    clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.width = "210mm";
    clone.style.padding = "20mm";
    document.body.appendChild(clone);

    // Collect all links and their positions before rendering
    const links: LinkData[] = [];
    const anchorElements = clone.querySelectorAll("a[href]");
    const cloneRect = clone.getBoundingClientRect();

    anchorElements.forEach((anchor) => {
      const href = anchor.getAttribute("href");
      if (
        href &&
        (href.startsWith("http") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:"))
      ) {
        const rect = anchor.getBoundingClientRect();
        links.push({
          url: href,
          x: rect.left - cloneRect.left,
          y: rect.top - cloneRect.top,
          width: rect.width,
          height: rect.height,
        });
      }
    });

    const scale = 2;
    const canvasOptions = {
      scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
      windowWidth: document.documentElement.offsetWidth,
      windowHeight: document.documentElement.offsetHeight,
    };

    const canvas = await html2canvas(clone, canvasOptions);
    const width = canvas.width;
    const height = canvas.height;

    const pdf = new jsPDF({
      orientation: width > height ? "landscape" : "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
    const pdfHeight = (height * pdfWidth) / width;
    const imgData = canvas.toDataURL("image/png", 1.0);

    pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);

    // Add clickable links to the PDF
    const scaleX = pdfWidth / (width / scale);
    const scaleY = pdfHeight / (height / scale);

    links.forEach((link) => {
      const pdfX = link.x * scaleX + 10;
      const pdfY = link.y * scaleY + 10;
      const pdfLinkWidth = link.width * scaleX;
      const pdfLinkHeight = link.height * scaleY;

      pdf.link(pdfX, pdfY, pdfLinkWidth, pdfLinkHeight, { url: link.url });
    });

    pdf.save(`${fileName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`);
    onSuccess?.();
  } catch (error) {
    console.error("Error generating PDF:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate PDF";
    onError?.(new Error(errorMessage));
    throw error;
  } finally {
    if (clone && document.body.contains(clone)) {
      document.body.removeChild(clone);
    }
    onComplete?.();
  }
};
const addPrintStyles = () => {
  const style = document.createElement("style");
  style.id = "pdf-print-styles";
  style.textContent = `
    @media print {
      body * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      #resume-preview {
        box-shadow: none;
        border: none;
        padding: 0;
        margin: 0;
      }
    }
  `;
  document.head.appendChild(style);
};
if (typeof window !== "undefined") {
  addPrintStyles();
}
