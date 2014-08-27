/*
 * app.model.user.js
 * User model
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/* global TAFFY, $, app */

app.model.user = (function () {
  'use strict';
  var
    configMap = { anon_id : 'a0' },
    stateMap  = {
      anon_user             : null,
      user                  : null,
    },
    firebaseAuth = null,
    authStatus = false,

    sign_in,
    get_user,
    get_display_name,
    get_first_name,
    get_photo,
    sign_out,
    is_authenticated,

    initModule,
    _userProto,
    _make_user,
    _set_authentication_listener;

  // User prototype
  // ---------------------
  _userProto= {
    get_is_anon : function () {
      return this.uid === stateMap.anon_user.uid;
    },
    is_signed_in : function(){
      return "not sure";
    }
  };

  // User factory
  // ---------------------
  _make_user = function( userObj ){
    var user,
        uid       = userObj.uid,
        id        = userObj.id,
        name      = userObj.name,
        provider  = userObj.provider,
        photo     = userObj.photo;

    if ( uid === undefined || ! name ) {
      throw 'client id and name required';
    }

    user          = Object.create( _userProto );
    user.uid      = uid;
    user.name     = name;
    user.provider = provider;
    user.photo    = photo;

    if ( id ) { user.id = id; }
    return user;
  };

  _set_authentication_listener = function(){
    var photo;
    firebaseAuth =  new FirebaseSimpleLogin(firebaseRef, function(error, user) {
      if (error) {
        console.log(error);
      } else if (user) {
        stateMap.user.uid = user.id; //The uid is the id value that Firebase returns
        stateMap.user.provider = user.provider;
        stateMap.user.name = user.displayName;
        
        stateMap.user.first_name = user.thirdPartyUserData.first_name;

        if( user.provider === 'facebook'){
          photo = user.thirdPartyUserData.picture.data.url;
        } else if (user.provider === 'twitter'){
          photo = user.thirdPartyUserData.profile_image_url;
        }

        stateMap.user = _make_user({
          uid       : user.id,
          name      : user.displayName,
          provider  : user.provider,
          photo     : photo
        });

        $.gevent.publish( 'app-authentication-status', [ 'signed-in' ] );

        authStatus = true;

      } else {
        stateMap.user.uid = configMap.anon_id;
        stateMap.user.provider = null;
        stateMap.user.name = "anonymous";
        $.gevent.publish( 'app-authentication-status', [ 'signed-out' ] );
      }
    });
  }

  sign_in = function( provider ){
    firebaseAuth.login( provider );
  };

  sign_out = function(){
    firebaseAuth.logout();
  };

  is_authenticated = function(){
    return authStatus;
  };

  get_user = function(){
    return stateMap.user;
  };

  get_display_name = function(){
    return stateMap.user.name;
  };

  get_first_name = function(){
    return stateMap.user.first_name;
  };

  get_photo = function(){
    return stateMap.user.photo;
  }

  initModule = function(){
    stateMap.anon_user = _make_user({
      uid       : configMap.anon_id,
      name      : 'anonymous',
      provider  : null,
      photo     : null
    });
    stateMap.user = stateMap.anon_user;
    _set_authentication_listener(); // Listen for authentication events
  }

  return {
    sign_in           : sign_in,
    sign_out          : sign_out,
    get_user          : get_user,
    get_display_name  : get_display_name,
    get_first_name    : get_first_name,
    get_photo         : get_photo,
    is_authenticated  : is_authenticated,
    initModule        : initModule
  };

}());
