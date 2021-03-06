<!DOCTYPE html>
<html>
<head>
	<title>Kaartenmaker</title>
	<script src="jquery-2.1.1.js" type="text/javascript"></script>
	<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css" />
	<script src="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js"></script>
	<script src="leaflet.polydrag.js"></script>
	<script src="script.js" type="text/javascript"></script>
	<script src="script_conversie_RD_WGS84.js" type="text/javascript"></script>
	<link rel="stylesheet" href="style.css" />
</head>
<body>
	<div class="website">
		<div class="topButtons">
		
		</div>
		<div class="map" style="width: 0px; height: 0px;">
			<div id="map-canvas"></div>
		</div>
		<div class="rightBar">
			<div class="rightBarContent">
				<div class="cutoutTools">
					<span class="buttonSet">
						<img src="icons/map_add.png" alt="A" onclick="Events.button_addCutout();" /><img src="icons/wrench.png" alt="E" onclick="Settings.defSettings_show();" /><img src="icons/help.png" alt="B" onclick="Popup.toggle('copyright');" />
					</span>
					<span class="mouseCoord">
					</span>
				</div>
				<div class="cutoutList">
					
				</div>
			</div>
		</div>
	</div>
	<div class="popups">
		<div class="colorpicker" style="display: none;">
		
		</div>
		<div class="popup popup_copyright" style="display: none;">
			<div class="close"><img src="icons/cross.png" alt="C" onclick="Popup.hide('copyright');" /></div>
			<div class="title">Copyright</div>
			<div class="content">
				<b>De ontwikkeling van deze website</b> kan worden gevolgd op <a href="https://github.com/marcovo">de Github-pagina</a>. Schroom niet om eventuele bugs daar te melden! Deze website is onder andere geinspireerd door <a href="http://scouting-weredi.nl/algemeen/kaarten">Scouting Weredi</a>.<br />
				<br />
				De gebruikte <b>iconen</b> zijn door <a href="http://www.famfamfam.com/lab/icons/silk/">Mark James</a> gemaakt, behalve het 'laden'-icoon dat van <a href="http://www.ajaxload.info/">ajaxload.info</a> vandaan komt. Voor de dynamische elementen is gebruik gemaakt van <a href="http://jquery.com/">jQuery</a>.<br />
				<br />
				Er wordt gebruik gemaakt van de <a href="http://leafletjs.com/">Leaflet library</a> voor het weergeven van <b>de kaart</b>, met kaartdata van <a href="http://www.openstreetmap.org/copyright">Open street map</a>.
				Deze kaartdata is beschikbaar onder de CC-BY-SA licentie.<br />
				<br />
				Voor <b>de gedownloade kaarten</b> wordt gebruik gemaakt van onder andere de data van het Kadaster en <a href="http://opentopo.nl/">opentopo.nl</a> (CC-BY licentie), eigendom van Jan-Willem van Aalst (www.imergis.nl).
				De kaartinformatie van het Kadaster is sinds <a href="http://nl.wikipedia.org/wiki/Basisregistratie_Topografie">1 januari 2012</a> vrijgegeven door het Kadaster onder de CC-BY-SA licentie.<br />
				<br />
				Voor het genereren van de <b>PDF-bestanden</b> wordt gebruik gemaakt van <a href="http://www.tcpdf.org/">TCPDF</a>.<br />
			</div>
		</div>
		<div class="popup popup_defaultSettings" style="display: none;">
			<div class="close"><img src="icons/cross.png" alt="C" onclick="Popup.hide('defaultSettings');" /></div>
			<div class="title">Standaardinstellingen voor kaartuitsnedes</div>
			<div class="content">
				<table>
					<tr>
						<th>Marges</th>
						<td>
							<table class="defSettings_margin">
								<tr>
									<td></td>
									<td><span>Boven:</span><br /><input type="number" step="0.1" name="marginTop" id="defSettings_marginTop" onchange="Settings.defSettings_setMargin('top', this);" />mm</td>
									<td></td>
								</tr>
								<tr>
									<td><span>Links:</span><br /><input type="number" step="0.1" name="marginLeft" id="defSettings_marginLeft" onchange="Settings.defSettings_setMargin('left', this);" />mm</td>
									<td></td>
									<td><span>Rechts:</span><br /><input type="number" step="0.1" name="marginRight" id="defSettings_marginRight" onchange="Settings.defSettings_setMargin('right', this);" />mm</td>
								</tr>
								<tr>
									<td></td>
									<td><span>Onder:</span><br /><input type="number" step="0.1" name="marginBottom" id="defSettings_marginBottom" onchange="Settings.defSettings_setMargin('bottom', this);" />mm</td>
									<td></td>
								</tr>
							</table>
						</td>
						<td>
							<img src="icons/cog_go.png" alt="T" class="clickable" onclick="Settings.defSettings_apply('margin');" title="Pas toe op alle kaartuitsnedes" />
						</td>
					</tr>
					<tr>
						<th>Bronkaart</th>
						<td>
							<table class="coSettings_sourcemaps">
								<tr>
									<td>
										<input type="radio" name="defSettings_sourcemap" value="OT400" id="defs_sm_OT400" onchange="Settings.defSettings_setSourceMap(this);" />
										<label for="defs_sm_OT400"> Opentopo 400 pix/km <img src="./kaart/400_130-430.png" alt="K" style="width: 100px;" /></label><br />
									</td>
									<td>
										<input type="radio" name="defSettings_sourcemap" value="OT200" id="defs_sm_OT200" onchange="Settings.defSettings_setSourceMap(this);" />
										<label for="defs_sm_OT200"> Opentopo 200 pix/km <img src="./kaart/ot200_130-430.png" alt="K" style="width: 100px;" /></label><br />
									</td>
									<td>
										<input type="radio" name="defSettings_sourcemap" value="KAD25" id="defs_sm_KAD25" onchange="Settings.defSettings_setSourceMap(this);" />
										<label for="defs_sm_KAD25"> Kadaster 1:25.000 <img src="./kaart/400_130-430.png" alt="K" style="width: 100px;" /></label><br />
									</td>
									<td>
										<input type="radio" name="defSettings_sourcemap" value="KAD50" id="defs_sm_KAD50" onchange="Settings.defSettings_setSourceMap(this);" />
										<label for="defs_sm_KAD50"> Kadaster 1:50.000 <img src="./kaart/kad50/130-430.png" alt="K" style="width: 100px;" /></label><br />
									</td>
									<td>
										<input type="radio" name="defSettings_sourcemap" value="KAD250" id="defs_sm_KAD250" onchange="Settings.defSettings_setSourceMap(this);" />
										<label for="defs_sm_KAD250"> Kadaster 1:250.000 <img src="./kaart/kad250_90-360.png" alt="K" style="width: 100px;" /></label><br />
									</td>
								</tr>
							</table>
						</td>
						<td>
							<img src="icons/cog_go.png" alt="T" class="clickable" onclick="Settings.defSettings_apply('sourceMap');" title="Pas toe op alle kaartuitsnedes" />
						</td>
					</tr>
				</table>
			</div>
		</div>
		<div class="popup popup_cutoutSettings" style="display: none;">
			<div class="close"><img src="icons/cross.png" alt="C" onclick="Popup.hide('cutoutSettings');" /></div>
			<div class="title">Instellingen voor kaartuitsnede</div>
			<div class="content">
				<table>
					<tr>
						<th>Marges</th>
						<td>
							<table class="coSettings_margin">
								<tr>
									<td></td>
									<td><span>Boven:</span><br /><input type="number" step="0.1" name="marginTop" id="coSettings_marginTop" onchange="Settings.coSettings_setMargin('top', this);" />mm</td>
									<td></td>
								</tr>
								<tr>
									<td><span>Links:</span><br /><input type="number" step="0.1" name="marginLeft" id="coSettings_marginLeft" onchange="Settings.coSettings_setMargin('left', this);" />mm</td>
									<td></td>
									<td><span>Rechts:</span><br /><input type="number" step="0.1" name="marginRight" id="coSettings_marginRight" onchange="Settings.coSettings_setMargin('right', this);" />mm</td>
								</tr>
								<tr>
									<td></td>
									<td><span>Onder:</span><br /><input type="number" step="0.1" name="marginBottom" id="coSettings_marginBottom" onchange="Settings.coSettings_setMargin('bottom', this);" />mm</td>
									<td></td>
								</tr>
							</table>
						</td>
						<td>
							<img src="icons/arrow_undo.png" alt="T" class="clickable" onclick="Settings.coSettings_reset('margin');" title="Gebruik standaardwaarde" />
						</td>
					</tr>
					<tr>
						<th>Bronkaart</th>
						<td>
							<table class="coSettings_sourcemaps">
								<tr>
									<td>
										<input type="radio" name="coSettings_sourcemap" value="OT400" id="cos_sm_OT400" onchange="Settings.coSettings_setSourceMap(this);" />
										<label for="cos_sm_OT400"> Opentopo 400 pix/km <img src="./kaart/400_130-430.png" alt="K" style="width: 100px;" /></label><br />
									</td>
									<td>
										<input type="radio" name="coSettings_sourcemap" value="OT200" id="cos_sm_OT200" onchange="Settings.coSettings_setSourceMap(this);" />
										<label for="cos_sm_OT200"> Opentopo 200 pix/km <img src="./kaart/ot200_130-430.png" alt="K" style="width: 100px;" /></label><br />
									</td>
									<td>
										<input type="radio" name="coSettings_sourcemap" value="KAD25" id="cos_sm_KAD25" onchange="Settings.coSettings_setSourceMap(this);" />
										<label for="cos_sm_KAD25"> Kadaster 1:25.000 <img src="./kaart/400_130-430.png" alt="K" style="width: 100px;" /></label><br />
									</td>
									<td>
										<input type="radio" name="coSettings_sourcemap" value="KAD50" id="cos_sm_KAD50" onchange="Settings.coSettings_setSourceMap(this);" />
										<label for="cos_sm_KAD50"> Kadaster 1:50.000 <img src="./kaart/kad50/130-430.png" alt="K" style="width: 100px;" /></label><br />
									</td>
									<td>
										<input type="radio" name="coSettings_sourcemap" value="KAD250" id="cos_sm_KAD250" onchange="Settings.coSettings_setSourceMap(this);" />
										<label for="cos_sm_KAD250"> Kadaster 1:250.000 <img src="./kaart/kad250_90-360.png" alt="K" style="width: 100px;" /></label><br />
									</td>
								</tr>
							</table>
						</td>
						<td>
							<img src="icons/arrow_undo.png" alt="T" class="clickable" onclick="Settings.coSettings_reset('sourceMap');" title="Gebruik standaardwaarde" />
						</td>
					</tr>
				</table>
			</div>
		</div>
	</div>
</body>
</html>