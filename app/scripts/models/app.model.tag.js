/*
 * app.model.tag.js
 * Tag model
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true, camelcase : false, loopfunc : true
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
    delete_tags,

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
    } else {
      callback (0);
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
      userUID = app.model.user.get_user().uid;

    tagsRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/' + userUID);
    tagsRef.child('/tags/' + tag + '/').once('value', function( data ){
      var 
        listOfVideosObj = data.val(), 
        listOfVideosKeysArr = [],
        listOfVideosArr = [],
        key, 
        videoID,
        videoObj,
        i;

      for(key in listOfVideosObj){
        listOfVideosKeysArr.push(key);
      }

      for(i=0; i< listOfVideosKeysArr.length; i++){
        videoID = listOfVideosKeysArr[i];
        
        (function( i, videoID ){
          tagsRef.child('/videos/' + videoID).once('value' , function( data ){
            videoObj = data.val();
            videoObj.videoID = videoID;

            listOfVideosArr.push( videoObj );

            if( i === listOfVideosKeysArr.length - 1 ){  
              callback( listOfVideosArr );
            }

          });
        }( i, videoID ));
      }
    });

  };

  // Different from remove_tag which removes a tag from an input.
  // delete_tag actually deletes the tag on the backend
  delete_tags = function( tagOrTags ){
    var 
      i, 
      tagRef,
      tag,
      videoTagRef,
      currentVideoID = app.model.video.get_video_id(),
      userUID = app.model.user.get_user().uid;

    if( tagOrTags.constructor === Array ){
      for(i = 0 ; i < tagOrTags.length; i++){
        tag = tagOrTags[i];
        tagRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/'+userUID+'/tags/' + tag);
        tagRef.remove();
        videoTagRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/' + userUID + '/videoTags/' + currentVideoID + '/' + tag  );
        videoTagRef.remove();
      }
    } else {
      tag = tagOrTags;
      tagRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/'+userUID+'/tags/' + tag);
      tagRef.remove();
      videoTagRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/' + userUID + '/videoTags/' + currentVideoID + '/' + tag  );
      videoTagRef.remove();
    }
  };

  initModule = function(){

  };

  return {
    add_tag             : add_tag,
    remove_tag          : remove_tag,
    get_all             : get_all,
    get_all_by_video_id : get_all_by_video_id,
    get_all_by_tag      : get_all_by_tag,
    delete_tags         : delete_tags,
    initModule          : initModule
  };

}());
