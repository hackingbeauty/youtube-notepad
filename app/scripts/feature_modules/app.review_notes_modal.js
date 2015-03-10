/*
 * review_notes_modal.js
 * <Module name> feature module
*/

/*jslint         browser    : true, continue : true,
  devel  : true, indent     : 2,    maxerr   : 50,
  newcap : true, nomen      : true, plusplus : true,
  regexp : true, sloppy     : true, vars     : false,
  white  : true, camelcase  : false
*/

/*global $, app, Handlebars */

app.review_notes_modal = (function () {
  'use strict';
  
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      main_html: Handlebars.compile($('#app-review-notes-modal-template').html()),
      content_html : Handlebars.compile($('#app-review-notes-content-template').html())
    },
    stateMap  = { $container : null },
    jqueryMap = {},

    getNotes,

    setJqueryMap, configModule, initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
  // example : getTrimmedString
  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$append_target.find('#app-review-notes-modal');

    jqueryMap = { 
      $container  : $container, 
      $body       : $container.find('#app-review-notes-body')
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  getNotes = function( evt, tag ){
    jqueryMap.$body.empty();

    app.model.note.get_all_by_tag( tag, function( notesData ){
      jqueryMap.$container.modal();

      jqueryMap.$body.append(
        configMap.content_html({
          metaData  : notesData.metaData,
          notes     : notesData.notes
        })
      );

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
    $.gevent.subscribe( jqueryMap.$container, 'app-review-notes',  getNotes );
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
