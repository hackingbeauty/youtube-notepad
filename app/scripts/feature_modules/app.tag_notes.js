/*
 * app_tag_notes.js
 * App Tag Notes feature module
*/

/*jslint         browser    : true, continue : true,
  devel  : true, indent     : 2,    maxerr   : 50,
  newcap : true, nomen      : true, plusplus : true,
  regexp : true, sloppy     : true, vars     : false,
  white  : true, camelcase  : false
*/

/*global $, app, Handlebars */

app.tag_notes = (function () {
  'use strict';
  
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      main_html: Handlebars.compile($('#app-tag-notes-template').html())
    },
    stateMap  = { $container : null },
    jqueryMap = {},

    onGetVideoTags,
    onSignOut,

    setJqueryMap, configModule, initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
  // example : getTrimmedString
  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$append_target.find('#app-tag-notes');

    jqueryMap = {
      $container : $container,
      $tagInput : $container.find('#app-tag-input')
    };
  };
  // End DOM method /setJqueryMap/

  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  onGetVideoTags = function( evt, videoID ){
    var tag;

    app.model.tag.get_all_by_video_id( videoID, function( videoTags ){

      app.model.tag.get_all( function( allUserTags ){ // Getting allUserTags for auto-suggest

        if( $('.tagit').length > 0){ //Hack: if tagit was already added to DOM, clear the previous video's tags
          jqueryMap.$tagInput.tagit('clearAndReload', videoTags );
        }

        jqueryMap.$tagInput.val( videoTags );

        jqueryMap.$tagInput.tagit({
          availableTags: allUserTags, // For auto-suggest
          singleField: true,
          removeConfirmation: true,
          afterTagAdded: function(event, ui){
            tag = ui.tagLabel;
            if(ui.duringInitialization === undefined){
              app.model.tag.add_tag( tag );
            }
          },
          afterTagRemoved: function(event, ui){
            tag = ui.tagLabel;
            if(ui.duringInitialization === undefined){
              app.model.tag.remove_tag( tag );
            }
          },
          allowSpaces: true,
          tagLimit: 5,
          placeholderText: 'Enter a Tag',
          fieldName : 'skills'
        });

        jqueryMap.$container.css('opacity','1');
      
      });
    });
  };

  onSignOut = function(){
    jqueryMap.$tagInput.tagit('clearAndReload', [] );
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
    $('#app-speed-controls').after( configMap.main_html );    
    setJqueryMap();
    $.gevent.subscribe( $('body'),             'app-get-video-tags',    onGetVideoTags );
    $.gevent.subscribe( jqueryMap.$container, 'app-user-signed-out',    onSignOut      );
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
