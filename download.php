<?php

class PDF_map {
	
	protected $a_paperSizes = array(
		'A3P' => array('size'	=> 'A3',	'orien'	=> 'P',		'width'	=> 297,	'height'	=>	420),
		'A3L' => array('size'	=> 'A3',	'orien'	=> 'L',		'width'	=> 420,	'height'	=>	297),

		'A4P' => array('size'	=> 'A4',	'orien'	=> 'P',		'width'	=> 210,	'height'	=>	297),
		'A4L' => array('size'	=> 'A4',	'orien'	=> 'L',		'width'	=> 297,	'height'	=>	210),

		'A5P' => array('size'	=> 'A5',	'orien'	=> 'P',		'width'	=> 148,	'height'	=>	210),
		'A5L' => array('size'	=> 'A5',	'orien'	=> 'L',		'width'	=> 210,	'height'	=>	148),
	);
	
	protected $a_sourceMaps = array(
		'OT400' => array('sep'=>1, 'file_prefix'=>'400_'),
		'OT200' => array('sep'=>1, 'file_prefix'=>'ot200_'),
		'KAD50' => array('sep'=>1, 'file_prefix'=>'kad50/'),
		'KAD250' => array('sep'=>10, 'file_prefix'=>'kad250_')
	);
	
	protected $x;
	protected $y;
	protected $s_paperSize;
	protected $s_scale;
	protected $a_margins;
	protected $i_ppi;
	protected $b_coords;
	protected $a_coords;

	protected $obj_pdf;
	protected $a_paper;
	protected $a_sourceMap;
	
	public function __construct() {
		
		if(!isset($_GET['x']) || !isset($_GET['y']) || !isset($_GET['paperSize'])) {
			die("Niet genoeg info...");
		}
		
		$this->x = intval($_GET['x']);
		$this->y = intval($_GET['y']);
		$this->s_paperSize = $_GET['paperSize'];
		$this->scale = 25; // 1:25000
		$this->s_sourceMap = $_GET['sm'];
		$this->i_ppi = 150;//254;
		
		$this->a_margins = array(
			'top' => floatval($_GET['mt']),
			'right' => floatval($_GET['mr']),
			'bottom' => floatval($_GET['mb']),
			'left' => floatval($_GET['ml']),
		);
		
		// Draw coordinates?
		$s_coords = (isset($_GET['c']) && strlen($_GET['c']) == 4)?$_GET['c']:'0000';
		$this->b_coords = ($s_coords != '0000');
		$this->a_coords = array('t'=>(bool)$s_coords{0},'r'=>(bool)$s_coords{1},'b'=>(bool)$s_coords{2},'l'=>(bool)$s_coords{3});
		
		// Rotate y-coordinates or not?
		$this->b_rotateYcoords = (isset($_GET['rotYc']) && $_GET['rotYc'] == 1);
		
		// Draw ticks?
		$this->b_coordTicks = (isset($_GET['cTck']) && $_GET['cTck'] == 1);
		$this->b_tenthTicks = (isset($_GET['tTck']) && $_GET['tTck'] == 1);
		
		if(!isset($this->a_paperSizes[$this->s_paperSize])) {
			$this->s_paperSize = 'A4L';
		}
		if(!isset($this->a_sourceMaps[$this->s_sourceMap])) {
			$this->s_sourceMap = 'OT400';
		}
		
		$this->a_paper = $this->a_paperSizes[$this->s_paperSize];
		$this->a_sourceMap = $this->a_sourceMaps[$this->s_sourceMap];
		
		$this->initPDF();
		$this->generateMap();
		$this->downloadPDF();
	}
	
	
	protected function initPDF() {
		require_once('tcpdf/tcpdf.php');

		// create new PDF document
		$this->obj_pdf = new TCPDF($this->a_paper['orien'], PDF_UNIT, $this->a_paper['size'], false, 'ISO-8859-1', false);

		// set document information
		$this->obj_pdf->SetCreator(PDF_CREATOR);
		$this->obj_pdf->SetAuthor('Marco van Oort');
		$this->obj_pdf->SetTitle('Kaart');
		$this->obj_pdf->SetSubject('Scouting APV Gorinchem');
		$this->obj_pdf->SetKeywords('Map, Netherlands, Scouting, TCPDF');

		// remove default header/footer
		$this->obj_pdf->setPrintHeader(false);
		$this->obj_pdf->setPrintFooter(false);

		// set default monospaced font
		$this->obj_pdf->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);

		// set margins
		$this->obj_pdf->SetMargins(0, 0, 0);
		$this->obj_pdf->SetHeaderMargin(0);
		$this->obj_pdf->SetFooterMargin(0);

		// set auto page breaks
		$this->obj_pdf->SetAutoPageBreak(false);

		// set image scale factor
		$this->obj_pdf->setImageScale(PDF_IMAGE_SCALE_RATIO);

		// add a page
		$this->obj_pdf->AddPage();
	}
	
	protected function generateMap() {
		set_time_limit(0);
		// Height & width
		$w = $this->a_paper['width'];
		$h = $this->a_paper['height'];
		
		// Margins
		$ml = $this->a_margins['left'];
		$mt = $this->a_margins['top'];
		$mr = $this->a_margins['right'];
		$mb = $this->a_margins['bottom'];
		
		// Inner height & width
		$iw = $w - $ml - $mr;
		$ih = $h - $mt - $mb;
		
		// Border width
		$bw = 0.1;
		
		// The amount of kilometers covered by one maptile
		$i_sep = $this->a_sourceMap['sep'];

		// The 'lower' coordinates are the coordinates of the lower-left square
		$x_low = floor($this->x/1000/$i_sep)*$i_sep;
		$y_low = floor($this->y/1000/$i_sep)*$i_sep;

		// The number of squares we'll have to draw
		$numX = ceil($iw*$this->scale/1000);
		$numY = ceil($ih*$this->scale/1000);
		
		// The number of squares, plus 1 to ensure no gaps
		$numX = ceil($numX/$i_sep + 1)*$i_sep;
		$numY = ceil($numY/$i_sep + 1)*$i_sep;
		
		// The 'higher' coordinates are the coordinates of the upper-right square
		$x_high = $x_low+$numX;
		$y_high = $y_low+$numY;
		
		// The remainder ('rest') is the amount of kilometers we gain extra by rounding down.
		$x_res = $this->x/1000 - $x_low;
		$y_res = $this->y/1000 - $y_low;
		
		// However, this remainder is defined in the lower-left corner, so the we still have to calculate the y_res for the upper-left corner
		$y_res2 = $y_high - ($this->y+$ih*$this->scale)/1000;

		// Place the squares
		for($iy=$y_high-$i_sep, $i_row = 0;$iy>=$y_low;$iy-=$i_sep, $i_row++) {
			
			for($ix=$x_low, $i_col = 0;$ix<$x_high;$ix+=$i_sep, $i_col++) {
				$s_filename = 'kaart/'.$this->a_sourceMap['file_prefix'].''.$ix.'-'.$iy.'.png';
				if(!file_exists($s_filename)) {
					continue;
				}
				$i_pdfCoord_x = ($i_col*$i_sep-$x_res)*1000/$this->scale+$ml;
				$i_pdfCoord_y = ($i_row*$i_sep-$y_res2)*1000/$this->scale+$mt;
				$this->obj_pdf->Image($s_filename, $i_pdfCoord_x, $i_pdfCoord_y, 40*$i_sep, 40*$i_sep, 'PNG', '', '', true, $this->i_ppi, '', false, false, 0, false, false, false);
				
			}
		}

		// Draw the margin-borders
		$this->obj_pdf->Rect(0,			0,		$ml,	$h,		'F', array(), array(255,255,255));
		$this->obj_pdf->Rect($w-$mr,	0,		$mr,	$h,		'F', array(), array(255,255,255));
		$this->obj_pdf->Rect(0,			0,		$w,		$mt,	'F', array(), array(255,255,255));
		$this->obj_pdf->Rect(0,			$h-$mb,	$w,		$mb,	'F', array(), array(255,255,255));

		$this->obj_pdf->Rect($ml-$bw, $mt-$bw, $iw+2*$bw, $ih+2*$bw, 'S', array('all'=>array('width'=>$bw,'color'=>array(0,0,0))));
		
		if($this->b_coords) {
			$i_tickSpace = 0;
			if($this->b_coordTicks) {
				$i_tickSpace = 1;
				if($this->b_tenthTicks) {
					$i_tickSpace = 3;
				}
			}
			
			
			// Draw the coordinates
			$this->obj_pdf->SetFont('helvetica', '', 7);
			// X-coordinates
			$i_pdfCoord_yBot = $h - $mb + $i_tickSpace;
			$i_pdfCoord_yTop = $mt - $i_tickSpace;
			for($ix=$x_low, $i_col = 0;$ix<$x_high;$ix+=$i_sep, $i_col++) {
				$i_pdfCoord_x = ($i_col*$i_sep-$x_res)*1000/$this->scale+$ml - 3;
				if($i_pdfCoord_x < $ml || $i_pdfCoord_x > $w - $mr) {
					continue;
				}
				if($this->a_coords['b'])	$this->obj_pdf->Text($i_pdfCoord_x, $i_pdfCoord_yBot, $ix);
				if($this->a_coords['t'])	$this->obj_pdf->Text($i_pdfCoord_x, $i_pdfCoord_yTop, $ix, false, false, true, 0, 0, '', false, '', 0, false, 'B');
			}
			// Y-coordinates
			$i_pdfCoord_xLeft = $ml - 6 - $i_tickSpace;
			$i_pdfCoord_xRight = $w - $mr + $i_tickSpace;
			for($iy=$y_high-$i_sep, $i_row = 0;$iy>=$y_low;$iy-=$i_sep, $i_row++) {
				$i_pdfCoord_y = ($i_row*$i_sep-$y_res2)*1000/$this->scale+$mt - 1.5;
				if($i_pdfCoord_y < $mt || $i_pdfCoord_y > $h - $mb) {
					continue;
				}
				
				if($this->b_rotateYcoords) {
					if($this->a_coords['l']) {
						$this->obj_pdf->startTransform();
						$this->obj_pdf->Rotate(90, $i_pdfCoord_xLeft+3.25, $i_pdfCoord_y+1.25);
						$this->obj_pdf->TranslateY(1.0);
						$this->obj_pdf->Text($i_pdfCoord_xLeft, $i_pdfCoord_y, $iy+$i_sep);
						$this->obj_pdf->stopTransform();
					}
					if($this->a_coords['r']) {
						$this->obj_pdf->startTransform();
						$this->obj_pdf->Rotate(-90, $i_pdfCoord_xRight+2.75, $i_pdfCoord_y+1.25);
						$this->obj_pdf->TranslateY(1.0);
						$this->obj_pdf->Text($i_pdfCoord_xRight, $i_pdfCoord_y, $iy+$i_sep);
						$this->obj_pdf->stopTransform();
					}
				}
				else {
					if($this->a_coords['l'])	$this->obj_pdf->Text($i_pdfCoord_xLeft, $i_pdfCoord_y, $iy+$i_sep);
					if($this->a_coords['r'])	$this->obj_pdf->Text($i_pdfCoord_xRight, $i_pdfCoord_y, $iy+$i_sep);
				}
			}
		}
		
		if($this->b_coordTicks) {
			// Draw the ticks
			$this->obj_pdf->SetLineStyle(array('width'=>$bw, 'color'=>array(0,0,0)));
			// X-ticks
			$i_pdfCoord_yBot = $h - $mb;
			$i_pdfCoord_yTop = $mt;
			for($ix=$x_low, $i_col = 0;$ix<$x_high+$i_sep;$ix+=$i_sep/10, $i_col++) {
				$i_pdfCoord_x = ($i_col/10*$i_sep-$x_res)*1000/$this->scale+$ml;
				if($i_pdfCoord_x < $ml || $i_pdfCoord_x > $w - $mr) {
					continue;
				}
				
				if($this->b_tenthTicks) {
					$f_lineHeight = ($i_col%10 == 0)?3:((($i_col+5)%10 == 0)?1.8:1);
				}
				else {
					if($i_col%10 != 0) {
						continue;
					}
					$f_lineHeight = 1;
				}
				
				$this->obj_pdf->Line($i_pdfCoord_x, $i_pdfCoord_yBot, $i_pdfCoord_x, $i_pdfCoord_yBot+$f_lineHeight);
				$this->obj_pdf->Line($i_pdfCoord_x, $i_pdfCoord_yTop, $i_pdfCoord_x, $i_pdfCoord_yTop-$f_lineHeight);
			}
			// Y-ticks
			$i_pdfCoord_xLeft = $ml;
			$i_pdfCoord_xRight = $w - $mr;
			for($iy=$y_high-$i_sep, $i_row = 0;$iy>=$y_low-$i_sep;$iy-=$i_sep/10, $i_row++) {
				$i_pdfCoord_y = ($i_row/10*$i_sep-$y_res2)*1000/$this->scale+$mt;
				if($i_pdfCoord_y < $mt || $i_pdfCoord_y > $h - $mb) {
					continue;
				}
				
				if($this->b_tenthTicks) {
					$f_lineHeight = ($i_row%10 == 0)?3:((($i_row+5)%10 == 0)?1.8:1);
				}
				else {
					if($i_row%10 != 0) {
						continue;
					}
					$f_lineHeight = 1;
				}
				
				$this->obj_pdf->Line($i_pdfCoord_xLeft, $i_pdfCoord_y, $i_pdfCoord_xLeft-$f_lineHeight, $i_pdfCoord_y);
				$this->obj_pdf->Line($i_pdfCoord_xRight, $i_pdfCoord_y, $i_pdfCoord_xRight+$f_lineHeight, $i_pdfCoord_y);
			}
		}
	}
	
	protected function downloadPDF() {
		$this->obj_pdf->Output('kaart.pdf', 'D');
	}
}

new PDF_map();
