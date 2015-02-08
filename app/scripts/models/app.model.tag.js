/*
 * app.model.tag.js
 * Tag model
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true, camelcase : false
*/
/* global $, app, Firebase */

app.model.tag = (function () {
  'use strict';
  var

    add_tag,
    remove_tag,
    get_all,
    get_all_by_video_id,
    get_all_by_tag,

    initModule;

  add_tag = function( tag ){
    var
      tagsRef,
      videoTagsRef,
      userUID = app.model.user.get_user().uid,
      currentVideoID  = app.model.video.get_video_id();

    if(app.model.user.is_authenticated()){
      tagsRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/' + userUID + '/tags/' + tag + '/' + currentVideoID  );
      tagsRef.update({ videoID: currentVideoID });
      videoTagsRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/' + userUID + '/videoTags/' + currentVideoID + '/' + tag  );
      videoTagsRef.update({ videoID: currentVideoID });
    } else {
      $.gevent.publish( 'app-login-modal', [ ] );
    }
  };

  remove_tag = function( tag ){
    var
      tagsRef,
      videoTagsRef,
      userUID = app.model.user.get_user().uid,
      currentVideoID  = app.model.video.get_video_id();

    if(app.model.user.is_authenticated()){
      tagsRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/' + userUID + '/tags/' + tag + '/'  + currentVideoID );
      tagsRef.remove();
      videoTagsRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/' + userUID + '/videoTags/' + currentVideoID + '/' + tag  );
      videoTagsRef.remove();
    } else {
      $.gevent.publish( 'app-login-modal', [ ] );
    }
  };

  get_all = function( callback ){
    var
      tagsRef,
      allTags = [],
      userUID = app.model.user.get_user().uid;

    if( app.model.user.is_authenticated() ){
      tagsRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/' + userUID + '/tags/');
      tagsRef.once('value', function( data ) {
        var key, dataObjects = data.val();

        for(key in dataObjects){
          allTags.push( key );
        }

        callback( allTags );
      });
    }
  };

  get_all_by_video_id = function( videoID, callback ){
    var
      tagsRef,
      allTags = [],
      userUID = app.model.user.get_user().uid;

    if( app.model.user.is_authenticated() ){
      tagsRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/' + userUID + '/videoTags/' + videoID );
      tagsRef.once('value', function( data ) {
        var key, dataObjects = data.val();

        for(key in dataObjects){
          allTags.push( key );
        }

        callback( allTags );

      });
    }
  };

  get_all_by_tag = function( tag, callback ){
    var
      tagsRef,
      userUID = app.model.user.get_user().uid,
      listOfVideosArr = [];

    tagsRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/' + userUID + '/tags/' + tag + '/' );
    tagsRef.once('value', function( data ){
      var listOfVideosObj = data.val(), key;

      for(key in listOfVideosObj){
        listOfVideosArr.push( key);
      }

      console.log('listOfVideos array is: ', listOfVideosArr);

    });

    callback();
  };

  initModule = function(){

  };

  return {
    add_tag             : add_tag,
    remove_tag          : remove_tag,
    get_all             : get_all,
    get_all_by_video_id : get_all_by_video_id,
    get_all_by_tag    : get_all_by_tag,
    initModule        : initModule
  };

}());
