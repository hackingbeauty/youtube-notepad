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
      new_note_item_html  : Handlebars.compile($('#app-notepad-new-note-item-template').html())
    },
    stateMap  = { $container : null },
    jqueryMap = {},
    deleteNoteCount = 0,
    
    appendNote,

    onNoteEdit,
    refreshNotePad,
    onRecordedTimeClick,
    onRemoveClick,
    onDeleteNotesBtnClick,

    setJqueryMap,
    configModule,
    initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------

  //-------------------- END UTILITY METHODS -------------------

  appendNote = function( evt, note ){
    jqueryMap.$notesList.prepend(
      configMap.note_item_html(note)
    );
  };

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$append_target.find('#app-notepad');

    jqueryMap = {
      $container              : $container,
      $notesList              : $container.find('ul#notes-list'),
      $videoTime              : $container.find('.video-time'),
      $note                   : $container.find('.note input:last'),
      $deleteNotesBtn         : $container.find('#delete-notes-btn'),
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
  refreshNotePad = function( id ){
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

  /*
   *  Purpose: Remove note when clicked
  */
  onRemoveClick = function( ){
    var $inputCheckBox;
    jqueryMap.$notesList.on('click', '.remove', function(){
      $inputCheckBox = $(this);
      if($inputCheckBox.is(':checked')){
        deleteNoteCount++;
      } else {
        deleteNoteCount--;
      }
      if(deleteNoteCount > 1){
        jqueryMap.$deleteNotesBtn.val('Delete ' + deleteNoteCount + ' Notes');
      } else if(deleteNoteCount === 1){
        jqueryMap.$deleteNotesBtn.val('Delete ' + deleteNoteCount + ' Note');
      } else {
        jqueryMap.$deleteNotesBtn.val('Delete Notes');
      }                     
    });
  };

  onDeleteNotesBtnClick = function(){
    var
      notesList,
      notesToDelete = [];

    jqueryMap.$deleteNotesBtn.on('click', function(){
      notesList = jqueryMap.$notesList.find('input:checked').parent();
      for(var i = 0; i < notesList.length; i++){
        notesToDelete.push( $(notesList[i]).data('id') );
        $(notesList[i]).remove();
      }
      app.model.note.delete_notes( notesToDelete );
    });
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
    onRemoveClick();
    onDeleteNotesBtnClick();
    $.gevent.subscribe( jqueryMap.$container, 'app-new-note', appendNote );
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
