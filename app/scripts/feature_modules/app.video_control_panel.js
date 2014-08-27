/*
 * app.video_control_panel.js
 * Video control panel feature module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, app */

app.video_control_panel = (function () {
  'use strict';
  
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      main_html : Handlebars.compile($('#app-video-control-panel-template').html())
    },
    stateMap  = { $container : null },
    jqueryMap = {},
    progressBarComplete = '0',

    _showProgress,

    showProgress,
    loadVideo,
    insertVideoIframe,
    onFullScreenModeClick,
    seekInVideo,
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
    var $container = stateMap.$append_target.find('#app-video-control-panel');
    jqueryMap = { 
      $container              : $container,
      $videoContainer         : $container.find('#app-video-control-panel-container'),
      $videoIframe            : $container.find('#app-video-iframe'),
      $progressBarContainer   : $container.find('.progress'),
      $progressBar            : $container.find('.progress-bar'),
      $fullScreenModeBtn      : $container.find('#full-screen-mode-btn')
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------

  showProgress = function(){
    jqueryMap.$progressBarContainer.show();
    _showProgress();
  };

  _showProgress = function(){
    var progressBarAnimation;
    if (progressBarComplete <= 100){
      jqueryMap.$progressBar.width(  progressBarComplete + '%' );
      progressBarComplete++;
      progressBarAnimation = requestAnimationFrame(_showProgress);
    }
  };

  onFullScreenModeClick = function(){
    jqueryMap.$fullScreenModeBtn.on('click', function(){
      if (screenfull.enabled) {
        screenfull.request();
      } else {
          // Ignore or do something else
      }
    });
  }

  loadVideo = function( event, videoID ){
    $('#app-video-noise-screen').hide();
    if(window.player){
      window.player.loadVideoById( videoID );
    }
  };

  insertVideoIframe = function ( event, videoID ) {
    var videoScriptTag = app.model.player.create_video_script( "app-video-iframe");
    jqueryMap.$videoContainer.append( videoScriptTag );
  };

  seekInVideo = function( event, time ){
    app.model.player.seek_time ( time );
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
    onFullScreenModeClick();
    $.gevent.subscribe( jqueryMap.$container, 'app-youtube-authorized', insertVideoIframe);
    $.gevent.subscribe( jqueryMap.$container, 'app-load-video',         loadVideo);
    $.gevent.subscribe( jqueryMap.$container, 'app-seek-in-video',      seekInVideo );
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
