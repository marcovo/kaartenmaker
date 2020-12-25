<template>
  <div class="btn-group">
    <div class="dropdown">
      <button type="button" class="btn btn-sm btn-outline-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <svg width="1em" height="1em" viewBox="0 0 16 16" class="align-baseline bi bi-info-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M2 4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v11.5a.5.5 0 0 1-.777.416L7 13.101l-4.223 2.815A.5.5 0 0 1 2 15.5V4zm2-1a1 1 0 0 0-1 1v10.566l3.723-2.482a.5.5 0 0 1 .554 0L11 14.566V4a1 1 0 0 0-1-1H4z"/>
          <path fill-rule="evenodd" d="M4.268 1H12a1 1 0 0 1 1 1v11.768l.223.148A.5.5 0 0 0 14 13.5V2a2 2 0 0 0-2-2H6a2 2 0 0 0-1.732 1z"/>
        </svg>
      </button>
      <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
        <a class="dropdown-item" href="#" v-on:click="addBookmark">Opslaan...</a>
        <div class="dropdown-divider" v-if="bookmarkList.length > 0"></div>
        <div class="dropdown-item d-flex mr-3" type="button" v-for="bookmark in bookmarkList" :key="bookmark.name" v-on:click="openBookmark(bookmark)">
          <div class="flex-grow-1">{{ bookmark.name }}</div>

          <button class="btn btn-sm btn-control" type="button" v-on:click="deleteBookmark($event, bookmark)">
            <svg width="1em" height="1em" viewBox="0 0 16 16" class="align-baseline bi bi-trash-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div
        class="modal"
        tabindex="-1"
        role="dialog"
        id="bookmarks_add_modal"
        data-backdrop="false"
        data-keyboard="false"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Werkruimte opslaan</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p class="small">
              Sla de huidige werkruimte op om deze later weer te kunnen gebruiken.
              <span v-if="bookmarkList.length > 0">Je kunt een nieuwe werkruimte maken, of een bestaande overschrijven.</span>
            </p>

            <h5 v-if="bookmarkList.length > 0">Als nieuwe werkruimte opslaan</h5>
            <div class="form-group">
              <label for="bookmark_name">Naam</label>

              <div class="input-group mb-3">
                <input type="text" class="form-control" id="bookmark_name" placeholder="Typ een naam...">
                <div class="input-group-append">
                  <button class="btn btn-primary" type="button" v-on:click="setBookmark">Opslaan</button>
                </div>
              </div>
            </div>

            <div v-if="bookmarkList.length > 0">
              <hr />
              <h5>Een bestaande werkruimte overschrijven</h5>
              <div class="list-group">
                <button
                    type="button"
                    class="list-group-item list-group-item-action"
                    v-for="bookmark in bookmarkList"
                    v-on:click="updateBookmark(bookmark)"
                >
                  {{ bookmark.name }}
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
import Bookmarks, {Bookmark} from "../Main/Bookmarks";

export default Vue.component('bookmarks', {
  props: {
    bookmarks: Bookmarks,
  },
  data () {
    return {
      bookmarkListRecomputeCounter: 0,
    };
  },
  watch: {

  },
  computed: {
    bookmarkList: function() {
      this.bookmarkListRecomputeCounter;
      return this.bookmarks.getBookmarks();
    }
  },
  methods: {
    addBookmark() {
      $('#bookmark_name').val('');
      $('#bookmarks_add_modal').modal();
    },
    setBookmark() {
      const name = $('#bookmark_name').val().trim();
      if(name.length > 0 && (!this.bookmarks.hasBookmark(name) || confirm('Er bestaat al een werkruimte met de naam "'+name+'". Wil je deze overschrijven?'))) {
        this.bookmarks.setBookmark(name);
        this.bookmarkListRecomputeCounter++;
        $('#bookmarks_add_modal').modal('hide');
      }
    },
    updateBookmark(bookmark: Bookmark) {
      if(confirm('Weet je zeker dat je "'+bookmark.name+'" wilt overschrijven?')) {
        this.bookmarks.setBookmark(bookmark.name);
        this.bookmarkListRecomputeCounter++;
        $('#bookmarks_add_modal').modal('hide');
      }
    },
    deleteBookmark(event, bookmark: Bookmark) {
      event.stopPropagation();
      if(confirm('Weet je zeker dat je "'+bookmark.name+'" wilt verwijderen? Deze actie kan niet worden teruggedraaid.')) {
        this.bookmarks.deleteBookmark(bookmark.name);
        this.bookmarkListRecomputeCounter++;
      }
    },
    openBookmark(bookmark: Bookmark) {
      this.bookmarks.applyBookmark(bookmark.name);
    },
  }
});
</script>

<style scoped>

</style>
