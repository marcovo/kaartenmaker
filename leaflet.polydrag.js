L.Handler.PolyDrag = L.Handler.extend({
    initialize: function (poly) {
        this._poly = poly;
        this._magnet = true;
    },

    addHooks: function () {
        var container = this._poly._container;
        if (!this._draggable) {
            this._draggable = new L.DraggablePoly(container, container)
            .on('dragstart', this._onDragStart, this)
            .on('drag', this._onDrag, this)
            .on('dragend', this._onDragEnd, this);
            this._draggable.on('dragstart', this._onDragStart, this);
        }
        this._draggable.enable();
    },

    removeHooks: function () {
        this._draggable.disable();
    },

    moved: function () {
        return this._draggable && this._draggable._moved;
    },

    _onDragStart: function (e) {
        if (this._poly.editing && this._poly.editing.enabled()) {
            this._wasEditing = true;
            this._poly.editing.disable();
        }
        this._poly
            .fire('movestart')
            .fire('dragstart');
    },

    _onDrag: function (e) {
		
		var totalDiffVec = e.target._totalDiffVec
		
		if(this._magnet) {
			var map = this._poly._map;
			var oldLatLngs = this._poly.getLatLngs();
			var oldContainerPoint = map.latLngToContainerPoint(oldLatLngs[0]);
			var newContainerPoint = oldContainerPoint.add(e.target._totalDiffVec);
			var newLatLng = map.containerPointToLatLng(newContainerPoint);
			
			var magnetLatLng = Cutouts.checkMagnet(newLatLng, this.cutoutId);
			var magnetContainerPoint = map.latLngToContainerPoint(magnetLatLng);
			
			totalDiffVec = magnetContainerPoint.subtract(oldContainerPoint);
		}
		
        L.DomUtil.setPosition(this._poly._container, totalDiffVec);
        this._poly
            .fire('move')
            .fire('drag');
    },

    _onDragEnd: function (e) {
        var map = this._poly._map;
        var oldLatLngs = this._poly.getLatLngs();
        var newLatLngs = [];
        var i;
        for (i in oldLatLngs) {
            var oldContainerPoint = map.latLngToContainerPoint(oldLatLngs[i]);
            var newContainerPoint = oldContainerPoint.add(e.target._totalDiffVec);
            var newLatLng = map.containerPointToLatLng(newContainerPoint);
			if(this._magnet) {
				var magnetLatLng = Cutouts.checkMagnet(newLatLng, this.cutoutId);
				newLatLngs.push(magnetLatLng);
			}
			else {
				newLatLngs.push(newLatLng);
			}
        }
        L.DomUtil.setPosition(this._poly._container, new L.Point(0,0));
        this._poly.setLatLngs(newLatLngs);
        if (this._wasEditing) {
            this._poly.editing.enable();
            this._wasEditing = false;
        }
        this._poly
            .fire('moveend')
            .fire('dragend');
    }
});

L.DraggablePoly = L.Draggable.extend({
    _onDown: function (e) {
        if (
            (!L.Browser.touch && e.shiftKey) ||
             ((e.which !== 1) && (e.button !== 1) && !e.touches)
        ) {
            return;
        }

        this._simulateClick = true;

        if (e.touches && e.touches.length > 1) {
            this._simulateClick = false;
            return;
        }

        var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e);
        var el = first.target;

        L.DomEvent.stop(e);

        if (L.Browser.touch && el.tagName.toLowerCase() === 'a') {
            L.DomUtil.addClass(el, 'leaflet-active');
        }

        this._moved = false;
        if (this._moving) {
            return;
        }

        L.DomUtil.disableImageDrag();
        L.DomUtil.disableTextSelection();

        this._startPoint = new L.Point(first.clientX, first.clientY);

        L.DomEvent.on(document, L.Draggable.MOVE[e.type], this._onMove, this);
        L.DomEvent.on(document, L.Draggable.END[e.type], this._onUp, this);
    },

    _onMove: function (e) {
        if (e.touches && e.touches.length > 1) { return; }

        var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e);
        if (this._moved) {
            this._lastPoint = this._newPoint;
        } else {
            this._lastPoint = this._startPoint;
        }
        this._newPoint = new L.Point(first.clientX, first.clientY);
        this._diffVec = this._newPoint.subtract(this._lastPoint);
        this._totalDiffVec = new L.Point(e.clientX, e.clientY).subtract(
            this._startPoint
        );


        if (!this._diffVec.x && !this._diffVec.y) { return; }

        L.DomEvent.stop(e);

        if (!this._moved) {
            this.fire('dragstart');
            this._moved = true;
        }

        this._moving = true;

        L.Util.cancelAnimFrame(this._animRequest);
        this._animRequest = L.Util.requestAnimFrame(
            this._updatePosition, this, true, this._dragStartTarget
        );
    },

    _updatePosition: function () {
        this.fire('predrag');
        this.fire('drag');
    },

    _onUp: function (e) {
        this._totalDiffVec = new L.Point(e.clientX, e.clientY).subtract(
            this._startPoint
        );

        if (this._simulateClick && e.changedTouches) {
            var first = e.changedTouches[0];
            var el = first.target;
            var dist = 
                (this._newPos && this._newPos.distanceTo(this._startPos)) ||
                0;

            if (el.tagName.toLowerCase() === 'a') {
                L.DomUtil.removeClass(el, 'leaflet-active');
            }

            if (dist < L.Draggable.TAP_TOLERANCE) {
                this._simulateEvent('click', first);
            }
        }

		L.DomUtil.enableImageDrag();
		L.DomUtil.enableTextSelection();

		for (var i in L.Draggable.MOVE) {
			L.DomEvent
				.off(document, L.Draggable.MOVE[i], this._onMove, this)
				.off(document, L.Draggable.END[i], this._onUp, this);
		}

        if (this._moved) {
            // ensure drag is not fired after dragend
            L.Util.cancelAnimFrame(this._animRequest);

            this.fire('dragend');
        }
        this._moving = false;
    }
});
