<template>
  <div class="control-pane control-pane-coordinate-panel d-none" id="coordinatePanel">
    <div class="control-pane-content">
      <div v-for="coordinateInSystem in coordinateInSystems">
        {{ coordinateInSystem.code }} ;
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
import CoordinateConverter from "../Util/CoordinateConverter";

export default Vue.component('coordinate-panel', {
  props: {
    userInterface: UserInterface,
    leafletConvertibleCoordinateSystem: Object, // LeafletConvertibleCoordinateSystem
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
        const converted = CoordinateConverter.convert(baseCoord, CoordinateConverter.getCoordinateSystem(code));
        const formats = converted.formats();
        const formatNames = Object.keys(formats);

        if(formatNames.length > 0) {
          coordinateInSystems.push({
            name: code,
            coordinate: formats[formatNames[0]](),
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
