/* VideoJS-Youtube API Based off youtube.js
================================================================================ */

_V_.youtube = _V_.PlaybackTech.extend({

  init: function(player, options){
    this.player = player;

    var source = options.source,

      // Which element to embed in
      parentEl = options.parentEl,

      // Create a temporary element to be replaced by swf object
      placeHolder = this.el = _V_.createElement("div", { id: parentEl.id + "_temp_ytswf" }),

      // Generate ID for swf object
      objId = player.el.id+"_youtube_api";

      // Store player options in local var for optimization
      playerOptions = player.options,

      // Merge default flashvars with ones passed in to init
      flashvars = _V_.merge({
        // Player Settings
      }, options.flashVars),

      // Merge default parames with ones passed in
      params = _V_.merge({
        allowScriptAccess: "always",
        wmode: "opaque",
        bgcolor: "#000000"
      }, options.params),

      // Merge default attributes with ones passed in
      attributes = _V_.merge({
        id: objId,
        name: objId,
        'class': 'vjs-tech'
      }, options.attributes);


    this.ready(function(){

      this.setupTriggers();

      var url = source.src;

      if (url.indexOf("http://") == 0) {
        // Get Youtube ID from URL
        url = url.match(/v=([^&]+)/)[1];
      }
      player.tech.el.cueVideoById(url);

    });

    // Add placeholder to player div
    _V_.insertFirst(placeHolder, parentEl);

    swfobject.embedSWF("http://www.youtube.com/apiplayer?" +
                       "version=3&enablejsapi=1&playerapiid=" + objId,
                       placeHolder.id, "480", "295", "9", null, null, params, attributes);

  },

  setupTriggers: function(){
    this.el.addEventListener("onStateChange",
      "(function(state){ _V_.youtube.stateChange('"+this.player.id+"',state); })");

    this.el.addEventListener("onError",
      "(function(errorCode){ _V_.youtube.error('"+this.player.id+"',errorCode); })");
  },

  play: function(){ this.el.playVideo(); },
  pause: function(){ this.el.pauseVideo(); },
  paused: function(){
    return this.el.getPlayerState() !== 1; // More accurate than isPaused
  },

  currentTime: function(){ return this.el.getCurrentTime(); },
  setCurrentTime: function(seconds){
    // False blocks seek-ahead.
    this.el.seekTo(seconds, true);
  },

  duration: function(){
    return this.el.getDuration();
  },

  buffered: function(){
    var percent = this.el.getVideoBytesLoaded() / this.el.getVideoBytesTotal(),
        seconds = this.duration() * percent;
    return _V_.createTimeRange(0, seconds);
  },

  volume: function(){ return _V_.round(this.el.getVolume() / 100, 2); },
  setVolume: function(percentAsDecimal){
    this.el.setVolume(parseInt(percentAsDecimal * 100));

    // Youtube Doesn't support VolumeChange Events
    this.triggerEvent("volumechange");
  },
  muted: function(){ return this.el.isMuted(); },
  setMuted: function(bool){
    if (bool) {
      this.el.mute()
    } else {
      this.el.unMute()
    }
  },

  supportsFullScreen: function(){
    return false; // Flash does not allow fullscreen through javascript
    // Maybe at click listener, and say "click screen".
  },
  enterFullScreen: function(){ this.tels.flowplayer.api.toggleFullscreen(); },

  src: function(src){
    this.el.cueVideoById(src);
  },
  load: function(){
  }

});

window.onYouTubePlayerReady = function(playerId) {

  console.log("playerId: " + playerId);
  var el = _V_.el(playerId);

  // Get player from box
  // On firefox reloads, el might already have a player
  var player = el.player || el.parentNode.player,
      tech = player.tech;


  // Reference player on tech element
  el.player = player;

  // Update reference to playback technology element
  tech.el = el;

  tech.triggerReady();
}

_V_.youtube.stateChange = function(id, state){
  var player = _V_(id);

  if (state == 0) {
    player.triggerEvent("ended");
  } else if (state == 1) {
    player.triggerEvent("play");
    player.triggerEvent("playing");
  } else if (state == 2) {
    player.triggerEvent("pause");
  }
};

_V_.youtube.error = function(id, errorCode){
  _V_.log(id, errorCode);
};

/* Youtube Support Testing -------------------------------------------------------- */

_V_.youtube.isSupported = function(){
return true;
// return swfobject.hasFlashPlayerVersion("10");
}

_V_.youtube.canPlaySource = function(srcObj){
  return !!(srcObj.type.toLowerCase() == "video/youtube");
  // 
  // if (srcObj.type.toLowerCase() == "video/youtube") {
  //   return true;
  // }
  // if (srcObj.type in _V_.flash.prototype.support.formats) { return "maybe"; }
  // return srcObj.type == "video/youtube";
};

_V_.youtube.prototype.support = {
  formats: {
    "video/youtube": "YOUTUBE",
  },

  // Optional events that we can manually mimic with timers
  progressEvent: false,
  timeupdateEvent: false,

  // Resizing plugins using request fullscreen reloads the plugin
  fullscreenResize: false,

  // Resizing plugins in Firefox always reloads the plugin (e.g. full window mode)
  parentResize: !(_V_.ua.match("Firefox"))
};