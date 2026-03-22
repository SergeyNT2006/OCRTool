# Setting Up OCRtool Full Version Sales

This guide explains how to receive $25 PayPal payments and manually send the full version (OcrHelper.exe) to customers.

## PayPal button (manual fulfillment)

1. **Open** `docs/purchase.html`
2. **Replace** `YOUR_PAYPAL_EMAIL` with your PayPal account email (the one you receive payments to)
3. **Host the page** (e.g. GitHub Pages — see below)
4. **When a customer pays**: PayPal sends you an email with the transaction. The payer's email is in the payment details. Reply or send them the download link for OcrHelper.exe.

## Hosting the purchase page (GitHub Pages)

1. Push the repo to GitHub
2. **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: `main`, folder: **/docs**
5. Save — the page will be at `https://YOUR_USERNAME.github.io/OCRTool/purchase.html`
6. In `js/main.js`, set `PURCHASE_URL = "https://YOUR_USERNAME.github.io/OCRTool/purchase.html"`

## Files to update

| File | What to change |
|------|----------------|
| `docs/purchase.html` | `YOUR_PAYPAL_EMAIL` → your PayPal email |
| `js/main.js` | `PURCHASE_URL` → your purchase page URL |
