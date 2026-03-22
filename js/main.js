(function () {
  var cs = null;
  try {
    if (typeof CSInterface !== "undefined") {
      cs = new CSInterface();
    }
  } catch (e) {
    // running outside CEP, ignore
  }

  // Purchase page URL — use your GitHub Pages link or direct Gumroad product URL
  // Example: "https://YOUR_USERNAME.github.io/OCRTool/docs/purchase.html"
  var PURCHASE_URL = "https://YOUR_USERNAME.github.io/OCRTool/docs/purchase.html";

  function $(id) {
    return document.getElementById(id);
  }

  function log(msg) {
    var el = $("log");
    if (!el) return;
    var now = new Date();
    var ts = now.toISOString().substring(11, 19);
    el.value += "[" + ts + "] " + msg + "\n";
    el.scrollTop = el.scrollHeight;
  }

  function setStatus(running) {
    var status = $("status-indicator");
    if (!status) return;
    status.textContent = running ? "Running" : "Stopped";
    status.classList.remove("status-running", "status-stopped");
    status.classList.add(running ? "status-running" : "status-stopped");
    $("start-btn").disabled = running;
    $("stop-btn").disabled = !running;
  }

  function evalScript(code, cb) {
    if (!cs) {
      log("CSInterface not available (test mode)");
      if (cb) cb("");
      return;
    }
    cs.evalScript(code, function (result) {
      if (cb) cb(result);
    });
  }

  function ensureHostScriptLoaded(cb) {
    if (!cs) {
      if (cb) cb("");
      return;
    }

    var extPath = cs.getSystemPath("extension");
    // Normalize to a path ExtendScript's File() understands.
    var scriptPath = (extPath + "/js/hostscript.jsx").replace(/\\/g, "/");

    // Load/refresh ExtendScript into host context reliably.
    var code =
      '(function(){try{var f=new File(' +
      JSON.stringify(scriptPath) +
      ');if(!f.exists){return "missing:"+f.fsName;}$.evalFile(f);return "ok";}catch(e){return "err:"+e;}})()';

    evalScript(code, function (res) {
      if (res && typeof res === "string" && res.indexOf("err:") === 0) {
        log("Hostscript load failed: " + res);
      } else if (res && typeof res === "string" && res.indexOf("missing:") === 0) {
        log("Hostscript missing: " + res);
      }
      if (cb) cb(res || "");
    });
  }

  // ── Tesseract language names (ISO 639-3 / special codes) ─────────────
  var TESS_LANG_NAMES = {
    "afr": "Afrikaans", "amh": "Amharic", "ara": "Arabic", "asm": "Assamese",
    "aze": "Azerbaijani", "aze_cyrl": "Azerbaijani (Cyrillic)",
    "bel": "Belarusian", "ben": "Bengali", "bod": "Tibetan", "bos": "Bosnian",
    "bre": "Breton", "bul": "Bulgarian", "cat": "Catalan", "ceb": "Cebuano",
    "ces": "Czech", "chi_sim": "Chinese Simplified", "chi_sim_vert": "Chinese Simplified (vert)",
    "chi_tra": "Chinese Traditional", "chi_tra_vert": "Chinese Traditional (vert)",
    "chr": "Cherokee", "cos": "Corsican", "cym": "Welsh", "dan": "Danish",
    "deu": "Deutsch", "div": "Dhivehi", "dzo": "Dzongkha", "ell": "Greek",
    "eng": "English", "enm": "English (Middle)", "epo": "Esperanto", "est": "Estonian",
    "eus": "Basque", "fao": "Faroese", "fas": "Persian", "fil": "Filipino",
    "fin": "Finnish", "fra": "Français", "frk": "Frankish", "frm": "French (Middle)",
    "fry": "Western Frisian", "gla": "Scottish Gaelic", "gle": "Irish",
    "glg": "Galician", "grc": "Greek (Ancient)", "guj": "Gujarati", "hat": "Haitian Creole",
    "heb": "Hebrew", "hin": "Hindi", "hrp": "Hrp", "hrv": "Croatian",
    "hun": "Hungarian", "hye": "Armenian", "iku": "Inuktitut", "ind": "Indonesian",
    "isl": "Icelandic", "ita": "Italiano", "ita_old": "Italian (Old)",
    "jav": "Javanese", "jpn": "Japanese", "jpn_vert": "Japanese (vert)",
    "kan": "Kannada", "kat": "Georgian", "kat_old": "Georgian (Old)",
    "kaz": "Kazakh", "khm": "Khmer", "kir": "Kyrgyz", "kmr": "Kurdish (Kurmanji)",
    "kor": "Korean", "kor_vert": "Korean (vert)", "lao": "Lao", "lat": "Latin",
    "lav": "Latvian", "lit": "Lithuanian", "ltz": "Luxembourgish",
    "mal": "Malayalam", "mar": "Marathi", "mkd": "Macedonian", "mlt": "Maltese",
    "mon": "Mongolian", "mri": "Maori", "msa": "Malay", "mya": "Burmese",
    "nep": "Nepali", "nld": "Dutch", "nor": "Norwegian", "oci": "Occitan",
    "ori": "Odia", "osd": "OSD", "pan": "Punjabi", "pol": "Polish",
    "por": "Português", "pus": "Pashto", "que": "Quechua", "ron": "Romanian",
    "rus": "Русский", "san": "Sanskrit", "sin": "Sinhala", "slk": "Slovak",
    "slv": "Slovenian", "snd": "Sindhi", "spa": "Español", "spa_old": "Spanish (Old)",
    "sqi": "Albanian", "srp": "Serbian (Cyrillic)", "srp_latn": "Serbian (Latin)",
    "sun": "Sundanese", "swa": "Swahili", "swe": "Swedish", "syr": "Syriac",
    "tam": "Tamil", "tat": "Tatar", "tel": "Telugu", "tgk": "Tajik",
    "tha": "Thai", "tir": "Tigrinya", "ton": "Tongan", "tur": "Türkçe",
    "uig": "Uyghur", "ukr": "Українська", "urd": "Urdu", "uzb": "Uzbek",
    "uzb_cyrl": "Uzbek (Cyrillic)", "vie": "Vietnamese", "yid": "Yiddish",
    "yor": "Yoruba",
    // Script models
    "script/Arabic": "Arabic Script", "script/Armenian": "Armenian Script",
    "script/Bengali": "Bengali Script", "script/Canadian_Aboriginal": "Canadian Aboriginal Script",
    "script/Cherokee": "Cherokee Script", "script/Cyrillic": "Cyrillic Script (handwriting)",
    "script/Devanagari": "Devanagari Script", "script/Ethiopic": "Ethiopic Script",
    "script/Fraktur": "Fraktur Script", "script/Georgian": "Georgian Script",
    "script/Greek": "Greek Script", "script/Gujarati": "Gujarati Script",
    "script/Gurmukhi": "Gurmukhi Script", "script/HanS": "Han Simplified Script",
    "script/HanS_vert": "Han Simplified Script (vert)",
    "script/HanT": "Han Traditional Script", "script/HanT_vert": "Han Traditional Script (vert)",
    "script/Hangul": "Hangul Script", "script/Hangul_vert": "Hangul Script (vert)",
    "script/Hebrew": "Hebrew Script", "script/Hiragana": "Hiragana Script",
    "script/Japanese": "Japanese Script", "script/Japanese_vert": "Japanese Script (vert)",
    "script/Kannada": "Kannada Script", "script/Katakana": "Katakana Script",
    "script/Khmer": "Khmer Script", "script/Lao": "Lao Script",
    "script/Latin": "Latin Script (handwriting)", "script/Malayalam": "Malayalam Script",
    "script/Myanmar": "Myanmar Script", "script/Oriya": "Oriya Script",
    "script/Sinhala": "Sinhala Script", "script/Syriac": "Syriac Script",
    "script/Tamil": "Tamil Script", "script/Telugu": "Telugu Script",
    "script/Thaana": "Thaana Script", "script/Thai": "Thai Script",
    "script/Tibetan": "Tibetan Script", "script/Vietnamese": "Vietnamese Script"
  };

  // Cached language lists returned by OcrHelper --list-languages (Tesseract only).
  var _allLanguages = { tesseract: [], tesseractScripts: [] };

  function langLabel(code) {
    return TESS_LANG_NAMES[code] || code;
  }

  // Show/hide second language and scripts section based on primary language.
  function updateScriptsVisibility() {
    var lang1 = $("language-select").value || "";
    var isScript = lang1.indexOf("script/") === 0;
    var secScripts = $("scripts-section");
    if (secScripts) secScripts.style.display = "";
    var secLang2 = $("lang2-section");
    if (secLang2) secLang2.style.display = isScript ? "none" : "";
  }

  // Populate the second language selector (Tesseract regular languages only, no script/ models).
  function populateLanguage2Select() {
    var select = $("language2-select");
    if (!select) return;
    var prevValue = select.value;
    var lang1 = $("language-select").value || "";

    select.innerHTML = "";
    var none = document.createElement("option");
    none.value = "";
    none.textContent = "(none)";
    select.appendChild(none);

    _allLanguages.tesseract.forEach(function(code) {
      if (code === lang1) return; // не дублировать первый язык
      var opt = document.createElement("option");
      opt.value = code;
      opt.textContent = langLabel(code);
      select.appendChild(opt);
    });

    // Restore the previously selected second language; default to "deu".
    var wantedLang2 = (prevValue && prevValue !== lang1) ? prevValue : "deu";
    select.value = wantedLang2;
    if (!select.value) select.selectedIndex = 0;
  }

  // Populate the primary language selector (Tesseract + optional script models).
  function populateLanguageSelect(prevValue) {
    var includeScripts = $("include-scripts-cb") && $("include-scripts-cb").checked;
    var select = $("language-select");
    select.innerHTML = "";

    var items = [];
    _allLanguages.tesseract.forEach(function(code) {
      items.push({ code: code });
    });
    if (includeScripts) {
      _allLanguages.tesseractScripts.forEach(function(code) {
        items.push({ code: "script/" + code });
      });
    }

    if (items.length === 0) {
      var opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "(no languages found)";
      select.appendChild(opt);
      return;
    }

    items.forEach(function(item) {
      var opt = document.createElement("option");
      opt.value = item.code;
      opt.textContent = langLabel(item.code);
      select.appendChild(opt);
    });

    // Restore the previously selected language.
    if (prevValue) {
      select.value = prevValue;
      if (!select.value && select.options.length > 0)
        select.selectedIndex = 0;
    }

    // Rebuild second language dropdown and update section visibility.
    updateScriptsVisibility();
    populateLanguage2Select();
  }

  function refreshLanguages() {
    if (!cs) {
      log("CSInterface not available.");
      populateFallbackLanguages();
      return;
    }
    log("Loading OCR languages…");
    var extPath = cs.getSystemPath("extension");
    ensureHostScriptLoaded(function () {
      var code = "OCRTool_GetAvailableLanguages(" + JSON.stringify(extPath) + ")";
      evalScript(code, function (result) {
        if (!result || result.indexOf("ERR:") === 0) {
          log("Language query failed: " + (result || "no response") + " — using fallback.");
          populateFallbackLanguages();
          return;
        }

        var tesseract = [], tesseractScripts = [];
        result.replace(/\r/g, "").split("\n").forEach(function(line) {
          line = line.trim();
          if (!line) return;
          if (line.indexOf("tesseract:script/") === 0)
            tesseractScripts.push(line.slice("tesseract:script/".length));
          else if (line.indexOf("tesseract:") === 0)
            tesseract.push(line.slice("tesseract:".length));
        });

        _allLanguages = { tesseract: tesseract, tesseractScripts: tesseractScripts };
        log("Languages: " + tesseract.length + " Tesseract, " + tesseractScripts.length + " scripts.");

        // Default to "eng" if no language was previously selected.
        var prevValue = $("language-select").value || "eng";
        populateLanguageSelect(prevValue);
      });
    });
  }

  function populateFallbackLanguages() {
    _allLanguages = {
      tesseract: ["eng", "deu", "fra", "spa", "ita", "pol", "nld", "por",
                  "ces", "swe", "dan", "fin", "nor", "hun", "ron", "slk",
                  "hrv", "slv", "ell", "tur"],
      tesseractScripts: []
    };
    populateLanguageSelect("eng");
  }

  function refreshStyles() {
    log("Requesting paragraph styles from InDesign…");
    var code =
      '(function(){' +
      'try{' +
      'if(app.documents.length===0){return "[]";}' +
      'var doc=app.activeDocument;' +
      'var styles=doc.allParagraphStyles;' +
      'var n=[];' +
      'for(var i=0;i<styles.length;i++){' +
      ' var s=styles[i];' +
      ' if(!s||!s.isValid) continue;' +
      ' n.push(String(s.name).replace(/\\n/g," "));' +
      '}' +
      'return n.join("\\n");' +
      '}catch(e){return "ERR:"+e;}' +
      '})()';

    evalScript(code, function (result) {
      var select = $("style-select");
      select.innerHTML = "";

      var raw = (result || "").replace(/\r/g, "");
      if (!raw) {
        log("No styles payload from host.");
        return;
      }
      if (raw.indexOf("ERR:") === 0) {
        log("Host error while listing styles: " + raw);
        return;
      }

        var lines = raw.split("\n");
        var count = 0;
        lines.forEach(function(name) {
        name = (name || "").trim();
        if (!name) return;
        var opt = document.createElement("option");
        if (name === "[Basic Paragraph]") {
          opt.value = "";
        } else {
          opt.value = name;
        }
        opt.textContent = name;
        select.appendChild(opt);
        count++;
      });
      log("Loaded " + count + " styles.");
    });
  }


  function start() {
    var lang1     = $("language-select").value  || "eng";
    var lang2     = ($("language2-select") && $("language2-select").value) || "";
    var lang      = (lang2 && lang2 !== lang1) ? (lang1 + "+" + lang2) : lang1;
    var engine    = "tesseract";
    var styleName = $("style-select").value     || "";
    log("Select rectangle tool and draw");
    ensureHostScriptLoaded(function () {
      var extPath = cs.getSystemPath("extension");
      var code =
        'OCRTool_Start(' +
        JSON.stringify(lang) + ',' +
        JSON.stringify(styleName) + ',' +
        JSON.stringify(extPath) + ',' +
        JSON.stringify(engine) +
        ');';
      evalScript(code, function (res) {
        var msg = res || "ok";
        log("Host response (Start): " + msg);
        if (
          msg.indexOf("Error") === 0 ||
          msg === "No document open" ||
          msg === "No active window"
        ) {
          setStatus(false);
          log("Start failed. Open a document first.");
        } else {
          setStatus(true);
        }
      });
    });
  }

  function stop() {
    log("Stop OCR mode");
    evalScript("OCRTool_Stop();", function (res) {
      log("Host response (Stop): " + (res || "ok"));
      setStatus(false);
    });
  }

  function about() {
    var overlay = $("about-overlay");
    if (overlay) overlay.style.display = "flex";
  }

  function aboutClose() {
    var overlay = $("about-overlay");
    if (overlay) overlay.style.display = "none";
  }

  function openPurchasePage() {
    var url = PURCHASE_URL;
    try {
      if (window.cep && window.cep.util && typeof window.cep.util.openURLInDefaultBrowser === "function") {
        window.cep.util.openURLInDefaultBrowser(url);
      } else if (window.open) {
        window.open(url, "_blank");
      }
    } catch (e) {
      log("Could not open purchase page: " + e);
    }
  }

  function init() {
    setStatus(false);

    $("start-btn").addEventListener("click", start);
    $("stop-btn").addEventListener("click", stop);
    $("refresh-styles-btn").addEventListener("click", refreshStyles);
    $("refresh-langs-btn").addEventListener("click", refreshLanguages);
    $("about-btn").addEventListener("click", about);
    $("about-close-btn").addEventListener("click", aboutClose);
    $("about-ok-btn").addEventListener("click", aboutClose);
    $("upgrade-btn").addEventListener("click", openPurchasePage);
    var aboutUpgrade = $("about-upgrade-btn");
    if (aboutUpgrade) aboutUpgrade.addEventListener("click", function () {
      aboutClose();
      openPurchasePage();
    });
    $("about-overlay").addEventListener("click", function(e) {
      if (e.target === $("about-overlay")) aboutClose();
    });

    // Primary language selector: update second language dropdown and section visibility.
    $("language-select").addEventListener("change", function () {
      updateScriptsVisibility();
      populateLanguage2Select();
    });

    // Script checkbox: re-filter the language list to include/exclude script models.
    var scriptsCb = $("include-scripts-cb");
    if (scriptsCb) {
      scriptsCb.addEventListener("change", function () {
        populateLanguageSelect($("language-select").value);
      });
    }

    ensureHostScriptLoaded(function () {
      refreshStyles();
      refreshLanguages();
      updateScriptsVisibility();
      log("OCRtool panel initialized.");
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();

