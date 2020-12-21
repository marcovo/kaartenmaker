import * as L from 'leaflet';

/**
 * Based on https://github.com/w8r/Leaflet.draw.drag/blob/master/dist/Leaflet.draw.drag-src.js
 * Copyright (c) 2015 Alexander Milevski
 * Copyright (c) 2020 Marco van Oort
 */

/**
 * Leaflet vector features drag functionality
 * @author Alexander Milevski <info@w8r.name>
 * @preserve
 */

/**
 * Matrix transform path for SVG/VML
 * Renderer-independent
 */
L.Path.include({

    /**
     * Check if the feature was dragged, that'll supress the click event
     * on mouseup. That fixes popups for example
     *
     * @param  {MouseEvent} e
     */
    _onMouseClick: function(e) {
        if ((this.dragging && this.dragging.moved()) ||
            (this._map.dragging && this._map.dragging.moved())) {
            return;
        }

        this._fireMouseEvent(e);
    }

});
/**
 * Drag handler
 * @class L.Path.Drag
 * @extends {L.Handler}
 */
L.Handler.PathDrag = L.Handler.extend( /** @lends  L.Path.Drag.prototype */ {

    statics: {
        DRAGGING_CLS: 'leaflet-path-draggable',
    },


    /**
     * @param  {L.Path} path
     * @constructor
     */
    initialize: function(path) {

        /**
         * @type {L.Path}
         */
        this._path = path;

        /**
         * @type {L.Point}
         */
        this._dragStartPoint = null;

        /**
         * @type {L.LatLng[]}
         */
        this._originalLatLngs = null;

        /**
         * @type {Boolean}
         */
        this._mapDraggingWasEnabled = false;

    },

    /**
     * Enable dragging
     */
    addHooks: function() {
        this._path.on('mousedown', this._onDragStart, this);

        this._path.options.className = this._path.options.className ?
            (this._path.options.className + ' ' + L.Handler.PathDrag.DRAGGING_CLS) :
            L.Handler.PathDrag.DRAGGING_CLS;

        if (this._path._path) {
            L.DomUtil.addClass(this._path._path, L.Handler.PathDrag.DRAGGING_CLS);
        }
    },

    /**
     * Disable dragging
     */
    removeHooks: function() {
        this._path.off('mousedown', this._onDragStart, this);

        this._path.options.className = this._path.options.className
            .replace(new RegExp('\\s+' + L.Handler.PathDrag.DRAGGING_CLS), '');
        if (this._path._path) {
            L.DomUtil.removeClass(this._path._path, L.Handler.PathDrag.DRAGGING_CLS);
        }
    },

    /**
     * @return {Boolean}
     */
    moved: function() {
        return this._path._dragMoved;
    },

    /**
     * Start drag
     * @param  {L.MouseEvent} evt
     */
    _onDragStart: function(evt) {
        var END = {
            mousedown:     'mouseup',
            touchstart:    'touchend',
            pointerdown:   'touchend',
            MSPointerDown: 'touchend'
        };

        var MOVE = {
            mousedown:     'mousemove',
            touchstart:    'touchmove',
            pointerdown:   'touchmove',
            MSPointerDown: 'touchmove'
        };

        var eventType = evt.originalEvent._simulated ? 'touchstart' : evt.originalEvent.type;

        if(evt.originalEvent.altKey) {
            return;
        }

        this._mapDraggingWasEnabled = false;
        this._dragStartPoint = evt.containerPoint.clone();
        this._originalLatLngs = this._path.getLatLngs()[0];
        L.DomEvent.stop(evt.originalEvent);

        L.DomUtil.addClass(this._path._renderer._container, 'leaflet-interactive');
        L.DomEvent
            .on(document, MOVE[eventType], this._onDrag,    this)
            .on(document, END[eventType],  this._onDragEnd, this);

        if (this._path._map.dragging.enabled()) {
            // I guess it's required because mousdown gets simulated with a delay
            //this._path._map.dragging._draggable._onUp(evt);

            this._path._map.dragging.disable();
            this._mapDraggingWasEnabled = true;
        }
        this._path._dragMoved = false;

        if (this._path._popup) { // that might be a case on touch devices as well
            this._path._popup._close();
        }
    },

    /**
     * Dragging
     * @param  {L.MouseEvent} evt
     */
    _onDrag: function(evt) {
        L.DomEvent.stop(evt);

        var first = (evt.touches && evt.touches.length >= 1 ? evt.touches[0] : evt);
        var containerPoint = this._path._map.mouseEventToContainerPoint(first);

        // skip taps
        if (evt.type === 'touchmove' && !this._path._dragMoved) {
            var totalMouseDragDistance = this._dragStartPoint.distanceTo(containerPoint);
            if (totalMouseDragDistance <= this._path._map.options.tapTolerance) {
                return;
            }
        }

        if (!this._path._dragMoved) {
            this._path._dragMoved = true;
            this._path.fire('dragstart', evt);
            // we don't want that to happen on click
            this._path.bringToFront();
        }

        var diffVec = L.point(
            containerPoint.x - this._dragStartPoint.x,
            containerPoint.y - this._dragStartPoint.y
        );

        this._path.fire('predrag', evt);
        this._transformPoints(diffVec, evt);
        this._path.fire('drag', evt);
    },

    /**
     * Dragging stopped, apply
     * @param  {L.MouseEvent} evt
     */
    _onDragEnd: function(evt) {
        var containerPoint = this._path._map.mouseEventToContainerPoint(evt);
        var moved = this.moved();

        // apply matrix
        if (moved) {
            var diffVec = L.point(
                containerPoint.x - this._dragStartPoint.x,
                containerPoint.y - this._dragStartPoint.y
            );

            this._transformPoints(diffVec, evt);

            L.DomEvent.stop(evt);
        }


        L.DomEvent
            .off(document, 'mousemove touchmove', this._onDrag, this)
            .off(document, 'mouseup touchend',    this._onDragEnd, this);

        // consistency
        if (moved) {
            this._path.fire('dragend', {});

            // hack for skipping the click in canvas-rendered layers
            var contains = this._path._containsPoint;
            this._path._containsPoint = L.Util.falseFn;
            L.Util.requestAnimFrame(function() {
                L.DomEvent.skipped({ type: 'click' });
                this._path._containsPoint = contains;
            }, this);
        }

        this._dragStartPoint  = null;
        this._path._dragMoved = false;

        if (this._mapDraggingWasEnabled) {
            if (moved) L.DomEvent.fakeStop({ type: 'click' });
            this._path._map.dragging.enable();
        }
    },


    /**
     * Applies translation
     *
     * @param {L.Point} diffVec
     * @param {L.MouseEvent} evt
     */
    _transformPoints: function(diffVec, evt) {
        var newLatLngs = [];
        var i;
        for (i in this._originalLatLngs) {
            var oldContainerPoint = this._path._map.latLngToContainerPoint(this._originalLatLngs[i]);
            var newContainerPoint = oldContainerPoint.add(diffVec);
            newLatLngs.push(this._path._map.containerPointToLatLng(newContainerPoint));
        }
        var preLatLngEvt = {
            latlngs: newLatLngs,
            originalEvent: evt,
        };
        this._path.fire('prelatlng', preLatLngEvt);
        this._path.setLatLngs(preLatLngEvt.latlngs);
    }

});


/**
 * @param  {L.Path} layer
 * @return {L.Path}
 */
L.Handler.PathDrag.makeDraggable = function(layer) {
    layer.dragging = new L.Handler.PathDrag(layer);
    return layer;
};


/**
 * Also expose as a method
 * @return {L.Path}
 */
L.Path.prototype.makeDraggable = function() {
    return L.Handler.PathDrag.makeDraggable(this);
};


L.Path.addInitHook(function() {
    if (this.options.draggable) {
        // ensure interactive
        this.options.interactive = true;

        if (this.dragging) {
            this.dragging.enable();
        } else {
            L.Handler.PathDrag.makeDraggable(this);
            this.dragging.enable();
        }
    } else if (this.dragging) {
        this.dragging.disable();
    }
});
