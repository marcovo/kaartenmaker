<?php
error_reporting(E_ALL); ini_set('display_errors', 'On');

$x = 184168;
$y = 551532;
$paperSize = 'A4P';
$scale = 25; // 1:25000

$x_low = floor($x/1000);
$y_low = floor($y/1000);

if($paperSize == 'A4P') {
	$numX = 4.5;
	$numY = 7;
}
else if($paperSize == 'A4L') {
	$numX = 7;
	$numY = 5;
}

$numX++;
$numY++;

$x_high = $x_low+$numX;
$y_high = $y_low+$numY;

$x_res = $x/1000 - $x_low;
$y_res = $y/1000 - $y_low;


$s_template = '<!DOCTYPE html>
<html>
<head>
	<title>Kaart</title>
	<style>
	img {
		width: '.(1000/$scale).'mm;
		position: absolute;
	}
	
	div.outer {
		position: absolute;
		overflow: hidden;
		width: '.(($numX-1)*1000/$scale+1).'mm;
		height: '.(($numY-1)*1000/$scale+1).'mm;
	}
	
	div.inner {
		position: relative;
		top: '.(-$x_res*1000/$scale).'mm;
		left: '.(-$y_res*1000/$scale).'mm;
		width: '.($numX*1000/$scale+1).'mm;
		height: '.($numY*1000/$scale+1).'mm;
	}
	</style>
</head>
<body>
	<div class="outer">
		<div class="inner">';
	$i_row = 0;
	for($iy=$y_high-1;$iy>=$y_low;$iy--) {
		$i_col = 0;
		for($ix=$x_low;$ix<$x_high;$ix++) {
			$s_template .= '<img src="./kaart/400_'.$ix.'-'.$iy.'.png" alt="'.$ix.'-'.$iy.'" style="top: '.($i_row*1000/$scale).'mm; left: '.($i_col*1000/$scale).'mm;" />';
			$i_col++;
		}
		$i_row++;
		$s_template .= '<br />';
	}
$s_template .= '
		</div>
	</div>
</body>
</html>';

$s_template = '
	<div class="outer" style="position: absolute;overflow: hidden;width: '.(($numX-1)*1000/$scale+1).'mm;height: '.(($numY-1)*1000/$scale+1).'mm;">
		<div class="inner" style="position: relative;top: '.(-$x_res*1000/$scale).'mm;left: '.(-$y_res*1000/$scale).'mm;width: '.($numX*1000/$scale+1).'mm;height: '.($numY*1000/$scale+1).'mm;">';
	$i_row = 0;
	for($iy=$y_high-1;$iy>=$y_low;$iy--) {
		$i_col = 0;
		for($ix=$x_low;$ix<$x_high;$ix++) {
			$s_template .= '<img src="./kaart/400_'.$ix.'-'.$iy.'.png" alt="'.$ix.'-'.$iy.'" style="width: '.(1000/$scale).'mm;float:left;" />';
			$i_col++;
		}
		$i_row++;
		$s_template .= '<br />';
	}
$s_template .= '
		</div>
	</div>';

/*
$s_filehash = md5(rand());
$s_filename = './tempMaps/'.$s_filehash.'.html';
file_put_contents($s_filename, $s_template);
exec('wkhtmltopdf '.$s_filename.' ./tempMaps/'.$s_filehash.'.pdf');
*/
//die($s_template);
/*
require('dompdf/dompdf_config.inc.php');
$obj_DOMPDF = new DOMPDF();
$obj_DOMPDF->load_html($s_template);
$obj_DOMPDF->set_paper('A4', 'portrait');
$obj_DOMPDF->render();
$obj_DOMPDF->stream('kaart.pdf');
*/













//die();

set_time_limit(0);

//<?php
//============================================================+
// File name   : example_001.php
// Begin       : 2008-03-04
// Last Update : 2013-05-14
//
// Description : Example 001 for TCPDF class
//               Default Header and Footer
//
// Author: Nicola Asuni
//
// (c) Copyright:
//               Nicola Asuni
//               Tecnick.com LTD
//               www.tecnick.com
//               info@tecnick.com
//============================================================+

/**
 * Creates an example PDF TEST document using TCPDF
 * @package com.tecnick.tcpdf
 * @abstract TCPDF - Example: Default Header and Footer
 * @author Nicola Asuni
 * @since 2008-03-04
 */

// Include the main TCPDF library (search for installation path).
require_once('tcpdf/examples/tcpdf_include.php');
require_once('tcpdf/tcpdf.php');
// create new PDF document
$pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, false, 'ISO-8859-1', false);

// set document information
$pdf->SetCreator(PDF_CREATOR);
$pdf->SetAuthor('Nicola Asuni');
$pdf->SetTitle('TCPDF Example 001');
$pdf->SetSubject('TCPDF Tutorial');
$pdf->SetKeywords('TCPDF, PDF, example, test, guide');

// set default header data
//$pdf->SetHeaderData(PDF_HEADER_LOGO, PDF_HEADER_LOGO_WIDTH, PDF_HEADER_TITLE.' 001', PDF_HEADER_STRING, array(0,64,255), array(0,64,128));
//$pdf->setFooterData(array(0,64,0), array(0,64,128));

// remove default header/footer
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);

// set default monospaced font
$pdf->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);

// set margins
$pdf->SetMargins(PDF_MARGIN_LEFT, PDF_MARGIN_TOP, PDF_MARGIN_RIGHT);
$pdf->SetHeaderMargin(PDF_MARGIN_HEADER);
$pdf->SetFooterMargin(PDF_MARGIN_FOOTER);

// set auto page breaks
$pdf->SetAutoPageBreak(TRUE, PDF_MARGIN_BOTTOM);

// set image scale factor
$pdf->setImageScale(PDF_IMAGE_SCALE_RATIO);

// set some language-dependent strings (optional)
if (@file_exists(dirname(__FILE__).'/lang/eng.php')) {
	require_once(dirname(__FILE__).'/lang/eng.php');
	$pdf->setLanguageArray($l);
}

// ---------------------------------------------------------

// set default font subsetting mode
$pdf->setFontSubsetting(true);

// Set font
// dejavusans is a UTF-8 Unicode font, if you only need to
// print standard ASCII chars, you can use core fonts like
// helvetica or times to reduce file size.
$pdf->SetFont('helvetica', '', 14, '', true);

// Add a page
// This method has several options, check the source code documentation for more information.
$pdf->AddPage();

// Set some content to print
$html = <<<EOD
<h1>Welcome to <a href="http://www.tcpdf.org" style="text-decoration:none;background-color:#CC0000;color:black;">&nbsp;<span style="color:black;">TC</span><span style="color:white;">PDF</span>&nbsp;</a>!</h1>
<i>This is the first example of TCPDF library.</i>
<p>This text is printed using the <i>writeHTMLCell()</i> method but you can also use: <i>Multicell(), writeHTML(), Write(), Cell() and Text()</i>.</p>
<p>Please check the source code documentation and other examples for further information.</p>
<p style="color:#CC0000;">TO IMPROVE AND EXPAND TCPDF I NEED YOUR SUPPORT, PLEASE <a href="http://sourceforge.net/donate/index.php?group_id=128076">MAKE A DONATION!</a></p>
EOD;

$html = $s_template;

// Print text using writeHTMLCell()
$pdf->writeHTMLCell(0, 0, '', '', $html, 0, 1, 0, true, '', true);

// ---------------------------------------------------------

// Close and output PDF document
// This method has several options, check the source code documentation for more information.
$pdf->Output('example_001.pdf', 'I');

//============================================================+
// END OF FILE
//============================================================+
