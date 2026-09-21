from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import ListFlowable, ListItem, Paragraph, SimpleDocTemplate, Spacer

ROOT = Path(__file__).resolve().parent.parent
DOCS_DIR = ROOT / "docs"

FILES = [
    (DOCS_DIR / "propuesta-ejecutiva.md", DOCS_DIR / "propuesta-ejecutiva.pdf", "Propuesta Ejecutiva"),
    (DOCS_DIR / "defensa-negociacion.md", DOCS_DIR / "defensa-negociacion.pdf", "Defensa de Negociación"),
]


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="CoverTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=26,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#245F34"),
            spaceAfter=18,
        )
    )
    styles.add(
        ParagraphStyle(
            name="DocSubtitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#5B6575"),
            spaceAfter=20,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Heading1Green",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=colors.HexColor("#245F34"),
            spaceBefore=10,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Heading2Gold",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#B7791F"),
            spaceBefore=8,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodyTextJustified",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10.5,
            leading=15,
            textColor=colors.HexColor("#1F2937"),
            spaceAfter=6,
        )
    )
    return styles


def clean_inline(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("**", "")
        .replace("`", "")
    )


def parse_markdown(md_text: str, title: str):
    styles = build_styles()
    story = []
    story.append(Spacer(1, 1.0 * cm))
    story.append(Paragraph(clean_inline(title), styles["CoverTitle"]))
    story.append(
        Paragraph(
            "PiñaLog 360 · Documento de negocios listo para exposición, entrega o impresión",
            styles["DocSubtitle"],
        )
    )

    lines = md_text.splitlines()
    paragraph_buffer: list[str] = []
    bullet_buffer: list[str] = []

    def flush_paragraph():
        nonlocal paragraph_buffer
        if paragraph_buffer:
            text = " ".join(item.strip() for item in paragraph_buffer if item.strip())
            if text:
                story.append(Paragraph(clean_inline(text), styles["BodyTextJustified"]))
            paragraph_buffer = []

    def flush_bullets():
        nonlocal bullet_buffer
        if bullet_buffer:
            items = [
                ListItem(Paragraph(clean_inline(item), styles["BodyTextJustified"]))
                for item in bullet_buffer
            ]
            story.append(
                ListFlowable(
                    items,
                    bulletType="bullet",
                    start="circle",
                    leftIndent=18,
                )
            )
            story.append(Spacer(1, 0.15 * cm))
            bullet_buffer = []

    for raw_line in lines:
        line = raw_line.rstrip()
        stripped = line.strip()

        if not stripped:
            flush_paragraph()
            flush_bullets()
            story.append(Spacer(1, 0.08 * cm))
            continue

        if stripped.startswith("# "):
            continue

        if stripped.startswith("## "):
            flush_paragraph()
            flush_bullets()
            story.append(Paragraph(clean_inline(stripped[3:]), styles["Heading1Green"]))
            continue

        if stripped.startswith("### "):
            flush_paragraph()
            flush_bullets()
            story.append(Paragraph(clean_inline(stripped[4:]), styles["Heading2Gold"]))
            continue

        if stripped.startswith("- "):
            flush_paragraph()
            bullet_buffer.append(stripped[2:])
            continue

        paragraph_buffer.append(stripped)

    flush_paragraph()
    flush_bullets()
    return story


def generate_pdf(source_path: Path, output_path: Path, title: str) -> None:
    content = source_path.read_text(encoding="utf-8")
    story = parse_markdown(content, title)

    document = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        leftMargin=2.0 * cm,
        rightMargin=2.0 * cm,
        topMargin=1.6 * cm,
        bottomMargin=1.6 * cm,
        title=title,
        author="GitHub Copilot",
    )
    document.build(story)


if __name__ == "__main__":
    for source, output, title in FILES:
        generate_pdf(source, output, title)
        print(f"Generated: {output}")
