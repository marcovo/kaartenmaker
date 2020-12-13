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
              Frame
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
import Container from "../Main/Container";
import Cutout from "../Main/Cutout";
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
      })
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
