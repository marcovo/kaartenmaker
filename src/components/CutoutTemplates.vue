<template>
  <div class="btn-group mr-1">
    <button type="button" class="btn btn-sm btn-outline-primary" v-on:click="addCutout">
      <svg width="1em" height="1em" viewBox="0 0 16 16" class="align-baseline bi bi-plus-square" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
        <path stroke="currentColor" stroke-width="1" fill-rule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
      </svg>
    </button>
    <button type="button" class="btn btn-sm btn-outline-primary dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      <span class="sr-only">Toggle Dropdown</span>
    </button>
    <div class="dropdown-menu">
      <template v-for="(cutoutTemplates, systemOrCustom) in templateList">
        <div
            class="dropdown-item d-flex mr-3"
             type="button"
             v-for="cutoutTemplate in cutoutTemplates"
             :key="cutoutTemplate.id"
             v-on:click="addCutoutFromTemplate(cutoutTemplate)"
        >
          <div class="flex-grow-1">{{ cutoutTemplate.name }}</div>

          <div class="d-flex flex-column justify-content-center" v-if="systemOrCustom === 'custom'">
            <button class="btn btn-sm btn-control" type="button" v-on:click="deleteTemplate($event, cutoutTemplate)">
              <svg width="1em" height="1em" viewBox="0 0 16 16" class="align-baseline bi bi-trash-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7z"/>
              </svg>
            </button>
          </div>
        </div>
      </template>
    </div>

    <div
        class="modal"
        tabindex="-1"
        role="dialog"
        id="templates_add_modal"
        data-backdrop="false"
        data-keyboard="false"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Sjabloon opslaan</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p class="small">
              Sla deze kaartuitsnede op als sjabloon om op basis hiervan later weer kaartuitsnedes te maken.
              <span v-if="customTemplateList.length > 0">Je kunt een nieuw sjabloon maken, of een bestaande overschrijven.</span>
            </p>

            <h5 v-if="customTemplateList.length > 0">Als nieuw sjabloon opslaan</h5>
            <div class="form-group">
              <label for="template_name">Naam</label>

              <div class="input-group mb-3">
                <input type="text" class="form-control" id="template_name" placeholder="Typ een naam...">
                <div class="input-group-append">
                  <button class="btn btn-primary" type="button" v-on:click="addTemplate">Opslaan</button>
                </div>
              </div>
            </div>

            <div v-if="customTemplateList.length > 0">
              <hr />
              <h5>Een bestaand sjabloon overschrijven</h5>
              <div class="list-group">
                <button
                    class="list-group-item list-group-item-action"
                    v-for="template in customTemplateList"
                    v-on:click="updateTemplate(template)"
                >
                  {{ template.name }}
                </button>
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
import UserInterface from "../Main/UserInterface";
import CutoutTemplate from "../Main/CutoutTemplate";
import Container from "../Main/Container";

export default Vue.component('cutoutTemplates', {
  props: {
    userInterface: UserInterface,
    newCutoutTemplate: <CutoutTemplate<any, any, any>>null,
  },
  data () {
    return {
      templateListRecomputeCounter: 0,
    };
  },
  watch: {
    newCutoutTemplate: function() {
      if(this.newCutoutTemplate === null) {
        return;
      }

      this.openSaveTemplateModal();
    },
  },
  computed: {
    customTemplateList: function() {
      this.templateListRecomputeCounter;
      return Container.customCutoutTemplateList();
    },
    templateList: function() {
      this.templateListRecomputeCounter;
      return {
        system: Container.systemCutoutTemplateList(),
        custom: Container.customCutoutTemplateList(),
      };
    },
  },
  methods: {
    openSaveTemplateModal() {
      $('#templates_add_modal').modal();
      $('#template_name').val('').focus();
    },
    addTemplate() {
      const name = $('#template_name').val().trim();
      if(name.length > 0) {
        for(const existingTemplate of Container.customCutoutTemplateList()) {
          if(existingTemplate.name === name) {
            if(confirm('Er bestaat al een sjabloon met de naam "'+name+'". Wil je deze overschrijven?')) {
              Container.removeCustomCutoutTemplate(existingTemplate);
            } else {
              return;
            }
          }
        }

        this.newCutoutTemplate.name = name;
        Container.addCustomCutoutTemplate(this.newCutoutTemplate);
        this.templateListRecomputeCounter++;
        $('#templates_add_modal').modal('hide');
      }
    },
    updateTemplate(oldTemplate: CutoutTemplate<any, any, any>) {
      const name = oldTemplate.name;
      if(confirm('Weet je zeker dat je "'+name+'" wilt overschrijven?')) {
        Container.removeCustomCutoutTemplate(oldTemplate);
        this.newCutoutTemplate.name = name;
        Container.addCustomCutoutTemplate(this.newCutoutTemplate);
        this.templateListRecomputeCounter++;
        $('#templates_add_modal').modal('hide');
      }
    },
    deleteTemplate(event, template: CutoutTemplate<any, any, any>) {
      event.stopPropagation();
      if(confirm('Weet je zeker dat je "'+template.name+'" wilt verwijderen? Deze actie kan niet worden teruggedraaid.')) {
        Container.removeCustomCutoutTemplate(template);
        this.templateListRecomputeCounter++;
      }
    },
    addCutout() {
      this.userInterface.addCutout();
    },
    addCutoutFromTemplate(template: CutoutTemplate<any, any, any>) {
      this.userInterface.addCutoutFromTemplate(template);
    },
  }
});
</script>

<style scoped>

</style>
