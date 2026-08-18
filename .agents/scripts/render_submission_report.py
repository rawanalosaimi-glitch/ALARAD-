from pathlib import Path
import fitz

source = Path("attached_assets/‎⁨الاخير_ALARAD_Submission_Report⁩_1787071894309.pdf")
output = Path(".agents/outputs/submission-report-pages")
output.mkdir(parents=True, exist_ok=True)

document = fitz.open(source)
print(f"pages={document.page_count}")
print(f"metadata={document.metadata}")

for index, page in enumerate(document):
    pixmap = page.get_pixmap(matrix=fitz.Matrix(1.8, 1.8), alpha=False)
    destination = output / f"page-{index + 1:03d}.png"
    pixmap.save(destination)
    print(destination)