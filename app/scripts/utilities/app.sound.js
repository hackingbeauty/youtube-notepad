/*
 * app.sound.js
 * Sound module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true, unparam : true
*/
/*global $, app, Handlebars */

app.sound = (function () {
  'use strict';
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    clickSound = document.createElement('audio'),
    play, stop, initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  play = function(type){
    switch(type){
      case 'ring':
        clickSound.setAttribute('src', '/sounds/phone_ring.mp3');
        clickSound.loop = true;
        break;
      case 'zap':
        clickSound.setAttribute('src', '/sounds/zap-sound.mp3');
        clickSound.loop = false;
        break;
      case 'click':
        clickSound.setAttribute('src', '/sounds/single_click_trimmed.mp3');
        clickSound.loop = false;
        break;
      case 'make_note':
        clickSound.setAttribute('src', '/sounds/make_note.mp3');
        clickSound.loop = false;
        break;
    }
    clickSound.play();
  };

  stop = function(type){
    clickSound.pause();
    clickSound.currentTime = 0;
  };

  initModule = function ( ) {
    clickSound.setAttribute('src','/sounds/single_click_trimmed.mp3');
    clickSound.setAttribute('autoplay', 'autoplay'); //putting this here for now, otherwise issues :)
    $('body').on('click','.app-sound-click', function(){
      app.sound.play('click');
    });
  };
  // End PUBLIC method /initModule/

  return { 
    initModule  : initModule, 
    play        : play,
    stop        : stop
  };
  //------------------- END PUBLIC METHODS ---------------------
}());
