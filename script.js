$(function() {
	resize();
	
	Map.init();
	
	resize();
	Cutouts.new();
	Cutouts.updateHTMLList();
	ColorPicker.fillPicker();
});

$( window ).resize(function() {
	resize();
});

function checkBounds_RD(coord) {
	return (-7000 <= coord.X && coord.X <= 300000 && 289000 <= coord.Y && coord.Y <= 629000);
}

function resize() {
	// First resize to a smaller height, to avoid extra space caused by scroll-bars
	$('.map, .rightBar').height($(window).height()-10);
	$('.map').width($(window).width() - $('.rightBar').outerWidth());
	
	// Now do the resize
	$('.map, .rightBar').height($(window).height());
	$('.map').width($(window).width() - $('.rightBar').outerWidth());
}

var Config = {
	defaultColor: -1, // -1 for random
	defaultSettings: {
		margins: { // in millimeters
			top: 10,
			right: 10,
			bottom: 10,
			left: 10
		},
		sourceMap: 'OT400',
		coords: {
			top: true,
			right: true,
			bottom: true,
			left: true
		},
		rotateYcoords: true,
		coordTicks: true,
		tenthTicks: true
	}
};

var PaperSize = {
};

	PaperSize.paperSizes = {
		'A3L': {size:{w:420, h:297}, name:'A3 - Landscape'},
		'A3P': {size:{w:297, h:420}, name:'A3 - Portrait'},
		
		'A4L': {size:{w:297, h:210}, name:'A4 - Landscape'},
		'A4P': {size:{w:210, h:297}, name:'A4 - Portrait'},
		
		'A5L': {size:{w:210, h:148}, name:'A5 - Landscape'},
		'A5P': {size:{w:148, h:210}, name:'A5 - Portrait'}
	};

var ColorPicker = {
	colours: ['#03f', 'aqua', 'black', 'blue', 'fuchsia', 'green', 'lime', 'maroon', 'navy', 'olive', 'orange', 'purple', 'red', 'teal', 'yellow'],
	activeCutoutId : -1
};

	ColorPicker.fillPicker = function() {
		$('.colorpicker').html('');
		
		for(var key in this.colours) {
			$('.colorpicker').append('<span class="colour" onclick="ColorPicker.setColour(\''+this.colours[key]+'\');" style="background-color: '+this.colours[key]+';"></span>');
		}
	};
	
	ColorPicker.show = function(cutoutId, el) {
		var offset = $(el).offset();
		$('.colorpicker').css({left:offset.left,top:offset.top+20}).toggle();
		
		this.activeCutoutId = cutoutId;
	}
	
	ColorPicker.getColour = function() {
		if(Config.defaultColor == -1) {
			return ColorPicker.colours[Math.floor(Math.random() * ColorPicker.colours.length)];
		}
		return ColorPicker.colours[Config.defaultColor];
	}
	
	ColorPicker.setColour = function(colour) {
		Cutouts.cutouts[this.activeCutoutId].setColour(colour);
		
		$('.colorpicker').hide();
	}
	
	
function Cutout(properties) {
	if(typeof(properties) == 'undefined') {
		properties = {};
	}
	this.cutoutName = (typeof(properties.cutoutName)== 'undefined')?('Kaartuitsnede '+properties.cutoutId):properties.cutoutName;
	this.cutoutId	= (typeof(properties.cutoutId)	== 'undefined')?0:properties.cutoutId;
	this.size		= (typeof(properties.size)		== 'undefined')?{w:6000, h:4000}:properties.size;
	this.scale		= 25000;
	this.sourceMap	= Config.defaultSettings.sourceMap;
	
	var center = Map.mapObject.getCenter();
	var centerRD = conversie_RD_WGS84.WGS84_2_RD({N:center.lat,E:center.lng});
	this.anchor		= (typeof(properties.anchor)	== 'undefined')?{X:centerRD.X-this.size.w/2,Y:centerRD.Y-this.size.h/2}:properties.anchor;
	
	var anchorWGS = conversie_RD_WGS84.RD_2_WGS84(this.anchor);
	this.anchorLatLng = new L.LatLng(anchorWGS.N,anchorWGS.E);
	
	this.paperSize	= (typeof(properties.paperSize)	== 'undefined')?'A4L':properties.paperSize;
	this.polygon	= null;
	this.colour		= ColorPicker.getColour();
	
	this.margins = { // in millimeters
		top: Config.defaultSettings.margins.top,
		right: Config.defaultSettings.margins.right,
		bottom: Config.defaultSettings.margins.bottom,
		left: Config.defaultSettings.margins.left
	};
	
	this.coords = {
		top: Config.defaultSettings.coords.top,
		right: Config.defaultSettings.coords.right,
		bottom: Config.defaultSettings.coords.bottom,
		left: Config.defaultSettings.coords.left
	};
	
	this.rotateYcoords = Config.defaultSettings.rotateYcoords;
	this.coordTicks = Config.defaultSettings.coordTicks;
	this.tenthTicks = Config.defaultSettings.tenthTicks;
	
	this.recalculateSize();
	
	this.createPolygon();
}

	Cutout.prototype.delete = function() {
		if(this.polygon != null) {
			Map.mapObject.removeLayer(this.polygon);
		}
	};
	
	Cutout.prototype.recalculateSize = function() {
		var paperSize = PaperSize.paperSizes[this.paperSize];
		
		this.size.w = (paperSize.size.w - this.margins.left - this.margins.right)*this.scale/1000;
		this.size.h = (paperSize.size.h - this.margins.top - this.margins.bottom)*this.scale/1000;
		
	};

	Cutout.prototype.calculatePolygonCoords = function() {
		var coords = [];
		var pointsOnEdge = 5;
		var dx = this.size.w/(pointsOnEdge - 1);
		var dy = this.size.h/(pointsOnEdge - 1);
		var coord;
		
		for(var ix = 0; ix < pointsOnEdge-1; ix++) {
			coord = conversie_RD_WGS84.RD_2_WGS84({X:this.anchor.X+ix*dx,Y:this.anchor.Y});
			coords.push(L.latLng(coord.N, coord.E));
		}
		
		for(var iy = 0; iy < pointsOnEdge-1; iy++) {
			coord = conversie_RD_WGS84.RD_2_WGS84({X:this.anchor.X+(pointsOnEdge-1)*dx,Y:this.anchor.Y+iy*dy});
			coords.push(L.latLng(coord.N, coord.E));
		}
		
		for(var ix = pointsOnEdge-1; ix > 0; ix--) {
			coord = conversie_RD_WGS84.RD_2_WGS84({X:this.anchor.X+ix*dx,Y:this.anchor.Y+(pointsOnEdge-1)*dy});
			coords.push(L.latLng(coord.N, coord.E));
		}
		
		for(var iy = pointsOnEdge-1; iy > 0; iy--) {
			coord = conversie_RD_WGS84.RD_2_WGS84({X:this.anchor.X,Y:this.anchor.Y+iy*dy});
			coords.push(L.latLng(coord.N, coord.E));
		}
		
		return coords;
	};
	
	Cutout.prototype.updatePolygonCoords = function() {
		this.anchor = conversie_RD_WGS84.WGS84_2_RD({N:this.polygon.getLatLngs()[0].lat,E:this.polygon.getLatLngs()[0].lng})
		this.updatePolygon();
	};

	Cutout.prototype.createPolygon = function() {
		var coords = this.calculatePolygonCoords();
		
		// Create polygon
		this.polygon = L.polygon(coords, {color:this.colour, weight: 3});
		
		// Enable dragging
		this.polygon.dragging = new L.Handler.PolyDrag(this.polygon);
		this.polygon.dragging.cutoutId = this.cutoutId;
		
		// Add to map
		this.polygon.addTo(Map.mapObject);
		this.polygon.dragging.enable();
		
		// Events
		this.polygon.on('mouseover', function() {
			$('#cutout_'+this.cutoutId).addClass('hover');
			this.mouseover();
		}.bind(this));
		
		this.polygon.on('mouseout', function() {
			$('#cutout_'+this.cutoutId).removeClass('hover');
			this.mouseout();
		}.bind(this));
		
		this.polygon.on('dragend', function () {
			this.updatePolygonCoords();
		}.bind(this));
	};
	
	Cutout.prototype.updatePolygon = function() {
		var coords = this.calculatePolygonCoords();
		this.polygon.setLatLngs(coords);
	};
	
	Cutout.prototype.setColour = function(colour) {
		this.colour = colour;
		this.polygon.setStyle({color:this.colour});
		$('#cutout_'+this.cutoutId+' .cutoutColour').css({backgroundColor:this.colour});
	};
	
	Cutout.prototype.mouseover = function() {
		this.polygon.setStyle({weight: 5, opacity: 0.7, fillOpacity: 0.3});
	};
	
	Cutout.prototype.mouseout = function() {
		this.polygon.setStyle({weight: 3, opacity: 0.5, fillOpacity: 0.2});
	};



var Cutouts = {
	cutouts: {},
	count: 0
};

	Cutouts.new = function() {
		this.count++;
		this.cutouts[this.count] = new Cutout({cutoutId:this.count});
	};
	
	Cutouts.delete = function(cutoutId) {
		this.cutouts[cutoutId].delete();
		delete this.cutouts[cutoutId];
	};
	
	Cutouts.download = function(cutoutId) {
		var cutout = this.cutouts[cutoutId];
		
		var c = (cutout.coords.top?'1':'0')+(cutout.coords.right?'1':'0')+(cutout.coords.bottom?'1':'0')+(cutout.coords.left?'1':'0');
		
		var url = 'download.php'+
				'?x='+cutout.anchor.X+
				'&y='+cutout.anchor.Y+
				'&paperSize='+cutout.paperSize+
				'&mt='+cutout.margins.top+
				'&mr='+cutout.margins.right+
				'&mb='+cutout.margins.bottom+
				'&ml='+cutout.margins.left+
				'&sm='+cutout.sourceMap+
				'&c='+c+
				'&rotYc='+(cutout.rotateYcoords?'1':'0')+
				'&cTck='+(cutout.coordTicks?'1':'0')+
				'&tTck='+(cutout.tenthTicks?'1':'0');
		
		$('#cutout_'+cutoutId+' .loading_icon').show();
		$("<iframe>")
			.hide()
			.prop("src", url)
			.appendTo("body")
			.load(function() {
				$('#cutout_'+cutoutId+' .loading_icon').hide();
			});
	};

	Cutouts.updateHTMLList = function() {
		$('.cutoutList').html('');
		var cutout, paperSizeList, options, colour, selected;
		
		for(var cutoutId in this.cutouts) {
			
			cutout = this.cutouts[cutoutId];
			
			paperSizeList = '<select onchange="Cutouts.changePaper('+cutoutId+', this);"><option value="-1">Selecteer...</option>';
			for(var paperSizeId in PaperSize.paperSizes) {
				selected = (cutout.paperSize == paperSizeId)?' selected="selected"':'';
				paperSizeList += '<option value="'+paperSizeId+'"'+selected+'>'+PaperSize.paperSizes[paperSizeId].name+'</option>';
			}
			paperSizeList += '</select>';
			
			options = '<span class="buttonSet cutoutButtons"><img src="icons/printer.png" alt="P" onclick="Events.button_downloadCutout('+cutoutId+');" /><img src="icons/pencil.png" alt="E" onclick="Settings.coSettings_show('+cutoutId+');" /><img src="icons/cross.png" alt="D" onclick="Events.button_deleteCutout('+cutoutId+');" /></span>';
		
			colour = '<span class="cutoutColour" onclick="ColorPicker.show('+cutoutId+', this);" style="background-color: '+cutout.colour+';"></span>';
			
			$('.cutoutList').append('<div class="cutoutItem" id="cutout_'+cutoutId+'">'+colour+'<span class="cutoutName">'+cutout.cutoutName+'</span><img src="ajax-loader.gif" alt="L" class="loading_icon" style="display: none;" /><br />'+paperSizeList+options+'</div>')
			
			$('#cutout_'+cutoutId+'').hover(
				cutout.mouseover.bind(cutout),
				cutout.mouseout.bind(cutout)
			);
		}
	};
	
	Cutouts.changePaper = function(cutoutId, el) {
		if(el.value == -1) {
			return;
		}
		Cutouts.cutouts[cutoutId].paperSize = el.value;
		Cutouts.cutouts[cutoutId].recalculateSize();
		Cutouts.cutouts[cutoutId].updatePolygon();
	};

	Cutouts.checkMagnet = function(newLatLng, cutoutId) {
		var newAnchorRD = conversie_RD_WGS84.WGS84_2_RD({N:newLatLng.lat,E:newLatLng.lng});
		var magnetAnchorRD = {X:newAnchorRD.X, Y:newAnchorRD.Y};
		var cutout = this.cutouts[cutoutId];
		
		var factor = Math.pow(2,Map.mapObject.getZoom()-12);
		
		var diff = {X:1000/factor, Y:1000/factor};
		var diff2 = 2000/factor;
		
		var cuLeft = newAnchorRD.X;
		var cuRight = newAnchorRD.X + cutout.size.w;
		var cuBottom = newAnchorRD.Y;
		var cuTop = newAnchorRD.Y + cutout.size.h;
		
		var outDiffLeft, outDiffRight, outDiffBottom, outDiffTop, inDiffLeft, inDiffRight, inDiffBottom, inDiffTop, diffVer, diffHor;
		
		for(var cutout2Id in this.cutouts) {
			if(cutoutId == cutout2Id) {
				continue;
			}
			
			cutout2 = this.cutouts[cutout2Id];
			
			// Outer diffs
			outDiffTop = Math.abs(cutout2.anchor.Y - cuTop);
			outDiffBottom = Math.abs(cutout2.anchor.Y+cutout2.size.h - cuBottom);
			outDiffLeft = Math.abs(cutout2.anchor.X+cutout2.size.w - cuLeft);
			outDiffRight = Math.abs(cutout2.anchor.X - cuRight);
			
			// Inner diffs
			inDiffTop = Math.abs(cutout2.anchor.Y+cutout2.size.h - cuTop);
			inDiffBottom = Math.abs(cutout2.anchor.Y - cuBottom);
			inDiffLeft = Math.abs(cutout2.anchor.X - cuLeft);
			inDiffRight = Math.abs(cutout2.anchor.X+cutout2.size.w - cuRight);
			
			diffVer = Math.min(outDiffTop, outDiffBottom, inDiffTop, inDiffBottom);
			diffHor = Math.min(outDiffLeft, outDiffRight, inDiffLeft, inDiffRight);
			
			if(outDiffTop < diff.Y && diffHor < diff2) {
				magnetAnchorRD.Y = cutout2.anchor.Y-cutout.size.h;
				diff.Y = outDiffTop;
			}
			if(outDiffBottom < diff.Y && diffHor < diff2) {
				magnetAnchorRD.Y = cutout2.anchor.Y+cutout2.size.h;
				diff.Y = outDiffBottom;
			}
			if(outDiffLeft < diff.X && diffVer < diff2) {
				magnetAnchorRD.X = cutout2.anchor.X+cutout2.size.w;
				diff.X = outDiffLeft;
			}
			if(outDiffRight < diff.X && diffVer < diff2) {
				magnetAnchorRD.X = cutout2.anchor.X-cutout.size.w;
				diff.X = outDiffRight;
			}
			
			if(inDiffTop < diff.Y && diffHor < diff2) {
				magnetAnchorRD.Y = cutout2.anchor.Y+cutout2.size.h-cutout.size.h;
				diff.Y = inDiffTop;
			}
			if(inDiffBottom < diff.Y && diffHor < diff2) {
				magnetAnchorRD.Y = cutout2.anchor.Y;
				diff.Y = inDiffBottom;
			}
			if(inDiffLeft < diff.X && diffVer < diff2) {
				magnetAnchorRD.X = cutout2.anchor.X;
				diff.X = inDiffLeft;
			}
			if(inDiffRight < diff.X && diffVer < diff2) {
				magnetAnchorRD.X = cutout2.anchor.X+cutout2.size.w-cutout.size.w;
				diff.X = inDiffRight;
			}
		}
		//if(diff.X < 1000 || diff.Y < 1000)
		//console.log(diff);
		var magnetLatLng = conversie_RD_WGS84.RD_2_WGS84(magnetAnchorRD);
		return new L.LatLng(magnetLatLng.N,magnetLatLng.E);
	};

var Map = {
	mapObject: null,
	markers: {},
	icons: {},
};
	
	Map.init = function() {
		// create a map in the "map" div, set the view to a given place and zoom
		this.mapObject = L.map('map-canvas').setView([52.1, 5.0], 8);

		// add an OpenStreetMap tile layer
		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(this.mapObject);
		
		this.mapObject.on('contextmenu', function(e) {
			Events.RightMouseClick(e);
		});
		
		this.mapObject.on('click', function(e) {
			Events.GeneralClick(e);
		});
		
		this.mapObject.on('mousedown', function(e) {
			Events.GeneralMousedown(e);
		});
		this.mapObject.on('movestart', function(e) {
			Events.MapMoveStart(e);
		});
		this.mapObject.on('mousemove', function(e) {
			Events.MapMouseMove(e);
		});
		
	};

var Settings = {
	cutoutSettings_id: -1
};

	Settings.coSettings_show = function(cutoutId) {
		this.cutoutSettings_id = cutoutId;
		
		this.coSettings_show_fillValues();
		
		Popup.show('cutoutSettings');
	};

	Settings.coSettings_show_fillValues = function() {
		var cutout = Cutouts.cutouts[this.cutoutSettings_id];
		
		$('#coSettings_marginTop').val(cutout.margins.top);
		$('#coSettings_marginRight').val(cutout.margins.right);
		$('#coSettings_marginBottom').val(cutout.margins.bottom);
		$('#coSettings_marginLeft').val(cutout.margins.left);
		
		$("#cos_sm_"+cutout.sourceMap).prop("checked", true);
	};
	
	Settings.coSettings_setMargin = function(side, el) {
		var cutout = Cutouts.cutouts[this.cutoutSettings_id];
		cutout.margins[side] = parseFloat(el.value);
		cutout.recalculateSize();
		cutout.updatePolygon();
	}
	
	Settings.coSettings_setSourceMap = function(el) {
		var cutout = Cutouts.cutouts[this.cutoutSettings_id];
		cutout.sourceMap = el.value;
	}

	Settings.defSettings_show = function() {
		$('#defSettings_marginTop').val(Config.defaultSettings.margins.top);
		$('#defSettings_marginRight').val(Config.defaultSettings.margins.right);
		$('#defSettings_marginBottom').val(Config.defaultSettings.margins.bottom);
		$('#defSettings_marginLeft').val(Config.defaultSettings.margins.left);
		
		$("#defs_sm_"+Config.defaultSettings.sourceMap).prop("checked", true);
		
		Popup.show('defaultSettings');
	};
	
	Settings.defSettings_setMargin = function(side, el) {
		Config.defaultSettings.margins[side] = parseFloat(el.value);
	}
	
	Settings.defSettings_setSourceMap = function(el) {
		Config.defaultSettings.sourceMap = el.value;
	}
	
	Settings.defSettings_apply = function(name) {
		if(name == 'margin') {
			for(var cutoutId in Cutouts.cutouts) {
				Cutouts.cutouts[cutoutId].margins.top = Config.defaultSettings.margins.top;
				Cutouts.cutouts[cutoutId].margins.right = Config.defaultSettings.margins.right;
				Cutouts.cutouts[cutoutId].margins.bottom = Config.defaultSettings.margins.bottom;
				Cutouts.cutouts[cutoutId].margins.left = Config.defaultSettings.margins.left;
				
				Cutouts.cutouts[cutoutId].recalculateSize();
				Cutouts.cutouts[cutoutId].updatePolygon();
			}
		}
		else if(name == 'sourceMap') {
			for(var cutoutId in Cutouts.cutouts) {
				Cutouts.cutouts[cutoutId].sourceMap = Config.defaultSettings.sourceMap;
			}
		}
	}
	
	Settings.coSettings_reset = function(name) {
		if(name == 'margin') {
			Cutouts.cutouts[this.cutoutSettings_id].margins.top = Config.defaultSettings.margins.top;
			Cutouts.cutouts[this.cutoutSettings_id].margins.right = Config.defaultSettings.margins.right;
			Cutouts.cutouts[this.cutoutSettings_id].margins.bottom = Config.defaultSettings.margins.bottom;
			Cutouts.cutouts[this.cutoutSettings_id].margins.left = Config.defaultSettings.margins.left;
			
			Cutouts.cutouts[this.cutoutSettings_id].recalculateSize();
			Cutouts.cutouts[this.cutoutSettings_id].updatePolygon();
		}
		else if(name == 'sourceMap') {
			for(var cutoutId in Cutouts.cutouts) {
				Cutouts.cutouts[this.cutoutSettings_id].sourceMap = Config.defaultSettings.sourceMap;
			}
		}
		
		this.coSettings_show_fillValues();
	}
	
var Events = {
	contextmenuVisible : false,
};

	Events.InvalidatePrevious = function() {
		if(this.contextmenuVisible) {
			$('.contextmenu').hide();
			this.contextmenuVisible = false;
		}
	};
	
	Events.GeneralClick = function(e) {
		this.InvalidatePrevious();
		
	};
	
	Events.GeneralMousedown = function(e) {
		this.InvalidatePrevious();
		
	};
	
	Events.MapMoveStart = function(e) {
		this.InvalidatePrevious();
	};
	
	Events.MapMouseMove = function(e) {
		var RD = conversie_RD_WGS84.WGS84_2_RD({N:e.latlng.lat,E:e.latlng.lng});
		if(checkBounds_RD(RD)) {
			$('.mouseCoord').html('RD: '+Math.round(RD.X)+' '+Math.round(RD.Y));
		}
		else {
			$('.mouseCoord').html('');
		}
	};

	Events.RightMouseClick = function(e) {
		this.InvalidatePrevious();
		log = e;
		var coordinate = new Coordinate(new WGS84().fromLatlng(e.latlng));
		var contextmenu = $('.contextmenu');
		contextmenu.css({left:$('.coordList').width() + e.containerPoint.x + 1, top:e.containerPoint.y + 1}).show();
		contextmenu.find('.coordinate').html(coordinate.get(SYSTEM_WGS84).toText_DMS().replace(',',',<br />'));
		
		this.contextmenuVisible = true;
	};

	Events.mouseoverCoord = function(locationId) {
		Map.highlight(locationId);
	};

	Events.mouseoutCoord = function(locationId) {
		Map.unhighlight(locationId);
	};

	Events.mouseoverMarker = function(locationId) {
		Map.highlight(locationId);
		$("#location"+locationId).addClass('markerHover');
	};

	Events.mouseoutMarker = function(locationId) {
		Map.unhighlight(locationId);
		$("#location"+locationId).removeClass('markerHover');
	};
	
	Events.button_addCutout = function() {
		Cutouts.new();
		Cutouts.updateHTMLList();
	};
	
	Events.button_deleteCutout = function(cutoutId) {
		if(!confirm("Weet je zeker dat je deze kaartuitsnede wilt verwijderen?")) {
			return;
		}
		Cutouts.delete(cutoutId);
		Cutouts.updateHTMLList();
	};
	
	Events.button_downloadCutout = function(cutoutId) {
		Cutouts.download(cutoutId);
	};

var Popup = {
};

	Popup.show = function(name) {
		$('.popup_'+name).show();
	};
	
	Popup.hide = function(name) {
		$('.popup_'+name).hide();
	};
	
	Popup.toggle = function(name) {
		$('.popup_'+name).toggle();
	};