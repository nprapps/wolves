var $container;
var $titlecard;
var $titlecard_wrapper;
var $w;
var $ambient_audio;
var $ambient_player;
var $audio;
var $player;
var $waypoints;
var $nav;
var $begin;
var $toggle_ambient;
var $button_download_audio;
var $button_toggle_caption;
var ambient_is_paused = false;
var ambient_start = 0;
var ambient_end = 53;
var aspect_width = 16;
var aspect_height = 9;
var AUDIO_LENGTH = 60;
var audio_supported = true;
var currently_playing = false;
var volume_ambient_active = 0.7;
var volume_ambient_inactive = 0.1;
var volume_narration_active = 1;
var volume_narration_inactive = 0;
var first_page_load = true;

var unveil_images = function() {
    /*
    * Loads images using jQuery unveil.
    * Current depth: 3x the window height.
    */
    if (Modernizr.touch) {
        $container.find('img').unveil($(document).height());
    }
    else {
        $container.find('img').unveil($w.height() * 3);
    }
};

var sub_responsive_images = function() {
    /*
    * Replaces large images with small ones for tiny devices.
    * Contains a test for non-tablet devices.
    */
    window_width = $w.width();
    if (window_width < 769 && Modernizr.touch === true) {
        _.each($container.find('img'), function(img){
            if ($(img).attr('data-src')){
                var responsive_image = $(img).attr('data-src').replace('_1500', '_750');
                $(img).attr('data-src', responsive_image);
            }
        });
    }
    unveil_images();
};

var on_resize = function() {
    /*
    * Handles resizing our full-width images.
    * Makes decisions based on the window size.
    */
    var w;
    var h;
    var w_optimal;
    var h_optimal;

    // Calculate optimal width if height is constrained to window height.
    w_optimal = ($w.height() * aspect_width) / aspect_height;

    // Calculate optimal height if width is constrained to window width.
    h_optimal = ($w.width() * aspect_height) / aspect_width;

    // Decide whether to go with optimal height or width.
    w = $w.width();
    h = h_optimal;

    if (w_optimal > $w.width()) {
        w = w_optimal;
        h = $w.height();
    }

    // Size the divs accordingly.
    $titlecard.width(w + 'px').height(h + 'px');
    $titlecard_wrapper.height($w.height() + 'px');
    $container.css('marginTop', $w.height() + 'px');
};

var check_cues = function(e) {
    /*
    * Handles actions based on the cue.
    * Example: Stops player when end cue is reached.
    */
    if (e.jPlayer.status.currentTime > parseInt(ambient_end, 0)) {

        // Don't pause the player, stop the player.
        $ambient_player.jPlayer("stop");
        currently_playing = false;
    }
};

var play_audio = function(times) {
    /*
    * Plays audio.
    * Requires start and end cue points as a string, times, in this format:
    * "<starting cue point in seconds>, <ending cue point in seconds>"
    * Fades out existing audio clip if one is currently playing.
    */

    // Set the start and ent times as ints.
    ambient_start = parseInt(times.split(',')[0], 0);
    ambient_end = parseInt(times.split(',')[1], 0);

    var init = function() {
        /*
        * Initializes the actual audio.
        * If we're paused, update the state and the start_time for the player.
        * Just don't actually play any audio.
        */
        $ambient_player.jPlayer("pause", ambient_start);
        currently_playing = true;
        if (ambient_is_paused) {
            return;
        }
        $ambient_player.jPlayerFade().to(1000, 0, volume_ambient_active);
        $ambient_player.jPlayer("play");
    };

    // Test if we're in the middle of a currently playing clip.
    if (currently_playing) {

        // If in a currently playing clip, fade the previous clip before starting this one.
        $ambient_player.jPlayerFade().to(1000, volume_ambient_active, 0, function(){
            init();
        });
    } else {

        // Start this clip, otherwise.
        init();
    }
};

var on_ambient_player_ready = function() {
    /*
    * A helper function for declaring the AMBIENT PLAYER to be ready.
    * Loads on button click for iOS/mobile.
    * Loads on initialization for desktop.
    */
    $ambient_player.jPlayer('setMedia', {
        mp3: 'http://s3.amazonaws.com/stage-apps.npr.org/wolves/WOLVESclips2.mp3',
        oga: 'http://s3.amazonaws.com/stage-apps.npr.org/wolves/WOLVESclips2.ogg'
    }).jPlayer('play', ambient_start);
};

var on_toggle_ambient_click =  function() {
    /*
    * Handles the "mute/pause" button clicks.
    */
    $(this).toggleClass("ambi-mute");

    // Don't like this but it's viable.
    if ($(this).hasClass('ambi-mute')) {
        ambient_is_paused = true;
        $ambient_player.jPlayer('pause');
    } else {
        ambient_is_paused = false;
        $ambient_player.jPlayer('play');
    }
};

var on_waypoint = function(element, direction) {
    /*
    * Events to fire when waypoints are reached.
    */

    var waypoint = $(element).attr('id');

    // Grab the waypoints for audio.
    // Varies by direction.
    if ($(element).attr('data-' + direction + '-waypoint')) {
        play_audio($(element).attr('data-' + direction + '-waypoint'));
    }
};


$(document).ready(function() {
    $container = $('#content');
    $titlecard = $('.titlecard');
    $titlecard_wrapper = $('.titlecard-wrapper');
    $w = $(window);
    $ambient_audio = $('#audio-ambient');
    $ambient_player = $('#pop-audio-ambient');
    $audio = $('#audio');
    $player = $('#pop-audio');
    $nav = $('.nav a');
    $waypoints = $('.waypoint');
    $begin = $('.begin-bar');
    $toggle_ambient = $( '.toggle-ambi' );
    $button_download_audio = $('#download-audio');
    $button_toggle_caption = $('.caption-label');

    // Set up the STORY NARRATION player.
    $player.jPlayer({
        ready: function () {
            $(this).jPlayer('setMedia', {
                mp3: 'http://s.npr.org/news/specials/2014/wolves/wolf-ambient-draft.mp3',
                oga: 'http://s.npr.org/news/specials/2014/wolves/wolf-ambient-draft.ogg'
            }).jPlayer('pause');
        },
        play: function() {
            $(this).jPlayer('play', 0);
            _gaq.push(['_trackEvent', 'Audio', 'Started story audio', APP_CONFIG.PROJECT_NAME, 1]);
        },
        ended: function (event) {
            $(this).jPlayer('pause', AUDIO_LENGTH - 1);
            _gaq.push(['_trackEvent', 'Audio', 'Completed story audio', APP_CONFIG.PROJECT_NAME, 1]);
        },
        swfPath: 'js/lib',
        supplied: 'mp3, oga',
        loop: false,
        timeupdate: check_cues,
        volume: volume_narration_active
    });

    // Load the ambient audio player.
    // Set up a ready function.
    var ready_func = on_ambient_player_ready;

    // If it's mobile, don't load a ready function.
    if (Modernizr.touch){
        ready_func = null;
    }

    // Set up the ambient player.
    $ambient_player.jPlayer({
        ready: ready_func,
        swfPath: 'js/lib',
        cssSelectorAncestor: '#jp_container_2',
        loop: false,
        supplied: 'mp3, oga',
        timeupdate: check_cues,
        volume: volume_ambient_active
    });

    // Mute button
    $toggle_ambient.on('click', on_toggle_ambient_click);

    //captions
    $button_toggle_caption.on('click', function() {
        _gaq.push(['_trackEvent', 'Captions', 'Clicked caption button', APP_CONFIG.PROJECT_NAME, 1]);
        $( this ).parent( ".captioned" ).toggleClass('cap-on');
    });

    //scrollspy
    $('body').scrollspy({ target: '.controls' });

    // Smooth scroll for the "begin" button.
    // Also sets up the ambient player.
    $begin.on('click', function() {
        if (Modernizr.touch) { on_ambient_player_ready(); }
        $.smoothScroll({ speed: 800, scrollTarget: '#intro' });
        return false;
    });

    // Smooth scroll for the nav.
    $nav.on('click', function(){
        var hash = $(this).attr('href').replace('#', '');
        $.smoothScroll({ speed: 800, scrollTarget: '#' + hash });
        return false;
    });

    $button_download_audio.on('click', function(){
        _gaq.push(['_trackEvent', 'Audio', 'Downloaded story audio mp3', APP_CONFIG.PROJECT_NAME, 1]);
        console.log('Downloaded story audio mp3');
    });

    //share popover
    $(function () {
        $('body').popover({
            selector: '[data-toggle="popover"]'
        });
    });

    $('.share-this').popover({
        'selector': '',
        'placement': 'left',
        //'title': '<p>Share</p>',
        'content': '<p><i class="fa fa-twitter"></i></p><p><i class="fa fa-facebook-square"></i></p><p>Grab the link</p>',
        'html': 'true'
      });

    $(window).on('resize', on_resize);

    //fluidbox

    // Global variables
    var $fb = $('a[data-fluidbox]'),
      vpRatio;

    // Add class
    $fb.addClass('fluidbox');

    // Create fluidbox modal background
    $('body').append('<div id="fluidbox-overlay" />');

    // The following events will force FB to close
    var closeFb = function (){
        $('a[data-fluidbox].fluidbox-opened').trigger('click');
      },
      positionFb = function ($activeFb){
        // Get elements
        var $img = $activeFb.find('img'),
            $ghost = $activeFb.find('.fluidbox-ghost');

        // Calculate offset and scale
        var offsetY = $(window).scrollTop()-$img.offset().top+0.5*($img.data('imgHeight')*($img.data('imgScale')-1))+0.5*($(window).height()-$img.data('imgHeight')*$img.data('imgScale')),
            offsetX = 0.5*($img.data('imgWidth')*($img.data('imgScale')-1))+0.5*($(window).width()-$img.data('imgWidth')*$img.data('imgScale'))-$img.offset().left,
            scale = $img.data('imgScale');

        // Animate ghost element
        $ghost.css({
          'transform': 'translate('+offsetX+'px,'+offsetY+'px) scale('+scale+')'
        });
      };

    // Close Fluidbox when overlay is closed
    $('#fluidbox-overlay').click(closeFb);

    // Check if images are loaded first
    $fb.imagesLoaded().done(function (){

    // Create dynamic elements
    $fb
    .wrapInner('<div class="fluidbox-wrap" />')
    .find('img')
      .css({ opacity: 1 })
      .after('<div class="fluidbox-ghost" />');

    // Listen to resize event for calculations
    $(window).resize(function (){

      // Get viewport ratio
      vpRatio = $(window).width() / $(window).height();

      // Get dimensions and aspect ratios
      $fb.each(function (){
        var $img   = $(this).find('img'),
            $ghost = $(this).find('.fluidbox-ghost'),
            $wrap  = $(this).find('.fluidbox-wrap'),
            data   = $img.data();

        // Save image dimensions as jQuery object
        data.imgWidth  = $img.width();
        data.imgHeight = $img.height();
        data.imgRatio  = $img.width() / $img.height();

        // Resize and position ghost element
        $ghost.css({
          width: $img.width(),
          height: $img.height(),
          top: $img.offset().top - $wrap.offset().top,
          left: $img.offset().left - $wrap.offset().left,
        });

        // Calculate scale based on orientation
        if(vpRatio > data.imgRatio) {
          data.imgScale = $(window).height()*0.95 / $img.height();
        } else {
          data.imgScale = $(window).width()*0.95 / $img.width();
        }

      });

      // Reposition Fluidbox, but only when one is found to be opened
      var $activeFb = $('a[data-fluidbox].fluidbox-opened');
      if($activeFb.length > 0) positionFb($activeFb);

    }).resize();

    // Bind click event
    $fb.click(function (e){
      // Variables
      var $activeFb = $(this),
          $img   = $(this).find('img'),
          $ghost = $(this).find('.fluidbox-ghost');

      _gaq.push(['_trackEvent', 'Photo', 'Zoomed on ' + $img.attr('src'), APP_CONFIG.PROJECT_NAME, 1]);

      if($(this).data('fluidbox-state') === 0 || !$(this).data('fluidbox-state')) {
        // State: Closed
        // Action: Open fluidbox

        // Switch state
        $(this)
        .data('fluidbox-state', 1)
        .removeClass('fluidbox-closed')
        .addClass('fluidbox-opened');

        // Show overlay
        $('#fluidbox-overlay').fadeIn();

        // Set thumbnail image source as background image first, preload later
        $ghost.css({
          'background-image': 'url('+$img.attr('src')+')',
          opacity: 1
        });

        // Hide original image
        $img.css({ opacity: 0 });

        // Preload ghost image
        var ghostImg = new Image();
        ghostImg.onload = function (){
          $ghost.css({ 'background-image': 'url('+$activeFb.attr('href')+')' });
        };
        ghostImg.src = $(this).attr('href');

        // Position Fluidbox
        positionFb($(this));

      } else {
        // State: Open
        // Action: Close fluidbox

        // Switch state
        $(this)
        .data('fluidbox-state', 0)
        .removeClass('fluidbox-opened')
        .addClass('fluidbox-closed');

        // Hide overlay
        $('#fluidbox-overlay').fadeOut();

        // Show original image
        $img.css({ opacity: 1 });

        // Reverse animation on wrapped elements
        $ghost
        .css({ 'transform': 'translate(0,0) scale(1)' })
        .one('webkitTransitionEnd MSTransitionEnd oTransitionEnd otransitionend transitionend', function (){
          // Wait for transntion to complete before hiding the ghost element
          $ghost.css({ opacity: 0 });
        });

      }
      e.preventDefault();
    });
    });

    on_resize();
    sub_responsive_images();
});

// Defer pointer events on animated header
$(window).load(function (){
  $('header').css({
    'pointer-events': 'auto'
  });
});
