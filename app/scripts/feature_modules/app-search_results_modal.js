/*
 * app.search_results_modal.js
 * Notes list Modal feature module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true, sub: true,  camelcase: false
*/
/*global $, app, Handlebars */

app.search_results_modal = (function () {
  'use strict';
  
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      main_html    : Handlebars.compile($('#app-search-results-modal-template').html()),
      content_html : Handlebars.compile($('#app-search-results-content-template').html())
    },
    stateMap  = { $container : null },
    jqueryMap = {},

    showSearchResults,
    closeModal,
    onLoadNoteClick,
    onCloseModal,
    addSearchResult,

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
    var $container = stateMap.$append_target.find('#app-search-results-list');

    jqueryMap = {
      $container        : $container,
      $closeNotesBtn    : $container.find('#close-notes-modal-btn'),
      $body             : $container.find('#app-search-results-list-body'),
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

  addSearchResult = function( evt, searchResult ){
    var 
      videoID = searchResult.id.videoId,
      $videoThumbnail,
      $videoThumbnailParent,
      findStr = '[data-video-id="' + videoID + '"]';

    if(searchResult.metaData.watched){
      $videoThumbnail = jqueryMap.$body.find(findStr);
      $videoThumbnailParent = $videoThumbnail.parent();
      $videoThumbnailParent.append('<core-icon-button icon="done" class="msg">Watched</core-icon-button>');
      $videoThumbnailParent.addClass('watched');
    }
  };

  closeModal = function(){
    jqueryMap.$body.empty();
    jqueryMap.$container.modal('hide');
  };

  onCloseModal = function(){
    jqueryMap.$container.on('hidden.bs.modal', function(){
      var 
        anchorMap,
        routeHash = window.location.hash.substr(2);

      if(routeHash.indexOf('search') > -1){ // If route has word "search", then clear it
        anchorMap = $.uriAnchor.makeAnchorMap();
        delete anchorMap['notes'];
        delete anchorMap['search'];
        $.uriAnchor.setAnchor( $.extend( anchorMap, { notepad: 'opened' } ) );
        jqueryMap.$body.empty();
      }
    });
  };

  onLoadNoteClick = function(){
    var videoID;
    jqueryMap.$container.on('click','.load-note', function(){
      videoID = $(this).data('video-id');
      $.uriAnchor.setAnchor( { video_id : videoID } );
      closeModal();
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
    $.gevent.subscribe( jqueryMap.$container, 'app-video-search-results',       showSearchResults );
    $.gevent.subscribe( jqueryMap.$container, 'app-video-search-result-found',  addSearchResult   );
    onCloseModal();
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
