/*
 * app.speed_controls.js
 * App Speed Controls feature module
*/

/*jslint         browser    : true, continue : true,
  devel  : true, indent     : 2,    maxerr   : 50,
  newcap : true, nomen      : true, plusplus : true,
  regexp : true, sloppy     : true, vars     : false,
  white  : true, camelcase  : false
*/

/*global $, app, Handlebars */

app.speed_controls = (function () {
  'use strict';
  
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      main_html: Handlebars.compile($('#app-speed-controls-template').html())
    },
    stateMap  = { $container : null },
    jqueryMap = {},

    speedControlBtnClicks,
    resetControlBtns,
    onWatchedVideoBtnClick,
    determineIfWatched,

    setJqueryMap, configModule, initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
  // example : getTrimmedString
  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$append_target.find('#app-speed-controls');

    jqueryMap = {
      $container : $container,
      $speedControlBtns       : $container.find('button'),
      $fasterSpeedBtn         : $container.find('#faster-speed-btn'),
      $normalSpeedBtn         : $container.find('#normal-speed-btn'),
      $slowerSpeedBtn         : $container.find('#slower-speed-btn'),
      $watchedVideoBtn        : $container.find('#watched-btn')
    };
  };
  // End DOM method /setJqueryMap/

  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  speedControlBtnClicks = function(){
    var speed, $button;
    jqueryMap.$container.on('click', 'button',function( evt ){
      speed = parseFloat($(evt.target).data('speed'));
      for(var i = 0; i < jqueryMap.$speedControlBtns.length; i++){
        $button = $(jqueryMap.$speedControlBtns[i]);
        if($button.hasClass('selected')){
          $button.removeClass('selected');
        }
      }
      $(evt.target).addClass('selected');
      app.model.player.change_speed( speed );
    });
  };

  resetControlBtns = function(){
    var $button, i;
    for(i = 0; i < jqueryMap.$speedControlBtns.length; i++){
      $button = $(jqueryMap.$speedControlBtns[i]);
      if($button.hasClass('selected')){
        $button.removeClass('selected');
      }
    }
    jqueryMap.$speedControlBtns.filter('[data-speed="1"]').addClass('selected');
  };

  onWatchedVideoBtnClick = function(){
    var currentVideoID, $watchBtn;
    jqueryMap.$watchedVideoBtn.on('click', function( ){
      currentVideoID = app.model.video.get_video_id();
      $watchBtn = $(this);
      if(currentVideoID !== ''){
        app.model.video.flag_as_watched( currentVideoID );
      }
      $watchBtn.html('Watched');
      $watchBtn.addClass('selected');
    });
  };

  determineIfWatched = function( evt, videoID){
    app.model.video.is_watched( videoID, function( isWatched ){
      if(isWatched){
        jqueryMap.$watchedVideoBtn.html( jqueryMap.$watchedVideoBtn.data('watched-text') );
        jqueryMap.$watchedVideoBtn.addClass('selected');
      } else {
        jqueryMap.$watchedVideoBtn.html( jqueryMap.$watchedVideoBtn.data('not-watched-text') );
        jqueryMap.$watchedVideoBtn.removeClass('selected');
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
    $('#app-note-input').after( configMap.main_html );
    setJqueryMap();
    speedControlBtnClicks();
    resetControlBtns();
    onWatchedVideoBtnClick();
    $.gevent.subscribe( jqueryMap.$container, 'app-load-video', determineIfWatched );
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
