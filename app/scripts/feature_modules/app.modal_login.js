/*
 * app.modal_login.js
 * Login Modal feature module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, app */

app.modal_login = (function () {
  'use strict';

  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      login_modal_html : Handlebars.compile($('#app-modal-login-template').html())
    },
    stateMap  = { $container : null },
    jqueryMap = {},

    showLoginModal,
    providerClick,

    setJqueryMap, 
    configModule, 
    initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------

  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$append_target;
    jqueryMap = { 
      $container    : $container,
      $loginModal   : $container.find('#app-modal-login')
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------


  //------------------- BEGIN EVENT HANDLERS -------------------

  showLoginModal = function( evt, data ){
    jqueryMap.$loginModal.modal()
  }

  providerClick = function( ){
    var provider;
    jqueryMap.$loginModal.on('click','li', function( evt ){
      provider = $(evt.currentTarget).find('.btn-social').data('provider')
      app.model.user.sign_in( provider );
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
    $append_target.append( configMap.login_modal_html() );
    setJqueryMap();
    $.gevent.subscribe( jqueryMap.$container, 'app-login-modal', showLoginModal );
    providerClick();
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
