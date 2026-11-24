"""Rakit evidence .docx dari manifest.jsonl hasil capture.
Pakai: python scripts/evidence/build_evidence_docx.py <folder_sesi> [--title T] [--case TC-001] [--maxw 1920] [--out file.docx]"""
import argparse, io, json, os, re, time
from docx import Document
from docx.shared import Pt, RGBColor, Emu
from docx.oxml.ns import qn
from PIL import Image

NUM = re.compile(r"^\s*(?:langkah\s*)?\d+\s*[.):-]\s*", re.I)
MAX_W_EMU = 5486400  # 6 inci


def norm(t):
    return re.sub(r"\s+", " ", NUM.sub("", t or "")).strip().lower()


def compose(entries):
    """Kelompokkan per case; capture ulang dengan step (atau expected) yang sama menggantikan yang lama di posisinya."""
    cases, order = {}, []
    for e in entries:
        c = (e.get("case") or "Tanpa judul case").strip()
        if c not in cases:
            cases[c] = []
            order.append(c)
        s, x = norm(e.get("step")), norm(e.get("expected"))
        key = ("s", s) if s else ("e", x) if x else ("f", e.get("file") or id(e))
        slots = cases[c]
        i = next((k for k, (kk, _) in enumerate(slots) if kk == key), None)
        if i is None:
            slots.append((key, e))
        else:
            slots[i] = (key, e)
    return [(c, [e for _, e in cases[c]]) for c in order]


def setup_styles(doc):
    n = doc.styles["Normal"]
    n.font.name, n.font.size = "Calibri", Pt(11)
    n.element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
    n.paragraph_format.space_after, n.paragraph_format.line_spacing = Pt(6), 1.15
    h = doc.styles["Heading 1"]
    h.font.name, h.font.size, h.font.bold = "Calibri", Pt(18), True
    h.font.color.rgb = RGBColor(0, 0, 0)
    h.element.rPr.rFonts.set(qn("w:asciiTheme"), "")  # cegah font tema menimpa Calibri
    h.paragraph_format.space_before, h.paragraph_format.space_after = Pt(18), Pt(6)
    h.paragraph_format.keep_with_next = True


def add_image(doc, path, max_px):
    img = Image.open(path)
    if max_px and img.width > max_px:
        img = img.convert("RGB").resize((max_px, round(img.height * max_px / img.width)), Image.LANCZOS)
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="JPEG", quality=92, optimize=True, subsampling=0)
    buf.seek(0)
    doc.add_picture(buf, width=Emu(min(MAX_W_EMU, img.width * 9525)))


def build(session, title="", case_filter="", max_px=1920, out=None):
    with open(os.path.join(session, "manifest.jsonl"), encoding="utf-8") as f:
        entries = [json.loads(l) for l in f if l.strip()]
    if case_filter:
        entries = [e for e in entries if case_filter.lower() in (e.get("case") or "").lower()]
    if not entries:
        raise SystemExit("Manifest kosong / tidak ada case yang cocok.")
    doc = Document()
    setup_styles(doc)
    if title:
        r = doc.add_paragraph().add_run(title)
        r.bold, r.font.size = True, Pt(24)
    missing = 0
    for case, items in compose(entries):
        doc.add_heading(case, level=1)
        no, seen = 0, set()
        for e in items:
            step = NUM.sub("", (e.get("step") or "").strip())
            if step:
                no += 1
                doc.add_paragraph(f"{no}. {step}")
            exp = (e.get("expected") or "").strip()
            if exp and exp not in seen:
                seen.add(exp)
                doc.add_paragraph().add_run("Expected: " + exp).bold = True
                if (e.get("result") or "").strip():
                    doc.add_paragraph("Hasil: " + e["result"].strip())
            if e.get("file"):
                p = os.path.join(session, e["file"])
                if os.path.isfile(p):
                    add_image(doc, p, max_px)
                else:
                    missing += 1
                    doc.add_paragraph(f"[Gambar tidak ditemukan: {e['file']}]")
    out = out or os.path.join(session, f"dokumentasi-{time.strftime('%Y%m%d-%H%M')}.docx")
    doc.save(out)
    print(f"OK: {out} ({len(entries)} capture, {missing} gambar hilang)")


if __name__ == "__main__":
    a = argparse.ArgumentParser()
    a.add_argument("session")
    a.add_argument("--title", default="")
    a.add_argument("--case", default="")
    a.add_argument("--maxw", type=int, default=1920)
    a.add_argument("--out")
    o = a.parse_args()
    build(o.session, o.title, o.case, o.maxw, o.out)
