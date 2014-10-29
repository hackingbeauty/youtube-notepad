/*
 * app.notepad.js
 * Video form feature module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, app */

app.notes_carousel = (function () {
  'use strict';

  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
          main_html: Handlebars.compile($('#app-notes-carousel-template').html())
    },
    stateMap  = { $container : null },
    jqueryMap = {},

    showNotes,
  
    setJqueryMap, configModule, initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------

  //-------------------- END UTILITY METHODS -------------------


  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$append_target.find('#app-notes-carousel-container');
    jqueryMap = { 
      $container : $container,
      $notesList : $container.find('#app-notes-carousel-list')    
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------


  //------------------- BEGIN EVENT HANDLERS -------------------
  showNotes = function(event, authStatus){
    var user = app.model.user.get_user();

    setJqueryMap();
    jqueryMap.$container.show();

    if(user.is_signed_in()){
      app.model.note.get_saved_notes(function( data ){
        stateMap.$append_target.append(
          configMap.main_html({
            notes : data
          })
        );
        setJqueryMap();
        jqueryMap.$container.show();
        
        /* put in separate funtion */
        var $frame = $('#app-notes-carousel-container');
        var $controls  = $('#app-notes-carousel-controls');
        var $scrollbar = $('#app-notes-carousel-scrollbar');

        console.log('control-prev is: ', $controls.find('.control-prev'));
        console.log('$scrollbar is: ', $scrollbar);
        console.log('controls: ', $controls);

        $controls.find('#control-prev').css('border','1px solid green');


        $frame.sly({
          horizontal: 1,
          itemNav: 'centered',
          smart: 1,
          activateMiddle: 1,
          activateOn: 'click',
          mouseDragging: 1,
          touchDragging: 1,
          releaseSwing: 1,
          startAt: 3,
          scrollBar: $scrollbar,
          scrollBy: 1,
          speed: 300,
          elasticBounds: 1,
          easing: 'swing',
          dragHandle: 1,
          dynamicHandle: 1,
          clickBar: 1,

          // Buttons
          prev: $controls.find('#control-prev'),
          next: $controls.find('#control-next')
        });





      });
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
    // stateMap.$append_target.append(configMap.main_html());
    // setJqueryMap();
    $.gevent.subscribe( stateMap.$append_target, 'app-show-notes',  showNotes );
    return true;
  };
  // End public method /initModule/

  // return public methods
  return {
    configModule    : configModule,
    initModule      : initModule
  };
  //------------------- END PUBLIC METHODS ---------------------
}());
