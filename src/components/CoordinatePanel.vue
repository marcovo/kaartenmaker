<template>
  <div class="control-pane control-pane-coordinate-panel d-none" id="coordinatePanel">
    <div class="control-pane-content" id="coordinateControlPanelContent">
      <div v-for="coordinateInSystem in coordinateInSystems" :key="coordinateInSystem.id">
        <div class="form-group">
          <label v-bind:for="'coord_panel_input_' + coordinateInSystem.id">{{ coordinateInSystem.name }}</label>
          <div class="input-group">
            <input
                type="text"
                class="form-control"
                v-bind:id="'coord_panel_input_' + coordinateInSystem.id"
                readonly
                v-bind:value="coordinateInSystem.showFormatted"
                aria-label="Coordinate"
            >

            <div class="input-group-append dropup">
              <button
                  type="button"
                  class="btn btn-outline-secondary"
                  v-on:click="copyInput('#coord_panel_input_' + coordinateInSystem.id)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="align-baseline bi bi-clipboard-plus" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M8 7a.5.5 0 0 1 .5.5V9H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V10H6a.5.5 0 0 1 0-1h1.5V7.5A.5.5 0 0 1 8 7z"/>
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
              </button>
              <button
                  class="btn btn-outline-secondary dropdown-toggle"
                  type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
                  v-on:click="updateFormatDropdownWidth"
              ></button>
              <div class="dropdown-menu dropdown-menu-right">
                <div class="mx-2">
                  <label>{{ coordinateInSystem.name }}</label>

                  <div v-for="(coordinate, formatName) in coordinateInSystem.formatted" :key="formatName">
                    <div class="input-group mb-1">
                      <input
                          type="text"
                          class="form-control"
                          v-bind:id="'coord_panel_input_' + coordinateInSystem.id + '_' + formatName"
                          readonly
                          v-bind:value="coordinate"
                          aria-label="Coordinate"
                      >

                      <div class="input-group-append">
                        <button
                            type="button"
                            class="btn btn-outline-secondary"
                            v-on:click="copyInput('#coord_panel_input_' + coordinateInSystem.id + '_' + formatName)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="align-baseline bi bi-clipboard-plus" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 7a.5.5 0 0 1 .5.5V9H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V10H6a.5.5 0 0 1 0-1h1.5V7.5A.5.5 0 0 1 8 7z"/>
                            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                            <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                          </svg>
                        </button>
                        <button
                            type="button"
                            class="btn btn-outline-secondary"
                            v-bind:disabled="formatName === coordinateInSystem.showFormatName"
                            v-on:click="setPreferredFormatName(coordinateInSystem.coordinate, formatName)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="align-baseline bi bi-box-arrow-in-down" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M3.5 6a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 1 0-1h2A1.5 1.5 0 0 1 14 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 14.5v-8A1.5 1.5 0 0 1 3.5 5h2a.5.5 0 0 1 0 1h-2z"/>
                            <path fill-rule="evenodd" d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue/dist/vue.esm.js';
import * as $ from "jquery";
import * as L from 'leaflet';
import UserInterface from "../Main/UserInterface";
import LeafletConvertibleCoordinate from "../Coordinates/LeafletConvertibleCoordinate";
import LeafletConvertibleCoordinateSystem from "../Coordinates/LeafletConvertibleCoordinateSystem";
import CoordinateConverter from "../Util/CoordinateConverter";
import Coordinate from "../Coordinates/Coordinate";
import {copyInput} from "../Util/functions";

const PREFERRED_FORMATS_LOCALSTORAGE_KEY = 'coord_panel_preferred_formats';

export default Vue.component('coordinate-panel', {
  props: {
    userInterface: UserInterface,
    leafletConvertibleCoordinateSystem: <LeafletConvertibleCoordinateSystem<LeafletConvertibleCoordinate>><unknown>Object,
    coordinateMarker: L.marker,
  },
  data () {
    this.coordinateMarker = null;

    const leafletMap = this.userInterface.getMap().getLeafletMap();

    leafletMap.on('click', (e) => {
      if(this.coordinateMarker === null) {
        this.coordinateMarker = L.marker(e.latlng).addTo(leafletMap);
      } else {
        leafletMap.removeLayer(this.coordinateMarker);
        this.coordinateMarker = null;
      }
      $('#coordinatePanel').toggleClass('d-none', this.coordinateMarker === null);
    });
    return {
      coordinatePanelRecomputeCounter: 0,
    };
  },
  watch: {

  },
  computed: {
    coordinateInSystems: function() {
      this.coordinatePanelRecomputeCounter;

      if(this.coordinateMarker === null) {
        return null;
      }

      const baseCoord: LeafletConvertibleCoordinate = this.leafletConvertibleCoordinateSystem.fromLeaflet(this.coordinateMarker.getLatLng());

      const coordinateSystemsRecord: Record<string, boolean> = {};
      for(const cutout of this.userInterface.getCutouts()) {
        coordinateSystemsRecord[cutout.workspaceCoordinateSystem.code] = true;
        coordinateSystemsRecord[cutout.getProjection().coordinateSystem.code] = true;
        coordinateSystemsRecord[cutout.getGrid().coordinateSystem.code] = true;
      }
      
      const coordinateSystemCodes = Object.keys(coordinateSystemsRecord);
      coordinateSystemCodes.sort();

      const preferredFormats = getPreferredFormats();

      const coordinateInSystems = [];
      for(const code of coordinateSystemCodes) {
        const coordinateSystem = CoordinateConverter.getCoordinateSystem(code);
        const converted = CoordinateConverter.convert(baseCoord, coordinateSystem);
        const formats = converted.formats();
        const formatNames = Object.keys(formats);

        if(formatNames.length > 0) {
          let showFormatName;
          if(preferredFormats.hasOwnProperty(code) && formats.hasOwnProperty(preferredFormats[code])) {
            showFormatName = preferredFormats[code];
          } else {
            showFormatName = converted.defaultFormat();
          }

          const formatted: Record<string, string> = {};
          for(const formatName of formatNames) {
            formatted[formatName] = formats[formatName]();
          }

          coordinateInSystems.push({
            id: coordinateSystem.code.replace(/[^a-z0-9]/g, '_'),
            coordinate: converted,
            name: coordinateSystem.name,
            formatted: formatted,
            showFormatName: showFormatName,
            showFormatted: formatted[showFormatName],
          });
        }
      }

      return coordinateInSystems;
    }
  },
  methods: {
    copyInput,
    updateFormatDropdownWidth(event) {
      const $btn = $(event.target);
      $btn.siblings('.dropdown-menu').width($btn.closest('#coordinateControlPanelContent').width());
    },
    setPreferredFormatName(coordinate: Coordinate, formatName: string) {
      const formats = coordinate.formats();
      if(formats.hasOwnProperty(formatName)) {
        const preferredFormats = getPreferredFormats();
        preferredFormats[coordinate.code] = formatName;
        window.localStorage.setItem(PREFERRED_FORMATS_LOCALSTORAGE_KEY, JSON.stringify(preferredFormats));
      }
      this.coordinatePanelRecomputeCounter++;
    },
  }
});

function getPreferredFormats(): Record<string, string> {
  let preferredFormats = window.localStorage.getItem(PREFERRED_FORMATS_LOCALSTORAGE_KEY);
  if(preferredFormats === null) {
    return {};
  } else {
    return JSON.parse(preferredFormats);
  }
}
</script>

<style scoped>
.control-pane-coordinate-panel {
  margin-top: 10px; /* We want margin-bottom but I guess due to the double 180deg rotation we have to use top here */
}
</style>
