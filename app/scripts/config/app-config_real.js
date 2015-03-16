/*
 * app.config.js
 * Configuration module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, app */

app.config = (function () {
	'use strict';
  	var		
  		configMap = {
			'dev': {
				'client-id'       : '901557209180-dvdpg415l767gt8fsk5ghpoi2r87jsjf.apps.googleusercontent.com',
				'youtube-api-key' : 'AIzaSyAtSE-0lZOKunNlkHt8wDJk9w4GjFL9Fu4'
			},
			'prod':{
				'client-id'       : '952912223614-ivmnm88u2231bvdduc26qqp5av6dn0c2.apps.googleusercontent.com',
				'youtube-api-key' : 'AIzaSyCzK3Pa-NERIdcQnxc8p6rqK7Tl7Za6YTs'
			}
		},
  		dataMode,
  		setDataMode,
  		getDataMode,
  		get_client_id,
  		get_api_key,
  		show_key;

  	get_client_id = function(){
  		return configMap[dataMode]['client-id'];
  	};

  	get_api_key = function(){
  		return configMap[dataMode]['youtube-api-key'];
  	};

  	setDataMode = function ( mode ) {
		dataMode = mode;
	};

	getDataMode = function ( ) {
		return dataMode;
	};

	show_key = function () {
		console.log('----------- Credentials -----------');
		console.log('client-id: ', configMap[app.config.getDataMode()]['client-id']);
		console.log('youtube-api-key: ', configMap[app.config.getDataMode()]['youtube-api-key']);
		console.log('-----------------------------------');
	};

	return {
		setDataMode		: setDataMode,
		getDataMode		: getDataMode,
		get_client_id	: get_client_id,
		get_api_key		: get_api_key,
		show_key		: show_key
	}; 
}());