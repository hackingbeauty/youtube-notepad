/*
 * app.notes_list_modal.js
 * Notes list Modal feature module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true, sub: true,  camelcase: false
*/
/*global $, app, Handlebars */

app.notes_list_modal = (function () {
  'use strict';
  
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      main_html    : Handlebars.compile($('#app-notes-list-modal-template').html()),
      content_html : Handlebars.compile($('#app-notes-list-content-template').html())
    },
    stateMap  = { $container : null },
    jqueryMap = {},

    showSearchResults,
    closeModal,
    onLoadNoteClick,

    setJqueryMap,
    configModule,
    initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
  // example : getTrimmedString
  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$append_target.find('#app-notes-list');

    jqueryMap = {
      $container        : $container,
      $closeNotesBtn    : $container.find('#close-notes-modal-btn'),
      $body             : $container.find('#app-notes-list-body'),
      $searchNotesInput : $container.find('#app-search-notes-input'),
      $deleteNoteIcon   : $container.find('.delete-note')
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  
  showSearchResults = function( evt, searchResults ){

    jqueryMap.$container.modal();
    jqueryMap.$body.append(
      configMap.content_html({
        searchQueryResults  : true,
        results             : searchResults
      })
    );
  };

  closeModal = function(){
    jqueryMap.$body.empty();
    jqueryMap.$container.modal('hide');

  };

  onLoadNoteClick = function(){
    var videoID, anchorMap;
    jqueryMap.$container.on('click','.load-note-btn', function(){
      videoID = $(this).data('video-id');
      anchorMap = $.uriAnchor.makeAnchorMap();
      closeModal();
      delete anchorMap['notes'];
      delete anchorMap['search'];
      $.uriAnchor.setAnchor( { video_id : videoID } );
    });
  };

  //-------------------- END EVENT HANDLERS --------------------

  //------------------- BEGIN PUBLIC METHODS -------------------
  // Begin public method /configModule/
  // Purpose    : Adjust configuration of allowed keys
  // Arguments  : A map of settable keys and values
  //   * color_name - color to use
  // Settings   :
  //   * configMap.settable_map declares allowed keys
  // Returns    : true
  // Throws     : none
  //
  configModule = function ( input_map ) {
    app.butil.setConfigMap({
      input_map    : input_map,
      settable_map : configMap.settable_map,
      config_map   : configMap
    });
    return true;
  };
  // End public method /configModule/


  // Begin public method /initModule/
  // Purpose    : Initializes module
  // Arguments  :
  //  * $container the jquery element used by this feature
  // Returns    : true
  // Throws     : none
  //
  initModule = function ( $append_target ) {
    stateMap.$append_target = $append_target;
    $append_target.append( configMap.main_html );
    setJqueryMap();
    $.gevent.subscribe( jqueryMap.$container, 'app-video-search-results', showSearchResults );
    onLoadNoteClick();
    return true;
  };
  // End public method /initModule/

  // return public methods
  return {
    configModule : configModule,
    initModule   : initModule
  };
  //------------------- END PUBLIC METHODS ---------------------
}());
