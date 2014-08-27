/*
 * app.model.video.js
 * Video model
 */

/*jslint         browser : true, continue : true,
	devel  : true, indent  : 2,    maxerr   : 50,
	newcap : true, nomen   : true, plusplus : true,
	regexp : true, sloppy  : true, vars     : false,
	white  : true
*/

/*global TAFFY, $, app */

app.model.video = (function () {
	'use strict';

	//---------------- BEGIN MODEL SCOPE VARIABLES --------------
	var
		stateMap  = { },
		videoID = '',

		load_library,
		check_video,
		set_video_id,
		get_video_id,
		get_current_video,
		set_current_video,
		get_video_id_from_url,
		initModule,
		_authorize;
	//----------------- END MODULE SCOPE VARIABLES ---------------

	load_library = function ( callback ){
		gapi.client.setApiKey(app.config.get_api_key());
		_authorize( callback );
	};

	check_video = function ( videoID, successCallback, errorCallback ){
		var 
			request,
			resultsFound;

		request = gapi.client.youtube.videos.list({ id : videoID, part : 'id' });
		request.execute(function(response) {
			resultsFound = response.result.pageInfo.totalResults;
			if(resultsFound > 0){
				successCallback();
			} else {
				errorCallback();
			}
		}); 
	}; 

	set_video_id = function( id ){
		videoID = id;
	};

	get_video_id = function(){
		return videoID;
	};

	get_video_id_from_url = function( url ){
		var 
			videoID,
			urlMatch = url.match(/v=[\D\d\W\w]*/g);

		if( urlMatch && urlMatch.length > 0 ){
			videoID = urlMatch[0].replace('v=','').split('&')[0];
			return videoID;
		} else {
			return false;
		}
	};

	//------------------- PRIVATE FUNCTIONS ----------------------

	_authorize = function( initAppCallback ) {
		gapi.auth.authorize({
			client_id	: app.config.get_client_id(),
			scope 		: 'https://www.googleapis.com/auth/youtube',
			immediate 	: true      
		}, function( resp ){
			gapi.client.load('youtube', 'v3', initAppCallback); //Load Youtube client library
			$.gevent.publish( 'app-youtube-authorized', [ ] );
		});
	};

	//------------------- END PRIVATE FUNCTIONS ------------------

	return {
		initModule          	: initModule,
		load_library         	: load_library,
		check_video         	: check_video,
		set_video_id 			: set_video_id,
		get_video_id  			: get_video_id,
		get_video_id_from_url 	: get_video_id_from_url
	};

}());
