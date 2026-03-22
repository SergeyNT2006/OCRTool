/**
 * OCRtool host script (ExtendScript for InDesign)
 *
 * Logic:
 * 1. On Start: creates/updates the OCRect object style. The user must manually
 *    set it as the default graphic frame style once per session via the Object
 *    Styles panel (right-click → Default Graphic Frame Style).
 * 2. On rectangle selection: applies OCRect, deselects to remove selection handles,
 *    then invokes OcrHelper.exe.
 * 3. OcrHelper.exe obtains an image of the target area marked by the rectangle,
 *    then runs OCR.
 * 4. The marker rectangle is removed; a text frame is created at the same
 *    coordinates with the recognized text.
 */

if (typeof OCRTool === "undefined") {
    var OCRTool = {};
}

/**
 * Stable dispatcher — created ONCE and always keeps the same function reference,
 * even after the script is reloaded via $.evalFile().
 * addEventListener/removeEventListener always operate on this wrapper object;
 * internally it always delegates to the most recently defined OCRTool_SelectionHandler.
 */
if (typeof OCRTool_Dispatcher === "undefined") {
    var OCRTool_Dispatcher = function(evt) {
        if (typeof OCRTool_SelectionHandler === "function") {
            OCRTool_SelectionHandler(evt);
        }
    };
}

OCRTool.running            = OCRTool.running            || false;
OCRTool.language           = OCRTool.language           || "eng";
OCRTool.engine             = OCRTool.engine             || "tesseract";
OCRTool.styleName          = OCRTool.styleName          || "";
OCRTool.extensionPath      = OCRTool.extensionPath      || "";
OCRTool.listener           = OCRTool.listener           || null;
OCRTool._handling          = OCRTool._handling          || false;
OCRTool.savedLayers        = OCRTool.savedLayers        || [];
OCRTool.savedDefaults      = OCRTool.savedDefaults      || null;

function OCRTool_Log(message) {
    try { $.writeln("[OCRtool] " + message); } catch (e) {}
}

function OCRTool_IsMac() {
    try { return ($.os || "").toLowerCase().indexOf("mac") >= 0; } catch (e) {}
    return false;
}

function OCRTool_IsWindows() {
    try { return ($.os || "").toLowerCase().indexOf("windows") >= 0; } catch (e) {}
    return false;
}

function OCRTool_GetRedColor(doc) {
    try {
        var red = doc.colors.itemByName("OCRToolRed");
        if (!red.isValid) {
            doc.colors.add({
                name: "OCRToolRed",
                model: ColorModel.PROCESS,
                space: ColorSpace.RGB,
                colorValue: [255, 0, 0]
            });
            red = doc.colors.itemByName("OCRToolRed");
        }
        return red;
    } catch (e) {
        try { return doc.swatches.item("Red"); } catch (e2) {}
    }
    return doc.swatches.itemByName("Black");
}

/**
 * Applies a 2pt red stroke to the given item using the OCRect object style.
 * Falls back to direct property assignment if the style is not available.
 */
function OCRTool_ApplyRedStroke(item, doc) {
    try {
        var ocRect = doc.objectStyles.itemByName("OCRect");
        if (ocRect && ocRect.isValid) {
            item.applyObjectStyle(ocRect, true);
        } else {
            item.fillColor = doc.swatches.itemByName("None");
            item.strokeColor = OCRTool_GetRedColor(doc);
            item.strokeWeight = 2;
        }
    } catch (e) {
        try {
            item.fillColor = doc.swatches.itemByName("None");
            item.strokeColor = OCRTool_GetRedColor(doc);
            item.strokeWeight = 2;
        } catch (e2) {
            OCRTool_Log("ApplyRedStroke: " + e.message);
        }
    }
}

/**
 * Creates or updates the OCRect object style in the document
 * (transparent fill, 2pt pure-red stroke).
 *
 * Note: programmatic setting of the default graphic frame style is not exposed
 * by InDesign's ExtendScript API. The user must assign OCRect as the default
 * manually via the Object Styles panel (right-click → Default Graphic Frame
 * Style) once per InDesign session.
 */
function OCRTool_SetupOCRect(doc) {
    try {
        var red  = OCRTool_GetRedColor(doc);
        var none = doc.swatches.itemByName("None");

        var ocRect = doc.objectStyles.itemByName("OCRect");
        if (!ocRect.isValid) {
            ocRect = doc.objectStyles.add({ name: "OCRect" });
        }
        ocRect.fillColor    = none;
        ocRect.strokeColor  = red;
        ocRect.strokeWeight = 2;

        OCRTool_Log("OCRect style ready");
    } catch (e) {
        OCRTool_Log("OCRect setup error: " + e.message);
    }
}

/**
 * Sets the default drawing stroke/fill so newly drawn rectangles get
 * the expected red outline immediately after pressing "Start".
 */
function OCRTool_SetDefaultStrokeToRed(doc) {
    try {
        var red  = OCRTool_GetRedColor(doc);
        var none = doc.swatches.itemByName("None");

        // Document-level defaults for newly created page items (rectangles, etc.).
        // This is more reliable than app.strokeColor for controlling defaults.
        try { doc.pageItemDefaults.fillColor   = none; } catch (ePFill) {}
        try { doc.pageItemDefaults.fillTint    = 100;  } catch (ePTint) {}
        try { doc.pageItemDefaults.strokeColor = red;  } catch (ePStroke) {}
        try { doc.pageItemDefaults.strokeTint  = 100;  } catch (ePSTint) {}
        try { doc.pageItemDefaults.strokeWeight = 2;   } catch (ePW) {}

        // Some tools read rectangle-specific defaults if available.
        try { doc.rectangleDefaults.fillColor   = none; } catch (eRFill) {}
        try { doc.rectangleDefaults.strokeColor = red;  } catch (eRStroke) {}
        try { doc.rectangleDefaults.strokeWeight = 2;   } catch (eRW) {}

        // Fallback to app-level defaults (not always honored).
        try { app.fillColor   = none; } catch (eFill) {}
        try { app.strokeColor = red;  } catch (eStroke) {}
        try { app.strokeWeight = 2;   } catch (eW) {}

        OCRTool_Log("Default stroke set to OCRToolRed");
    } catch (e) {
        OCRTool_Log("SetDefaultStroke error: " + e.message);
    }
}

function OCRTool_SaveCurrentDrawingDefaults(doc) {
    try {
        if (OCRTool.savedDefaults) return;

        OCRTool.savedDefaults = {
            page: {},
            rect: {},
            app:  {}
        };

        try { OCRTool.savedDefaults.page.fillColor = doc.pageItemDefaults.fillColor; } catch (e) {}
        try { OCRTool.savedDefaults.page.fillTint = doc.pageItemDefaults.fillTint; } catch (e) {}
        try { OCRTool.savedDefaults.page.strokeColor = doc.pageItemDefaults.strokeColor; } catch (e) {}
        try { OCRTool.savedDefaults.page.strokeTint = doc.pageItemDefaults.strokeTint; } catch (e) {}
        try { OCRTool.savedDefaults.page.strokeWeight = doc.pageItemDefaults.strokeWeight; } catch (e) {}

        try { OCRTool.savedDefaults.rect.fillColor = doc.rectangleDefaults.fillColor; } catch (e) {}
        try { OCRTool.savedDefaults.rect.strokeColor = doc.rectangleDefaults.strokeColor; } catch (e) {}
        try { OCRTool.savedDefaults.rect.strokeWeight = doc.rectangleDefaults.strokeWeight; } catch (e) {}

        try { OCRTool.savedDefaults.app.fillColor = app.fillColor; } catch (e) {}
        try { OCRTool.savedDefaults.app.strokeColor = app.strokeColor; } catch (e) {}
        try { OCRTool.savedDefaults.app.strokeWeight = app.strokeWeight; } catch (e) {}

        OCRTool_Log("Saved drawing defaults");
    } catch (e) {
        OCRTool_Log("SaveDrawingDefaults error: " + e.message);
    }
}

function OCRTool_RestoreDrawingDefaults(doc) {
    try {
        if (!OCRTool.savedDefaults) return;
        var d = OCRTool.savedDefaults;

        if (d.page) {
            try { if (d.page.fillColor) doc.pageItemDefaults.fillColor = d.page.fillColor; } catch (e) {}
            try { if (d.page.fillTint !== undefined) doc.pageItemDefaults.fillTint = d.page.fillTint; } catch (e) {}
            try { if (d.page.strokeColor) doc.pageItemDefaults.strokeColor = d.page.strokeColor; } catch (e) {}
            try { if (d.page.strokeTint !== undefined) doc.pageItemDefaults.strokeTint = d.page.strokeTint; } catch (e) {}
            try { if (d.page.strokeWeight !== undefined) doc.pageItemDefaults.strokeWeight = d.page.strokeWeight; } catch (e) {}
        }

        if (d.rect) {
            try { if (d.rect.fillColor) doc.rectangleDefaults.fillColor = d.rect.fillColor; } catch (e) {}
            try { if (d.rect.strokeColor) doc.rectangleDefaults.strokeColor = d.rect.strokeColor; } catch (e) {}
            try { if (d.rect.strokeWeight !== undefined) doc.rectangleDefaults.strokeWeight = d.rect.strokeWeight; } catch (e) {}
        }

        if (d.app) {
            try { if (d.app.fillColor) app.fillColor = d.app.fillColor; } catch (e) {}
            try { if (d.app.strokeColor) app.strokeColor = d.app.strokeColor; } catch (e) {}
            try { if (d.app.strokeWeight !== undefined) app.strokeWeight = d.app.strokeWeight; } catch (e) {}
        }

        OCRTool.savedDefaults = null;
        OCRTool_Log("Restored drawing defaults");
    } catch (e) {
        OCRTool_Log("RestoreDrawingDefaults error: " + e.message);
    }
}

/**
 * Locates OcrHelper.exe (or OcrHelper-demo.exe for demo distribution).
 * Search order: bin/ folder (production), then Debug/Release/Demo build
 * output folders (developer environment).
 * Returns an existing File object, or null if no executable is found.
 */
function OCRTool_FindExe(extPath) {
    var sep = extPath.indexOf("/") >= 0 ? "/" : "\\";
    // Full version takes priority; if missing, use demo exe (extension runs in demo mode).
    var candidates = [
        extPath + sep + "bin" + sep + "win" + sep + "OcrHelper.exe",
        extPath + sep + "bin" + sep + "win" + sep + "OcrHelper-demo.exe",
        extPath + sep + "bin" + sep + "mac" + sep + "OcrHelper.app" + sep + "Contents" + sep + "MacOS" + sep + "OcrHelper"
    ];
    for (var i = 0; i < candidates.length; i++) {
        var f = new File(candidates[i]);
        if (f.exists) return f;
    }
    return null;
}

/**
 * Runs OcrHelper --list-languages and returns a newline-separated list of
 * available language codes. Each line has a prefix:
 *   "tesseract:eng"         — Tesseract language
 *   "tesseract:script/Latin"— Tesseract script model
 * Returns a string starting with "ERR:" on failure.
 */
function OCRTool_GetAvailableLanguages(extensionPath) {
    try {
        var extPath = ((extensionPath || OCRTool.extensionPath || "")).replace(/\\/g, "/");
        if (!extPath) return "ERR:extensionPath empty";

        var exeFile = OCRTool_FindExe(extPath);
        if (!exeFile) return "ERR:OcrHelper.exe not found";

        var tempFile   = new File(Folder.temp.fsName + "/ocrtool_langs_" + (new Date()).getTime() + ".txt");
        var exeEsc     = exeFile.fsName.replace(/"/g, '""');
        var tempEsc    = tempFile.fsName.replace(/"/g, '""');

        if (OCRTool_IsWindows()) {
            var extPathEsc = extPath.replace(/\//g, "\\").replace(/"/g, '""');
            var vbsCode =
                'Dim sh: Set sh = CreateObject("WScript.Shell")\r\n' +
                'Dim exec: Set exec = sh.Exec("""' + exeEsc + '"" ""--list-languages"" ""' + extPathEsc + '""")\r\n' +
                'Dim out: out = exec.StdOut.ReadAll()\r\n' +
                'Dim fso: Set fso = CreateObject("Scripting.FileSystemObject")\r\n' +
                'Dim f: Set f = fso.CreateTextFile("' + tempEsc + '", True)\r\n' +
                'f.Write out\r\n' +
                'f.Close\r\n';
            app.doScript(vbsCode, ScriptLanguage.visualBasic);
        } else if (OCRTool_IsMac()) {
            // macOS: run helper via AppleScript and redirect stdout to a temp file.
            var shPath  = exeFile.fsName.replace(/"/g, '\\"');
            var outPath = tempFile.fsName.replace(/"/g, '\\"');
            var extArg  = extPath.replace(/"/g, '\\"');
            var apple =
                'do shell script \"' + shPath + ' --list-languages ' + extArg + ' > ' + outPath + '\"';
            app.doScript(apple, ScriptLanguage.applescript);
        } else {
            return "ERR:unsupported OS";
        }

        if (!tempFile.exists) return "ERR:temp file not created";
        tempFile.open("r");
        var result = tempFile.read();
        tempFile.close();
        try { tempFile.remove(); } catch (er) {}
        return result;
    } catch (e) {
        return "ERR:" + e.message;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Layer management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ensures OCR_layer exists and is properly configured:
 *   - creates it on top of all layers if it does not exist;
 *   - if it exists, ensures it is at the top of the layer stack,
 *     unlocked, visible, and colored blue.
 * Sets OCR_layer as the active document layer and returns it.
 */
function OCRTool_EnsureOCRLayer(doc) {
    try {
        var ocrLayer = doc.layers.itemByName("OCR_layer");
        if (!ocrLayer.isValid) {
            ocrLayer = doc.layers.add();
            ocrLayer.name = "OCR_layer";
            OCRTool_Log("OCR_layer created");
        } else {
            OCRTool_Log("OCR_layer already exists");
        }
        ocrLayer.layerColor = UIColors.BLUE;
        ocrLayer.locked     = false;
        ocrLayer.visible    = true;
        // Move to the top of the layer stack if not already there.
        if (doc.layers[0].name !== "OCR_layer") {
            ocrLayer.move(LocationOptions.AT_BEGINNING);
            OCRTool_Log("OCR_layer moved to top");
        }
        doc.activeLayer = ocrLayer;
        return ocrLayer;
    } catch (e) {
        OCRTool_Log("EnsureOCRLayer error: " + e.message);
        return null;
    }
}

/**
 * Saves the locked state and color of every layer except OCR_layer, then
 * locks all other layers and recolors them to LIGHT_GRAY. This prevents
 * accidental selection or OCR of objects on other layers, and ensures their
 * colored borders do not interfere with red-rectangle detection.
 */
function OCRTool_SaveAndLockLayers(doc) {
    try {
        OCRTool.savedLayers = [];
        for (var i = 0; i < doc.layers.length; i++) {
            var layer = doc.layers[i];
            if (layer.name === "OCR_layer") continue;
            OCRTool.savedLayers.push({
                name:   layer.name,
                locked: layer.locked,
                color:  layer.layerColor
            });
            layer.locked     = true;
            layer.layerColor = UIColors.LIGHT_GRAY;
        }
        OCRTool_Log("Saved and locked " + OCRTool.savedLayers.length + " layer(s)");
    } catch (e) {
        OCRTool_Log("SaveAndLockLayers error: " + e.message);
    }
}

/**
 * Restores the locked state and original color of all layers saved by
 * OCRTool_SaveAndLockLayers. Does not modify OCR_layer.
 */
function OCRTool_RestoreLayers(doc) {
    try {
        if (!OCRTool.savedLayers || OCRTool.savedLayers.length === 0) {
            OCRTool_Log("RestoreLayers: nothing to restore");
            return;
        }
        for (var i = 0; i < OCRTool.savedLayers.length; i++) {
            var saved = OCRTool.savedLayers[i];
            try {
                var layer = doc.layers.itemByName(saved.name);
                if (layer.isValid) {
                    layer.locked     = saved.locked;
                    layer.layerColor = saved.color;
                }
            } catch (eL) {
                OCRTool_Log("RestoreLayer skip '" + saved.name + "': " + eL.message);
            }
        }
        OCRTool.savedLayers = [];
        OCRTool_Log("Layers restored");
    } catch (e) {
        OCRTool_Log("RestoreLayers error: " + e.message);
    }
}

function OCRTool_Start(languageCode, styleName, extensionPath, engine) {
    try {
        if (app.documents.length === 0) return "No document open";
        OCRTool.language      = languageCode || "eng";
        OCRTool.engine        = "tesseract";
        OCRTool.styleName     = styleName || "";
        OCRTool.extensionPath = (extensionPath || "").replace(/\\/g, "/");
        OCRTool.running       = true;

        if (OCRTool.listener && OCRTool.listener.isValid && app.activeWindow) {
            app.activeWindow.removeEventListener("afterSelectionChanged", OCRTool_Dispatcher);
            OCRTool.listener = null;
        }
        if (!app.activeWindow) return "No active window";

        var doc = app.activeDocument;
        OCRTool_EnsureOCRLayer(doc);
        OCRTool_SaveAndLockLayers(doc);
        OCRTool_SetupOCRect(doc);
        OCRTool_SaveCurrentDrawingDefaults(doc);
        OCRTool_SetDefaultStrokeToRed(doc);

        OCRTool.listener = app.activeWindow.addEventListener("afterSelectionChanged", OCRTool_Dispatcher);
        OCRTool_Log("Started. Language=" + OCRTool.language);
        return "Started";
    } catch (e) {
        OCRTool_Log("Start error: " + e.message);
        return "Error: " + e.message;
    }
}

function OCRTool_Stop() {
    try {
        OCRTool.running = false;
        if (OCRTool.listener && OCRTool.listener.isValid && app.activeWindow) {
            app.activeWindow.removeEventListener("afterSelectionChanged", OCRTool_Dispatcher);
        }
        OCRTool.listener = null;
        if (app.documents.length > 0) {
            var doc = app.activeDocument;
            OCRTool_RestoreLayers(doc);
            OCRTool_RestoreDrawingDefaults(doc);
        }
        OCRTool_Log("Stopped.");
        return "Stopped";
    } catch (e) {
        OCRTool_Log("Stop error: " + e.message);
        return "Error: " + e.message;
    }
}

function OCRTool_SelectionHandler(evt) {
    if (!OCRTool.running || OCRTool._handling) return;
    OCRTool._handling = true;

    try {
        if (app.documents.length === 0) return;
        var win = app.activeWindow;
        if (!win) return;
        var sel = win.selection;
        if (!sel || sel.length !== 1) return;

        var item = sel[0];
        if (!(item instanceof Rectangle)) return;

        // Process only rectangles drawn on OCR_layer; ignore all other layers.
        try {
            if (!item.itemLayer || item.itemLayer.name !== "OCR_layer") return;
        } catch (eLayerCheck) {}

        var doc = app.activeDocument;

        OCRTool_ApplyRedStroke(item, doc);

        // Deselect: selection handles and the blue OCR_layer color border must
        // not appear in the image analyzed by OcrHelper.exe.
        try {
            while (app.selection.length > 0) {
                app.selection[0].selected = false;
            }
        } catch (eSel) {}

        var gb     = item.geometricBounds;
        var parent = item.parent;

        var appliedStyle = null;
        if (OCRTool.styleName) {
            try {
                appliedStyle = doc.paragraphStyles.itemByName(OCRTool.styleName);
                if (!appliedStyle.isValid) appliedStyle = null;
            } catch (e) { appliedStyle = null; }
        }
        if (!appliedStyle) appliedStyle = doc.paragraphStyles.itemByName("[Basic Paragraph]");

        var text    = "";
        var extPath = OCRTool.extensionPath;
        var sep     = extPath.indexOf("/") >= 0 ? "/" : "\\";

        var exeFile = OCRTool_FindExe(extPath);
        if (!exeFile) {
            text = "[OCR Error: OcrHelper.exe not found]";
        } else {
            var tempFile  = new File(Folder.temp.fsName + sep + "ocrtool_" + (new Date()).getTime() + ".txt");
            var lang      = (OCRTool.language || "eng").replace(/"/g, "");
            var engine    = "tesseract";
            var extDir    = OCRTool_IsMac() ? OCRTool.extensionPath : OCRTool.extensionPath.replace(/\//g, "\\");
            var zoom      = 100;
            try { zoom = Math.round(app.activeWindow.zoomPercentage); } catch (ez) {}

            var exeEsc    = exeFile.fsName.replace(/"/g, '""');
            var langEsc   = lang.replace(/"/g, '""');
            var zoomStr   = String(zoom);
            var extDirEsc = extDir.replace(/"/g, '""');
            var engineEsc = engine.replace(/"/g, '""');
            var tempEsc   = tempFile.fsName.replace(/"/g, '""');

            // Yield to InDesign's UI thread so the red stroke is fully redrawn on
            // screen before OcrHelper.exe analyzes the image.
            try { $.sleep(400); } catch (eSleep) {}

            try {
                if (OCRTool_IsWindows()) {
                    var vbsCode =
                        'Dim sh: Set sh = CreateObject("WScript.Shell")\r\n' +
                        'Dim exec: Set exec = sh.Exec("""' + exeEsc + '"" ""' + langEsc + '"" ""' + zoomStr + '"" ""' + extDirEsc + '"" ""' + engineEsc + '""")\r\n' +
                        'Dim out: out = exec.StdOut.ReadAll()\r\n' +
                        'Dim fso: Set fso = CreateObject("Scripting.FileSystemObject")\r\n' +
                        'Dim f: Set f = fso.CreateTextFile("' + tempEsc + '", True)\r\n' +
                        'f.Write out\r\n' +
                        'f.Close\r\n';
                    app.doScript(vbsCode, ScriptLanguage.visualBasic);
                } else if (OCRTool_IsMac()) {
                    // macOS: run helper via AppleScript and redirect stdout to temp file.
                    var shPath  = exeFile.fsName.replace(/"/g, '\\"');
                    var outPath = tempFile.fsName.replace(/"/g, '\\"');
                    // Keep arguments simple (no quotes) — extDir in CEP is a normal path.
                    var cmd = shPath + ' ' + lang + ' ' + zoomStr + ' ' + OCRTool.extensionPath + ' ' + engine + ' > ' + outPath;
                    var apple = 'do shell script \"' + cmd.replace(/"/g, '\\"') + '\"';
                    app.doScript(apple, ScriptLanguage.applescript);
                }
            } catch (callErr) {
                OCRTool_Log("External call error: " + callErr.message);
            }

            if (tempFile.exists) {
                tempFile.open("r");
                text = tempFile.read();
                tempFile.close();
                try { tempFile.remove(); } catch (er) {}
            }

            if (!text || text.length === 0) text = "[No text recognized]";
        }

        item.remove();
        var tfProps = { geometricBounds: gb };
        try {
            var ocrLayerForTF = doc.layers.itemByName("OCR_layer");
            if (ocrLayerForTF.isValid) tfProps.itemLayer = ocrLayerForTF;
        } catch (eTFLayer) {}
        var tf = parent.textFrames.add(tfProps);
        tf.contents = text;
        tf.parentStory.appliedParagraphStyle = appliedStyle;

    } catch (e) {
        OCRTool_Log("SelectionHandler error: " + e.message);
    } finally {
        OCRTool._handling = false;
    }
}