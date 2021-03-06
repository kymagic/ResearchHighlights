<?php

/**
 * Research Highlights engine
 * 
 * Copyright (c) 2014 Martin Porcheron <martin@porcheron.uk>
 * See LICENCE for legal information.
 */

// Generate a submission preview from MD to HTML
// -1 : Not logged in
// -3 : No details on who to save submission as
// -5 : Attempting to masquerade when not admin

$rh = \CDT\RH::i();
$oUserModel = $rh->cdt_user_model;
$oInputModel = $rh->cdt_input_model;

if (!$oUserModel->login ()) {
	print '-1';
	exit;
}

if (is_null ($oInputModel->get('saveAs'))) {
	print '-3';
	exit;
}

if ($oInputModel->get('username') !== $oInputModel->get ('saveAs')
	&& !$oUserModel->login (true)) {
	print '-5';
	exit;
}

$oSubmissionModel = $rh->cdt_submission_model;

$textMd = \trim ($oInputModel->get ('text'));
$textHtml = !empty ($textMd) ? $oSubmissionModel->markdownToHtml ($textMd) : '<em>No text.</em>';

$refMd = \trim ($oInputModel->get ('references'));
$refHtml = !empty ($textMd) && !empty ($refMd) ?  '<h1>References</h1>' . $oSubmissionModel->markdownToHtml ($refMd) : '';

print $textHtml . $refHtml;