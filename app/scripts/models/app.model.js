/*
 * app.model.js
 * Model initializer
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/* global TAFFY, $, app */

app.model = (function () {
  'use strict';
  var
    configMap = { },
    stateMap  = { },

  isFakeData = false,
  initModule;

  initModule = function () {
    app.model.note.initModule();
    app.model.user.initModule();
  };

  return {
    initModule : initModule
  };
  
}());
