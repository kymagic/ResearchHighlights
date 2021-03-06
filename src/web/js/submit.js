
/**
 * Research Highlights engine
 * 
 * Copyright (c) 2014 Martin Porcheron <martin@porcheron.uk>
 * See LICENCE for legal information.
 */

var wordCount = 1500;
var year = 1;

function autoResize() {
	$('.stage-editor textarea').each(function() {$(this).trigger('autosize.resize')});
}

var loginPrefill = function (response, textStatus, jqXHR) {
	$('#tweet').unbind('keyup.count');
	$('#text').unbind('keyup.count');

	$('.wordlimit').text(response.wordCount);

	$('#tweet').bind('keyup.count', function(e) {
		ReHi.charCount($(this), $('.tweet-rem'), 125);
	});
	$('#text').bind('keyup.count', function(e) {
		ReHi.wordCount($(this), $('.text-rem'), response.wordCount);
	});
	
	$('.name').text(response.firstName + ' ' + response.surname);

	$('#cohort').attr('value', response.cohort);
	$('#name').attr('value', response.firstName + ' ' + response.surname);
	$('#email').attr('value', response.email);

	$('#tweet').val(response.tweet);
	$('#tweet').triggerHandler('keyup');

	$('#twitter').val(response.twitter);
	$('#website').attr('value', response.website);
	$('#keywords').tagsinput('removeAll'); 
	$.each(response.keywords.split(','), function(k,v) {$('#keywords').tagsinput('add', v)});

	$('#industryName').attr('value', response.industryName);
	$('#industryUrl').attr('value', response.industryUrl);

	$('#title').val(response.title);
	$('#text').val(response.text);
	$('#text').triggerHandler('keyup');

	$('#references').val(response.references);
	$('#references').triggerHandler('keyup');

	$('.preview-supported').data('fundingStatement', response.fundingStatement);

	$('#publications').val(response.publications);
	$('#publications').triggerHandler('keyup');
	$('.stage-login').fadeOut({complete : function() {$('.stage-editor').fadeIn(); $('.stage-editor input').triggerHandler('change'); autoResize(); }});
};

$(function() {

	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
	 	autoResize();
	});

	var sub = 0;
	$('.collapse').each(function(i) {
		if(!$(this).hasClass('stage-editor')) {
			$(this).delay(400 * (i - sub)).fadeIn();
		} else {
			sub++;
		}
	});

	$('.navbar-toggle').addClass('stage-editor');

	ReHi.showAlert('Welcome!', 'Please enter your credentials to continue.', 'info'); 

	ReHi.regSubForm($('form.stage-login'), '@@@URI_ROOT@@@/do/login', function(response, textStatus, jqXHR) {
		if (response == '-3') {
			ReHi.showError('Humph!', 'Your account has been disabled. <a href="mailto:cdt-rh@lists.porcheron.uk" class="alert-link">Email support</a> for help.');
		} else if (response == '-1') {
			ReHi.showError('Oh, snap!', 'Looks like you\'ve entered an invalid username/password combination. <a href="mailto:cdt-rh@lists.porcheron.uk" class="alert-link">Email support</a> for help.'); 
		} else if (response.success == '1') {
			ReHi.showSuccess('Welcome!', 'Your login was successful. You can log back in any time to modify your submission before the deadline.');
			$('#saveAs').attr('value', $('#username').val());
			$('#admin-user').attr('value', $('#username').val());
			$('#admin-pass').attr('value', $('#password').val());
			$('#editor-user').attr('value', $('#username').val());
			$('#editor-pass').attr('value', $('#password').val());
			loginPrefill(response, textStatus, jqXHR); 
			if(response.admin != undefined) {
				$.getScript("web/js/admin@@@EXT_JS@@@");
			}
		}
	}, 'json');

	ReHi.regAutoForm($('form.stage-editor'), '@@@URI_ROOT@@@/do/preview', function (response, textStatus, jqXHR) {
		var tVal = $('#title').val();
		$('.preview-title').html(tVal.length == 0 ? 'Preview' : tVal);
	 
		var iNVal = $('#industryName').val(); var iUVal = $('#industryUrl').val();
		var fundingStatement = '<small>' + $('.preview-supported').data('fundingStatement');
		if (iNVal == '') {
			$('.preview-supported').html($(fundingStatement + '.</small>'));
		} else if (iUVal == '' || iUVal == 'http://') {
			$('.preview-supported').html($(fundingStatement  + ' and by <span>' + iNVal + '</span>.</small>'));
		} else {
			$('.preview-supported').html($(fundingStatement  + ' and by <a href="' + iUVal + '" target="_blank">' + iNVal + '</a>.</small>'));
		}

		$('.preview-input').html(response);
	});

	ReHi.regSubForm($('form.stage-editor'), '@@@URI_ROOT@@@/do/submit', function (response, textStatus, jqXHR) {
		if (response != '1') {
			ReHi.showError('Goshdarnit!', 'Something has gone wrong! <a href="mailto:cdt-rh@lists.porcheron.uk" class="alert-link">I need help!</a> (error: ' + response + ')');
		} else {
			ReHi.showSuccess('Good News!', 'Your submission was saved, ' + $('#name').val() + '! For reference, you can see the latest version of <a href="@@@URI_ROOT@@@/read#' + $('#saveAs').attr('value') + '" target="_blank">your submission</a> online (although it may not look like this in the final website).')
		}
	});

	$('a[href="#content"]').on('shown.bs.tab', function(e) {
		$('#text').show().trigger('autosize.resize');
	});

	$('textarea').autosize(); 

	$('#keywords').on('beforeItemAdd', function(e) {
		var ret = false;
		$.each($('#keywords').tagsinput('items'), function(k, v) {
			if(!ret && v.toLowerCase() == e.item.toLowerCase()) {
				ret = true;
			}
		});
		e.cancel = ret;
	});

	$('a').click(function(e) {
		var href = $(this).attr('href');
		if (href.substring(0, 1) != '#' && $('.stage-editor').is(':visible')) {
			if(!confirm('If you continue, any unsubmitted changes may be lost')) {
				e.preventDefault();
				return false;
			}
		}
	});

	$('#logout').click(function(e) {
		if (confirm('If you logout, any unsubmitted changes will be lost!')) {
			window.location.reload();
		}
	});

	$('#submit').click(function(e) {
		e.preventDefault();
		if ($('#title').val().length == 0) {
			ReHi.showError('Whoopsie!', 'You need to give your submission a title!');
		} else if ($('#keywords').tagsinput('items').length == 0) {
			ReHi.showError('Oh dear!', 'You need to enter at least <strong>five</strong> keywords!');
		} else if ($('#keywords').tagsinput('items').length < 5) {
			ReHi.showError('Oh dear!', 'You need to enter <strong>' + (5 - $('#keywords').tagsinput('items').length) + '</strong> more keywords');
		} else if ($('#tweet').val().length < 25) {
			ReHi.showError('Oh dear!', 'You should enter a better 140-character summary of your PhD');
		} else if ($('#tweet').val().length > 125) {
			ReHi.showError('Oh dear!', 'Your tweet-like summary is too long!');
		} else {
			ReHi.showAlert('Just a moment!', 'Saving your submission. Please don\'t leave or refresh this page until a success message appears (resubmit if need be).', 'info');
			setTimeout(function() {$('form.stage-editor').triggerHandler('submit')}, 500);
		}
	});
});