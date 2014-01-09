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
var $lightbox;
var $lightbox_image;
var ambient_is_paused = false;
var ambient_start = 0;
var ambient_end = 53;
var aspect_width = 16;
var aspect_height = 9;
var AUDIO_LENGTH = 60;
var audio_supported = true;
var currently_playing = false;
var volume_ambient_active = 1;
var volume_ambient_inactive = 0.1;
var volume_narration_active = 1;
var volume_narration_inactive = 0;
var first_page_load = true;
var w;
var h;
var w_optimal;
var h_optimal;
var fade;

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
    * Event for reaching a waypoint.
    */

    // Get the waypoint name.
    var waypoint = $(element).attr('id');

    // Get the directionally-varied waypoint for audio.
    if ($(element).attr('data-' + direction + '-waypoint')) {
        play_audio($(element).attr('data-' + direction + '-waypoint'));
    }

    // Kill audio on the final waypoint.
    if (waypoint == 'quote-hilary-zaranek' && direction == 'down'){
        $ambient_player.jPlayerFade().to(1000, volume_ambient_active, 0);
    }

};

var lightbox_image = function(element) {
    /*
    * We built our own lightbox function.
    * We wanted more control over transitions and didn't
    * require image substitution.
    * You'll note that there are three functions.
    * This is because we need to fade the lightbox in and out,
    * but removing/adding it to the document is instantaneous with CSS.
    */

    // Add lightbox to the document.
    $('body').append('<div id="lightbox"></div>');

    // Get our elements.
    $lightbox = $('#lightbox');
    var $el = $(element);

    // Get the clicked image and add it to lightbox.
    $lightbox.append('<img src="' + $el.attr('src') + '" id="lightbox_image">');
    $lightbox_image = $('#lightbox_image');

    // Base styles for the lightbox.
    $lightbox.css({
        display: 'block',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        'z-index': 500,
    });

    // Transition with debounce.
    fade = _.debounce(fade_lightbox_in, 1);
    fade();

    // Grab Wes's properly sized width.
    var lightbox_width = w;

    // Sometimes, this is wider than the window, shich is bad.
    if (lightbox_width > $w.width()) {
        lightbox_width = $w.width();
    }

    // Set the hight as a proportion of the image width.
    var lightbox_height = ((lightbox_width * aspect_height) / aspect_width);

    // Sometimes the lightbox width is greater than the window height.
    // Center it vertically.
    if (lightbox_width > $w.height()) {
        lightbox_top = (lightbox_height - $w.height()) / 2;
    }

    // Sometimes the lightbox height is greater than the window height.
    // Resize the image to fit.
    if (lightbox_height > $w.height()) {
        lightbox_width = ($w.height() * aspect_width) / aspect_height;
        lightbox_height = $w.height();
    }

    // Sometimes the lightbox width is greater than the window width.
    // Resize the image to fit.
    if (lightbox_width > $w.width()) {
        lightbox_height = ($w.width() * aspect_height) / aspect_width;
        lightbox_width = $w.width();
    }

    // Set the top and left offsets.
    var lightbox_top = ($w.height() - lightbox_height) / 2;
    var lightbox_left = ($w.width() - lightbox_width) / 2;

    // Set styles on the lightbox image.
    $lightbox_image.css({
        'width': lightbox_width + 'px',
        'height': lightbox_height + 'px',
        'opacity': 1,
        'position': 'absolute',
        'top': lightbox_top + 'px',
        'left': lightbox_left + 'px',
    });

    // Disable scrolling while the lightbox is present.
    $('body').css({
        overflow: 'hidden'
    });

    // On click, remove the lightbox.
    $lightbox.on('click', on_remove_lightbox);
};

var on_remove_lightbox = function() {
    /*
    * Handles the click event.
    */

    // Set the element.
    $el = $('#lightbox');

    // Fade to black.
    $el.css({
        opacity: 0,
    });

    // Un-disable scrolling.
    $('body').css({
        overflow: 'auto'
    });

    // Debounce the fade.
    fade = _.debounce(fade_lightbox_out, 250);
    fade();
};

var fade_lightbox_in = function() {
    /*
    * Fade in event.
    */
    $lightbox.css({
        opacity: 1
    });
};

var fade_lightbox_out = function() {
    /*
    * Fade out event.
    */
    $lightbox.remove();
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
    $overlay = $('#fluidbox-overlay');

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
        if (Modernizr.touch) {
            on_ambient_player_ready();
            $( "#content" ).addClass( "touch-begin" );
        }
        $.smoothScroll({ speed: 800, scrollTarget: '#intro' });
        return false;
    });

    // Smooth scroll for the nav.
    $nav.on('click', function(){
        var hash = $(this).attr('href').replace('#', '');
        $.smoothScroll({ speed: 800, scrollTarget: '#' + hash });
        return false;
    });

    // call lightbox on a click, but only if it's not a mobile device
    if (!Modernizr.touch) {
        $('.img-responsive, img.waypoint').on('click', function() {
            lightbox_image(this);
        });
    }

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

    // Initial window sizing.
    on_resize();

    // Decide on image sizes.
    sub_responsive_images();

    // Initialize waypoints.
    $waypoints.waypoint(function(direction){
        on_waypoint(this, direction);
    }, { offset: $w.height() / 3 });
});

// Defer pointer events on animated header
$(window).load(function (){
  $('header').css({
    'pointer-events': 'auto'
  });
});
