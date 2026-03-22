/**************************************************************************************************
*
* ADOBE SYSTEMS INCORPORATED
* Copyright 2013 Adobe Systems Incorporated
* All Rights Reserved.
*
* NOTICE: Adobe permits you to use, modify, and distribute this file in accordance with the
* terms of the Adobe license agreement accompanying it. If you have received this file from a
* source other than Adobe, then your use, modification, or distribution of it requires the prior
* written permission of Adobe.
*
**************************************************************************************************/

/** CSInterface - v9.4.0 */

/**
 * Stores constants for the window types supported by the CSXS infrastructure.
 */
function CSXSWindowType()
{
}

/** Constant for the CSXS window type Panel. */
CSXSWindowType._PANEL = "Panel";

/** Constant for the CSXS window type Modeless. */
CSXSWindowType._MODELESS = "Modeless";

/** Constant for the CSXS window type ModalDialog. */
CSXSWindowType._MODAL_DIALOG = "ModalDialog";

/** EvalScript error message */
EvalScript_ErrMessage = "EvalScript error.";

/**
 * @class Version
 */
function Version(major, minor, micro, special)
{
 this.major = major;
 this.minor = minor;
 this.micro = micro;
 this.special = special;
}
Version.MAX_NUM = 999999999;

/**
 * @class VersionBound
 */
function VersionBound(version, inclusive)
{
 this.version = version;
 this.inclusive = inclusive;
}

/**
 * @class VersionRange
 */
function VersionRange(lowerBound, upperBound)
{
 this.lowerBound = lowerBound;
 this.upperBound = upperBound;
}

/**
 * @class Runtime
 */
function Runtime(name, versionRange)
{
 this.name = name;
 this.versionRange = versionRange;
}

/**
* @class Extension
*/
function Extension(id, name, mainPath, basePath, windowType, width, height, minWidth, minHeight, maxWidth, maxHeight,
 defaultExtensionDataXml, specialExtensionDataXml, requiredRuntimeList, isAutoVisible, isPluginExtension)
{
 this.id = id;
 this.name = name;
 this.mainPath = mainPath;
 this.basePath = basePath;
 this.windowType = windowType;
 this.width = width;
 this.height = height;
 this.minWidth = minWidth;
 this.minHeight = minHeight;
 this.maxWidth = maxWidth;
 this.maxHeight = maxHeight;
 this.defaultExtensionDataXml = defaultExtensionDataXml;
 this.specialExtensionDataXml = specialExtensionDataXml;
 this.requiredRuntimeList = requiredRuntimeList;
 this.isAutoVisible = isAutoVisible;
 this.isPluginExtension = isPluginExtension;
}

/**
 * @class CSEvent
 */
function CSEvent(type, scope, appId, extensionId)
{
 this.type = type;
 this.scope = scope;
 this.appId = appId;
 this.extensionId = extensionId;
}
CSEvent.prototype.data = "";

/**
 * @class SystemPath
 */
function SystemPath()
{
}
SystemPath.USER_DATA = "userData";
SystemPath.COMMON_FILES = "commonFiles";
SystemPath.MY_DOCUMENTS = "myDocuments";
SystemPath.APPLICATION = "application";
SystemPath.EXTENSION = "extension";
SystemPath.HOST_APPLICATION = "hostApplication";

function ColorType() {}
ColorType.RGB = "rgb";
ColorType.GRADIENT = "gradient";
ColorType.NONE = "none";

function RGBColor(red, green, blue, alpha)
{
 this.red = red;
 this.green = green;
 this.blue = blue;
 this.alpha = alpha;
}

function Direction(x, y)
{
 this.x = x;
 this.y = y;
}

function GradientStop(offset, rgbColor)
{
 this.offset = offset;
 this.rgbColor = rgbColor;
}

function GradientColor(type, direction, numStops, arrGradientStop)
{
 this.type = type;
 this.direction = direction;
 this.numStops = numStops;
 this.arrGradientStop = arrGradientStop;
}

function UIColor(type, antialiasLevel, color)
{
 this.type = type;
 this.antialiasLevel = antialiasLevel;
 this.color = color;
}

function AppSkinInfo(baseFontFamily, baseFontSize, appBarBackgroundColor, panelBackgroundColor, appBarBackgroundColorSRGB, panelBackgroundColorSRGB, systemHighlightColor)
{
 this.baseFontFamily = baseFontFamily;
 this.baseFontSize = baseFontSize;
 this.appBarBackgroundColor = appBarBackgroundColor;
 this.panelBackgroundColor = panelBackgroundColor;
 this.appBarBackgroundColorSRGB = appBarBackgroundColorSRGB;
 this.panelBackgroundColorSRGB = panelBackgroundColorSRGB;
 this.systemHighlightColor = systemHighlightColor;
}

function HostEnvironment(appName, appVersion, appLocale, appUILocale, appId, isAppOnline, appSkinInfo)
{
 this.appName = appName;
 this.appVersion = appVersion;
 this.appLocale = appLocale;
 this.appUILocale = appUILocale;
 this.appId = appId;
 this.isAppOnline = isAppOnline;
 this.appSkinInfo = appSkinInfo;
}

function HostCapabilities(EXTENDED_PANEL_MENU, EXTENDED_PANEL_ICONS, DELEGATE_APE_ENGINE, SUPPORT_HTML_EXTENSIONS, DISABLE_FLASH_EXTENSIONS)
{
 this.EXTENDED_PANEL_MENU = EXTENDED_PANEL_MENU;
 this.EXTENDED_PANEL_ICONS = EXTENDED_PANEL_ICONS;
 this.DELEGATE_APE_ENGINE = DELEGATE_APE_ENGINE;
 this.SUPPORT_HTML_EXTENSIONS = SUPPORT_HTML_EXTENSIONS;
 this.DISABLE_FLASH_EXTENSIONS = DISABLE_FLASH_EXTENSIONS;
}

function ApiVersion(major, minor, micro)
{
 this.major = major;
 this.minor = minor;
 this.micro = micro;
}

function MenuItemStatus(menuItemLabel, enabled, checked)
{
 this.menuItemLabel = menuItemLabel;
 this.enabled = enabled;
 this.checked = checked;
}

function ContextMenuItemStatus(menuItemID, enabled, checked)
{
 this.menuItemID = menuItemID;
 this.enabled = enabled;
 this.checked = checked;
}

function CSInterface()
{
}
CSInterface.THEME_COLOR_CHANGED_EVENT = "com.adobe.csxs.events.ThemeColorChanged";
CSInterface.prototype.hostEnvironment = window.__adobe_cep__ ? JSON.parse(window.__adobe_cep__.getHostEnvironment()) : null;

CSInterface.prototype.getHostEnvironment = function()
{
 this.hostEnvironment = JSON.parse(window.__adobe_cep__.getHostEnvironment());
 return this.hostEnvironment;
};

CSInterface.prototype.loadBinAsync = function(urlName,callback)
{
 try
 {
 var xhr = new XMLHttpRequest();
 xhr.responseType = 'arraybuffer';
 xhr.open('GET', urlName, true);
 xhr.onerror = function () { return false; };
 xhr.send();
 xhr.onload = function() {
 window.__adobe_cep__.loadSnapshot(xhr.response);
 if (typeof callback === "function") callback();
 };
 }
 catch(err) { return false; }
 return true;
};

CSInterface.prototype.loadBinSync = function(pathName)
{
 try
 {
 var OSVersion = this.getOSInformation();
 if(pathName.startsWith("file://"))
 {
 if (OSVersion.indexOf("Windows") >= 0)
 pathName = pathName.replace("file:///", "");
 else if (OSVersion.indexOf("Mac") >= 0)
 pathName = pathName.replace("file://", "");
 window.__adobe_cep__.loadSnapshot(pathName);
 return true;
 }
 }
 catch(err) {}
 return false;
};

CSInterface.prototype.closeExtension = function()
{
 window.__adobe_cep__.closeExtension();
};

CSInterface.prototype.getSystemPath = function(pathType)
{
 var path = decodeURI(window.__adobe_cep__.getSystemPath(pathType));
 var OSVersion = this.getOSInformation();
 if (OSVersion.indexOf("Windows") >= 0)
 path = path.replace("file:///", "");
 else if (OSVersion.indexOf("Mac") >= 0)
 path = path.replace("file://", "");
 return path;
};

CSInterface.prototype.evalScript = function(script, callback)
{
 if(callback === null || callback === undefined)
 callback = function(result){};
 window.__adobe_cep__.evalScript(script, callback);
};

CSInterface.prototype.getApplicationID = function()
{
 return this.hostEnvironment.appId;
};

CSInterface.prototype.getHostCapabilities = function()
{
 return JSON.parse(window.__adobe_cep__.getHostCapabilities());
};

CSInterface.prototype.dispatchEvent = function(event)
{
 if (typeof event.data == "object")
 event.data = JSON.stringify(event.data);
 window.__adobe_cep__.dispatchEvent(event);
};

CSInterface.prototype.addEventListener = function(type, listener, obj)
{
 window.__adobe_cep__.addEventListener(type, listener, obj);
};

CSInterface.prototype.removeEventListener = function(type, listener, obj)
{
 window.__adobe_cep__.removeEventListener(type, listener, obj);
};

CSInterface.prototype.requestOpenExtension = function(extensionId, params)
{
 window.__adobe_cep__.requestOpenExtension(extensionId, params);
};

CSInterface.prototype.getExtensions = function(extensionIds)
{
 var extensionsStr = window.__adobe_cep__.getExtensions(JSON.stringify(extensionIds));
 return JSON.parse(extensionsStr);
};

CSInterface.prototype.getNetworkPreferences = function()
{
 return JSON.parse(window.__adobe_cep__.getNetworkPreferences());
};

CSInterface.prototype.initResourceBundle = function()
{
 return JSON.parse(window.__adobe_cep__.initResourceBundle());
};

CSInterface.prototype.dumpInstallationInfo = function()
{
 return window.__adobe_cep__.dumpInstallationInfo();
};

CSInterface.prototype.getOSInformation = function()
{
 var userAgent = navigator.userAgent;
 if ((navigator.platform == "Win32") || (navigator.platform == "Windows"))
 {
 var winVersion = "Windows";
 if (userAgent.indexOf("Windows NT 10") > -1) winVersion = "Windows 10";
 else if (userAgent.indexOf("Windows NT 6.3") > -1) winVersion = "Windows 8.1";
 else if (userAgent.indexOf("Windows NT 6.2") > -1) winVersion = "Windows 8";
 else if (userAgent.indexOf("Windows NT 6.1") > -1) winVersion = "Windows 7";
 var winBit = (userAgent.indexOf("WOW64") > -1 || userAgent.indexOf("Win64") > -1) ? " 64-bit" : " 32-bit";
 return winVersion + winBit;
 }
 if ((navigator.platform == "MacIntel") || (navigator.platform == "Macintosh"))
 {
 var result = "Mac OS X";
 if (userAgent.indexOf("Mac OS X") > -1)
 result = userAgent.substring(userAgent.indexOf("Mac OS X"), userAgent.indexOf(")")).replace(/_/g, ".");
 return result;
 }
 return "Unknown Operation System";
};

CSInterface.prototype.openURLInDefaultBrowser = function(url)
{
 return cep.util.openURLInDefaultBrowser(url);
};

CSInterface.prototype.getExtensionID = function()
{
 return window.__adobe_cep__.getExtensionId();
};

CSInterface.prototype.getScaleFactor = function()
{
 return window.__adobe_cep__.getScaleFactor();
};

CSInterface.prototype.setScaleFactorChangedHandler = function(handler)
{
 window.__adobe_cep__.setScaleFactorChangedHandler(handler);
};

CSInterface.prototype.getCurrentApiVersion = function()
{
 return JSON.parse(window.__adobe_cep__.getCurrentApiVersion());
};

CSInterface.prototype.setPanelFlyoutMenu = function(menu)
{
 if ("string" == typeof menu)
 window.__adobe_cep__.invokeSync("setPanelFlyoutMenu", menu);
};

CSInterface.prototype.updatePanelMenuItem = function(menuItemLabel, enabled, checked)
{
 if (this.getHostCapabilities().EXTENDED_PANEL_MENU)
 return window.__adobe_cep__.invokeSync("updatePanelMenuItem", JSON.stringify(new MenuItemStatus(menuItemLabel, enabled, checked)));
 return false;
};

CSInterface.prototype.setContextMenu = function(menu, callback)
{
 if ("string" == typeof menu)
 window.__adobe_cep__.invokeAsync("setContextMenu", menu, callback);
};

CSInterface.prototype.setContextMenuByJSON = function(menu, callback)
{
 if ("string" == typeof menu)
 window.__adobe_cep__.invokeAsync("setContextMenuByJSON", menu, callback);
};

CSInterface.prototype.updateContextMenuItem = function(menuItemID, enabled, checked)
{
 return window.__adobe_cep__.invokeSync("updateContextMenuItem", JSON.stringify(new ContextMenuItemStatus(menuItemID, enabled, checked)));
};

CSInterface.prototype.isWindowVisible = function()
{
 return window.__adobe_cep__.invokeSync("isWindowVisible", "");
};

CSInterface.prototype.resizeContent = function(width, height)
{
 window.__adobe_cep__.resizeContent(width, height);
};

CSInterface.prototype.registerInvalidCertificateCallback = function(callback)
{
 return window.__adobe_cep__.registerInvalidCertificateCallback(callback);
};

CSInterface.prototype.registerKeyEventsInterest = function(keyEventsInterest)
{
 return window.__adobe_cep__.registerKeyEventsInterest(keyEventsInterest);
};

CSInterface.prototype.setWindowTitle = function(title)
{
 window.__adobe_cep__.invokeSync("setWindowTitle", title);
};

CSInterface.prototype.getWindowTitle = function()
{
 return window.__adobe_cep__.invokeSync("getWindowTitle", "");
};
