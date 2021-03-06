/*
 * app.note_input.js
 * Note Input feature module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, app, Handlebars */

app.note_input = (function () {
  'use strict';
  
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      main_html : Handlebars.compile($('#app-note-input-template').html())
    },
    stateMap  = { $container : null },
    jqueryMap = {},
    inputKeypressCount = 0,

    _enterNewNote,

    onNoteEnter,
    onCreateNoteBtnClick,
    onKeyPressPause,

    setJqueryMap, configModule, initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
  _enterNewNote = function(){
    var
        note,
        inputValue,
        startTime,
        videoTitle;

    inputValue = $.trim(jqueryMap.$newNoteInput.val());

    if(inputValue !== ''){

      if(app.model.user.is_authenticated()){
        app.model.player.play_video();
        startTime = app.model.player.get_current_time();
        videoTitle = app.model.video.get_video_data().title;
        note = app.model.note.create( inputValue, startTime, videoTitle );
        $.gevent.publish( 'app-new-note', note );
        jqueryMap.$newNoteInput.val('');
        inputKeypressCount = 0;
      } else {
        $.gevent.publish( 'app-login-modal', [ ] );
      }
    }
  };
  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$append_target;

    jqueryMap = {
      $container     : $container,
      $newNoteInput  : $container.find('#new-note-input'),
      $createNoteBtn : $container.find('#new-note-btn')
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------

  /*
   *  Purpose: Called when user enters a note in the notepad
   */
  onNoteEnter = function(){
    jqueryMap.$newNoteInput.keypress(function( evt ){

        // If enter key was pressed
        if (evt.which === 13) {
          _enterNewNote();
        }
      });
  };

  /*
   *  Purpose: Pause video when user is typing
   */
  onKeyPressPause = function(){
    var currentVideoTime;
    jqueryMap.$newNoteInput.keypress(function(e){
      if(inputKeypressCount === 1){
        app.model.player.pause_video();
      }
      inputKeypressCount++;
    });
  };

  /*
   *  Purpose: Create note when "Create Note" button is clicked
   */
  onCreateNoteBtnClick = function(){
    jqueryMap.$createNoteBtn.on('click', function(evt){
      _enterNewNote();
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
    $('#app-video-control-panel').after( configMap.main_html ); // Redundant id lookup - had to do it
    setJqueryMap();
    onNoteEnter();
    onCreateNoteBtnClick();
    onKeyPressPause();
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
