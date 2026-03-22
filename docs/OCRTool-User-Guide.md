# OCRtool — User Guide

OCRtool turns text visible on your screen into editable InDesign text. Draw a rectangle to mark the area around any text—in a PDF, image, or webpage—then the extension runs OCR for that area and inserts the result into your document.

---

> **Current public release:** Windows 10/11 only.

## Requirements

- **Adobe InDesign** 2022 (17.x) through 2026 (21.x)
- **Windows 10/11** only
- Screen content with readable text (scans, PDFs, screenshots, web pages)

---

## Installation

1. Close InDesign if it is running.
2. Install the extension from Adobe Exchange, or double‑click the `.zxp` file if you have it locally.
3. Launch InDesign.
4. Open the panel: **Window → Extensions → OCRtool**.
5. Dock the panel where it suits your workspace.

---

## Quick Start

1. **Set up OCRect style** (once per InDesign session):  
   In the **Object Styles** panel, right‑click **OCRect** → **Default Graphic Frame Style**.

2. **Start OCR**: Click **Start** in the OCRtool panel.

3. **Draw a rectangle**: Create a graphic frame around the text you want to capture. It will get a red stroke (OCRect style).

4. **Capture**: Click elsewhere to deselect the frame. OCRtool recognizes the text from the marked area and creates a text frame with the result.

5. **Stop**: Click **Stop** when finished.

---

## Panel Options

| Option | Description |
|--------|-------------|
| **OCR Engine** | **Tesseract**. |
| **Language** | Primary language for recognition. |
| **Second language** | Optional; useful for mixed-language content. |
| **Paragraph style** | Style applied to the inserted text. |
| **Refresh languages** | Reload available languages from the engine. |
| **Refresh styles** | Reload paragraph styles from the document. |

**Language packs:** The extension includes English and German. For additional Tesseract languages, download the language data (`.traineddata` files) from the [Tesseract GitHub](https://github.com/tesseract-ocr/tessdata) and place them in the extension’s `tessdata` folder, then click **Refresh languages**.

---

## Tips for Better Results

- **Image quality**: Clear, high-contrast text works best. Blurry or low-resolution text may be misrecognized.
- **Language**: Set the correct language before capture. Wrong language can cause many errors.
- **Frame size**: Draw the frame close around the text to avoid capturing extra clutter.
- **Overlapping windows**: Make sure the source content is visible and not covered by other windows when you deselect.
- **Multiple captures**: Capture text in order if you need a specific sequence in the layout.

---

## Typical Workflows

**Scanned documents or images:** Place the image in InDesign, draw frames over each text block, and capture. Each block becomes an editable text frame.

**PDFs:** Open the PDF in a viewer, position it on screen, then use OCRtool to capture text regions and insert them into your InDesign document.

**Web pages or references:** Display the content on screen, draw frames around the needed text, and capture into InDesign.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **Panel doesn’t appear** | Check **Window → Extensions → OCRtool**. Restart InDesign if needed. |
| **Red rectangle not found** | Ensure the frame is visible on screen when you deselect. Minimize or move overlaying windows. |
| **Wrong or garbled text** | Choose the correct language and verify the selected Tesseract language matches the source text. |
| **Languages list is empty** | Click **Refresh languages**. For Tesseract, ensure language data is installed (English and German are included; other languages: download from [Tesseract tessdata](https://github.com/tesseract-ocr/tessdata) and place in the extension’s `tessdata` folder). |
| **Styles list is empty** | Create at least one paragraph style in the document, then click **Refresh styles**. |
| **OcrHelper.exe not found** | Reinstall the extension. The executable should be in the extension’s `bin` folder. |

---

## Support

For questions or issues, contact Sergey Inozemtsev at `sergeynt2006@yandex.ru`.

---

*Copyright 2025 Sergey Inozemtsev. All rights reserved.*
