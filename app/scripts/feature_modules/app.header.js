/*
 * app.header.js
 * Header feature module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true, camelcase: false
*/

/*global $, app, Handlebars */

app.header = (function () {
  'use strict';

  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      main_html           : Handlebars.compile($('#app-header-template').html()),
      auth_buttons_html   : Handlebars.compile($('#app-authentication-buttons-template').html())
    },
    stateMap  = { $container : null },
    jqueryMap = {},

    signInBtnClick,
    signOutBtnClick,
    showAuthButtons,

    setJqueryMap,
    configModule,
    initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------

  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$append_target.find('#app-header');
    jqueryMap = {
      $container              : $container,
      $authButtons            : $container.find('#app-authentication-buttons')
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------


  //------------------- BEGIN EVENT HANDLERS -------------------

  signInBtnClick = function(){ // THIS NEEDS TO BE MOVED TO USER MODEL
    jqueryMap.$container.on('click', '#sign-in', function(){
      $.gevent.publish( 'app-login-modal', [ ] );
    });
  };

  signOutBtnClick = function(){
    jqueryMap.$container.on('click', '#sign-out', function(){
      app.model.user.sign_out();
      $.gevent.publish( 'app-user-signed-out', [ ] );
    });
  };

  showAuthButtons = function( event, authStatus ){
    jqueryMap.$authButtons.empty();
    if(authStatus === 'signed-in'){
      jqueryMap.$authButtons.append(
        configMap.auth_buttons_html({
          userSignedIn  : true,
          userPhoto     : app.model.user.get_photo(),
          displayName   : app.model.user.get_display_name(),
          firstName     : app.model.user.get_first_name()
        })
      );
    }
    if(authStatus === 'signed-out'){
      jqueryMap.$authButtons.append(
        configMap.auth_buttons_html({
          userSignedIn : false
        })
      );
    }
    setJqueryMap();
  };

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
    $append_target.append( configMap.main_html() );
    setJqueryMap();
    signInBtnClick();
    signOutBtnClick();
    $.gevent.subscribe( jqueryMap.$container, 'app-authentication-status',    showAuthButtons );
    return true;
  };
  // End public method /initModule/

  // return public methods
  return {
    configModule : configModule,
    initModule   : initModule
  };
  //------------------- END PUBLIC METHODS ---------------------
}());
