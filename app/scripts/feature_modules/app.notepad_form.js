/*
 * app.notepad_form.js
 * Notepad form feature module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, app */

app.notepad_form = (function () {
  'use strict';
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      main_html : Handlebars.compile($('#app-notes-form-template').html()),

      settable_map : {
        slider_open_time    : true,
        slider_close_time   : true,
        slider_opened_em    : true,
        slider_closed_em    : true,
        slider_opened_title : true,
        slider_closed_title : true,

        chat_model          : true,
        conversation_model  : true,
        set_chat_anchor     : true
      },

      slider_open_time     : 120,
      slider_close_time    : 120,
      slider_opened_em     : 30,
      slider_closed_em     : 2,
      slider_opened_title  : 'Tap to close',
      slider_closed_title  : 'Tap to open',
      slider_opened_min_em : 10,
      window_height_min_em : 20,

      chat_model      : null,
      people_model    : null,
      set_chat_anchor : null
    },
    stateMap  = {
      $append_target   : null,
      position_type    : 'closed',
      px_per_em        : 0,
      slider_hidden_px : 0,
      slider_closed_px : 0,
      slider_opened_px : '21em'
    },
    jqueryMap = {},
    setJqueryMap,  setPxSizes,
    setSliderPosition,
    onTapToggle,   onSubmitMsg,  onTapList,
    onLogin,       onLogout,
    configModule,  characterCount,
    removeSlider,  handleResize, initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var
      $append_target = stateMap.$append_target,
      $slider        = $append_target.find( '#app-notepad-form-container' );

    jqueryMap = {
      $slider         : $slider,
      $head           : $slider.find( '.spa-conversation-head' ),
      $toggle         : $slider.find( '.spa-conversation-head-toggle' ),
      $title          : $slider.find( '.spa-conversation-head-title' ),
      $sizer          : $slider.find( '.spa-conversation-sizer' ),
      $list_box       : $slider.find( '.spa-conversation-list-box' ),
      $msg_log        : $slider.find( '.spa-conversation-msg-log' ),
      $msg_in         : $slider.find( '.spa-conversation-msg-in' ),
      $convo_url      : $slider.find( '.spa-conversation-url'),
      $convo_title    : $slider.find( '.spa-conversation-title'),
      $countdown      : $slider.find( '.spa-conversation-countdown' ),
      $send           : $slider.find( '.spa-conversation-msg-send' ),
      $form           : $slider.find( '.spa-conversation-msg-form' ),
      $window         : $(window)
    };
  };
  // End DOM method /setJqueryMap/

  // Begin DOM method /setPxSizes/
  setPxSizes = function () {
    var px_per_em, window_height_em, opened_height_em;

    px_per_em = app.util_b.getEmSize( jqueryMap.$slider.get(0) );
    window_height_em = Math.floor(
      ( jqueryMap.$window.height() / px_per_em ) + 0.5
    );

    opened_height_em
      = window_height_em > configMap.window_height_min_em
      ? configMap.slider_opened_em
      : configMap.slider_opened_min_em;

    stateMap.px_per_em        = px_per_em;
    stateMap.slider_closed_px = configMap.slider_closed_em * px_per_em;

    jqueryMap.$sizer.css({
      height : ( opened_height_em - 2 ) * px_per_em
    });
  };
  // End DOM method /setPxSizes/

  // Begin public method /setSliderPosition/
  // Example   : spa.conversation.setSliderPosition( 'closed' );
  // Purpose   : Move the chat slider to the requested position
  // Arguments :
  //   * position_type - enum('closed', 'opened', or 'hidden')
  //   * callback - optional callback to be run end at the end
  //     of slider animation.  The callback receives a jQuery
  //     collection representing the slider div as its single
  //     argument
  // Action    :
  //   This method moves the slider into the requested position.
  //   If the requested position is the current position, it
  //   returns true without taking further action
  // Returns   :
  //   * true  - The requested position was achieved
  //   * false - The requested position was not achieved
  // Throws    : none
  //
  setSliderPosition = function ( position_type, callback ) {
    var
      height_px, animate_time, slider_title, toggle_text;

    // prepare animate parameters
    switch ( position_type ){
      case 'opened' :
        height_px    = stateMap.slider_opened_px;
        animate_time = configMap.slider_open_time;
        slider_title = configMap.slider_opened_title;
        toggle_text  = '=';
      break;

      case 'hidden' :
        height_px    = 0;
        animate_time = configMap.slider_open_time;
        slider_title = '';
        toggle_text  = '+';
      break;

      case 'closed' :
        height_px    = stateMap.slider_closed_px;
        animate_time = configMap.slider_close_time;
        slider_title = configMap.slider_closed_title;
        toggle_text  = '+';
      break;

      // bail for unknown position_type
      default : return false;
    }

    // animate slider position change
    stateMap.position_type = '';
    jqueryMap.$slider.animate(
      { height : height_px },
      animate_time,
      function () {
        jqueryMap.$toggle.prop( 'title', slider_title );
        jqueryMap.$toggle.text( toggle_text );
        stateMap.position_type = position_type;
        if ( callback ) { callback( jqueryMap.$slider ); }
      }
    );
    return true;
  };
  // End public DOM method /setSliderPosition/

  // Begin private DOM methods to manage chat message


  // End private DOM methods to manage chat message
  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  onTapToggle = function ( event ) {
    var set_chat_anchor = configMap.set_chat_anchor;
    if ( stateMap.position_type === 'opened' ) {
      set_chat_anchor( 'closed' );
    }
    else if ( stateMap.position_type === 'closed' ){
      set_chat_anchor( 'opened' );
    }
    return false;
  };

  onSubmitMsg = function ( event ) {
    var data = {
      "convo_title" : jqueryMap.$convo_title.val(),
      "convo_url"  : jqueryMap.$convo_url.val()
    };

    jqueryMap.$convo_title.val('');
    jqueryMap.$convo_url.val('');
    jqueryMap.$convo_url.focus();

    spa.model.conversations.create(data);
    return false;
  };

  onTapList = function ( event ) {
    var $tapped  = $( event.elem_target ), chatee_id;
    if ( ! $tapped.hasClass('spa-chat-list-name') ) { return false; }

    chatee_id = $tapped.attr( 'data-id' );
    if ( ! chatee_id ) { return false; }

    configMap.chat_model.set_chatee( chatee_id );
    return false;
  };

  onLogin = function ( event, login_user ) {
    configMap.set_chat_anchor( 'opened' );
  };

  onLogout = function ( event, logout_user ) {
    configMap.set_chat_anchor( 'closed' );
    jqueryMap.$title.text( 'Chat' );
  };

  characterCount = function ( ) {
    var remaining = 50 - jqueryMap.$convo_title.val().length;
    jqueryMap.$countdown.text(remaining + ' characters remaining.');
  };

  //-------------------- END EVENT HANDLERS --------------------

  //------------------- BEGIN PUBLIC METHODS -------------------
  // Begin public method /configModule/
  // Example   : spa.conversation.configModule({ slider_open_em : 18 });
  // Purpose   : Configure the module prior to initialization
  // Arguments :
  //   * set_chat_anchor - a callback to modify the URI anchor to
  //     indicate opened or closed state. This callback must return
  //     false if the requested state cannot be met
  //   * chat_model - the chat model object provides methods
  //       to interact with our instant messaging
  //   * people_model - the people model object which provides
  //       methods to manage the list of people the model maintains
  //   * slider_* settings. All these are optional scalars.
  //       See mapConfig.settable_map for a full list
  //       Example: slider_open_em is the open height in em's
  // Action    :
  //   The internal configuration data structure (configMap) is
  //   updated with provided arguments. No other actions are taken.
  // Returns   : true
  // Throws    : JavaScript error object and stack trace on
  //             unacceptable or missing arguments
  //
  configModule = function ( input_map ) {
    spa.util.setConfigMap({
      input_map    : input_map,
      settable_map : configMap.settable_map,
      config_map   : configMap
    });
    return true;
  };
  // End public method /configModule/

  // Begin public method /removeSlider/
  // Purpose    :
  //   * Removes chatSlider DOM element
  //   * Reverts to initial state
  //   * Removes pointers to callbacks and other data
  // Arguments  : none
  // Returns    : true
  // Throws     : none
  //
  removeSlider = function () {
    // unwind initialization and state
    // remove DOM container; this removes event bindings too
    if ( jqueryMap.$slider ) {
      jqueryMap.$slider.remove();
      jqueryMap = {};
    }
    stateMap.$append_target = null;
    stateMap.position_type  = 'closed';

    // unwind key configurations
    configMap.chat_model            = null;
    configMap.conversation_model    = null;
    configMap.set_chat_anchor       = null;

    return true;
  };
  // End public method /removeSlider/

  // Begin public method /handleResize/
  // Purpose    :
  //   Given a window resize event, adjust the presentation
  //   provided by this module if needed
  // Actions    :
  //   If the window height or width falls below
  //   a given threshold, resize the chat slider for the
  //   reduced window size.
  // Returns    : Boolean
  //   * false - resize not considered
  //   * true  - resize considered
  // Throws     : none
  //
  handleResize = function () {
    // don't do anything if we don't have a slider container
    if ( ! jqueryMap.$slider ) { return false; }

    setPxSizes();
    if ( stateMap.position_type === 'opened' ){
      jqueryMap.$slider.css({ height : stateMap.slider_opened_px });
    }
    return true;
  };
  // End public method /handleResize/

  // Begin public method /initModule/
  // Example    : spa.conversation.initModule( $('#div_id') );
  // Purpose    :
  //   Directs Chat to offer its capability to the user
  // Arguments  :
  //   * $append_target (example: $('#div_id')).
  //     A jQuery collection that should represent
  //     a single DOM container
  // Action     :
  //   Appends the chat slider to the provided container and fills
  //   it with HTML content.  It then initializes elements,
  //   events, and handlers to provide the user with a chat-room
  //   interface
  // Returns    : true on success, false on failure
  // Throws     : none
  //
  initModule = function ( $append_target ) {
    var $list_box;

    // load chat slider html and jquery cache
    stateMap.$append_target = $append_target;
    $append_target.append( configMap.main_html );
    setJqueryMap();
    setPxSizes();
    alert('yada')
    jqueryMap.$convo_title.change(characterCount);
    jqueryMap.$convo_title.keyup(characterCount);

    // initialize chat slider to default title and state
    jqueryMap.$toggle.prop( 'title', configMap.slider_closed_title );
    stateMap.position_type = 'opened';

    // Have $list_box subscribe to jQuery global events
    $list_box = jqueryMap.$list_box;
    $.gevent.subscribe( $list_box, 'spa-login',      onLogin      );
    $.gevent.subscribe( $list_box, 'spa-logout',     onLogout     );

    // bind user input events
    jqueryMap.$head.bind(     'utap', onTapToggle );
    jqueryMap.$list_box.bind( 'utap', onTapList   );
    jqueryMap.$form.bind(   'submit', onSubmitMsg );
  };
  // End public method /initModule/

  // return public methods
  return {
    setSliderPosition : setSliderPosition,
    configModule      : configModule,
    initModule        : initModule,
    removeSlider      : removeSlider,
    handleResize      : handleResize
  };
  //------------------- END PUBLIC METHODS ---------------------
}());