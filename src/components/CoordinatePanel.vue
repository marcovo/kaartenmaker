<template>
  <div class="control-pane control-pane-coordinate-panel d-none" id="coordinatePanel">
    <div class="control-pane-content">
      <div v-for="coordinateInSystem in coordinateInSystems">
        {{ coordinateInSystem.name }} ;
        {{ coordinateInSystem.coordinate }}
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

const PREFERRED_FORMATS_LOCALSTORAGE_KEY = 'coord_panel_preferred_formats';

export default Vue.component('coordinate-panel', {
  props: {
    userInterface: UserInterface,
    leafletConvertibleCoordinateSystem: <LeafletConvertibleCoordinateSystem<LeafletConvertibleCoordinate>><unknown>Object,
    coordinateMarker: L.marker,
    preferredFormats: <Record<string, string>>{},
  },
  data () {
    this.coordinateMarker = null;
    this.preferredFormats = window.localStorage.getItem(PREFERRED_FORMATS_LOCALSTORAGE_KEY);
    if(this.preferredFormats === null) {
      this.preferredFormats = {};
    }

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
    };
  },
  watch: {

  },
  computed: {
    coordinateInSystems: function() {
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

      const coordinateInSystems = [];
      for(const code of coordinateSystemCodes) {
        const coordinateSystem = CoordinateConverter.getCoordinateSystem(code);
        const converted = CoordinateConverter.convert(baseCoord, coordinateSystem);
        const formats = converted.formats();
        const formatNames = Object.keys(formats);

        if(formatNames.length > 0) {
          let formatName;
          if(this.preferredFormats.hasOwnProperty(code) && formats.hasOwnProperty(this.preferredFormats[code])) {
            formatName = this.preferredFormats[code];
          } else {
            formatName = converted.defaultFormat();
          }

          coordinateInSystems.push({
            name: coordinateSystem.name,
            coordinate: formats[formatName](),
          });
        }
      }

      return coordinateInSystems;
    }
  },
  methods: {

  }
});
</script>

<style scoped>
.control-pane-coordinate-panel {
  margin-top: 10px; /* We want margin-bottom but I guess due to the double 180deg rotation we have to use top here */
}
</style>
