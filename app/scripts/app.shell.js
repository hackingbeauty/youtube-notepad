/*
 * module_template.js
 * Template for browser feature modules
 *
 * Michael S. Mikowski - mike.mikowski@gmail.com
 * Copyright (c) 2011-2012 Manning Publications Co.
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, app */

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
    onCloseModal,
    setChatAnchor,
    changeAnchorPart,
    copyAnchorMap,

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
      $container    : $container,
      $shell        : $container.find('#app-shell'),
      $shellBody    : $container.find('#app-shell-body'),
      $videoForm    : $container.find('#app-video-form'),
      $saveNotesBtn : $container.find('#save-notes')    
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
    $(document).on('click',function(){
      $.gevent.publish( 'app-close-modals', [ ] );
    });
  };

  // Returns copy of stored anchor map; minimizes overhead
  copyAnchorMap = function () {
    return $.extend( true, {}, stateMap.anchor_map );
  };

  parseRoute = function(){
    var 
        routeHash = window.location.hash.substr(2),
        route    = routeHash.split('='),
        routeKey = route[0],
        routeVal = route[1],
        videoID,
        url;

    switch( routeKey ){
      case 'video_id':
        videoID = app.util.parseVideoID(routeHash);
        url     = 'http://www.youtube.com/watch?v=' + videoID;
        app.model.video.check_video(
          videoID,
          function(){
            $.gevent.publish( 'app-load-video',               [ videoID ] );
            $.gevent.publish( 'app-start-load-of-video',      [ videoID ] );
            app.model.video.set_video_id( videoID );
            app.notepad.refreshNotePad( videoID ); 
            app.model.video.set_video_data( videoID );           
          },
          function(){
            alert('video not found!');
          }
        );
        break;
      case 'user_id':
        break;
      case 'notes':
        $.gevent.publish( 'app-show-notes', [  ] );
        break;
    }
  };

    // Begin DOM method /changeAnchorPart/
  // Purpose    : Changes part of the URI anchor component
  // Arguments  :
  //   * arg_map - The map describing what part of the URI anchor
  //     we want changed.
  // Returns    :
  //   * true  - the Anchor portion of the URI was updated
  //   * false - the Anchor portion of the URI could not be updated
  // Actions    :
  //   The current anchor rep stored in stateMap.anchor_map.
  //   See uriAnchor for a discussion of encoding.
  //   This method
  //     * Creates a copy of this map using copyAnchorMap().
  //     * Modifies the key-values using arg_map.
  //     * Manages the distinction between independent
  //       and dependent values in the encoding.
  //     * Attempts to change the URI using uriAnchor.
  //     * Returns true on success, and false on failure.
  //
  changeAnchorPart = function ( arg_map ) {
    var
      anchor_map_revise = copyAnchorMap(),
      bool_return       = true,
      key_name, key_name_dep;

    // Begin merge changes into anchor map
    KEYVAL:
    for ( key_name in arg_map ) {
      if ( arg_map.hasOwnProperty( key_name ) ) {

        // skip dependent keys during iteration
        if ( key_name.indexOf( '_' ) === 0 ) { continue KEYVAL; }

        // update independent key value
        anchor_map_revise[key_name] = arg_map[key_name];

        // update matching dependent key
        key_name_dep = '_' + key_name;
        if ( arg_map[key_name_dep] ) {
          anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
        }
        else {
          delete anchor_map_revise[key_name_dep];
          delete anchor_map_revise['_s' + key_name_dep];
        }
      }
    }
    // End merge changes into anchor map

    // Begin attempt to update URI; revert if not successful
    try {
      $.uriAnchor.setAnchor( anchor_map_revise );
    }
    catch ( error ) {
      // replace URI with existing state
      $.uriAnchor.setAnchor( stateMap.anchor_map,null,true );
      bool_return = false;
    }
    // End attempt to update URI...

    return bool_return;
  };
  // End DOM method /changeAnchorPart/

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


  // Begin callback method /setChatAnchor/
  // Example  : setChatAnchor( 'closed' );
  // Purpose  : Change the chat component of the anchor
  // Arguments:
  //   * position_type - may be 'closed' or 'opened'
  // Action   :
  //   Changes the URI anchor parameter 'chat' to the requested
  //   value if possible.
  // Returns  :
  //   * true  - requested anchor part was updated
  //   * false - requested anchor part was not updated
  // Throws   : none
  //
  setChatAnchor = function ( position_type ) {
    return changeAnchorPart({ chat : position_type });
  };

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

    app.notepad_form.configModule({
      set_chat_anchor : setChatAnchor
    });

    app.notepad_form.initModule( jqueryMap.$container );
    app.notepad_form.setSliderPosition( 'opened' );

    app.header.initModule( jqueryMap.$shellBody );

    app.model.video.load_library( function(){ //rename this function
      parseRoute();
    });

    app.login_modal.initModule        ( jqueryMap.$shellBody );
    app.notes_list_modal.initModule   ( jqueryMap.$shellBody );
    app.video_control_panel.initModule( jqueryMap.$shellBody );
    app.notepad.initModule            ( jqueryMap.$shellBody );
    app.notepad_form.initModule       ( jqueryMap.$shellBody );
    app.alert_modal.initModule        ( jqueryMap.$shellBody );

    closeModalsOnClick();
  
    $.gevent.subscribe( jqueryMap.$shellBody, 'app-successfully-found-video', updateURL);
    $.gevent.subscribe( jqueryMap.$container, 'app-close-modals',  onCloseModal);
    
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
