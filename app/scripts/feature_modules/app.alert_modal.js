/*
 * alert_modal.js
 * <Module name> feature module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, app */

app.alert_modal = (function () {
  'use strict';
  
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
        main_html: Handlebars.compile($('#app-alert-modal-template').html())
    },
    stateMap  = { $container : null },
    jqueryMap = {},

    showAlertModal,
    onDeleteNotesClick,
    onConfirm,

    setJqueryMap, configModule, initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
  // example : getTrimmedString
  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$append_target.find('#app-modal-alert');
    jqueryMap = { 
      $container : $container 
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------

  showAlertModal = function( evt, type ){
    var action;
    jqueryMap.$container.modal();
  };

  onConfirm = function( ){
    var action;
    jqueryMap.$container.on('click','.btn-main-action', function( evt ){
      action = $(this).data('modal-action');
      console.log('$(this) is: ', $(this));
      switch( action ){
        case "delete-notes":
          alert('gonna delete notes');
          // delete notes here
          break;
      }
    });
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
    onConfirm();
    $.gevent.subscribe( jqueryMap.$container, 'app-alert-modal', showAlertModal );
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
