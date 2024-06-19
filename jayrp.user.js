// ==UserScript==
// @name        Jays RP Board Improver Script
// @namespace   https://jaysrpboard.proboards.com
// @match       https://jaysrpboard.proboards.com/*
// @require     https://code.jquery.com/jquery-3.7.1.min.js
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_addStyle
// @grant       GM_listValues
// @grant       GM_setClipboard
// @grant       GM_xmlhttpRequest
// @grant       GM_getResourceURL
// @version     0.3.1
// @author      Ssieth
// @description 19/06/2024, 10:33:25
// @license     MIT
// @copyright   2021, Ssieth@ssieth.co.uk
// ==/UserScript==

// Setup config object
let config = {};

// Setup page object
let page = {}
page["type"] = ""

// -- What we are logging to the console -- //
let logTags = {};
logTags.startup = true;
logTags.functiontrace = false;

// CSS
let strCSSPointer = ".pointer {cursor: pointer !important; }";
let strCSSMaxWidth100 = ".maxwidth100 {max-width: 100%}";

// Contants
let jayClass = "jayscript";

// Script Info
let scriptLoc = "https://github.com/Ssieth/JaysScript/raw/main/jayrp.user.js";

// Logging
function log(strLogTag, strMessage) {
  if (logTags[strLogTag]) {
    var now = new Date();
    if (log.caller === undefined || log.caller === null) {
      console.log(now.toLocaleString() + ":" + strLogTag + ": " + log.caller.name + ": " + JSON.stringify(strMessage));
    }
    else {
      console.log(now.toLocaleString() + ":" + strLogTag + ": -none-: " + JSON.stringify(strMessage));
    }
  }
}

/* =========================== */
/* Main Menu                   */
/* =========================== */
function setupMenu(menuID,menuText,menuTarget,menuFunction) {
  let $navMenu = $("div#navigation-menu ul");

  // Add new menu
  let $navItem = $(`<li id="menu-${menuID}" class="${jayClass}"><a href="${menuTarget}">${menuText}</a></li>`);
  if (menuFunction) {
    $navItem.click(function(e) {
      e.preventDefault();
      menuFunction();
    });
  }
  $navMenu.append($navItem);
}

function mTestCallback() {
  alert("WHoo!");
}

function setupMenus() {
  // Remove old menus
  let $navMenu = $("div#navigation-menu ul");
  $(`.${jayClass}`).remove();

  setupMenu("script","Script","/search#script");
}

/* =========================== */
/* New Configuration Stuff     */
/* =========================== */
function initConfigCategory(configCat, catDisplayName, isAdmin) {
  if (!config[configCat]) {
      config[configCat] = {
          loaded: new Date()
      };
  }
  config_display[configCat] = {
      displayName: catDisplayName,
      isAdmin: !!isAdmin,
      loaded: new Date()
  }
}

function initConfigItem(itemCat, itemName, defaultValue, displaySettings) {
  if (config[itemCat]) {
      if (!config[itemCat].hasOwnProperty(itemName)) {
          config[itemCat][itemName] = defaultValue;
      }
  }
  config_display[itemCat][itemName] = displaySettings;
}

function loadConfig(andThen) {
  var blNewConfig;
  var strConf = GM_getValue("config","");
  if (strConf === "") {
      config = {};
      blNewConfig = true;
  } else {
      config = JSON.parse(strConf);
      blNewConfig = false;
  }
  if (andThen) andThen();
  return !blNewConfig;
}



function saveConfig(andThen) {
	config.version = GM_info.script.version;
  config.savedWhen = new Date();
  console.log("Saving config");
  console.log(config);
  GM_setValue("config",JSON.stringify(config));
  if (andThen) andThen();
}

function initConfig(andThen) {
  config = {};
  config_display = {};
  loadConfig();
  // Settings categories
  initConfigCategory("speechStyling","Speech Styling");
  initConfigCategory("image","Images");
  // Speech Styling
  initConfigItem("speechStyling","on", true, {text: "Style Speech?", type: "bool" });
  initConfigItem("speechStyling","incQuote", true , {text: "Include quotes?", type: "bool" });
  initConfigItem("speechStyling","CSS", "color: blue;", {text: "Speech Styling (CSS)", type: "text" });
  // Images
  initConfigItem("image","enlarge", true, {text: "Click to Enlarge?", type: "bool" });
  saveConfig();
  if (andThen) andThen();
}

// Returns true if a setting hsa been set, false otherwise
function updateConfig(controlID) {
	var $control = $("#content div.content").find("#" + controlID);
	var aID = controlID.split("-");
	var catID = aID[3];
	var settingID = aID[4];
  console.log("Set: " + settingID);
  console.log($control);
	if ($control.hasClass("gm-settings-control-bool")) {
		config[catID][settingID] = $control[0].checked;
	} else if ($control.hasClass("gm-settings-control-int")) {
        console.log("Inty: " + settingID);
        var intVal = parseInt($control.val());
        console.log(intVal);
        if ($.isNumeric("" + intVal)) {
            if (config_display[catID][settingID].hasOwnProperty("min") && intVal < config_display[catID][settingID].min) {
                console.log("There's a minimum and " + intVal + " < " + config_display[catID][settingID].min);
                return false;
            }
            if (config_display[catID][settingID].hasOwnProperty("max") && intVal > config_display[catID][settingID].max) {
                console.log("There's a maximum and " + intVal + " > " + config_display[catID][settingID].max);
                return false;
            }
            config[catID][settingID] = intVal;
        } else {
            console.log("Not an integer: " + $control.val())
            return false;
        }
	} else {
		config[catID][settingID] = $control.val();
	}
    return true;
}

function editConfig() {
  GM_addStyle(".gm-settings-cat { float: left; display: block; border: thin solid black; padding: 10px; margin: 10px; background-color: #c5c5c5}");
  GM_addStyle(".gm-settings-cat-title { font-weight: bold; font-size: 120%; margin-bottom: 10px; }");
  GM_addStyle(".gm-settings-cat-settings { margin-left: 10px; }");
  GM_addStyle(".gm-settings-setting { margin-bottom: 15px; border-bottom: thin solid gray; width: auto; padding-bottom: 5px; }");
  GM_addStyle(".gm-settings-setting-label { margin-right: 10px; display: inline; font-weight: bold; color: black;}");
  GM_addStyle(".gm-settings-control-int { width: 4rem; }");
  GM_addStyle(".gm-settings-setting-label { max-width: 15rem; display: inline-block; }");
  //var $page = $("div#helpmain");
  //$("#fatal_error").css("width","auto");
  let $titleBar = $("#content div.title-bar");
  let $page = $("#content div.content");

  console.log($titleBar);
  $titleBar.html(`<h1>${GM_info.script.name} v${GM_info.script.version} (<a style='color:white' href='${scriptLoc}'>Force Update</a>)</h1>`)

  $page.css("max-width","initial");
  //var $title = $("<h2>Script Settings (v" + GM_info.script.version + ")</h2>");
  $("h3.catbg").html("Script Settings (v" + GM_info.script.version + ")");
  document.title = "Script Settings (v" + GM_info.script.version + ")";
  $page.html("");
  for (var key in config_display) {
      var confd = config_display[key];
      var $newcat = $("<div class='gm-settings-cat well' id='gm-settings-cat-" + key + "'></div>");
      $newcat.append("<h3 class='gm-settings-cat-title'>" + confd.displayName + "</h3>");
      var $newSettings = $("<div class='gm-settings-cat-settings'></div>");
      for (var key2 in confd) {
          var $newSetting = $("<div class='gm-settings-setting'></div>");
          var setting = confd[key2];
          var val = config[key][key2];
          if (setting.text) {
              $newSetting.append("<label class='gm-settings-setting-label' for='gm-settings-value-" + key + "-" + key2 + "'>" + setting.text + "</label>");
              switch (setting.type) {
                  case "bool":
                      $newSetting.append("<span class='gm-settings-setting-value' style='display: inline' ><input type='checkbox' class='gm-settings-control gm-settings-control-bool' id='gm-settings-value-" + key + "-" + key2 + "'" + ((val) ? ' checked' : '') + "></span>");
                      break;
                  case "int":
                      var min = '';
                      if (setting.hasOwnProperty('min')) {
                          min = " min='" + setting.min + "'";
                      }
                      var max = '';
                      if (setting.hasOwnProperty('max')) {
                          max = " max='" + setting.max + "'";
                      }
                      $newSetting.append("<span class='gm-settings-setting-value'><input type='number' class='gm-settings-control gm-settings-control-int' id='gm-settings-value-" + key + "-" + key2 + "' value='" + val + "'" + min + max + "></span>");
                      break;
                  case "select":
                      var $select;
                      $select = $("<select class='gm-settings-control gm-settings-control-select' id='gm-settings-value-" + key + "-" + key2 + "'>");
                      for (var i = 0; i < setting.select.length; i++) {
                          var selKey = setting.select[i];
                          $select.append("<option value='" + selKey + "'" + ((val === selKey) ? " selected" : "") + ">" + selKey + "</option>");
                      }
                      $newSetting.append($select);
                      break;
                  case "text":
                  default:
                      $newSetting.append("<span class='gm-settings-setting-value'><input type='text' class='gm-settings-control gm-settings-control-text' id='gm-settings-value-" + key + "-" + key2 + "' value='" + val + "'></span>");
                      break;
              }
              $newSettings.append($newSetting);
          }
      }
      $newcat.append($newSettings);
      if (!confd.isAdmin || strScriptAdmins.indexOf(user.id) > -1) {
        $page.append($newcat);
      }
  }
  $page.append("<div style='clear: both;'>&nbsp;</div>");
  $page.find(".gm-settings-control").change($.debounce(500, function(e) {
    if (updateConfig(e.target.id)) {
            saveConfig(loadConfig);
        };
  }));
  $page.find(".gm-settings-control-text, .gm-settings-control-int").keyup($.debounce(500, function(e) {
    if (updateConfig(e.target.id)) {
            saveConfig(loadConfig);
        };
  }));
}
/* =========================== */


/* =========================== */
/* Speech Styling              */
/* =========================== */
function StyleSpeechElement($el) {
  log("functiontrace", "Start Function");
  var blInTag = false;
  var blInSpeech = false;
  var htmlOut;
  var incQuote = "";
  var excQuote = "";
  if (config.speechStyling.incQuote) {
    incQuote = '"';
  }
  else {
    excQuote = '"';
  }
  var $post = $el;
  var html = $post.html();
  htmlOut = "";
  for (var i = 0; i < html.length; i++) {
    switch (html.charAt(i)) {
      case "“":
      case "”":
      case '"':
      case '"':
      case '"':
        if (blInTag) {
          htmlOut += '"';
        }
        else {
          if (blInSpeech) {
            htmlOut += incQuote + '</span>' + excQuote;
          }
          else {
            htmlOut += excQuote + '<span style=\'' + config.speechStyling.CSS.replaceAll("'", '"') + '\'>' + incQuote;
          }
          blInSpeech = !blInSpeech;
        }
        break;
      case "<":
        blInTag = true;
        if ((i+3)<html.length) {
          if (blInSpeech && html.charAt(i+1) == "/" && html.charAt(i+2) == "p") {
            htmlOut += "</span>";
            blInSpeech = false;
          }
          if (blInSpeech && html.charAt(i+1) == "b" && html.charAt(i+2) == "r"  && html.charAt(i+3) == ">") {
            htmlOut += "</span>";
            blInSpeech = false;
          }
        }
        htmlOut += "<";
        break;
      case ">":
        blInTag = false;
        htmlOut += ">";
        break;
      default:
        htmlOut += html.charAt(i);
        break;
    }
  }
  $post.html(htmlOut);
}


function StyleSpeechElements(selector) {
  if (!config.speechStyling.on) {
    return;
  }
  $(selector).each(function() {
    StyleSpeechElement($(this));
  });
}

/* =========================== */
/* Image Stuff                 */
/* =========================== */
function setupImageEnlarge(selector) {
  if (!config.image.enlarge) {
    return;
  }
  let $toEnlarge = $(selector + " img");
  $toEnlarge.each(function () {
    let $img = $(this);
    let imgWidth = $img.attr("width");
    let imgHeight = $img.attr("height");
    $img.addClass("pointer");
    $img.addClass("maxwidth100");
    if (imgWidth) {
      $img.attr("orig-width",imgWidth);
    }
    if (imgHeight) {
      $img.attr("orig-height",imgHeight);
    }
    $(this).click(function(){
      if ($(this).hasClass("enlarged")) {
        if ($img.attr("orig-width")) {
          $img.attr("width",$img.attr("orig-width"));
        }
        if ($img.attr("orig-height")) {
          $img.attr("height",$img.attr("orig-height"));
        }
        $img.removeClass("enlarged");
      } else {
        $(this).removeAttr("height").removeAttr("width");
        $img.addClass("enlarged");
      }
    });
  });
}

/* =========================== */
/* CSS Fixes                   */
/* =========================== */
function applyCSS() {
  log("functiontrace", "Start Function");
  GM_addStyle(strCSSPointer);
  GM_addStyle(strCSSMaxWidth100);
}

/*
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function(b,c){var $=b.jQuery||b.Cowboy||(b.Cowboy={}),a;$.throttle=a=function(e,f,j,i){var h,d=0;if(typeof f!=="boolean"){i=j;j=f;f=c}function g(){var o=this,m=+new Date()-d,n=arguments;function l(){d=+new Date();j.apply(o,n)}function k(){h=c}if(i&&!h){l()}h&&clearTimeout(h);if(i===c&&m>e){l()}else{if(f!==true){h=setTimeout(i?k:l,i===c?e-m:e)}}}if($.guid){g.guid=j.guid=j.guid||$.guid++}return g};$.debounce=function(d,e,f){return f===c?a(d,e,false):a(d,f,e!==false)}})(this);

/* =========================== */
/* Page object                 */
/* =========================== */
function getPage() {
  page.url = {};
  page.url.full = window.location.href;
  page.url.page = window.location.pathname.split('/')[1].toLowerCase();
  page.url.query = window.location.search;
  page.url.hash = window.location.hash;
  page.type = "";
  switch (page.url.page) {
    case "search":
      switch (page.url.hash) {
        case "#script":
          page.type = 'script';
          break;
        default:
          page.type = page.url.page;
      }
      break;
    default:
      page.type = page.url.page;
      break;
  }
  console.log(page);
}

/* =========================== */
/* Main Function               */
/* =========================== */
function main() {
  applyCSS();
  getPage();
  setupMenus();
  switch (page.type) {
      case "thread":
        StyleSpeechElements("div.message");
        setupImageEnlarge("div.message");
        break;
      case "post":
        StyleSpeechElements("div.message");
        break;
    case "script":
        editConfig();
        break;
  }
}

$( document ).ready(function() {
  console.log(GM_info);
  log("startup", "Starting " + GM_info.script.name + " v" + GM_info.script.version);
  initConfig(main);
});
