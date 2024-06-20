// ==UserScript==
// @name        Jays RP Board Improver Script
// @namespace   https://jaysrpboard.proboards.com
// @match       https://jaysrpboard.proboards.com/*
// @require     https://code.jquery.com/jquery-3.7.1.min.js
// @require     https://code.jquery.com/ui/1.13.3/jquery-ui.min.js
// @require     https://cdn.jsdelivr.net/npm/ui-contextmenu@1.18.1/jquery.ui-contextmenu.min.js
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_addStyle
// @grant       GM_listValues
// @grant       GM_setClipboard
// @grant       GM_xmlhttpRequest
// @grant       GM_getResourceURL
// @grant       GM_getResourceText
// @resource    JQI_CSS https://code.jquery.com/ui/1.13.3/themes/smoothness/jquery-ui.css
// @version     0.9.1
// @author      Sieth
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
logTags.savesettings = false;
logTags.updateconfig = false;
logTags.editconfig = false;
logTags.getpage = false;
logTags.gminfo = false;


// CSS
let strCSSPointer = ".pointer {cursor: pointer !important; }";
let strCSSMaxWidth100 = ".maxwidth100 {max-width: 100%}";

// Contants
let jayClass = "jayscript";

// Script Info
let scriptLoc = "https://github.com/Ssieth/JaysScript/raw/main/jayrp.user.js";

// Do not mess with these:
let snippets = {};
let strModal = '<div id="modalpop" title="title"></div>';


// Logging
function log(strLogTag, strMessage) {
  if (logTags[strLogTag]) {
    let now = new Date();
    let msg = "-".repeat(80) + "\n";
    if (log.caller === undefined || log.caller === null) {
      msg = msg + now.toLocaleString() + ":" + strLogTag + ": " + log.caller.name + ": "; // + JSON.stringify(strMessage);
    }
    else {
      msg = msg + now.toLocaleString() + ":" + strLogTag + ": "; // + JSON.stringify(strMessage);
    }
    if (typeof strMessage === 'string' || strMessage instanceof String) {
      console.log(`${msg} ${JSON.stringify(strMessage)} ${"-".repeat(80)}`);
    } else {
      console.log(msg);
      console.log(strMessage);
      console.log("-".repeat(80));
    }
  }
}




/* =========================== */
/* Wordcounts                  */
/* =========================== */
function getWordCount(strText) {
  log("functiontrace", "Start Function");
  var regex = /\s+/gi;
  var wordCount = strText.trim().replace(regex, ' ').split(' ').length;
  return wordCount;
}

function showWordCountThreads() {
  $("div.message").each(function() {
    let $post = $(this);
    let wc = getWordCount($post.text());
    let $article = $post.parent();
    let $head = $article.find("div.content-head div.info");
    let style = "font-size: 80%;";
    switch (page.type) {
      case "thread":
        style = style + " vertical-align: -7px;";
        break;
      case "post":
        style = style + " margin-left: 10px;";
        break;
    }
    $head.append(`<span style='${style}'>(${wc} words)</span>`);
  });
}

/* =========================== */
/* Reversing Table/threads     */
/* =========================== */
function reverseTableRows(tableId) {
    var table = document.getElementById(tableId),
        newTbody = document.createElement('tbody'),
        oldTbody = table.tBodies[0],
        rows = oldTbody.rows,
        i = rows.length - 1;

    while (i >= 0) {
        newTbody.appendChild(rows[i]);
        i -= 1;
    }
    oldTbody.parentNode.replaceChild(newTbody, oldTbody);
}

function reverseThread() {
  $("div.content>table").attr("id","contentTable");
  reverseTableRows("contentTable");
}

/* =========================== */
/* Snippets                    */
/* =========================== */
function throwModal(strTitle, strBody, width) {
  log("functiontrace", "Start Function");
  var intHeight;
  let strWidth = "720px";
  if (width) {
    strWidth = width;
  }
  intHeight = Math.floor($(window).height() * 0.8);
  if ($("#modalpop").length === 0) {
    $('body').append($(strModal));
  }
  $('#modalpop').html(strBody).on("dialogopen", function (event, ui) {});
  $('#modalpop').dialog({
    title: strTitle,
    width: strWidth,
    maxHeight: intHeight
  });
}

function sortSnippets_enableCustom() {
  switch (config.snippets.sortType) {
    case "alpha":
      $("#sortable").hide();
      break;
    default:
      $("#sortable").show();
  }
}

function sortSnippets() {
  if (!config.snippets) {
    config.snippets = {}
  }
  if (!config.snippets.sortType) {
    config.snippets.sortType = "alpha";
    saveConfig();
  }
  var $page = $("div#helpmain");
  if ($page.length <= 0) {
    $("#fatal_error").css("width","auto");
    $page = $("#fatal_error div.windowbg")
  }
  $page.css("max-width","initial");
  $("h3.catbg").html("Sort Snippets");
  document.title = "Sort Snippets";
  var $help = $("<p>Just grab the snippet and drag it where you want it in the ordering.</p>");
  var $sortOptions = $("<p></p>");
  var $snippetList = $("<ul id='sortable'></ul>");
  $sortOptions.append("<input class='sortType' type='radio' name='sortType' id='sortTypeAlpha' value='alpha' " + ((config.snippets.sortType == "alpha") ? " checked='checked'" : "") + "/>: <label for='sortTypeAlpha'>Alphabetical</label><br />");
  $sortOptions.append("<input class='sortType' type='radio' name='sortType' id='sortTypeCustom' value='custom' " + ((config.snippets.sortType == "custom") ? " checked='checked'" : "") + "/>: <label for='sortTypeCustom'>Custom</label><br />");
  GM_addStyle("#sortable { list-style-type: none; margin: 0; padding: 0; width: 60%; list-style-type:none; }");
  GM_addStyle("#sortable li { margin: 0 3px 3px 3px; padding: 0.4em; padding-left: 1.5em; font-size: 1.4em; cursor: pointer; border: thin solid black;}");
  GM_addStyle("#sortable li span { position: absolute; margin-left: -1.3em; }");
  var aryKeys = sortedSnippetKeys();
  for (var i = 0; i < aryKeys.length; i++) {
    var key = aryKeys[i];
    //console.log("KEY: " + key);
    var snippet = snippets[key];
    if (snippet.body.trim() === "") {
      delete snippets[key];
    }
    $snippetList.append($("<li id='" + key + "'>" +  snippets[key].name + "</li>"));
  }
  $page.html("");
  $page.append($help);
  $page.append($sortOptions);
  $page.append($snippetList);
  sortSnippets_enableCustom();
  $(".sortType").change(function() {
    config.snippets.sortType = $('.sortType:checked').val();
    saveConfig();
    sortSnippets_enableCustom();
  });
  $( "#sortable" ).sortable({
    cursor: "move",
    deactivate: function( event, ui ) {
      var arySorted = $( "#sortable" ).sortable( "toArray" );
      for (var i = 0; i < arySorted.length; i++) {
        if (!snippets[arySorted[i]]) {
          console.log("*** Error finding snippet::" +  arySorted[i] + "::");
        } else {
          snippets[arySorted[i]].ordinal = i;
        }
      }
      console.log(snippets);
      saveSnippets();
    }
  });
  $( "#sortable" ).disableSelection();
}

function cleanSnippets() {
  log("functiontrace", "Start Function");
  var key;
  for (key in snippets) {
    var snippet = snippets[key];
    if (snippet.body.trim() === "") {
      delete snippets[key];
    }
  }
}

function sortedSnippetKeys() {
  log("functiontrace", "Start Function");
  var sortType = "alpha";
  if (config.snippets && config.snippets.sortType) {
    sortType = config.snippets.sortType;
  }
  console.log("SortType:" + sortType);
  switch (sortType) {
    case "alpha":
      return Object.keys(snippets).sort(function (a, b) { return a.toLowerCase().localeCompare(b.toLowerCase());  });
    case "custom":
      return Object.keys(snippets).sort(function compare(aKey, bKey) {
        var a = snippets[aKey];
        var b = snippets[bKey];
        if (a.ordinal < b.ordinal) {
          return -1;
        }
        if (a.ordinal > b.ordinal) {
          return 1;
        }
        return 0;
      });
  }
}

function setSnippet() {
  log("functiontrace", "Start Function");
  var strName = $('#snippetName').val();
  var strBody = $('#snippetBody').val();
  var strID = strName.replace(/ /g, "-");
  var snippet = {};

  strID = strID.replaceAll("\'","");
  strID = strID.replaceAll('\"',"");
  snippet.id = strID.replaceAll(":","");
  snippet.body = strBody;
  snippet.name = strName.replaceAll(":","");
  snippet.ordinal = Object.keys(snippets).length;
  snippets[strID] = snippet;

  cleanSnippets();
  saveSnippets();
  //displaySnippets();
  //$('#modalpop').dialog( "close" );

  return false;
}

function frmSnippetBody() {
  log("functiontrace", "Start Function");
  var strBody = "";
  var key;
  strBody = "<p><strong>Add Snippet</strong></p>";
  strBody += "<table>";
  strBody += "<tr>";
  strBody += " <th style='vertical-align: top; text-align: right;'>Name:</th>";
  strBody += " <td><input type='text' id='snippetName' size='50'></td>";
  strBody += "</tr>";
  strBody += "<tr>";
  strBody += " <th style='vertical-align: top; text-align: right;'>Snippet:</th>";
  strBody += " <td><textarea id='snippetBody' rows='3' cols='50'></textarea></td>";
  strBody += "</tr>";
  strBody += "<tr>";
  strBody += " <td colspan='2'><center><button value='Set' id='setSnippet'>Set</button></center></td>";
  strBody += "</tr>";
  strBody += "</table>";
  strBody += "<p><strong>Current Snippets</strong></p>";
  strBody += "<table>";
  strBody += "<tr>";
  strBody += " <th style='text-align: left;'>Name</th>";
  strBody += " <th style='text-align: left;'>Actions</th>";
  strBody += "</tr>";
  for (key in snippets) {
    var snippet = snippets[key];
    if (snippet.body !== "") {
      strBody += "<tr id='snipEdit_row_" + snippet.id + "'>";
      strBody += " <td>" + snippet.name.replace("'", "&#39;") + "</td>";
      strBody += " <td>";
      strBody += "<button type='button' id='snipEdit_use_" + snippet.id + "' class='snipEdit_usebutton' value='Use'>Use</button> ";
      strBody += "<button type='button' id='snipEdit_update_" + snippet.id + "' class='snipEdit_updatebutton' value='Edit'>Edit</button> ";
      strBody += "<button type='button' id='snipEdit_delete_" + snippet.id + "' class='snipEdit_deletebutton' value='Delete'>Delete</button> ";
      strBody += "</td>";
      strBody += "</tr>";
    }
  }
  return strBody;
}

function frmSnippetButtons() {
  log("functiontrace", "Start Function");
  var strBody;
  var strID;
  var snippet;
  $('button#setSnippet').click(function (e) {
    e.preventDefault();
    setSnippet();
    strBody = frmSnippetBody();
    $("#modalpop").html(strBody);
    frmSnippetButtons();
  });
  $('#modalpop button.snipEdit_updatebutton').click(function (e) {
    strID = $(this).attr("id");
    strID = strID.replace("snipEdit_update_", "");
    snippet = snippets[strID];
    $("#modalpop #snippetName").val(snippet.name);
    $("#modalpop #snippetBody").val(snippet.body);
  });
  $('#modalpop button.snipEdit_usebutton').click(function (e) {
    strID = $(this).attr("id");
    strID = strID.replace("snipEdit_use_", "");
    snippet = snippets[strID];
    pasteToDesc(snippets[strID].body, false);
  });
  $('#modalpop button.snipEdit_deletebutton').click(function (e) {
    strID = $(this).attr("id");
    strID = strID.replace("snipEdit_delete_", "");
    delete snippets[strID];
    saveSnippets();
    //displaySnippets();
    strBody = frmSnippetBody();
    $("#modalpop").html(strBody);
    frmSnippetButtons();
  });
}

function frmSnippet() {
  log("functiontrace", "Start Function");
  var strBody = frmSnippetBody;
  var strID = "";
  throwModal("Add Snippet", strBody);
  frmSnippetButtons();
}

function cleanSnippetKeys() {
  var tmp = {};
  for (var key in snippets) {
    var snip = snippets[key];
    var newKey = key;
    newKey = newKey.replaceAll("\'","");
    newKey = newKey.replaceAll("\&","");
    newKey = newKey.replaceAll('\"',"");
    snip.id = newKey;
    tmp[newKey] = snip;
  }
  snippets = tmp;
}

function loadSnippets() {
  log("functiontrace", "Start Function");
  var strSnippets = GM_getValue("snippets", "");
  if (strSnippets !== "") {
    snippets = JSON.parse(strSnippets);
    cleanSnippetKeys();
  }
}

function rawSnippets() {
    return JSON.stringify(snippets);
}

function saveSnippets() {
  log("functiontrace", "Start Function");
  cleanSnippetKeys();
  GM_setValue("snippets", JSON.stringify(snippets));
}

function moveCaretToEnd(el) {
  log("functiontrace", "Start Function");
  if (typeof el.selectionStart == "number") {
    el.selectionStart = el.selectionEnd = el.value.length;
  }
  else if (typeof el.createTextRange != "undefined") {
    el.focus();
    var range = el.createTextRange();
    range.collapse(false);
    range.select();
  }
}

/* For doing bold, italics etc */
function pasteToDesc(snippet, moveToEnd) {
  log("functiontrace", "Start Function");
  var textArea = $(strLastFocus);
  if (textArea.length > 0) {
    var start = textArea[0].selectionStart;
    var end = textArea[0].selectionEnd;
    let iPos = snippet.indexOf("%sel%");

    if (iPos > -1) {
      let strSel = "";
      if (end > start) {
        strSel = textArea.val().substring(start, end);
      }
      snippet = snippet.replace("%sel%",strSel);
    }

    var replacement = snippet;
    textArea.val(textArea.val().substring(0, start) + replacement + textArea.val().substring(end, textArea.val().length));
    if (moveToEnd) {
      moveCaretToEnd(textArea[0]);
    }
  }
}

function pasteSnippet($this) {
  log("functiontrace", "Start Function");
  var strID = $this.attr("id").replace("snip-", "");
  pasteToDesc(snippets[strID].body, false);
  return false;
}

function pasteSnippetNew($this) {
  log("functiontrace", "Start Function");
  var strID = $this.attr("id").replace("snipNew-", "");
  pasteToDesc(snippets[strID].body, false);
  return false;
}

function replaceSnippetsTags() {
  var aryKeys = sortedSnippetKeys();
  var textArea = $(strLastFocus);
  if (textArea.length > 0) {
    console.log("RST: Got textarea");
    //textArea = textArea[0];
    var strText = textArea.val();
    for (var i = 0; i < aryKeys.length; i++) {
      var strKey = aryKeys[i];
      strText = strText.replaceAll("\\[" + i + "\\]", snippets[strKey].body);
      console.log("RST: replaced: " + strKey);
    }
    textArea.val(strText);
  }
}

function getSnipCats() {
  let keys = sortedSnippetKeys();
  let cats = [];
  for (const key of keys) {
    let iPos = key.indexOf("__");
    if (iPos > -1) {
      let strCat = key.substring(0,iPos);
      if (!cats.includes(strCat)) {
        cats.push(strCat);
      }
    }
  }
  return cats;
}

function buildSnipMenu() {
  let $snipNew = $("<ul id='snipMenu' style='width: 8rem; float: right; margin-right: 15rem; z-index: 999; margin-top: 9px;'><li><div id='snipNewTop'>Snippets</div><ul id='snipMenuInner' style='width: 10rem'></ul></li></ul>")
  let $snipInner = $snipNew.find("#snipMenuInner");
  $snipNew.find('#snipNewTop').click(function (e) {
    //e.preventDefault();
    frmSnippet();
    if (config.general.snippetscontext) {
      $("#snipMenu").hide();
    }
  });
  var keys = sortedSnippetKeys();
  let cats = getSnipCats();
  for (const catName of cats) {
    let $catLi = $("<li><div>" + catName + "</div><ul style='width: 10rem' id='snipCat-" + catName + "'></ul></li>");
    $snipInner.append($catLi);
  }
  for (const key of keys) {
    var snippet = snippets[key];
    var snipName = "";
    let iPos = key.indexOf("__");
    if (snippet.body !== "") {
      if (iPos > -1) {
        snipName = snippet.name.substring(iPos+2);
      } else {
        snipName = snippet.name;
      }
      let $snip = $("<li id='snipNew-" + snippet.id + "'><div>" + snipName + "</div></li>");
      $snip.click(function (e) {
        pasteSnippetNew($(this));
        if (config.general.snippetscontext) {
          $("#snipMenu").hide();
        }
        //stopDefaultAction(e);
        return false;
      });
      if (iPos > -1) {
        let strCat = key.substring(0,iPos);
        $snipInner.find("#snipCat-" + strCat).append($snip);
      } else {
        $snipInner.append($snip);
      }
    }
  }

  $snipNew.menu();
  return $snipNew;
}


function setSnipMenu(strSel, copyTo) {
  var $copyTo = $(copyTo);
  if ($copyTo.length > 0) {
    $copyTo.find("#snipMenu").remove();
    $copyTo.before(buildSnipMenu());
  }

  if (config.general.snippetscontext) {
    $(document).contextmenu({
      delegate: strSel,
      closeOnWindowBlur: false,
      menu: "#snipMenu",
      select: function(event, ui) {
        alert("select " );
      }
    });

    $( document.body ).click( function() {
      $("#snipMenu").hide();
    } );
  }
}

function displaySnippets() {
  log("functiontrace", "Start Function");
  if (!config.general.snippets)  {
    return;
  }
  setTimeout(function() {
    if ($("div.bbcode-editor textarea").length > 0) {
      strLastFocus ="div.bbcode-editor textarea";
      setSnipMenu("div.bbcode-editor textarea","body");
    }
  },500);

}
/* =========================== */

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
  log("savesettings","Saving config");
  log("savesettings",config);
  GM_setValue("config",JSON.stringify(config));
  if (andThen) andThen();
}

function initConfig(andThen) {
  config = {};
  config_display = {};
  loadConfig();
  // Settings categories
  initConfigCategory("general","General");
  initConfigCategory("speechStyling","Speech Styling");
  initConfigCategory("image","Images");
  initConfigCategory("threads","Threads");
  // Speech Styling
  initConfigItem("speechStyling","on", true, {text: "Style Speech?", type: "bool" });
  initConfigItem("speechStyling","incQuote", true , {text: "Include quotes?", type: "bool" });
  initConfigItem("speechStyling","CSS", "color: blue;", {text: "Speech Styling (CSS)", type: "text" });
  // Images
  initConfigItem("image","enlarge", true, {text: "Click to Enlarge?", type: "bool" });
  // General
  initConfigItem("general","CSS", "", {text: "CSS", type: "textbox", cols: 60, rows: 10 });
  initConfigItem("general","snippets", false, {text: "Snippets?", type: "bool" });
  initConfigItem("general","snippetscontext", true, {text: "Snippets context menu?", type: "bool" });

  //Threads
  initConfigItem("threads","scrollToBottom", false, {text: "Autoscroll Threads?", type: "bool" });
  initConfigItem("threads","removeQuickReply", false, {text: "Remove Quick Reply?", type: "bool" });
  initConfigItem("threads","reverseThread", false, {text: "Most recent first?", type: "bool" });
  initConfigItem("threads","wordCount", true, {text: "Show word count?", type: "bool" });

  saveConfig();
  if (andThen) andThen();
}

// Returns true if a setting hsa been set, false otherwise
function updateConfig(controlID) {
	var $control = $("#content div.content").find("#" + controlID);
	var aID = controlID.split("-");
	var catID = aID[3];
	var settingID = aID[4];
  log("updateconfig","Set: " + settingID);
  log("updateconfig",$control);
	if ($control.hasClass("gm-settings-control-bool")) {
		config[catID][settingID] = $control[0].checked;
	} else if ($control.hasClass("gm-settings-control-int")) {
        log("updateconfig","Inty: " + settingID);
        var intVal = parseInt($control.val());
        log("updateconfig",intVal);
        if ($.isNumeric("" + intVal)) {
            if (config_display[catID][settingID].hasOwnProperty("min") && intVal < config_display[catID][settingID].min) {
                log("updateconfig","There's a minimum and " + intVal + " < " + config_display[catID][settingID].min);
                return false;
            }
            if (config_display[catID][settingID].hasOwnProperty("max") && intVal > config_display[catID][settingID].max) {
                log("updateconfig","There's a maximum and " + intVal + " > " + config_display[catID][settingID].max);
                return false;
            }
            config[catID][settingID] = intVal;
        } else {
            log("updateconfig","Not an integer: " + $control.val())
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
  GM_addStyle(".gm-settings-setting-label { max-width: 15rem; display: inline-block; vertical-align: top; }");
  //var $page = $("div#helpmain");
  //$("#fatal_error").css("width","auto");
  let $titleBar = $("#content div.title-bar");
  let $page = $("#content div.content");

  log("editconfig",$titleBar);
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
                case "textbox":
                  let strBox = `<span class='gm-settings-setting-value'><textarea class='gm-settings-control gm-settings-control-text' id='gm-settings-value-${key}-${key2}'`;
                  if (setting.cols) {
                    strBox = `${strBox} cols='${setting.cols}'`;
                  }
                  if (setting.rows) {
                    strBox = `${strBox} rows='${setting.rows}'`;
                  }
                  strBox = `${strBox}>${val}</textarea></span>`;
                  $newSetting.append(strBox);
                  break;
                case "text":
                  default:11
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
  if (config.general.CSS && config.general.CSS.trim().length > 0) {
    GM_addStyle(config.general.CSS);
  }
  GM_addStyle(GM_getResourceText("JQI_CSS"));
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
  page.thread = -1;
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
    case "thread":
      page.type = page.url.page;
      page.thread = parseInt(window.location.pathname.split('/')[2]);
    default:
      page.type = page.url.page;
      break;
  }
  log("getpage","Get Page");
  log("getpage",page);
}

/* =========================== */
/* Main Function               */
/* =========================== */
function main() {
  applyCSS();
  getPage();
  setupMenus();
  loadSnippets();
  switch (page.type) {
      case "thread":
        displaySnippets();
        // The following two have config control inside the functions
        StyleSpeechElements("div.message");
        setupImageEnlarge("div.message");

        // Remove quick reply
        if (config.threads.removeQuickReply) {
          $("div.quick-reply").remove();
        }

        // See most recent posts first
        if (config.threads.reverseThread) {
          reverseThread()
        }

        // Scroll to bottom of thread
        if (config.threads.scrollToBottom) {
          window.scrollTo(0, document.body.scrollHeight);
        } else {
          window.scrollTo(0, 0);
        }

        // Add top menu to bottom of page
        $('footer').prepend($('div#navigation-menu').clone().attr("id","navigation-menu").css("margin-bottom","10px"));4

        // Add reply link to top (and bottom) menu
        setupMenu("reply","Reply",`/post/new/${page.thread}`);

        // Show word counts
        if (config.threads.wordCount) {
          showWordCountThreads();
        }
        break;
      case "post":
        displaySnippets();
        StyleSpeechElements("div.message");
        if (config.threads.reverseThread) {
          reverseThread()
        }
        // Show word counts
        if (config.threads.wordCount) {
          showWordCountThreads();
        }
        break;
    case "script":
        editConfig();
        break;
  }
}

$( document ).ready(function() {
  log("gminfo",GM_info);
  log("startup", "Starting " + GM_info.script.name + " v" + GM_info.script.version);
  initConfig(main);
});
