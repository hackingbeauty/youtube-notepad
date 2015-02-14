/*
 * app.js
 * Root namespace module
*/

/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 2,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : false,
  white  : true
*/
/*global app */

var app = (function () {
  'use strict';
  var initModule = function ( $container ) {
    app.data.initModule();
    app.model.initModule();
    app.shell.initModule( $container );
  };

  return { initModule: initModule };
}());
