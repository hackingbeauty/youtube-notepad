/*
 * app.model.player.js
 * Player model
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global TAFFY, $, app */

app.model.player = (function () {
  'use strict';

  //---------------- BEGIN MODEL SCOPE VARIABLES --------------
  var
    configMap = { },
    stateMap  = { },
    isFakeData = false,
    videoTime = '',

    create_video_script,
    on_player_ready,
    on_player_state_change,
    play_video,
    pause_video,
    change_speed,
    get_current_time,
    seek_time;
    
  //----------------- END MODEL SCOPE VARIABLES ---------------

  create_video_script = function ( dimensions, videoContainerID ){
    var stringObj = 
      '<script type="text/javascript">' +
          'player = new YT.Player("'+videoContainerID+'", { '+
            // 'height: "'+dimensions.height+'", '+
            // 'width: "'+dimensions.width+'", '+
            'videoId: "", '+
            // 'playerVars: { "controls": 0 }, ' +
            'events: { '+
              '"onReady": app.model.player.on_player_ready,'+
              '"onStateChange": app.model.player.on_player_state_change '+
            '}'+
          '});'+
      '</script>';
    return stringObj;
  };

  on_player_ready = function( ){
    play_video();
  };

  on_player_state_change = function( state, target ){
    var videoURL,
        videoIDMatch,
        videoID;

    if( state.data === -1){
      videoURL = window.player.getVideoUrl();
      videoIDMatch = videoURL.match(/v=[\D\d\W\w]*/g);
      
      if(videoIDMatch !== null){
        videoID = videoIDMatch[0].slice(2, videoIDMatch[0].length);
      }

    }
   
  };

  play_video = function(){
    window.player.playVideo();
  };

  pause_video = function(){
    window.player.pauseVideo();
  };

  change_speed = function( speed ){
    window.player.setPlaybackRate( speed );
  };

  get_current_time = function(){
    var date,
        minutes,
        seconds;

    if(window.player && window.player.getCurrentTime){
      date = new Date( Math.floor( window.player.getCurrentTime() ) * 1000 );
      minutes = date.getUTCMinutes();
      seconds = date.getUTCSeconds() < 10 ? '0' + date.getUTCSeconds() : date.getUTCSeconds();
      videoTime = minutes + ":" + seconds;
    } else {
      videoTime = "0:00";
    }
    
    return videoTime;
  };

  seek_time = function( time ){ // WARNING: NOT TAKING INTO ACCOUNT HOURS IF VIDEO LENGTH IS IN HOURS...
    var 
      minutesInSeconds = parseInt( time.split(":")[0] ) * 60,
      seconds = parseInt( time.split(":")[1] ),
      totalSeconds = minutesInSeconds + seconds;
    
    if(window.player){
      window.player.seekTo( totalSeconds, true ); // Not sure if second param should be true or false - check docs
    }
  };


  //------------------- PRIVATE FUNCTIONS ----------------------

  //------------------- END PRIVATE FUNCTIONS ------------------

  return {
    create_video_script     : create_video_script,
    on_player_ready         : on_player_ready,
    on_player_state_change  : on_player_state_change,
    play_video              : play_video,
    pause_video             : pause_video,
    get_current_time        : get_current_time,
    seek_time               : seek_time,
    change_speed            : change_speed
  };

}());
