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
  get_id,
  save_all_notes,
  delete_notes,
  initModule;

  create = function( note, startTime ){
    var 
        note,
        videoID = app.model.video.get_video_id(),
        startTime = startTime,
        endTime = app.model.player.get_current_time();

    note = db.insert({
      videoID   : videoID,
      note      : note,
      startTime : startTime
    });

    startTime = null;
    endTime = null;

    return note.get()[0];
  };

  edit = function( id, val ){
    db(id).update( { "note" : val } );
  }

  get_all = function(){
    return db().order('videoTime').get();
  };

  get_all_by_video_id = function( videoID ){
    return db({ videoID: videoID }).get();
  };

  get_id = function( note ){
    return note['___id'];
  }

  receive = function(){
    firebaseRef.on('child_added', function(snapshot){
      console.log('snapshot is: ', snapshot.val());
    });
  };

  set_start_time = function( ){
    var currentTime = app.model.player.get_current_time();
    startTime =  currentTime !== "" ? currentTime : "0:00";
    return startTime;
  };

  save_all_notes = function(){
    var noteID,
        userRef,
        notes   = get_all_by_video_id( app.model.video.get_video_id() ),
        userUID = app.model.user.get_user().uid;

    alert('testing123 testing - about to save all notes');

    for(var i = 0; i < notes.length; i++){
      noteID = get_id( notes[i] );
      userRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/'+userUID+'/notes/' + noteID);
      userRef.push( notes[i] ); // need to check if data already exists..if it does...don't add
    }
  };

  delete_notes = function( notes ){
    for(var i = 0; i < notes.length; i++){
      db(notes[i]).remove();
    }
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
    save_all_notes        : save_all_notes,
    delete_notes          : delete_notes,
    get_id                : get_id,
    initModule            : initModule
  };


}());
