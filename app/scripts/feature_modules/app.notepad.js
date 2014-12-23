/*
 * app.notepad.js
 * Video form feature module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, app */

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
    inputKeypressCount = 0,
    deleteNoteCount = 0,
    
    _appendNote,
    _createNoteInput,

    onNoteEnter,
    onNoteEdit,
    refreshNotePad,
    onRecordedTimeClick,
    onKeyPress,
    onRemoveClick,
    onDeleteNotesBtnClick,
    onSaveNotesBtnClick,
    disableOrEnableBttns,
    setPosition,

    setJqueryMap, 
    configModule, 
    initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------

  //-------------------- END UTILITY METHODS -------------------

  _createNoteInput = function( ){
    jqueryMap.$notesList.append(
      configMap.new_note_item_html() 
    );
    jqueryMap.$notesList.find('.note:last input').focus();
  }

  _appendNote = function( note ){  
    jqueryMap.$container.find('.note:last').remove();
    jqueryMap.$notesList.append(
      configMap.note_item_html(note) 
    );
  }

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
      $saveNotesBtn           : $container.find('#save-notes-btn')
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------



  //------------------- BEGIN EVENT HANDLERS -------------------

  /*
   *  Purpose: Called when user enters a note in the notepad
  */
  onNoteEnter = function(){
    var 
        note,
        inputValue,
        startTime,
        videoTitle,
        $notePad;

    jqueryMap.$notesList.keypress(function( evt ){

        if (evt.which == 13 && evt.target.id === 'new-note-input') {  // If enter key was pressed and
          if(app.model.user.is_authenticated()){

            $notePad = $(this);
            inputValue = $.trim($notePad.find('.note input:last').val());
            if(inputValue !== ''){
              app.model.player.play_video();
              startTime = $notePad.find('.note input:last').data('start-time');
              videoTitle = app.model.video.get_video_data().title;
              note = app.model.note.create( inputValue, startTime, videoTitle );
              inputKeypressCount = 0; // Reset keypress count
              _appendNote( note );
              _createNoteInput();
              disableOrEnableBttns();
            }
            evt.preventDefault();
          } else {
            $.gevent.publish( 'app-login-modal', [ ] );
          }
        }
    });
  };

  /*
   *  Purpose: Called when user edits a note via contentEditable
  */
  onNoteEdit = function(){
    var elementID,
        elementVal;
    jqueryMap.$notesList.keypress(function( evt ){
      if (evt.which == 13 && evt.target.className === 'text') { 
        elementID = $(evt.target).parent().data('id');
        elementVal = $(evt.target).html();
        app.model.note.edit( elementID, elementVal );
        jqueryMap.$notesList.find('.note:last input').focus();
      }
    });
  };

  /*
   *  Purpose: Called when user enters a key in input
  */
  onKeyPress = function(){
    var currentVideoTime;
    jqueryMap.$notesList.keypress(function(e){
      if(inputKeypressCount === 1){
        app.model.player.pause_video();
        currentVideoTime = app.model.player.get_current_time();
        jqueryMap.$container.find('.note input:last').data('start-time', currentVideoTime);
      }
      inputKeypressCount++;
    });
  };

  /*
   *  Purpose: Refreshes notepad with list of notes if they exist.
  */
  refreshNotePad = function( id ){
    var 
        notes, 
        noteCount, 
        lastNote,
        currentVideoID  = app.model.video.get_video_id();

    app.model.note.get_all_by_video_id( id, function( notes ){

      jqueryMap.$notesList.empty();

      if(currentVideoID){
        disableOrEnableBttns();

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

        _createNoteInput();

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
  onRemoveClick = function( event ){
    var $inputCheckBox;
    jqueryMap.$notesList.on('click', '.remove', function(){
      $inputCheckBox = $(this);
      if($inputCheckBox.is(':checked')){
        deleteNoteCount++;
      } else {
        deleteNoteCount--;
      }
      if(deleteNoteCount > 1){
        jqueryMap.$deleteNotesBtn.val('Delete ' + deleteNoteCount + ' Notes') 
      } else if(deleteNoteCount === 1){
        jqueryMap.$deleteNotesBtn.val('Delete ' + deleteNoteCount + ' Note') 
      } else {
         jqueryMap.$deleteNotesBtn.val('Delete Notes') 
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

  disableOrEnableBttns = function(){
    app.model.note.get_all_by_video_id( app.model.video.get_video_id(), function( notes ){
      if( notes && notes.length > 0 ){
        jqueryMap.$saveNotesBtn.removeClass( 'disabled' );
        jqueryMap.$deleteNotesBtn.removeClass( 'disabled' ); 
      }
    });
  };

  onSaveNotesBtnClick = function(){
    jqueryMap.$saveNotesBtn.on('click', function(){
      // if(app.model.user.is_authenticated()){
      //   app.model.note.save_all_notes();
      // } else {
      //   $.gevent.publish( 'app-login-modal', [ ] );
      // }
    });
  };

  //-------------------- END EVENT HANDLERS --------------------


  //------------------- BEGIN PUBLIC METHODS -------------------
  // Begin public method /setPosition/
  // Example   : spa.chat.setPosition( 'closed' );
  // Purpose   : Move the chat slider to the requested position
  // Arguments :
  //   * position_type - enum('closed', 'opened', or 'hidden')
  //   * callback - optional callback to be run end at the end
  //     of slider animation.  The callback receives a jQuery
  //     collection representing the slider div as its single
  //     argument
  // Action    :
  //   This method moves the slider into the requested position.
  //   If the requested position is the current position, it
  //   returns true without taking further action
  // Returns   :
  //   * true  - The requested position was achieved
  //   * false - The requested position was not achieved
  // Throws    : none
  //
  setPosition = function ( position_type, callback ) {

    // prepare animate parameters
    switch ( position_type ){
      case 'opened' :
        jqueryMap.$container.height('92%');
        break;
      case 'closed' :
        jqueryMap.$container.height('0');
        break;
      // bail for unknown position_type
      default : 
        return false;
    }

  };
  // End public DOM method /setPosition/

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
    onNoteEnter();
    onNoteEdit();
    onRecordedTimeClick();
    onKeyPress();
    onRemoveClick();
    onDeleteNotesBtnClick();
    onSaveNotesBtnClick();
    return true;
  };
  // End public method /initModule/

  // return public methods
  return {
    configModule    : configModule,
    initModule      : initModule,
    refreshNotePad  : refreshNotePad,
    setPosition     : setPosition
  };
  //------------------- END PUBLIC METHODS ---------------------
}());
