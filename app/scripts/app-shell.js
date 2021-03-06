/*
 * module_template.js
 * Template for browser feature modules
 *
 * Michael S. Mikowski - mike.mikowski@gmail.com
 * Copyright (c) 2011-2012 Manning Publications Co.
*/

/*jslint         browser    : true, continue : true,
  devel  : true, indent     : 2,    maxerr   : 50,
  newcap : true, nomen      : true, plusplus : true,
  regexp : true, sloppy     : true, vars     : false,
  white  : true, camelcase  : false
*/

/*global $, app, Handlebars, unescape */

app.shell = (function () {
  'use strict';

  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      main_html: Handlebars.compile($('#app-shell-template').html())
    },
    stateMap  = { $container : null },
    jqueryMap = {},

    updateURL,
    parseRoute,
    closeModalsOnClick,

    setJqueryMap,
    configModule,
    initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
  // example : getTrimmedString
  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$container;

    jqueryMap = {
      $container        : $container,
      $shell            : $container.find('#app-shell'),
      $shellBody        : $container.find('#app-shell-body'),
      $videoForm        : $container.find('#app-video-form'),
      $saveNotesBtn     : $container.find('#save-notes'),
      $headerContainer  : $('#app-header-container'),
      $yourNotes        : $('#app-your-notes-module-container'),
      $yourTags         : $('#app-your-tags-module-container')
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------

  updateURL = function( event, videoID ){
    //This function gets executed 2x and I don't like that
    $.uriAnchor.setAnchor({
      video_id : videoID
    });
  };

  closeModalsOnClick = function(){
    $('html').on('click',function( ){
      $.gevent.publish( 'app-close-modals', [ ] );
    });
  };

  parseRoute = function(){
    var
      routeHash = window.location.hash.substr(2),
      videoID,
      url,
      searchTerm;

    if(/video_id/.test( routeHash )){
      videoID  = app.util.parseVideoID( window.location.href );
      url      = 'http://www.youtube.com/watch?v=' + videoID;

      app.model.video.check_video(
        videoID,
        function(){
          app.model.video.set_video_id( videoID );
          app.model.video.set_video_data( videoID );
          $.gevent.publish( 'app-load-video',               [ videoID ] );
          $.gevent.publish( 'app-start-load-of-video',      [ videoID ] );
          $.gevent.publish( 'app-get-video-tags',           [ videoID ] );
        },
        function(){
          alert('video not found!');
        }
      );
    }

    if( /search/.test( routeHash )){
      searchTerm = unescape(routeHash.split('=')[1]);
      app.model.video.get_results( searchTerm );
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
  initModule = function ( $container ) {
    var dataMode;
    dataMode = window.location.host === 'localhost:9000' ? 'dev' : 'prod';
    app.config.setDataMode( dataMode );
    console.log('----------- Data Mode = ' + app.config.getDataMode() + ' -----------');
    
    stateMap.$container = $container;
    $container.html(  configMap.main_html() );
    setJqueryMap();

    app.model.video.load_library(function(){
      parseRoute(); // must do first time
    });

    app.header.initModule                 ( jqueryMap.$headerContainer );
    app.login_modal.initModule            ( jqueryMap.$shellBody );
    app.search_results_modal.initModule   ( jqueryMap.$shellBody );
    app.video_control_panel.initModule    ( jqueryMap.$shellBody );
    app.search_box.initModule             ( jqueryMap.$shellBody );
    app.notepad.initModule                ( jqueryMap.$shellBody );
    app.alert_modal.initModule            ( jqueryMap.$shellBody );
    app.your_tags.initModule              ( jqueryMap.$yourTags  );
    app.note_input.initModule             ( jqueryMap.$shellBody );
    app.speed_controls.initModule         ( jqueryMap.$shellBody );
    app.tag_notes.initModule              ( jqueryMap.$shellBody );

    closeModalsOnClick();
  
    $(window)
      .bind( 'hashchange', parseRoute );
    
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
