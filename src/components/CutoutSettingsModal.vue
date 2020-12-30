<template>
  <div
      class="modal"
      tabindex="-1"
      role="dialog"
      v-bind:id="'cutout_settings_modal_' + cutout.id"
      data-backdrop="false"
      data-keyboard="false"
  >
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Kaartinstellingen</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <ul class="nav nav-tabs" role="tablist" v-bind:id="'csm_' + cutout.id + '_tabbar-tablist'">
            <li class="nav-item">
              <a
                  class="nav-link active"
                  v-bind:id="'csm_' + cutout.id + '_tabbar_general-tab'"
                  role="tab"
                  data-toggle="tab"
                  v-bind:aria-controls="'csm_' + cutout.id + '_tabbar_general'"
                  v-bind:data-target="'#csm_' + cutout.id + '_tabbar_general'"
                  aria-selected="true"
              >Algemeen</a>
            </li>
            <li class="nav-item">
              <a
                  class="nav-link"
                  v-bind:id="'csm_' + cutout.id + '_tabbar_projection-tab'"
                  role="tab"
                  data-toggle="tab"
                  v-bind:aria-controls="'csm_' + cutout.id + '_tabbar_projection'"
                  v-bind:data-target="'#csm_' + cutout.id + '_tabbar_projection'"
                  aria-selected="false"
              >Projectie</a>
            </li>
            <li class="nav-item">
              <a
                  class="nav-link"
                  v-bind:id="'csm_' + cutout.id + '_tabbar_grid-tab'"
                  role="tab"
                  data-toggle="tab"
                  v-bind:aria-controls="'csm_' + cutout.id + '_tabbar_grid'"
                  v-bind:data-target="'#csm_' + cutout.id + '_tabbar_grid'"
                  aria-selected="false"
              >Raster</a>
            </li>
            <li class="nav-item">
              <a
                  class="nav-link"
                  v-bind:id="'csm_' + cutout.id + '_tabbar_frame-tab'"
                  role="tab"
                  data-toggle="tab"
                  v-bind:aria-controls="'csm_' + cutout.id + '_tabbar_frame'"
                  v-bind:data-target="'#csm_' + cutout.id + '_tabbar_frame'"
                  aria-selected="false"
              >Kader</a>
            </li>
          </ul>
          <div class="tab-content">
            <div
                class="tab-pane show active"
                v-bind:id="'csm_' + cutout.id + '_tabbar_general'"
                role="tabpanel"
                v-bind:aria-labelledby="'csm_' + cutout.id + '_tabbar_general-tab'"
            >
              <div class="form-group">
                <label v-bind:for="'csm_' + cutout.id + '_name'">Kaart naam</label>
                <input type="text" class="form-control" v-bind:id="'csm_' + cutout.id + '_name'" placeholder="Typ een naam..." v-bind:value="cutout.name">
              </div>

              <div class="form-group">
                <label v-bind:for="'csm_' + cutout.id + '_paper'">Papier formaat</label>
                <select class="form-control" v-bind:id="'csm_' + cutout.id + '_paper'">
                  <option
                      v-for="paper in container.getPaperList()"
                      v-bind:value="paper.name"
                      v-bind:selected="cutout.paper.name === paper.name"
                  >{{ paper.title }}</option>
                </select>
              </div>
            </div>

            <div class="tab-pane"
                 v-bind:id="'csm_' + cutout.id + '_tabbar_projection'"
                 role="tabpanel"
                 v-bind:aria-labelledby="'csm_' + cutout.id + '_tabbar_projection-tab'"
            >
              <div class="alert alert-warning" role="alert" v-bind:id="'csm_' + cutout.id + '_error_suggested_scale'" style="display: none;">
                De ingevulde combinatie van Schaal en DPI resulteert in een resolutie die mogelijk incompatibel is met het geselecteerde WMS.
              </div>

              <div class="form-group">
                <label v-bind:for="'csm_' + cutout.id + '_mip'">Kaartbron</label>
                <select class="form-control" v-bind:id="'csm_' + cutout.id + '_mip'">
                  <option
                      v-for="mip in container.mapImageProviderList()"
                      v-bind:value="mip.name"
                      v-bind:selected="cutout.projection.mapImageProvider.name === mip.name"
                  >{{ mip.title }}</option>
                </select>
              </div>

              <div class="form-group">
                <label v-bind:for="'csm_' + cutout.id + '_scale'">Schaal</label>

                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text">1:</span>
                  </div>
                  <input type="text" class="form-control" v-bind:id="'csm_' + cutout.id + '_scale'" v-bind:value="cutout.getProjection().getScale()">
                </div>
              </div>

              <div class="form-group" v-if="isWmsProjection(cutout.getProjection())">
                <label v-bind:for="'csm_' + cutout.id + '_dpi'">DPI</label>
                <input
                    type="text" class="form-control"
                    v-bind:id="'csm_' + cutout.id + '_dpi'"
                    v-bind:value="cutout.getProjection().getDpi()"
                    v-on:change="changeDpi($event, cutout)"
                    v-on:keyup="changeDpi($event, cutout)"
                    v-on:input="changeDpi($event, cutout)"
                    v-on:blur="changeDpi($event, cutout)"
                >
              </div>

              <div class="form-group" v-if="isWmtsProjection(cutout.getProjection())">
                <label v-bind:for="'csm_' + cutout.id + '_tile_matrix'">Zoom niveau</label>
                <select class="form-control" v-bind:id="'csm_' + cutout.id + '_tile_matrix'" v-on:change="changeTileMatrixId($event, cutout)">
                  <option
                      v-for="tileMatrix in cutout.projection.mapImageProvider.getTileMatrixList()"
                      v-bind:value="tileMatrix.identifier"
                      v-bind:selected="cutout.projection.getTileMatrixId() === tileMatrix.identifier"
                  >{{ tileMatrixName(tileMatrix) }} px/km</option>
                </select>
              </div>

              <div class="form-group" v-if="isWmtsProjection(cutout.getProjection())">
                <label v-bind:for="'csm_' + cutout.id + '_dpi_wmts'">DPI</label>
                <input type="text" disabled class="form-control" v-bind:id="'csm_' + cutout.id + '_dpi_wmts'" v-bind:value="Math.round(cutout.projection.getDpi())">
              </div>
            </div>

            <div
                class="tab-pane"
                v-bind:id="'csm_' + cutout.id + '_tabbar_grid'"
                role="tabpanel"
                v-bind:aria-labelledby="'csm_' + cutout.id + '_tabbar_grid-tab'"
            >
              <div class="form-group">
                <div class="form-check">
                  <input class="form-check-input" v-bind:id="'csm_' + cutout.id + '_draw_grid'" type="checkbox" value="1" v-bind:checked="cutout.options.draw_grid">
                  <label class="form-check-label" v-bind:for="'csm_' + cutout.id + '_draw_grid'">Raster tekenen</label>
                </div>
              </div>

              <div class="form-group">
                <div class="form-check">
                  <input
                      class="form-check-input"
                      type="radio"
                      v-bind:name="'csm_' + cutout.id + '_grid_type'"
                      v-bind:id="'csm_' + cutout.id + '_grid_type_auto'"
                      value="auto"
                      v-bind:checked="cutout.grid.customGridSpec === null"
                  >
                  <label class="form-check-label" v-bind:for="'csm_' + cutout.id + '_grid_type_auto'">
                    Automatisch raster
                  </label>
                </div>
                <div class="form-check">
                  <input
                      class="form-check-input"
                      type="radio"
                      v-bind:name="'csm_' + cutout.id + '_grid_type'"
                      v-bind:id="'csm_' + cutout.id + '_grid_type_manual'"
                      value="manual"
                      v-bind:checked="cutout.grid.customGridSpec !== null"
                  >
                  <label class="form-check-label" v-bind:for="'csm_' + cutout.id + '_grid_type_manual'">
                    Handmatig raster
                  </label>
                </div>
              </div>

              <div class="form-group">
                <table class="table table-sm" v-if="cutout.grid.customGridSpec !== null">
                  <tr>
                    <th>Rasterdefinitie</th>
                    <th>Basis</th>
                    <th>Stapgrootte</th>
                  </tr>
                  <tr>
                    <th>X</th>
                    <td>
                      <input
                          type="number" class="form-control"
                          v-bind:id="'csm_' + cutout.id + '_grid_manual_base_x'"
                          v-bind:value="cutout.grid.customGridSpec.base_x"
                          v-on:change="changeManualGrid($event, cutout, 'base_x')"
                          v-on:keyup="changeManualGrid($event, cutout, 'base_x')"
                          v-on:input="changeManualGrid($event, cutout, 'base_x')"
                          v-on:blur="changeManualGrid($event, cutout, 'base_x')"
                      >
                    </td>
                    <td>
                      <input
                          type="number" class="form-control"
                          v-bind:id="'csm_' + cutout.id + '_grid_manual_delta_x'"
                          v-bind:value="cutout.grid.customGridSpec.delta_x"
                          v-on:change="changeManualGrid($event, cutout, 'delta_x')"
                          v-on:keyup="changeManualGrid($event, cutout, 'delta_x')"
                          v-on:input="changeManualGrid($event, cutout, 'delta_x')"
                          v-on:blur="changeManualGrid($event, cutout, 'delta_x')"
                      >
                    </td>
                  </tr>
                  <tr>
                    <th>Y</th>
                    <td>
                      <input
                          type="number" class="form-control"
                          v-bind:id="'csm_' + cutout.id + '_grid_manual_base_y'"
                          v-bind:value="cutout.grid.customGridSpec.base_y"
                          v-on:change="changeManualGrid($event, cutout, 'base_y')"
                          v-on:keyup="changeManualGrid($event, cutout, 'base_y')"
                          v-on:input="changeManualGrid($event, cutout, 'base_y')"
                          v-on:blur="changeManualGrid($event, cutout, 'base_y')"
                      >
                    </td>
                    <td>
                      <input
                          type="number" class="form-control"
                          v-bind:id="'csm_' + cutout.id + '_grid_manual_delta_y'"
                          v-bind:value="cutout.grid.customGridSpec.delta_y"
                          v-on:change="changeManualGrid($event, cutout, 'delta_y')"
                          v-on:keyup="changeManualGrid($event, cutout, 'delta_y')"
                          v-on:input="changeManualGrid($event, cutout, 'delta_y')"
                          v-on:blur="changeManualGrid($event, cutout, 'delta_y')"
                      >
                    </td>
                  </tr>
                </table>
              </div>
            </div>

            <div
                class="tab-pane"
                v-bind:id="'csm_' + cutout.id + '_tabbar_frame'"
                role="tabpanel"
                v-bind:aria-labelledby="'csm_' + cutout.id + '_tabbar_frame-tab'"
            >
              <label>Marges</label>
              <div class="row">
                <div class="offset-md-4 col-md-4">
                  <div class="form-group">
                    <div>
                      <label v-bind:for="'csm_' + cutout.id + '_margin_top'" class="float-left font-italic">Boven</label>
                      <div class="form-check float-right">
                        <input class="form-check-input" v-bind:id="'csm_' + cutout.id + '_coords_top'" type="checkbox" value="1" v-bind:checked="cutout.options.display_coords_top">
                        <label class="form-check-label" v-bind:for="'csm_' + cutout.id + '_coords_top'">Coördinaten</label>
                      </div>
                    </div>
                    <div class="input-group">
                      <input type="number" class="form-control" v-bind:id="'csm_' + cutout.id + '_margin_top'" v-bind:value="cutout.options.margin_top">
                      <div class="input-group-append"><span class="input-group-text">mm</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-4">
                  <div class="form-group">
                    <div>
                      <label v-bind:for="'csm_' + cutout.id + '_margin_left'" class="font-italic">Links</label>
                      <div class="form-check float-right">
                        <input class="form-check-input" v-bind:id="'csm_' + cutout.id + '_coords_left'" type="checkbox" value="1" v-bind:checked="cutout.options.display_coords_left">
                        <label class="form-check-label" v-bind:for="'csm_' + cutout.id + '_coords_left'">Coördinaten</label>
                      </div>
                    </div>
                    <div class="input-group">
                      <input type="number" class="form-control" v-bind:id="'csm_' + cutout.id + '_margin_left'" v-bind:value="cutout.options.margin_left">
                      <div class="input-group-append"><span class="input-group-text">mm</span></div>
                    </div>
                  </div>
                </div>

                <div class="offset-md-4 col-md-4">
                  <div class="form-group">
                    <div>
                      <label v-bind:for="'csm_' + cutout.id + '_margin_right'" class="font-italic">Rechts</label>
                      <div class="form-check float-right">
                        <input class="form-check-input" v-bind:id="'csm_' + cutout.id + '_coords_right'" type="checkbox" value="1" v-bind:checked="cutout.options.display_coords_right">
                        <label class="form-check-label" v-bind:for="'csm_' + cutout.id + '_coords_right'">Coördinaten</label>
                      </div>
                    </div>
                    <div class="input-group">
                      <input type="number" class="form-control" v-bind:id="'csm_' + cutout.id + '_margin_right'" v-bind:value="cutout.options.margin_right">
                      <div class="input-group-append"><span class="input-group-text">mm</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="offset-md-4 col-md-4">
                  <div class="form-group">
                    <div>
                      <label v-bind:for="'csm_' + cutout.id + '_margin_bottom'" class="font-italic">Onder</label>
                      <div class="form-check float-right">
                        <input class="form-check-input" v-bind:id="'csm_' + cutout.id + '_coords_bottom'" type="checkbox" value="1" v-bind:checked="cutout.options.display_coords_bottom">
                        <label class="form-check-label" v-bind:for="'csm_' + cutout.id + '_coords_bottom'">Coördinaten</label>
                      </div>
                    </div>
                    <div class="input-group">
                      <input type="number" class="form-control" v-bind:id="'csm_' + cutout.id + '_margin_bottom'" v-bind:value="cutout.options.margin_bottom">
                      <div class="input-group-append"><span class="input-group-text">mm</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-check">
                <input class="form-check-input" v-bind:id="'csm_' + cutout.id + '_display_name'" type="checkbox" value="1" v-bind:checked="cutout.options.display_name">
                <label class="form-check-label" v-bind:for="'csm_' + cutout.id + '_display_name'">Kaartnaam afdrukken</label>
              </div>

              <div class="form-check">
                <input class="form-check-input" v-bind:id="'csm_' + cutout.id + '_display_scale'" type="checkbox" value="1" v-bind:checked="cutout.options.display_scale">
                <label class="form-check-label" v-bind:for="'csm_' + cutout.id + '_display_scale'">Schaal-indicatie afdrukken</label>
              </div>

              <div class="form-check">
                <input class="form-check-input" v-bind:id="'csm_' + cutout.id + '_rotate_y_coords'" type="checkbox" value="1" v-bind:checked="cutout.options.rotate_y_coords">
                <label class="form-check-label" v-bind:for="'csm_' + cutout.id + '_rotate_y_coords'">Coördinaten langs verticale as kwartslag draaien</label>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Ok</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue/dist/vue.esm.js';
import ChangeCutoutNameAction from "../ActionHistory/ChangeCutoutNameAction";
import ChangeCutoutProjectionAction from "../ActionHistory/ChangeCutoutProjectionAction";
import ChangeCutoutScaleAction from "../ActionHistory/ChangeCutoutScaleAction";
import ChangeCutoutDpiAction from "../ActionHistory/ChangeCutoutDpiAction";
import UpdateCutoutOptionAction from "../ActionHistory/UpdateCutoutOptionAction";
import Container from "../Main/Container";
import Cutout from "../Main/Cutout";
import WmsProjection from "../Projection/WmsProjection";
import * as $ from "jquery";
import Projection from "../Projection/Projection";
import Coordinate from "../Coordinates/Coordinate";
import MapImageProvider from "../Projection/MapImageProvider";
import Wmts, {TileMatrix} from "../Projection/Wmts";
import WmtsProjection from "../Projection/WmtsProjection";
import Wms from "../Projection/Wms";
import {trimTrailingZeroDecimalPlaces} from "../Util/functions";
import ChangeCutoutTileMatrixAction from "../ActionHistory/ChangeCutoutTileMatrixAction";
import ChangeCutoutPaperAction from "../ActionHistory/ChangeCutoutPaperAction";
import ChangeCutoutGridTypeAction from "../ActionHistory/ChangeCutoutGridTypeAction";
import ChangeCutoutManualGridAction from "../ActionHistory/ChangeCutoutManualGridAction";

function checkSuggestedScaleRange(cutout: Cutout<any, any, any>) {
  const projection = cutout.getProjection();
  if(projection instanceof WmsProjection) {
    projection.isWithinSuggestedScaleRange().then((isWithin) => {
      $('#csm_' + cutout.id + '_error_suggested_scale').toggle(!isWithin);
    });
  } else {
    $('#csm_' + cutout.id + '_error_suggested_scale').toggle(false);
  }
}

export default Vue.component('cutout-settings-modal', {
  props: {
    cutout: Cutout,
    listenId: String,
  },
  data () {
    const cutout = this.cutout;

    $(() => {
      $('#' + this.listenId).on('click', () => {
        $('#cutout_settings_modal_' + cutout.id).modal();
      });

      $('#csm_' + cutout.id + '_name').on('change keyup input blur', function() {
        const newName = $(this).val();
        if(newName !== cutout.name) {
          cutout.userInterface.actionHistory.addAction(new ChangeCutoutNameAction(cutout, newName));
        }
      });

      $('#csm_' + cutout.id + '_paper').on('change', function() {
        const newVal = $(this).val();
        const oldPaper = cutout.getPaper();
        if(newVal !== oldPaper.name) {
          const newPaper = Container.getPaper(newVal);
          cutout.userInterface.actionHistory.addAction(new ChangeCutoutPaperAction(cutout, newPaper));
        }
      });

      $('#csm_' + cutout.id + '_mip').on('change', function() {
        const newVal = $(this).val();
        const oldProjection = cutout.getProjection();
        if(newVal !== oldProjection.mapImageProvider.name) {
          cutout.userInterface.showLoadingIndicator(100);

          let newProjection: Projection<Coordinate, MapImageProvider>;
          const mapImageProvider = Container.mapImageProvider(newVal);
          if(mapImageProvider instanceof Wms) {
            newProjection = new WmsProjection(newVal);
          } else if(mapImageProvider instanceof Wmts) {
            newProjection = new WmtsProjection(newVal);
          } else {
            throw new Error('Invalid value');
          }

          if(
              !(oldProjection instanceof WmsProjection)
              || !(newProjection instanceof WmsProjection)
              ||  oldProjection.mapImageProvider.getDefaultScale() === newProjection.mapImageProvider.getDefaultScale()
          ) {
            // The new WMS is has equivalent scaling with the old WMS, so we can reasonably keep the scale setting
            newProjection.setScale(oldProjection.getScale());
            if(oldProjection instanceof WmsProjection && newProjection instanceof WmsProjection) {
              newProjection.setDpi(oldProjection.getDpi());
            }
          }

          newProjection.initialize().then(() => {
            cutout.userInterface.actionHistory.addAction(new ChangeCutoutProjectionAction(cutout, newProjection));
          }).finally(() => {
            cutout.userInterface.hideLoadingIndicator();
          });
        }
      });

      $('#csm_' + cutout.id + '_scale').on('change keyup input blur', function() {
        const newScale = parseInt($(this).val());
        if(!isNaN(newScale) && newScale !== cutout.getProjection().getScale()) {
          cutout.userInterface.actionHistory.addAction(new ChangeCutoutScaleAction(cutout, newScale));
        }
      });

      for(const side of ['top', 'left', 'right', 'bottom']) {
        $('#csm_' + cutout.id + '_coords_' + side).on('change', function() {
          const newVal = $(this).prop('checked');
          if(newVal !== cutout.options['display_coords_'+side]) {
            cutout.userInterface.actionHistory.addAction(new UpdateCutoutOptionAction(
                cutout,
                'display_coords_'+side,
                newVal
            ));
          }
        });

        $('#csm_' + cutout.id + '_margin_' + side).on('change keyup input blur', function() {
          const newVal = parseInt($(this).val());
          if(!isNaN(newVal) && newVal !== cutout.options['margin_'+side]) {
            cutout.userInterface.actionHistory.addAction(new UpdateCutoutOptionAction(
                cutout,
                'margin_'+side,
                newVal
            ));
          }
        });
      }

      for(const optionKey of ['draw_grid', 'display_name', 'display_scale', 'rotate_y_coords']) {
        $('#csm_' + cutout.id + '_' + optionKey).on('change', function() {
          const newVal = $(this).prop('checked');
          if(newVal !== cutout.options[optionKey]) {
            cutout.userInterface.actionHistory.addAction(new UpdateCutoutOptionAction(
                cutout,
                optionKey,
                newVal
            ));
          }
        });
      }

      $('[name="csm_' + cutout.id + '_grid_type"]').on('change', function(evt) {
        cutout.userInterface.actionHistory.addAction(new ChangeCutoutGridTypeAction(
            cutout,
            ($(this).val() === 'manual') ? 'manual' : 'auto',
        ));
      });
    });

    return {
      container: Container,
    };
  },
  watch: {
    'cutout.projection': function (val, oldVal) {
      checkSuggestedScaleRange(this.cutout);
    },
    'cutout.projection.dpi': function (val, oldVal) {
      checkSuggestedScaleRange(this.cutout);
    },
    'cutout.projection.scale': function (val, oldVal) {
      checkSuggestedScaleRange(this.cutout);
    }
  },
  methods: {
    isWmsProjection(obj): boolean {
      return obj instanceof WmsProjection;
    },
    isWmtsProjection(obj): boolean {
      return obj instanceof WmtsProjection;
    },
    tileMatrixName(tileMatrix: TileMatrix): string {
      const pxPerKm = Wmts.getPxPerKm(tileMatrix);
      return parseInt(tileMatrix.identifier) + ': ' + trimTrailingZeroDecimalPlaces(pxPerKm, pxPerKm < 10 ? 1 : 0);
    },
    changeDpi(event, cutout: Cutout<any, any, any>) {
      const newDpi = parseInt($('#csm_' + cutout.id + '_dpi').val());
      const projection = cutout.getProjection();
      if(!isNaN(newDpi) && projection instanceof WmsProjection && newDpi !== projection.getDpi()) {
        cutout.userInterface.actionHistory.addAction(new ChangeCutoutDpiAction(cutout, newDpi));
      }
    },
    changeTileMatrixId(event, cutout: Cutout<any, any, any>) {
      const newTileMatrixId = $('#csm_' + cutout.id + '_tile_matrix').val();
      const projection = cutout.getProjection();
      if(projection instanceof WmtsProjection && newTileMatrixId !== projection.getTileMatrixId()) {
        cutout.userInterface.actionHistory.addAction(new ChangeCutoutTileMatrixAction(cutout, newTileMatrixId));
      }
    },
    changeManualGrid(event, cutout: Cutout<any, any, any>, key: 'base_x'|'delta_x'|'base_y'|'delta_y') {
      const newValue = parseInt($('#csm_' + cutout.id + '_grid_manual_' + key).val());
      const grid = cutout.getGrid();
      if(!isNaN(newValue) && newValue !== grid.getCustomGridSpec()[key] && (newValue > 0 || (key === 'base_x' || key === 'base_y'))) {
        cutout.userInterface.actionHistory.addAction(new ChangeCutoutManualGridAction(cutout, key, newValue));
      }
    },
  }
});
</script>

<style scoped>

</style>
