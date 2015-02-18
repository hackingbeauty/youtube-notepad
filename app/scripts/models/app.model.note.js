/*
 * app.model.note.js
 * Note model
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true, camelcase : false, sub: true
*/
/*global TAFFY, app, Firebase */

app.model.note = (function () {
  'use strict';
  var
  db,

  create,
  edit,
  receive,
  get_all,
  get_all_by_video_id,
  set_start_time,
  get_start_time,
  get_by_id,
  get_saved_notes,
  delete_notes,
  delete_video,
  initModule;

  create = function( note, startTime, videoTitle ){
    var
      videoStartTime = startTime,
      endTime = app.model.player.get_current_time(),
      videoID = app.model.video.get_video_id(),
      userUID = app.model.user.get_user().uid,
      videosNotesRef, noteID, noteObj;

    note = db.insert({
      videoID     : videoID,
      note        : note,
      startTime   : videoStartTime,
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
      var dataObjects = data.val(), key;

      for(key in dataObjects){
        notes.push( dataObjects[key] );
      }

      // // Sort ascending
      // notes.sort(function(a,b){
      //   return parseInt(a.startTime, 10) - parseInt(b.startTime, 10);
      // });

      callback( notes );
    });
  };

  get_by_id = function( note ){
    return note.first();
  };

  receive = function(){
    firebaseRef.on('child_added', function(snapshot){

    });
  };

  set_start_time = function( ){
    var
      currentTime = app.model.player.get_current_time(),
      startTime;

    startTime =  currentTime !== '' ? currentTime : '0:00';
    return startTime;
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
      videosNotesRef, noteID, i;

    for(i = 0; i < notes.length; i++){
      noteID = notes[i];

      videosNotesRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/'+userUID+'/videos/' + videoID + '/notes/' + noteID);
      videosNotesRef.remove();

      db(noteID).remove();
    }
  };

  delete_video = function( videoID ){
    var userUID = app.model.user.get_user().uid, videoRef; 
    videoRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/'+userUID+'/videos/' + videoID);
    videoRef.remove();
  };

  initModule = function(){
    db = TAFFY();
    db.store('videos');
  };

  return {
    create                : create,
    edit                  : edit,
    receive               : receive,
    get_all               : get_all,
    get_all_by_video_id   : get_all_by_video_id,
    set_start_time        : set_start_time,
    get_start_time        : get_start_time,
    get_saved_notes       : get_saved_notes,
    delete_notes          : delete_notes,
    delete_video          : delete_video,
    get_by_id             : get_by_id,
    initModule            : initModule
  };


}());
