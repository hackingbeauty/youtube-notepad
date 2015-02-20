/*
 * app.util.js
 * General JavaScript utilities
 *
 * Michael S. Mikowski - mmikowski at gmail dot com
 * These are routines I have created, compiled, and updated
 * since 1998, with inspiration from around the web.
 *
 * MIT License
 *
*/

/*jslint          browser : true,  continue : true,
  devel  : true,  indent  : 2,     maxerr   : 50,
  newcap : true,  nomen   : true,  plusplus : true,
  regexp : true,  sloppy  : true,  vars     : false,
  white  : true,  camelcase : false
*/
/*global app */

app.util = (function () {
  var makeError, setConfigMap, parseVideoID, isValidDomain;

  // Begin Public constructor /isValidDomain/
  // Purpose: Determine if given URL is valid
  // Valid URLs include the domains youtube.com and coursera.com
  // Arguments:
  //   * url - the url
  // Returns  : boolean
  // Throws   : none
  //
  isValidDomain = function( url ){
    var validDomains = ['youtube.com'], i;

    for(i = 0; i < validDomains.length; i++ ){
      if( url.indexOf( validDomains[i]) > -1){ //If the URL contains a valid domain
        return true;                            //then we're good
      }
    }
    return false;
  };

  // Begin Public constructor /parseVideoID/
  // Purpose: parse the video id from a given route
  // Arguments:
  //   * route - the actual hash route
  // Returns  : video id
  // Throws   : none
  //
  parseVideoID = function(route){
    if( !route.match(/video_id=(.*)&/) ) {    // If url with video_id DOES NOT have &,
      return route.match(/video_id=(.*)/)[1]; // use this regex
    } else {
      return route.match(/video_id=(.*)&/)[1]; // Else, route has &, so use this regex
    }
  };

  // Begin Public constructor /makeError/
  // Purpose: a convenience wrapper to create an error object
  // Arguments:
  //   * name_text - the error name
  //   * msg_text  - long error message
  //   * data      - optional data attached to error object
  // Returns  : newly constructed error object
  // Throws   : none
  //
  makeError = function ( name_text, msg_text, data ) {
    var error     = new Error();
    error.name    = name_text;
    error.message = msg_text;

    if ( data ){ error.data = data; }

    return error;
  };
  // End Public constructor /makeError/

  // Begin Public method /setConfigMap/
  // Purpose: Common code to set configs in feature modules
  // Arguments:
  //   * input_map    - map of key-values to set in config
  //   * settable_map - map of allowable keys to set
  //   * config_map   - map to apply settings to
  // Returns: true
  // Throws : Exception if input key not allowed
  //
  setConfigMap = function ( arg_map ){
    var
      input_map    = arg_map.input_map,
      settable_map = arg_map.settable_map,
      config_map   = arg_map.config_map,
      key_name, error;

    for ( key_name in input_map ){
      if ( input_map.hasOwnProperty( key_name ) ){
        if ( settable_map.hasOwnProperty( key_name ) ){
          config_map[key_name] = input_map[key_name];
        }
        else {
          error = makeError( 'Bad Input',
            'Setting config key |' + key_name + '| is not supported'
          );
          throw error;
        }
      }
    }
  };
  // End Public method /setConfigMap/

  return {
    makeError     : makeError,
    setConfigMap  : setConfigMap,
    parseVideoID  : parseVideoID,
    isValidDomain : isValidDomain
  };
}());
