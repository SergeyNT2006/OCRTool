# OCRtool Demo — Adobe InDesign CEP Extension

OCRtool is a CEP extension for Adobe InDesign that performs optical character recognition (OCR) on screen regions and inserts the recognized text directly into your document.

> **This repository contains the Demo version.** The demo applies a watermark (~10% of characters replaced with `*`, plus `[demo mode]` in the text). [**Get Full Version — $25**](#get-full-version) for clean OCR output.

## Features

- **Region OCR**: Draw a rectangle in InDesign to mark the area you want to recognize, then OCRtool runs OCR for that area and creates a text frame with the result.
- **OCR engine**: **Tesseract**.
- **Multiple languages**: English and German are included. Additional Tesseract languages can be downloaded from the [Tesseract tessdata repository](https://github.com/tesseract-ocr/tessdata) and placed in the extension’s `tessdata` folder.
- **Paragraph styles**: Apply any existing paragraph style to the inserted text.
- **Object style**: Uses the OCRect object style (red stroke) to mark the capture region; you can set it as the default graphic frame style for new frames.

## Requirements

- **Adobe InDesign** 2022 (17.x) through 2026 (21.x)
- **Windows 10/11** only
- **CEP runtime** 9.0+ (bundled with supported InDesign versions)

## Installation

1. **Ensure required assets are present** (see [Required Assets](#required-assets) below).
2. Close InDesign if it is running.
3. Copy the extension folder into your CEP extensions directory:
   - **Windows (Demo)**: `%APPDATA%\Adobe\CEP\extensions\OCRTooldemo`
4. Launch InDesign.
5. Open the panel via **Window → Extensions → OCRtool** (or **OCRtool Demo** if using a demo-specific build).
6. Dock the panel where it fits your workspace.

## Usage

1. **Set up OCRect style** (once per session): In the Object Styles panel, right‑click **OCRect** → **Default Graphic Frame Style**.
2. **Start OCR**: Click **Start** in the panel.
3. **Draw a rectangle**: Create a graphic frame in your document. It will get a red stroke (OCRect style).
4. **Capture**: Deselect the frame (click elsewhere). OCRtool recognizes the text from the marked area and creates a text frame with the result.
5. **Stop**: Click **Stop** when finished.

## Panel Options

- **Language**: Primary and optional second language (Tesseract). Optional script/handwriting models.
- **Paragraph style**: Style applied to the inserted text.
- **Refresh languages**: Reload available Tesseract languages.
- **Refresh styles**: Reload paragraph styles from the document.

## Get Full Version

The full version removes the watermark and delivers clean OCR text. **$25 USD** — pay with PayPal, instant download.

| Demo | Full Version |
|------|--------------|
| ~10% characters replaced with `*` | 100% accurate text |
| `[demo mode]` in output | No watermarks |
| OcrHelper-demo.exe | OcrHelper.exe |

**[→ Buy Full Version — $25](docs/purchase.html)** — PayPal payment. Download link sent by email within 24 hours.  
*(Authors: see [docs/PURCHASE-SETUP.md](docs/PURCHASE-SETUP.md) for PayPal setup.)*

## Required Assets

| Asset | Location | Status |
|-------|----------|--------|
| **OcrHelper-demo.exe** | `bin/win/` | Included in repository |
| **Icons** | `icons/` | Panel icons: `icon_normal.png`, `icon_rollover.png`, `icon_dark_normal.png`, `icon_dark_rollover.png` (20×20 px). Add manually if missing. |

## Project Structure

```
OCRTool/
├── CSXS/manifest.xml    # CEP extension manifest
├── css/styles.css
├── docs/                # User guide, purchase page, setup
│   ├── purchase.html    # Buy Full Version landing page
│   ├── PURCHASE-SETUP.md
│   └── OCRTool-User-Guide.md
├── icons/               # Panel icons
├── js/
│   ├── CSInterface.js   # Adobe CEP API
│   ├── hostscript.jsx   # ExtendScript (InDesign)
│   └── main.js          # Panel UI logic
├── tessdata/            # Tesseract language data
├── bin/win/
│   └── OcrHelper-demo.exe
└── index.html
```


## Support

For feedback or issues, contact Sergey Inozemtsev at `sergeynt2006@yandex.ru`.

## License

Copyright 2025 Sergey Inozemtsev. All rights reserved.

