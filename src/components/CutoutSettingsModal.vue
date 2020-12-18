<template>
  <div
      class="modal"
      tabindex="-1"
      role="dialog"
      v-bind:id="'cutout_settings_modal_' + cutout.id"
      data-backdrop="static"
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
            </div>

            <div class="tab-pane"
                 v-bind:id="'csm_' + cutout.id + '_tabbar_projection'"
                 role="tabpanel"
                 v-bind:aria-labelledby="'csm_' + cutout.id + '_tabbar_projection-tab'"
            >
              <div class="form-group">
                <label v-bind:for="'csm_' + cutout.id + '_wms'">Kaartbron</label>
                <select class="form-control" v-bind:id="'csm_' + cutout.id + '_wms'">
                  <option
                      v-for="wms in container.wmsList()"
                      v-bind:value="wms.name"
                  >{{ wms.title }}</option>
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

              <div class="form-group">
                <label v-bind:for="'csm_' + cutout.id + '_dpi'">DPI</label>
                <input type="text" class="form-control" v-bind:id="'csm_' + cutout.id + '_dpi'" v-bind:value="cutout.getProjection().getDpi()">
              </div>
            </div>

            <div
                class="tab-pane"
                v-bind:id="'csm_' + cutout.id + '_tabbar_grid'"
                role="tabpanel"
                v-bind:aria-labelledby="'csm_' + cutout.id + '_tabbar_grid-tab'"
            >
              Grid
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
import Projection from "../Main/Projection";
import * as $ from "jquery";

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


      $('#csm_' + cutout.id + '_wms').on('change', function() {
        const newVal = $(this).val();
        const oldProjection = cutout.getProjection();
        if(newVal !== oldProjection.wms.name) {
          const newProjection = new Projection(newVal);

          if(
              oldProjection.wms.getDefaultScale() === newProjection.wms.getDefaultScale()
              && oldProjection.wms.getPreferredScaleRange().min === newProjection.wms.getPreferredScaleRange().min
              && oldProjection.wms.getPreferredScaleRange().max === newProjection.wms.getPreferredScaleRange().max
          ) {
            // The new WMS is has equivalent scaling with the old WMS, so we can reasonably keep the scale setting
            newProjection.setScale(oldProjection.getScale());
            newProjection.setDpi(oldProjection.getDpi());
          }

          cutout.userInterface.actionHistory.addAction(new ChangeCutoutProjectionAction(cutout, newProjection));
        }
      });

      $('#csm_' + cutout.id + '_scale').on('change keyup input blur', function() {
        const newScale = parseInt($(this).val());
        if(newScale !== cutout.getProjection().getScale()) {
          cutout.userInterface.actionHistory.addAction(new ChangeCutoutScaleAction(cutout, newScale));
        }
      });

      $('#csm_' + cutout.id + '_dpi').on('change keyup input blur', function() {
        const newDpi = parseInt($(this).val());
        if(newDpi !== cutout.getProjection().getDpi()) {
          cutout.userInterface.actionHistory.addAction(new ChangeCutoutDpiAction(cutout, newDpi));
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
          if(newVal !== cutout.options['margin_'+side]) {
            cutout.userInterface.actionHistory.addAction(new UpdateCutoutOptionAction(
                cutout,
                'margin_'+side,
                newVal
            ));
          }
        });
      }
    });

    return {
      container: Container,
    };
  },
  methods: {

  }
});
</script>

<style scoped>

</style>
