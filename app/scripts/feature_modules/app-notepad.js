/*
 * app.notepad.js
 * Video form feature module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true, camelcase: false
*/

/*global $, app, Handlebars */

app.notepad = (function () {
  'use strict';

  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      main_html           : Handlebars.compile($('#app-notepad-template').html()),
      notes_list_html     : Handlebars.compile($('#app-notepad-notes-template').html()),
      note_item_html      : Handlebars.compile($('#app-notepad-note-item-template').html()),
      new_note_item_html  : Handlebars.compile($('#app-notepad-new-note-item-template').html()),
      alert_html          : Handlebars.compile($('#app-delete-notes-alert-template').html())
    },
    stateMap  = { $container : null },
    jqueryMap = {},
    
    appendNote,
    onNoteEdit,
    refreshNotePad,
    onRecordedTimeClick,
    onDeleteNotesBtnClick,
    onSignOut,

    setJqueryMap,
    configModule,
    initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------

  //-------------------- END UTILITY METHODS -------------------

  appendNote = function( evt, note ){
    jqueryMap.$headerMsg.show();
    jqueryMap.$notesList.prepend(
      configMap.note_item_html(note)
    );
    setTimeout(function(){
      jqueryMap.$headerMsg.hide();
    },800);
  };

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$append_target.find('#app-notepad');

    jqueryMap = {
      $container              : $container,
      $header                 : $container.find('#app-notepad-header'),
      $headerMsg              : $container.find('#app-notepad-header-msg'),
      $notesList              : $container.find('ul#notes-list'),
      $videoTime              : $container.find('.video-time'),
      $note                   : $container.find('.note input:last'),
      $deleteNotesBtn         : $container.find('#delete-notes-btn'),
      $deleteNotesIcon        : $container.find('#delete-notes-icon'),
      $saveNotesBtn           : $container.find('#save-notes-btn'),
      $toggleHandle           : $container.find('#app-notepad-toggle-handle')
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------

  /*
   *  Purpose: Called when user edits a note via contentEditable
  */
  onNoteEdit = function(){
    var
      videoID,
      noteID,
      noteVal;

    jqueryMap.$notesList.on('blur','.note' ,function( evt ){
      videoID = $(evt.target).parent().data('video-id');
      noteID = $(evt.target).parent().data('note-id');
      noteVal = $(evt.target).html();
      app.model.note.edit( videoID, noteID, noteVal );
    });
  };

  /*
   *  Purpose: Refreshes notepad with list of notes if they exist.
  */
  refreshNotePad = function( evt, id ){
    var
      lastNote,
      currentVideoID  = app.model.video.get_video_id();

    app.model.note.get_all_by_video_id( id, function( notes ){

      jqueryMap.$notesList.empty();

      if(currentVideoID){

        if (notes){
          lastNote = notes[notes.length-1];
          jqueryMap.$notesList.append(
            configMap.notes_list_html({
              notes: notes
            })
          );
          
          jqueryMap.$deleteNotesIcon.show();

          if(lastNote){
            $.gevent.publish( 'app-seek-in-video', [ lastNote.startTime ] );
          }
        }

      }
    });
  };

  /*
   *  Purpose: Forwards video to point in time that was clicked       
  */
  onRecordedTimeClick = function( ){
    var recordedTime;
    jqueryMap.$notesList.on('click', '.recorded-video-time', function( event ){
      recordedTime = $(this).html();
      app.model.player.seek_time( recordedTime );
      event.preventDefault();
    });
  };

  onDeleteNotesBtnClick = function(){
    var 
      $checkedNotesIDs=[], 
      $checkedNotesText=[],
      $paperCheckboxNotes, 
      deleteNotesCallback, 
      $paperCheckbox;

    jqueryMap.$deleteNotesIcon.on('click', function(){
      $paperCheckboxNotes = jqueryMap.$container.find('paper-checkbox');
      $paperCheckboxNotes.each(function(){
        $paperCheckbox = $(this);
        if ( $paperCheckbox.attr('aria-checked') === 'true' ){
          $checkedNotesIDs.push( $(this).parent().data('note-id') );
          $checkedNotesText.push( $(this).parent().find('.text').html() );
        }
      });
      deleteNotesCallback = function( confirmed ){
        if(confirmed){
          app.model.note.delete_notes( $checkedNotesIDs );
          app.notepad.refreshNotePad( undefined, app.model.video.get_video_id() );
        }
        $checkedNotesIDs = [];
        $checkedNotesText = [];
      };
      $.gevent.publish( 'app-alert-modal-show', [ configMap.alert_html({ notes: $checkedNotesText }), deleteNotesCallback ] );
    });
  };

  onSignOut = function(){
    jqueryMap.$notesList.empty();
  };

  //-------------------- END EVENT HANDLERS --------------------


  //------------------- BEGIN PUBLIC METHODS -------------------
  // End public DOM method /set/

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
    onNoteEdit();
    onRecordedTimeClick();
    onDeleteNotesBtnClick();
    $.gevent.subscribe( jqueryMap.$container, 'app-load-video',        refreshNotePad );
    $.gevent.subscribe( jqueryMap.$container, 'app-new-note',          appendNote     );
    $.gevent.subscribe( jqueryMap.$container, 'app-user-signed-out',   onSignOut      );
    return true;
  };
  // End public method /initModule/

  // return public methods
  return {
    configModule    : configModule,
    initModule      : initModule,
    refreshNotePad  : refreshNotePad
  };
  //------------------- END PUBLIC METHODS ---------------------
}());
