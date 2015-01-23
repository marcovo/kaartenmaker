<?php
set_time_limit(0);

$a_kaarten = array(
	'01W'	=>	array('origin' => array(140, 600)),
	'01O'	=>	array('origin' => array(160, 600)),
	'02W'	=>	array('origin' => array(180, 600)),
	'02O'	=>	array('origin' => array(200, 600)),
	'03W'	=>	array('origin' => array(220, 600)),
	'03O'	=>	array('origin' => array(240, 600)),
	
	'04W'	=>	array('origin' => array(100, 575)),
	'04O'	=>	array('origin' => array(120, 575)),
	'05W'	=>	array('origin' => array(140, 575)),
	'05O'	=>	array('origin' => array(160, 575)),
	'06W'	=>	array('origin' => array(180, 575)),
	'06O'	=>	array('origin' => array(200, 575)),
	'07W'	=>	array('origin' => array(220, 575)),
	'07O'	=>	array('origin' => array(240, 575)),
	'08W'	=>	array('origin' => array(260, 575)),
	
	'09W'	=>	array('origin' => array(100, 550)),
	'09O'	=>	array('origin' => array(120, 550)),
	'10W'	=>	array('origin' => array(140, 550)),
	'10O'	=>	array('origin' => array(160, 550)),
	'11W'	=>	array('origin' => array(180, 550)),
	'11O'	=>	array('origin' => array(200, 550)),
	'12W'	=>	array('origin' => array(220, 550)),
	'12O'	=>	array('origin' => array(240, 550)),
	'13W'	=>	array('origin' => array(260, 550)),
	
	'14W'	=>	array('origin' => array(100, 525)),
	'14O'	=>	array('origin' => array(120, 525)),
	'15W'	=>	array('origin' => array(140, 525)),
	'15O'	=>	array('origin' => array(160, 525)),
	'16W'	=>	array('origin' => array(180, 525)),
	'16O'	=>	array('origin' => array(200, 525)),
	'17W'	=>	array('origin' => array(220, 525)),
	'17O'	=>	array('origin' => array(240, 525)),
	'18W'	=>	array('origin' => array(260, 525)),
	
	'19W'	=>	array('origin' => array(100, 500)),
	'19O'	=>	array('origin' => array(120, 500)),
	'20W'	=>	array('origin' => array(140, 500)),
	'20O'	=>	array('origin' => array(160, 500)),
	'21W'	=>	array('origin' => array(180, 500)),
	'21O'	=>	array('origin' => array(200, 500)),
	'22W'	=>	array('origin' => array(220, 500)),
	'22O'	=>	array('origin' => array(240, 500)),
	'23W'	=>	array('origin' => array(260, 500)),
	
	'24O'	=>	array('origin' => array( 80, 475)),
	'25W'	=>	array('origin' => array(100, 475)),
	'25O'	=>	array('origin' => array(120, 475)),
	'26W'	=>	array('origin' => array(140, 475)),
	'26O'	=>	array('origin' => array(160, 475)),
	'27W'	=>	array('origin' => array(180, 475)),
	'27O'	=>	array('origin' => array(200, 475)),
	'28W'	=>	array('origin' => array(220, 475)),
	'28O'	=>	array('origin' => array(240, 475)),
	'29W'	=>	array('origin' => array(260, 475)),
	
	'30W'	=>	array('origin' => array( 60, 450)),
	'30O'	=>	array('origin' => array( 80, 450)),
	'31W'	=>	array('origin' => array(100, 450)),
	'31O'	=>	array('origin' => array(120, 450)),
	'32W'	=>	array('origin' => array(140, 450)),
	'32O'	=>	array('origin' => array(160, 450)),
	'33W'	=>	array('origin' => array(180, 450)),
	'33O'	=>	array('origin' => array(200, 450)),
	'34W'	=>	array('origin' => array(220, 450)),
	'34O'	=>	array('origin' => array(240, 450)),
	'35W'	=>	array('origin' => array(260, 450)),
	
	'36O'	=>	array('origin' => array( 40, 430)),
	'37W'	=>	array('origin' => array( 60, 425)),
	'37O'	=>	array('origin' => array( 80, 425)),
	'38W'	=>	array('origin' => array(100, 425)),
	'38O'	=>	array('origin' => array(120, 425)),
	'39W'	=>	array('origin' => array(140, 425)),
	'39O'	=>	array('origin' => array(160, 425)),
	'40W'	=>	array('origin' => array(180, 425)),
	'40O'	=>	array('origin' => array(200, 425)),
	'41W'	=>	array('origin' => array(220, 425)),
	'41O'	=>	array('origin' => array(240, 425)),
	'42W'	=>	array('origin' => array(260, 425)),
	
	'43W'	=>	array('origin' => array( 60, 400)),
	'43O'	=>	array('origin' => array( 80, 400)),
	'44W'	=>	array('origin' => array(100, 400)),
	'44O'	=>	array('origin' => array(120, 400)),
	'45W'	=>	array('origin' => array(140, 400)),
	'45O'	=>	array('origin' => array(160, 400)),
	'46W'	=>	array('origin' => array(180, 400)),
	'46O'	=>	array('origin' => array(200, 400)),
	'47W'	=>	array('origin' => array(220, 400)),
	
	'49W'	=>	array('origin' => array( 60, 375)),
	'49O'	=>	array('origin' => array( 80, 375)),
	'50W'	=>	array('origin' => array(100, 375)),
	'50O'	=>	array('origin' => array(120, 375)),
	'51W'	=>	array('origin' => array(140, 375)),
	'51O'	=>	array('origin' => array(160, 375)),
	'52W'	=>	array('origin' => array(180, 375)),
	'52O'	=>	array('origin' => array(200, 375)),
	'53W'	=>	array('origin' => array(220, 375)),
	
	'55W'	=>	array('origin' => array( 60, 350)),
	'55O'	=>	array('origin' => array( 80, 350)),
	'56W'	=>	array('origin' => array(100, 350)),
	'56O'	=>	array('origin' => array(120, 350)),
	'57W'	=>	array('origin' => array(140, 350)),
	'57O'	=>	array('origin' => array(160, 350)),
	'58W'	=>	array('origin' => array(180, 350)),
	'58O'	=>	array('origin' => array(200, 350)),
	'59W'	=>	array('origin' => array(220, 350)),
	
	'64W'	=>	array('origin' => array( 20, 405)),
	'64O'	=>	array('origin' => array( 40, 405)),
	'65W'	=>	array('origin' => array( 20, 380)),
	'65O'	=>	array('origin' => array( 40, 380)),
	'66O'	=>	array('origin' => array( 10, 355)),
	'67W'	=>	array('origin' => array( 20, 355)),
	'67O'	=>	array('origin' => array( 40, 355)),

	'68W'	=>	array('origin' => array(170, 325)),
	'68O'	=>	array('origin' => array(190, 325)),
	'69W'	=>	array('origin' => array(170, 300)),
	'69O'	=>	array('origin' => array(190, 300)),

	'70O'	=>	array('origin' => array( 10, 380)),

	'71O'	=>	array('origin' => array(120, 600)),
	'72O'	=>	array('origin' => array( 80, 500)),
	'73O'	=>	array('origin' => array( 80, 525)),

	'74O'	=>	array('origin' => array(150, 325)),
	'75W'	=>	array('origin' => array(210, 325)),
	'76O'	=>	array('origin' => array(150, 300)),
	'77W'	=>	array('origin' => array(210, 300)),

	'78W'	=>	array('origin' => array(260, 600))
);

define('x', 0);
define('y', 1);

foreach($a_kaarten as $s_key => $a_kaartInfo) {
	if($s_key == '66O' || $s_key == '70O') {
		$h = 25;
		$w = 10;
	}
	else {
		$h = 25;
		$w = 20;
	}
	
	exec('convert kaarten_origineel/400-'.$s_key.'.tif -crop 400x400 +repage kaart/crop_%d.png');
	
	$X = $a_kaartInfo['origin'][x];
	$Y = $a_kaartInfo['origin'][y];
	
	for($i=0;$i<$h*$w;$i++) {
		$x = $X+$i%$w;
		$y = $Y+($h-ceil(($i+1)/$w));
		
		rename('kaart/crop_'.$i.'.png', 'kaart/400_'.$x.'-'.$y.'.png');
	}
	
}