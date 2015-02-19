/*
 * app.search_Box.js
 * Search Box feature module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true, camelcase: false
*/

/*global $, app, Handlebars */

app.search_box = (function () {
  'use strict';
  
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      main_html: Handlebars.compile($('#app-search-box-template').html()),
      search_results_html : Handlebars.compile($('#app-search-results-template').html())
    },
    stateMap  = { $container : null },
    jqueryMap = {},

    _populateDropDown,
    _isURL,
    _checkAndInsertVideo,
    _transform,

    onSearchBoxKeyPress,
    onSearchBoxEnter,
    onSearchItemSelect,
    onSearch,
    closeSearchBox,

    setJqueryMap, configModule, initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
  _populateDropDown = function( searchResults ){
    var
      pluckedArray = [],
      i;

    jqueryMap.$searchResultsBox.empty();
    jqueryMap.$searchResultsBox.show();

    for(i=0; i<searchResults.length; i++){
      pluckedArray.push(searchResults[i][0]);
    }

    jqueryMap.$searchResultsBox.append(
      configMap.search_results_html({
        searchResults : pluckedArray
      })
    );

  };

  _isURL = function( inputValue ){
    var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
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
  };

  /*
   *  Purpose: Transform Youtube search results
   *           into palatable format for jquery.ui.autocomplete
  */
  _transform = function( arr ){
    var searchResults = [], i;
    for(i = 0; i< arr.length; i++){  
      searchResults.push( arr[i][0] );  
    }
    return searchResults;
  };

  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$append_target.find('#app-search-box');

    jqueryMap = {
      $container           : $container,
      $searchInput         : $container.find('#app-search-input'),
      $searchResultsBox    : $container.find('#app-search-results-box'),
      $searchResultsList   : $container.find('#app-search-results-list')
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------

  onSearch = function(){
    jqueryMap.$searchInput.autocomplete({
      source: function( request, response ) {
        $.ajax({
          url: '//suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=' + request.term,
          dataType: 'jsonp',
          data: {
            q: request.term
          },
          success: function( data ) {
            var searchResults = _transform( data[1] );
            response( searchResults );
          }
        });
      },
      minLength: 3,
      select: function( event, ui ) {
        $.uriAnchor.setAnchor({
          search : ui.item.value,
        });
      }
    });
  };

  onSearchBoxKeyPress = function(){
    var query;

    jqueryMap.$searchInput.keyup( function( ){
      query = $.trim($(this).val());

      if(query.length > 0){
        $.ajax({
          type      : 'GET',
          url       : '//suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=' + query,
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
      } else {
        closeSearchBox();
      }
 
    });
  };

  onSearchBoxEnter = function(){
    var
      searchItems,
      currSelectedItem,
      searchItemsRemaining = 0;

    jqueryMap.$searchInput.keydown( function(evt){
      setJqueryMap();

      searchItems = jqueryMap.$searchResultsList.children();

      if (evt.which === 13){
        evt.preventDefault();
      } else if (evt.which === 40){ // If down arrow key clicked
        
        // if(firstClick){
        //   // jqueryMap.$searchResultsList.children().get(searchItemsRemaining).focus();
        //   firstClick = false;
        // }

        if(searchItemsRemaining < searchItems.length){
          currSelectedItem = jqueryMap.$searchResultsList.children().get(searchItemsRemaining);
          $(currSelectedItem).addClass('selected');
          searchItemsRemaining++;
        }
      }
    });
  };

  onSearchItemSelect = function(){
    var searchTerm;
    jqueryMap.$searchResultsBox.on('click','li', function(){
      searchTerm = $(this).html();
      $.uriAnchor.setAnchor({
        search : searchTerm,
      });
    });
  };

  closeSearchBox = function(){
    jqueryMap.$searchResultsBox.hide();
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
    var $videoControlPanel = stateMap.$append_target.find('#app-video-control-panel');
    $videoControlPanel.prepend( configMap.main_html );
    setJqueryMap();
    onSearch();
    // onSearchBoxKeyPress();
    // onSearchBoxEnter();
    // onSearchItemSelect();
    $.gevent.subscribe( jqueryMap.$container, 'app-close-modals', closeSearchBox );
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
