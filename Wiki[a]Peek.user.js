// ==UserScript==
// @name         Wiki[a]Peek
// @namespace    http://your.homepage/
// @version      0.1
// @description  (test) Preview Wikia articles as a tooltip
// @author       C.Cajas
// @match        http://*.wikia.com/wiki/*
// @grant        none
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.js
// ==/UserScript==

$(document).ready(function()
{
	$('#WikiaArticle a').hover(
		function(e) {
			hoverFunc(e, this);
		},
		function() {
			hoverOut();
		}
	);

	console.info("Wiki[a]Peek loaded");
});

///
/// Hover function, to load the article
///

function hoverFunc(e, link) 
{
	var content = loadArticle(link.href);

	// Check if it's a redirect
	if (link.className == "mw-redirect")
	{
		var redirContent = $.parseHTML(content);
		var redirLink = $(redirContent).find('a');
		
		content = loadArticle(redirLink[0].href);  
	}
	
	// Show toolTip with article preview
	if (content)
	{
		showToolTip(e, content);
	}
}

///
/// Load article object from the article's name
///


function loadArticle(article)
{
	// Article URL slug
	article = article.substr(article.lastIndexOf("/") + 1);

	// Check if this is an anchor link or empty
	if (article.indexOf("#") != -1 || article.indexOf("?") != -1 || article === "")
		return null;
	
	// URL for MediaWiki API
	var queryURL = ajaxFunc("/api/v1/Articles/Details/?titles="+ article +"&abstract=500&width=200&height=200");

	var jsonObj = queryURL.items;
	var basePath = queryURL.basepath;
	var pageID;

	// Get property key name of page ID
	for(var key in jsonObj) {
		if(jsonObj.hasOwnProperty(key)) {
			pageID = jsonObj[key];
			break;
		}
	}

	console.dir(pageID.abstract);

	return pageID;
}

///
/// Remove target element from string
///

(function($) {
	$.strRemove = function(theTarget, theString) {
		return $("<div/>").append(
			$(theTarget, theString).remove().end()
		).html();
	};
})(jQuery);

///
/// AJAX shorthand function
///

function ajaxFunc(url) 
{
	var result;

	$.ajax({
		datatype: "json",
		url: url,
		async: false,
		success: function(data){
			result = data;
		}
	});
	return result;
}

///
/// Show the ToolTip
///

function showToolTip(event, content)
{	
	console.log(content);
	var bgcolor = $('.WikiaPage .WikiaPageBackground').css('background-color');
	var thumbnail = (content.thumbnail) ? '<img align="right" src="'+ content.thumbnail +'"/>' : '';

	$('body')
		.prepend('<div class="WikiaPageBackground wpk-tooltip">'+ 
			thumbnail + content.abstract +'</div>');

	$('.wpk-tooltip')
		.hide()
		.fadeIn(500)
		.css({
			'position' : 'absolute',
			'z-index' : '10',
			'font-size' : '12px',
			'line-height' : '1.4em',
			'top' : (event.pageY + 10) + 'px',
			'left' : '20%',
			'width' : '400px',
			'padding' : '5px',
			'background-color': bgcolor,
			'border' : '1px solid #aaa',
			'-webkit-box-shadow' : '0px 3px 3px 2px rgba(0,0,0,0.25)',
			'-moz-box-shadow' : '0px 3px 3px 2px rgba(0,0,0,0.25)',
			'box-shadow' : '0px 3px 3px 2px rgba(0,0,0,0.25)'
		});

	$('.wpk-tooltip img').css({
		'margin': '0px 4px', 'width': '96px', 'height': '96px'});
}

///
/// Hide the ToolTip
///

function hoverOut()
{
	$('.wpk-tooltip').remove();
}
