/*
 * app.model.video.js
 * Video model
 */

/* jslint         browser : true, continue : true,
	devel  : true, indent  : 2,    maxerr   : 50,
	newcap : true, nomen   : true, plusplus : true,
	regexp : true, sloppy  : true, vars     : false,
	white  : true, camelcase : false
*/

/* global $, app, gapi, Firebase */

app.model.video = (function () {
	'use strict';

	//---------------- BEGIN MODEL SCOPE VARIABLES --------------
	var
		videoID = '',
		videoData,

		load_library,
		check_video,
		set_video_id,
		get_video_id,
		get_video_id_from_url,
		get_video_data,
		set_video_data,
		get_results,
		flag_as_watched,
		is_watched,

		_determine_which_videos_watched,
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

	set_video_data = function( videoID ){
		var 
			userUID = app.model.user.get_user().uid,
			videoRef,
			url = 'https://www.googleapis.com/youtube/v3/videos?id='+videoID+'&key='+ app.config.get_api_key() +'&part=snippet';

		$.getJSON( url, function( data ){
			videoData = data.items[0].snippet;
			videoRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/'+userUID+'/videos/' + videoID + '/metaData/' );
			videoRef.once('value', function( data ){
				var result = data.val();

				if( $.isEmptyObject( result )){
					videoRef.set( videoData );
				}
			});
		});
	};

	get_video_data = function(){
		return videoData;
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

	get_results = function( searchTerm ){
		var request, results;
		request = gapi.client.youtube.search.list({ part : 'snippet, id', q : searchTerm, maxResults: 25 });
		request.execute(function(response) {
			results = response.result.items;
			_determine_which_videos_watched( results );
			$.gevent.publish( 'app-video-search-results', [ results ] );
		}); 
	};

	flag_as_watched = function( videoID ){
		var userUID = app.model.user.get_user().uid,
			videoRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/'+userUID+'/videos/' + videoID + '/metaData/' );
		videoRef.update({ watched : true});
	};

	is_watched = function( videoID, callback ){
		var userUID = app.model.user.get_user().uid,
			videoRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/'+userUID+'/videos/' + videoID + '/metaData' );
				
		videoRef.once('value', function( data ) {
			var result = data.val(),
				isWatched = false;

			if(result.watched && result.watched === true){
				isWatched = true;
			}
			callback( isWatched );
		});
	};

	//------------------- PRIVATE FUNCTIONS ----------------------

	_authorize = function( initAppCallback ) {
		gapi.auth.authorize({
			client_id	: app.config.get_client_id(),
			scope		: 'https://www.googleapis.com/auth/youtube',
			immediate	: true      
		}, function( ){
			gapi.client.load('youtube', 'v3', initAppCallback); //Load Youtube client library
			$.gevent.publish( 'app-youtube-authorized', [ ] );
		});
	};

	_determine_which_videos_watched = function( list ){
		var i,	
			userUID = app.model.user.get_user().uid,
			videoRef,
			videoID,
			searchResultItem,
			returnObj;
		
		for(i = 0; i < list.length; i++){
			videoID = list[i].id.videoId;
			searchResultItem = list[i];

			(function( theVideoID, theSearchResultItem ){

				if( theVideoID !== undefined ){
					videoRef = new Firebase('https://intense-fire-7738.firebaseio.com/users/'+userUID+'/videos/' + theVideoID);

					videoRef.once('value', function(data) {
						var result = data.val();
						
						if( result !== null ){
							returnObj = $.extend( theSearchResultItem, { metaData: result.metaData } );
							$.gevent.publish( 'app-video-search-result-found',  [ returnObj ] );
						}

					});
				} 
			}( videoID, searchResultItem ));
		
		}
	};

	//------------------- END PRIVATE FUNCTIONS ------------------

	return {
		initModule				: initModule,
		load_library			: load_library,
		check_video				: check_video,
		get_video_data			: get_video_data,
		set_video_data			: set_video_data,
		set_video_id			: set_video_id,
		get_video_id			: get_video_id,
		get_video_id_from_url	: get_video_id_from_url,
		get_results				: get_results,
		flag_as_watched			: flag_as_watched,
		is_watched				: is_watched
	};

}());
