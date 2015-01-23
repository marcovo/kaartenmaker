<?php
set_time_limit(0);

$a_kaarten = array(
	'71+04'	=>	array('origin' => array(100, 575), 'size' => array(40, 50)),
	'01+05'	=>	array('origin' => array(140, 575), 'size' => array(40, 50)),
	'02+06'	=>	array('origin' => array(180, 575), 'size' => array(40, 50)),
	'03+07'	=>	array('origin' => array(220, 575), 'size' => array(40, 50)),
	'78+08'	=>	array('origin' => array(260, 575), 'size' => array(20, 50)),
	
	'73'	=>	array('origin' => array( 60, 525), 'size' => array(40, 25)),
	'09+14'	=>	array('origin' => array(100, 525), 'size' => array(40, 50)),
	'10+15'	=>	array('origin' => array(140, 525), 'size' => array(40, 50)),
	'11+16'	=>	array('origin' => array(180, 525), 'size' => array(40, 50)),
	'12+17'	=>	array('origin' => array(220, 525), 'size' => array(40, 50)),
	'13+18'	=>	array('origin' => array(260, 525), 'size' => array(20, 50)),
	
	'72+24'	=>	array('origin' => array( 60, 475), 'size' => array(40, 50)),
	'19+25'	=>	array('origin' => array(100, 475), 'size' => array(40, 50)),
	'20+26'	=>	array('origin' => array(140, 475), 'size' => array(40, 50)),
	'21+27'	=>	array('origin' => array(180, 475), 'size' => array(40, 50)),
	'22+28'	=>	array('origin' => array(220, 475), 'size' => array(40, 50)),
	'23+29'	=>	array('origin' => array(260, 475), 'size' => array(20, 50)),
	
	'30+37'	=>	array('origin' => array( 60, 425), 'size' => array(40, 50)),
	'31+38'	=>	array('origin' => array(100, 425), 'size' => array(40, 50)),
	'32+39'	=>	array('origin' => array(140, 425), 'size' => array(40, 50)),
	'33+40'	=>	array('origin' => array(180, 425), 'size' => array(40, 50)),
	'34+41'	=>	array('origin' => array(220, 425), 'size' => array(40, 50)),
	'35+42'	=>	array('origin' => array(260, 425), 'size' => array(20, 50)),
	
	'43+49'	=>	array('origin' => array( 60, 375), 'size' => array(40, 50)),
	'44+50'	=>	array('origin' => array(100, 375), 'size' => array(40, 50)),
	'45+51'	=>	array('origin' => array(140, 375), 'size' => array(40, 50)),
	'46+52'	=>	array('origin' => array(180, 375), 'size' => array(40, 50)),
	'47+53'	=>	array('origin' => array(220, 375), 'size' => array(20, 50)),
	
	'55'	=>	array('origin' => array( 60, 350), 'size' => array(40, 25)),
	'56'	=>	array('origin' => array(100, 350), 'size' => array(40, 25)),
	'57'	=>	array('origin' => array(140, 350), 'size' => array(40, 25)),
	'58'	=>	array('origin' => array(180, 350), 'size' => array(40, 25)),
	'59'	=>	array('origin' => array(220, 350), 'size' => array(20, 25)),
	
	'36+64'	=>	array('origin' => array( 20, 405), 'size' => array(40, 50)),
	'66+70'	=>	array('origin' => array( 10, 355), 'size' => array(10, 50)),
	'65+67'	=>	array('origin' => array( 20, 355), 'size' => array(40, 50)),

	'68+69'	=>	array('origin' => array(170, 300), 'size' => array(40, 50)),

	'74+76'	=>	array('origin' => array(150, 300), 'size' => array(20, 50)),
	'75+77'	=>	array('origin' => array(210, 300), 'size' => array(20, 50)),
);

define('x', 0);
define('y', 1);

foreach($a_kaarten as $s_key => $a_kaartInfo) {
	
	exec('convert kaarten_origineel/200-'.$s_key.'.tif -crop 200x200 +repage kaart/crop_%d.png');
	
	$X = $a_kaartInfo['origin'][x];
	$Y = $a_kaartInfo['origin'][y];
	
	$w = $a_kaartInfo['size'][x];
	$h = $a_kaartInfo['size'][y];
	
	for($i=0;$i<$h*$w;$i++) {
		$x = $X+$i%$w;
		$y = $Y+($h-ceil(($i+1)/$w));
		
		rename('kaart/crop_'.$i.'.png', 'kaart/ot200_'.$x.'-'.$y.'.png');
	}
	
}