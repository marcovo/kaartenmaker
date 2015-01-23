<?php
set_time_limit(0);

$a_kaarten = array(
	'01W'	=>	array('origin' => array(140, 600)),
	'01O'	=>	array('origin' => array(160, 600)),
	'02W'	=>	array('origin' => array(180, 600)),
	'02O'	=>	array('origin' => array(200, 600)),
	'03W'	=>	array('origin' => array(220, 600)),
	'03O'	=>	array('origin' => array(240, 600)),
	
	'04'	=>	array('origin' => array(114, 575), 'size' => array(26, 25)),
	'05W'	=>	array('origin' => array(140, 575)),
	'05O'	=>	array('origin' => array(160, 575)),
	'06W'	=>	array('origin' => array(180, 575)),
	'06O'	=>	array('origin' => array(200, 575)),
	'07W'	=>	array('origin' => array(220, 575)),
	'07O'	=>	array('origin' => array(240, 575)),
	'08'	=>	array('origin' => array(260, 575)),
	
	'09'	=>	array('origin' => array(100, 550), 'size' => array(30, 25)),
	'10W'	=>	array('origin' => array(130, 550), 'size' => array(30, 25)),
	'10O'	=>	array('origin' => array(160, 550)),
	'11W'	=>	array('origin' => array(180, 550)),
	'11O'	=>	array('origin' => array(200, 550)),
	'12W'	=>	array('origin' => array(220, 550)),
	'12O'	=>	array('origin' => array(240, 550)),
	'13'	=>	array('origin' => array(260, 550)),
	
	'14W'	=>	array('origin' => array(100, 525)),
	'14O'	=>	array('origin' => array(120, 525), 'size' => array(30, 25)),
	'15'	=>	array('origin' => array(150, 525), 'size' => array(30, 25)),
	'16W'	=>	array('origin' => array(180, 525)),
	'16O'	=>	array('origin' => array(200, 525)),
	'17W'	=>	array('origin' => array(220, 525)),
	'17O'	=>	array('origin' => array(240, 525)),
	'18'	=>	array('origin' => array(260, 525)),
	
	'19W'	=>	array('origin' => array(100, 500)),
	'19O'	=>	array('origin' => array(120, 500), 'size' => array(30, 25)),
	'20'	=>	array('origin' => array(150, 500), 'size' => array(30, 25)),
	'21W'	=>	array('origin' => array(180, 500)),
	'21O'	=>	array('origin' => array(200, 500)),
	'22W'	=>	array('origin' => array(220, 500)),
	'22O'	=>	array('origin' => array(240, 500), 'size' => array(30, 25)),
	
	'25W'	=>	array('origin' => array( 88, 475), 'size' => array(32, 25)),
	'25O'	=>	array('origin' => array(120, 475)),
	'26W'	=>	array('origin' => array(140, 475)),
	'26O'	=>	array('origin' => array(160, 475)),
	'27W'	=>	array('origin' => array(180, 475)),
	'27O'	=>	array('origin' => array(200, 475)),
	'28W'	=>	array('origin' => array(220, 475)),
	'28O'	=>	array('origin' => array(240, 475), 'size' => array(30, 25)),
	
	'30'	=>	array('origin' => array( 68, 450), 'size' => array(32, 25)),
	'31W'	=>	array('origin' => array(100, 450)),
	'31O'	=>	array('origin' => array(120, 450)),
	'32W'	=>	array('origin' => array(140, 450)),
	'32O'	=>	array('origin' => array(160, 450)),
	'33W'	=>	array('origin' => array(180, 450)),
	'33O'	=>	array('origin' => array(200, 450)),
	'34W'	=>	array('origin' => array(220, 450)),
	'34O'	=>	array('origin' => array(240, 450), 'size' => array(30, 25)),
	
	'37W'	=>	array('origin' => array( 54, 425), 'size' => array(26, 25)),
	'37O'	=>	array('origin' => array( 80, 425)),
	'38W'	=>	array('origin' => array(100, 425)),
	'38O'	=>	array('origin' => array(120, 425)),
	'39W'	=>	array('origin' => array(140, 425)),
	'39O'	=>	array('origin' => array(160, 425)),
	'40W'	=>	array('origin' => array(180, 425)),
	'40O'	=>	array('origin' => array(200, 425)),
	'41W'	=>	array('origin' => array(220, 425)),
	'41O'	=>	array('origin' => array(240, 425)),
	
	'43W'	=>	array('origin' => array( 60, 400)),
	'43O'	=>	array('origin' => array( 80, 400)),
	'44W'	=>	array('origin' => array(100, 400)),
	'44O'	=>	array('origin' => array(120, 400)),
	'45W'	=>	array('origin' => array(140, 400)),
	'45O'	=>	array('origin' => array(160, 400)),
	'46'	=>	array('origin' => array(180, 400), 'size' => array(27, 25)), // Actually this is 26 + a bit...
	
	'49W'	=>	array('origin' => array( 60, 375)),
	'49O'	=>	array('origin' => array( 80, 374), 'size' => array(20, 26)), // There's an extra bit at the bottom
	'50W'	=>	array('origin' => array(100, 375)),
	'50O'	=>	array('origin' => array(120, 375)),
	'51W'	=>	array('origin' => array(140, 375)),
	'51O'	=>	array('origin' => array(160, 375)),
	'52W'	=>	array('origin' => array(180, 375)),
	'52O'	=>	array('origin' => array(200, 375)),
	
	'55'	=>	array('origin' => array( 60, 350)),
	'57W'	=>	array('origin' => array(127, 350), 'size' => array(33, 25)),
	'57O'	=>	array('origin' => array(160, 350)),
	'58W'	=>	array('origin' => array(180, 350)),
	'58O'	=>	array('origin' => array(200, 350)),
	
	'64'	=>	array('origin' => array( 34, 405), 'size' => array(26, 25)),
	'65W'	=>	array('origin' => array( 13, 380), 'size' => array(27, 25)),
	'65O'	=>	array('origin' => array( 40, 380)),
	'67W'	=>	array('origin' => array( 13, 355), 'size' => array(27, 25)),
	'67O'	=>	array('origin' => array( 40, 355)),

	'68W'	=>	array('origin' => array(170, 325)),
	'68O'	=>	array('origin' => array(190, 325)),
	'69W'	=>	array('origin' => array(170, 300)),
	'69O'	=>	array('origin' => array(190, 300))

);

define('x', 0);
define('y', 1);

foreach($a_kaarten as $s_key => $a_kaartInfo) {
	if(isset($a_kaartInfo['size'])) {
		$h = $a_kaartInfo['size'][y];
		$w = $a_kaartInfo['size'][x];
	}
	else {
		$h = 25;
		$w = 20;
	}
	
	$a_matches = glob('kaarten_origineel/TOP50raster_GEOTIFF_november_2014/TOP50raster_GEOTIFF_november_2014/TOP50raster_GEOTIFF/TOP50raster-'.$s_key.'*.tif');
	$s_filename = $a_matches[0];
	
	// De kadaster kaarten zorgen voor zwarte tiles als we ze in 1 keer converten naar tiles. Daarom doen we het in 2 keer.
	exec('convert '.$s_filename.' kaart/kad50/origineel.png');
	exec('convert kaart/kad50/origineel.png -crop 200x200 +repage kaart/kad50/crop_%d.png');
	
	$X = $a_kaartInfo['origin'][x];
	$Y = $a_kaartInfo['origin'][y];
	
	for($i=0;$i<$h*$w;$i++) {
		$x = $X+$i%$w;
		$y = $Y+($h-ceil(($i+1)/$w));
		
		rename('kaart/kad50/crop_'.$i.'.png', 'kaart/kad50/'.$x.'-'.$y.'.png');
	}
}

unlink('kaart/kad50/origineel.png');
