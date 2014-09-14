/*
 * app.notes_list_modal.js
 * Notes list Modal feature module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global $, app */

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

    openModal,
    onCloseModal,
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
    var $container = stateMap.$append_target.find('#app-notes-list-modal');

    jqueryMap = { 
      $container     : $container,
      $closeNotesBtn : $container.find('#close-notes-modal-btn'),
      $modalBody     : $container.find('.modal-body') 
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  
  openModal = function () {;
    if(app.model.user.is_authenticated()){
      jqueryMap.$modalBody.empty(); 
      jqueryMap.$container.modal();
      app.model.note.get_saved_notes(function( data ){
        jqueryMap.$modalBody.append(
          configMap.content_html({
            notes : data
          })
        );
      });
    }
  };

  onCloseModal = function(){
    var anchorMap;
    jqueryMap.$container.on('hidden.bs.modal', function () {
      // anchorMap = $.extend($.uriAnchor.makeAnchorMap(),{ notepad: 'enabled'});
      $.uriAnchor.setAnchor( { notepad: 'enabled'}); 
      jqueryMap.$modalBody.empty();   
    });
  };

  onLoadNoteClick = function(){
    var videoID;
    jqueryMap.$container.on('click','.load-note-btn', function(){
      videoID = $(this).data('video-id');
      $.uriAnchor.setAnchor({
        video_id : videoID
      });
      jqueryMap.$container.modal('hide');
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
    spa.butil.setConfigMap({
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
    $.gevent.subscribe( jqueryMap.$container, 'app-show-notes-modal', openModal );
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
