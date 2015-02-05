/*
 * app.your_notes.js
 * Your Notes feature module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, app, Handlebars */

app.your_notes = (function () {
  'use strict';
  
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      main_html : Handlebars.compile($('#app-your-notes-template').html()),
      body_html : Handlebars.compile($('#app-your-notes-body-template').html()),
    },
    stateMap  = { $container : null },
    jqueryMap = {},

    _showNotes,

    onButtonClick,
    onLoadNoteClick,
    onDeleteNoteClick,

    setJqueryMap, configModule, initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
  _showNotes = function(){
    if(app.model.user.is_authenticated()){
      app.model.note.get_saved_notes(function( notes ){
        jqueryMap.$body.append(
          configMap.body_html({
            results: notes
          })
        );
      });
    }
  };
  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$append_target.find('#app-your-notes');

    jqueryMap = {
      $container 		  : $container, 
      $yourNotesLink 	: $container.find('#app-get-your-notes-link'),
      $body           : $container.find('#app-your-notes-body')
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  onButtonClick = function(){
  	jqueryMap.$yourNotesLink.on('click', function( evt ){
      _showNotes();
  	});
  };

  onLoadNoteClick = function(){
    var videoID;
    jqueryMap.$body.on('click','.load-note', function(){
      videoID = $(this).data('video-id');
      $.uriAnchor.setAnchor( { video_id : videoID } );
    });
  };

  onDeleteNoteClick = function(){
    var
      $videoListItem,
      videoID;

    jqueryMap.$container.on('click', '.delete-note', function(){
      $videoListItem = $(this).closest('[data-video-id]');
      videoID = $videoListItem.data('video-id').trim();
      var deleteNoteCallback = function(){
        app.model.note.delete_video( videoID );
        $videoListItem.remove();
      };
      $.gevent.publish( 'app-alert-modal-show', [ deleteNoteCallback ] );
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
    onButtonClick();
    onLoadNoteClick();
    onDeleteNoteClick();
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
