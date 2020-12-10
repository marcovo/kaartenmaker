<template>
  <div class="modal" tabindex="-1" role="dialog" v-bind:id="'cutout_settings_modal_' + cutout.id">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Modal title</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <p>Modal body text goes here.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary">Save changes</button>
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue/dist/vue.esm.js';
import Cutout from "../Main/Cutout";
import * as $ from "jquery";

export default Vue.component('cutout-settings-modal', {
  props: {
    cutout: Cutout,
    listenId: String,
  },
  data () {
    $(() => {
      $('#' + this.listenId).on('click', () => {
        $('#cutout_settings_modal_' + this.cutout.id).modal();
      });
    });

    return {

    };
  },
  methods: {

  }
});
</script>

<style scoped>

</style>
