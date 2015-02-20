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

    _transform,

    onSearch,
    onURLPaste,
    closeSearchBox,

    setJqueryMap, configModule, initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
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

  onURLPaste = function(){
    var inputValue;
    jqueryMap.$searchInput.on('paste', function( evt ){
      setTimeout(function(){
        inputValue = $(evt.currentTarget).val();
        if( app.util.isValidDomain( inputValue )){
          $(evt.currentTarget).removeClass('error');
        } else {
          $(evt.currentTarget).val('Enter a link from youtube.com or coursera.org');
          $(evt.currentTarget).addClass('error');
        }
      }, 0);
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
    onURLPaste();
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
