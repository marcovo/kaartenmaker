<?php
set_time_limit(0);


// 27 x 32 vakjes

exec('convert kaarten_origineel/TOP250raster_2011.tif -crop 10800x12540+1+1 +repage kaarten_origineel/TOP250raster_2011_cropped.tif');
exec('convert kaarten_origineel/TOP250raster_2011_cropped.tif -crop 400x400 +repage kaart/crop_%d.png');

$X = 10;
$Y = 300;

$w = 27;
$h = 32;

for($i=0;$i<$h*$w;$i++) {
	$x = $X+10*($i%$w);
	$y = $Y+10*($h-ceil(($i+1)/$w));
	
	rename('kaart/crop_'.$i.'.png', 'kaart/kad250_'.$x.'-'.$y.'.png');
}
