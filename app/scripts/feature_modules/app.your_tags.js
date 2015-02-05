/*
 * app.your_tags.js
 * Your Tags feature module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, app, Handlebars */

app.your_tags = (function () {
  'use strict';
  
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      main_html : Handlebars.compile($('#app-your-tags-template').html()),
      body_html : Handlebars.compile($('#app-your-tags-body-template').html()),
    },
    stateMap  = { $container : null },
    jqueryMap = {},

    onGetAllUserTags,

    setJqueryMap, configModule, initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------

  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$append_target.find('#app-your-tags');

    jqueryMap = {
      $container : $container
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  onGetAllUserTags = function( evt, authStatus){
    var videoTags;

    if(authStatus === 'signed-in'){
      videoTags = app.model.tag.get_all( function( tags ){
        jqueryMap.$container.append(
          configMap.body_html({
            videoTags: tags
          })
        );
      });
    }
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
    $append_target.append( configMap.main_html );
    setJqueryMap();
    $.gevent.subscribe( jqueryMap.$container, 'app-authentication-status', onGetAllUserTags );
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
