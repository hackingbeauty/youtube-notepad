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
    
    _checkAndInsertVideo,
    _appendNote,
    _createNoteInput,

    isURL,
    onVideoLinkBlur,
    onNoteEnter,
    onNoteEdit,
    refreshNotePad,
    onEnterButtonClick,
    updateLinkInput,
    onRecordedTimeClick,
    onKeyPress,
    showVideoTime,
    onRemoveClick,
    onDeleteBtnClick,

    setJqueryMap, 
    configModule, 
    initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
  isURL = function( inputValue ){
    var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/
    if ( urlPattern.test( inputValue ) ){    // This should really test for youtube video urls
      return true;
    } else {
      return false;
    }
  };
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
    // jqueryMap.$container.find('.note:last').attr('data-id', note.___id);
  }

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$append_target.find('#app-notepad');

    jqueryMap = { 
      $container              : $container, 
      $youtubeLinkInput       : $container.find('#app-youtube-link'),
      $notesList              : $container.find('ul#notes-list'),
      $videoTime              : $container.find('.video-time'),
      $note                   : $container.find('.note input:last'),
      $saveNotesBtn           : $container.find('#app-notepad-save-notes'),
      $urlErrorMsg            : $container.find('#app-notepad-url-error'),
      $videoNotFoundMsg       : $container.find('#app-notepad-video-not-found-error'),
      $videoFoundMsg          : $container.find('#app-notepad-video-found'),
      $enterBtn               : $container.find('#app-notepad-enter-btn'),
      $deleteNoteBtn          : $container.find('#delete-note-btn')
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------

  /*
   *  Purpose: Check if video exists.
   *           If it does, insert it.
  */
  _checkAndInsertVideo = function( inputValue ){
    var videoID;
    if( isURL(inputValue) ){
      videoID = app.model.video.get_video_id_from_url( inputValue );
      app.model.video.check_video( 
        videoID, 
        function(){ // Success
          jqueryMap.$urlErrorMsg.hide();
          jqueryMap.$videoNotFoundMsg.hide();
          jqueryMap.$videoFoundMsg.show();
          $.gevent.publish( 'app-successfully-found-video', [ videoID ] );
        },
        function(){ // Error
          jqueryMap.$videoNotFoundMsg.show();
        }
      );
    } else {
      jqueryMap.$urlErrorMsg.show();
    }
  }

  //------------------- BEGIN EVENT HANDLERS -------------------

  /*
   *  Purpose: Called when user enters YouTube url and tabs out.
   *           If video found, it is then inserted 
  */
  onVideoLinkBlur = function( ){
    var inputValue,videoID;
    jqueryMap.$youtubeLinkInput.keydown( function(e){
      if ((e.which == 13) || (e.keyCode == 9)) { // If enter key or tab key pressed
        inputValue = $.trim($(this).val());
        _checkAndInsertVideo( inputValue );
        e.preventDefault();
      }
    });
  };

  /*
   *  Purpose: Called when user enters YouTube url and click 'Take Notes' button.
   *           If video found, it is then inserted 
  */
  onEnterButtonClick = function(){
    var inputValue;
    jqueryMap.$enterBtn.on('click', function( evt ){
      inputValue = jqueryMap.$youtubeLinkInput.val();
      _checkAndInsertVideo( inputValue );
      evt.preventDefault();
    });
  };

  /*
   *  Purpose: Called when user enters a note in the notepad
  */
  onNoteEnter = function(){
    var 
        note,
        inputValue,
        startTime,
        $notePad;

    jqueryMap.$notesList.keypress(function( evt ){
      if (evt.which == 13 && evt.target.id === 'new-note-input') {  // If enter key was pressed and
        $notePad = $(this);
        inputValue = $.trim($notePad.find('.note input:last').val());
        if(inputValue !== ''){
          startTime = $notePad.find('.note input:last').data('start-time');
          note = app.model.note.create( inputValue, startTime );
          inputKeypressCount = 0; // Reset keypress count
          _appendNote( note );
          _createNoteInput();
        }
        evt.preventDefault();
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
        currentVideoTime = app.model.player.get_current_time();
        jqueryMap.$container.find('.video-time')
          .removeClass('video-time')
          .addClass('recorded-video-time');
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
        notes           = app.model.note.get_all_by_video_id( id ),
        currentVideoID  = app.model.video.get_video_id(),
        noteCount       = notes.length,
        lastNote        = notes[notes.length-1];

    if(currentVideoID){
      $.gevent.publish( 'app-note-count', [ noteCount ] );
      jqueryMap.$notesList.empty();
      jqueryMap.$notesList.append(
        configMap.notes_list_html({
          notes: notes
        })
      );
      setTimeout(function(){
        if( lastNote ){
          $.gevent.publish( 'app-seek-in-video', [ lastNote.startTime ] );
        }
        _createNoteInput();
      },2000)
    }
  };

  /*
   *  Purpose: When a video is found, the YouTube link input is
   *           updated with the found YouTube url
  */
  updateLinkInput = function( event, videoID ){
    if(jqueryMap.$youtubeLinkInput.val() === ''){
      jqueryMap.$youtubeLinkInput.val( 'http://youtube.com/watch?v=' + videoID );
    }
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
   *  Purpose: Listen for continuously updated current video time.
   *           Show current time next to latest input
  */
  showVideoTime = function( event, time ){
    jqueryMap.$container.find('.video-time').html( time );
  };

  /*
   *  Purpose: Remove note when clicked
  */
  onRemoveClick = function( event ){
    jqueryMap.$notesList.on('click', '.remove', function(){
      deleteNoteCount++;
      deleteNoteCount > 1 ? jqueryMap.$deleteNoteBtn.val('Delete ' + deleteNoteCount + ' Notes') :
                            jqueryMap.$deleteNoteBtn.val('Delete ' + deleteNoteCount + ' Note') 
    });
  };

  onDeleteBtnClick = function(){
    var
      notesList, 
      notesToDelete = [];

    jqueryMap.$deleteNoteBtn.on('click', function(){
      notesList = jqueryMap.$notesList.find('input:checked').parent();
      for(var i = 0; i < notesList.length; i++){
        notesToDelete.push( $(notesList[i]).data('id') );
        $(notesList[i]).remove();
      }
      app.model.note.delete_notes( notesToDelete );
    });
  }

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
    onVideoLinkBlur();
    onNoteEnter();
    onNoteEdit();
    onRecordedTimeClick();
    onEnterButtonClick();
    onKeyPress();
    onRemoveClick();
    onDeleteBtnClick();
    $.gevent.subscribe( jqueryMap.$container, 'app-successfully-found-video', updateLinkInput );
    $.gevent.subscribe( jqueryMap.$container, 'app-video-time',               showVideoTime   );
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
