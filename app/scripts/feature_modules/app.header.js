/*
 * app.header.js
 * Header feature module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, app */

app.header = (function () {
  'use strict';

  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      main_html           : Handlebars.compile($('#app-header-template').html()),
      auth_buttons_html   : Handlebars.compile($('#app-authentication-buttons-template').html()),
      search_results_html : Handlebars.compile($('#app-search-results-template').html())
    },
    stateMap  = { $container : null },
    jqueryMap = {},

    signInBtnClick,
    signOutBtnClick,
    showAuthButtons,
    onNotesLinkClick,
    onEnterButtonClick,
    onVideoLinkBlur,
    updateLinkInput,
    onSearchBoxKeyPress,

    _populateDropDown,
    _isURL,
    _checkAndInsertVideo,

    setJqueryMap, 
    configModule, 
    initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  _populateDropDown = function( searchResults ){
    var pluckedArray = [];

    jqueryMap.$searchResultsBox.empty();
    jqueryMap.$searchResultsBox.show();

    for(var i=0; i<searchResults.length; i++){
      pluckedArray.push(searchResults[i][0])
    }

    console.log('pluckedArray IS: ', pluckedArray);

    jqueryMap.$searchResultsBox.append(
      configMap.search_results_html({
        searchResults : pluckedArray
      })
    );

  };

  _isURL = function( inputValue ){
    var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/
    if ( urlPattern.test( inputValue ) ){    // This should really test for youtube video urls
      return true;
    } else {
      return false;
    }
  };

  /*
   *  Purpose: Check if video exists.
   *           If it does, insert it.
  */
  _checkAndInsertVideo = function( inputValue ){
    var videoID;
    if( _isURL(inputValue) ){
      videoID = app.model.video.get_video_id_from_url( inputValue );
      app.model.video.check_video( 
        videoID, 
        function(){ // Success
          jqueryMap.$urlErrorMsg.hide();
          jqueryMap.$videoNotFoundMsg.hide();
          jqueryMap.$videoFoundMsg.show();
          $.gevent.publish( 'app-successfully-found-video', [ videoID ] );
          app.model.video.set_video_data( videoID );
        },
        function(){ // Error
          jqueryMap.$videoNotFoundMsg.show();
        }
      );
    } else {
      jqueryMap.$urlErrorMsg.show();
    }
  }
  //------------------- BEGIN UTILITY METHODS ------------------

  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------

  onSearchBoxKeyPress = function(){
    var inputValue,videoID, keyPressCount = 0, query;
    jqueryMap.$youtubeLinkInput.keydown( function(e){
      if(keyPressCount > 2){
        query = $.trim($(this).val());
        $.ajax({
          type      : 'GET',
          url       : '//google.com/complete/search?client=youtube&ds=yt&q=' + query,
          dataType  : 'jsonp',
          crossDomain : true,
          success: function(resp){
            var searchResults = resp[1];
            if(searchResults.length > 0){
              _populateDropDown( searchResults );
            }
          },
          error: function(){
            console.log('ERRRROORR');
          }
        });
      }
      keyPressCount++;
    });
  };

  /*
   *  Purpose: Called when user enters YouTube url and tabs out.
   *           If video found, it is then inserted 
  */
  onVideoLinkBlur = function( ){
    var inputValue,videoID;
    jqueryMap.$youtubeLinkInput.keydown( function(e){
      if ((e.which == 13) || (e.keyCode == 9)) { // If enter key or tab key pressed
        inputValue = $.trim($(this).val());
        _checkAndInsertVideo( inputValue );
        e.preventDefault();
      }
    });
  };

  /*
   *  Purpose: Called when user enters YouTube url and click 'Take Notes' button.
   *           If video found, it is then inserted 
  */
  onEnterButtonClick = function(){
    var inputValue;
    jqueryMap.$enterBtn.on('click', function( evt ){
      inputValue = jqueryMap.$youtubeLinkInput.val();
      _checkAndInsertVideo( inputValue );
      evt.preventDefault();
    });
  };

  /*
   *  Purpose: When a video is found, the YouTube link input is
   *           updated with the found YouTube url
  */
  updateLinkInput = function( event, videoID ){
    if(jqueryMap.$youtubeLinkInput.val() === ''){
      jqueryMap.$youtubeLinkInput.val( 'http://youtube.com/watch?v=' + videoID );
    }
  };


  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$append_target.find('#app-header');
    jqueryMap = { 
      $container              : $container,
      $authButtons            : $container.find('#app-authentication-buttons'),
      $youtubeLinkInput       : $container.find('#app-youtube-link'),
      $urlErrorMsg            : $container.find('#app-notepad-url-error'),
      $videoNotFoundMsg       : $container.find('#app-notepad-video-not-found-error'),
      $videoFoundMsg          : $container.find('#app-notepad-video-found'),
      $enterBtn               : $container.find('#app-notepad-enter-btn'),
      $searchResultsBox       : $container.find('#app-search-results-box')
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------


  //------------------- BEGIN EVENT HANDLERS -------------------

  signInBtnClick = function(){ // THIS NEEDS TO BE MOVED TO USER MODEL
    jqueryMap.$container.on('click', '#sign-in', function(){
      $.gevent.publish( 'app-login-modal', [ ] );
    });
  };

  signOutBtnClick = function(){
    jqueryMap.$container.on('click', '#sign-out', function(){
      app.model.user.sign_out();
    });
  };

  showAuthButtons = function( event, authStatus ){
    jqueryMap.$authButtons.empty();
    if(authStatus === 'signed-in'){
      jqueryMap.$authButtons.append(
        configMap.auth_buttons_html({
          userSignedIn  : true,
          userPhoto     : app.model.user.get_photo(),
          displayName   : app.model.user.get_display_name(),
          firstName     : app.model.user.get_first_name()
        })
      );
    }
    if(authStatus === 'signed-out'){
      jqueryMap.$authButtons.append(
        configMap.auth_buttons_html({
          userSignedIn : false
        })
      );
    }
    setJqueryMap();
  };

  onNotesLinkClick = function(){
    jqueryMap.$container.on('click', '#notes-link', function( evt ){
      $.uriAnchor.setAnchor({
        notes : 'opened',
      });
      evt.preventDefault();
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
    $append_target.append( configMap.main_html() );
    setJqueryMap();
    signInBtnClick();
    signOutBtnClick();
    onNotesLinkClick();
    onSearchBoxKeyPress();
    // onEnterButtonClick();
    // onVideoLinkBlur();
    $.gevent.subscribe( jqueryMap.$container, 'app-successfully-found-video', updateLinkInput );
    $.gevent.subscribe( jqueryMap.$container, 'app-authentication-status',  showAuthButtons );
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
