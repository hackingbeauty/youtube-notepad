/*
 * app.model.note.js
 * Note model
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global TAFFY, $, app */

app.model.note = (function () {
  'use strict';
  var
    configMap = { },
    stateMap  = { },

  isFakeData = false,
  db,

  create,
  edit,
  receive,
  get_all,
  get_all_by_video_id,
  set_start_time,
  get_start_time,
  get_by_id,
  save_all_notes,
  get_saved_notes,
  delete_notes,
  delete_video,
  initModule;

  create = function( note, startTime, videoTitle ){
    var 
        videoID = app.model.video.get_video_id(),
        startTime = startTime,
        endTime = app.model.player.get_current_time(),
        videoData = app.model.video.get_video_data(),
        videoID = app.model.video.get_video_id(),
        userUID = app.model.user.get_user().uid,
        videosRef, notesRef, videosNotesRef, noteID, noteObj;

    note = db.insert({
      videoID     : videoID,
      note        : note,
      startTime   : startTime,
      videoTitle  : videoTitle
    });

    startTime = null;
    endTime = null;

    noteID  = get_by_id( note )['___id'];
    noteObj = get_by_id( note );

    videosNotesRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/'+userUID+'/videos/' + videoID + '/' + '/notes/' + noteID);
    videosNotesRef.set( noteObj );

    return note.get()[0];
  };

  edit = function( videoID, noteID, note ){
    var
      videoNotesRef,
      noteObj,
      userUID = app.model.user.get_user().uid;

    noteObj = {
      note: note
    };

    videoNotesRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/'+userUID+'/videos/' + videoID + '/' + '/notes/' + noteID);
    videoNotesRef.update( noteObj );
  };

  get_all = function(){
    return db().order('videoTime').get();
  };

  get_all_by_video_id = function( videoID, callback ){
    var
      notes = [],
      videoNotesRef,
      userUID = app.model.user.get_user().uid;

    videoNotesRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/' + userUID + '/videos/' + videoID + '/notes/');
    videoNotesRef.once('value', function( data) {
      var dataObjects = data.val();

      for(var key in dataObjects){
        notes.push( dataObjects[key] );
      }

      // Sort descending
      notes.sort(function(a,b){
        return parseInt(b.startTime) - parseInt(a.startTime);
      });

      callback( notes);
    });
  };

  get_by_id = function( note ){
    return note.first();
  }

  receive = function(){
    firebaseRef.on('child_added', function(snapshot){

    });
  };

  set_start_time = function( ){
    var currentTime = app.model.player.get_current_time();
    startTime =  currentTime !== "" ? currentTime : "0:00";
    return startTime;
  };

  save_all_notes = function(){
    var noteID,
        notesRef,
        videosRef,
        videosNotesRef,
        notes = app.model.note.get_all_by_video_id( videoID );

    // for(var i = 0; i < notes.length; i++){
    //   noteID = get_id( notes[i] );
    //   notesRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/'+userUID+'/notes/' + noteID);
    //   notesRef.set( notes[i] ); 

    //   videosNotesRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/'+userUID+'/videos/' + videoID + '/' + noteID);
    //   videosNotesRef.set( notes[i] );
    // }
  };

  get_saved_notes = function( callback ){
    var 
      userNotesRef,
      userUID = app.model.user.get_user().uid;

    userNotesRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/' + userUID + '/videos/');
    userNotesRef.once('value', function(data) {
      callback( data.val() );
    });
  };

  delete_notes = function( notes ){
    var 
      userUID = app.model.user.get_user().uid,
      videoID = app.model.video.get_video_id(),
      videosNotesRef;

    for(var i = 0; i < notes.length; i++){

      videosNotesRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/'+userUID+'/videos/' + videoID + '/notes/' + noteID);
      videosNotesRef.remove();

      db(noteID).remove();
    }
  };

  delete_video = function( videoID ){
    var userUID = app.model.user.get_user().uid;
    var videoRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/'+userUID+'/videos/' + videoID);
    videoRef.remove();
  };

  initModule = function(){
    // db = TAFFY();
    // db.store('videos');
  };

  return {
    create                : create,
    edit                  : edit,
    receive               : receive,
    get_all               : get_all,
    get_all_by_video_id   : get_all_by_video_id,
    set_start_time        : set_start_time,
    get_start_time        : get_start_time,
    save_all_notes        : save_all_notes,
    get_saved_notes       : get_saved_notes,
    delete_notes          : delete_notes,
    delete_video          : delete_video,
    get_by_id             : get_by_id,
    initModule            : initModule
  };


}());
