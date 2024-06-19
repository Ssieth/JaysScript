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
// @version     0.2.0
// @author      Ssieth
// @description 19/06/2024, 10:33:25
// @license     MIT
// @copyright   2021, Ssieth@ssieth.co.uk
// ==/UserScript==

// Setup config object
let config = {};
config.speechStyling = {};
config.speechStyling.on = true;
config.speechStyling.incQuote = true;
config.speechStyling.CSS = "color: blue;";
config.image = {}
config.image.enlarge = true;

// Setup page object
let page = {}
page["type"] = ""

// -- What we are logging to the console -- //
var logTags = {};
logTags.startup = true;
logTags.functiontrace = false;

// CSS
var strCSSPointer = ".pointer {cursor: pointer !important; }";
var strCSSMaxWidth100 = ".maxwidth100 {max-width: 100%}";

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
  switch (page.type) {
      case "thread":
        StyleSpeechElements("div.message");
        setupImageEnlarge("div.message");
        break;
      case "post":
        StyleSpeechElements("div.message");
        break;
  }
}

$( document ).ready(function() {
    main();
});
