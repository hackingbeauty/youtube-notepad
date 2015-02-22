/*
 * app.your_tags.js
 * Your Tags feature module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true, camelcase : false
*/

/*global $, app, Handlebars */

app.your_tags = (function () {
  'use strict';
  
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      main_html : Handlebars.compile($('#app-your-tags-template').html()),
      body_html : Handlebars.compile($('#app-your-tags-body-template').html()),
      item_html : Handlebars.compile($('#app-your-tags-body-item-template').html())
    },
    stateMap  = { $container : null },
    jqueryMap = {},

    onGetAllUserTags,
    onTagItemClick,
    onNoteItemClick,
    onDeleteClick,
    onSignOut,

    setJqueryMap, configModule, initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------

  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$append_target.find('#app-your-tags');

    jqueryMap = {
      $container : $container,
      $list      : $container.find('#app-your-tags-list'),
      $deleteIcon : $container.find('.delete-icon')
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  onGetAllUserTags = function(  ){
    jqueryMap.$list.empty();
    app.model.tag.get_all( function( tags ){
      jqueryMap.$list.append(
        configMap.body_html({
          videoTags: tags
        })
      );
    });
  };

  onTagItemClick = function( ){
    var $submenu, tag, $self;

    jqueryMap.$list.on('click', '.tag-item', function(){
      $self = $(this);
      tag = $self.find('h3').html();
      $submenu = $self.find('.submenu');
      
      if($submenu.is(':empty')){
        app.model.tag.get_all_by_tag( tag , function( videos ){
          $submenu.append(
            configMap.item_html({
              videos: videos
            })
          );
        });
      }

    });
  };

  onNoteItemClick = function(){
    var 
      videoID,
      coreDrawerPanel = document.getElementById('core-drawer-panel');

    jqueryMap.$list.on('click','.note-item', function( evt ){
      videoID = $(this).data('video-id');
      $.uriAnchor.setAnchor( { video_id : videoID } );
      coreDrawerPanel.closeDrawer();
      evt.preventDefault();
    });
  };

  onDeleteClick = function(){
    jqueryMap.$deleteIcon.on('click', function(){
      alert('ya clicked the trash icon');
    });
  };

  onSignOut = function(){
    jqueryMap.$list.empty();
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
    $append_target.append( configMap.main_html );
    setJqueryMap();
    onDeleteClick()
    $('#app-your-tags-list').easyAccordion();
    onTagItemClick();
    onNoteItemClick();
    $.gevent.subscribe( jqueryMap.$container, 'app-authentication-status', onGetAllUserTags );
    $.gevent.subscribe( jqueryMap.$container, 'app-user-signed-out',       onSignOut );
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
