var $container;
var $titlecard;
var $titlecard_wrapper;
var $w = $(window);
var $ambient_audio;
var $ambient_player;
var $story_audio;
var $story_player;
var $waypoints;
var $nav;
var $begin;
var $toggle_ambient;
var $button_download_audio;
var $button_toggle_caption;
var $lightbox;
var $lightbox_image;
var $story_player_button;
var $enlarge;
var $intro_advance;
var ambient_is_paused = true;
var ambient_start = 0;
var ambient_end = 53;
var aspect_width = 16;
var aspect_height = 9;
var story_start = 0;
var story_end = 830;
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
        // If we're on a touch device, just load all the images.
        // Seems backwards, but iOS Safari and Android have terrible scroll event
        // handling that doesn't allow unveil to progressively load images.
        $container.find('img').unveil($(document).height());
    }
    else {
        // Otherwise, start loading at 3x the window height.
        $container.find('img').unveil($w.height() * 3);
    }
};

var sub_responsive_images = function() {
    /*
    * Replaces large images with small ones for tiny devices.
    * Contains a test for non-tablet devices.
    */

    // If the window is narrow and this is a touch device ...
    if ($w.width() < 769 && Modernizr.touch === true) {

        // Loop over our images ...
        _.each($container.find('img'), function(img){

            // If the image has a data-src attribute ...
            if ($(img).attr('data-src')){

                // Sub in the responsive image from that data-src attribute.
                var responsive_image = $(img).attr('data-src').replace('_1500', '_750');
                $(img).attr('data-src', responsive_image);
            }
        });
    }

    // Call unveil afterwards.
    unveil_images();
};

var on_window_resize = function() {
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
    //$opener.height($w.height() + 'px');
    $container.css('marginTop', $w.height() + 'px');

};

var on_story_timeupdate = function(e) {
    /*
    * Handles the time updates for the story player.
    */

    // If we reach the end, stop playing AND send a Google event.
    if (e.jPlayer.status.currentTime > parseInt(story_end, 0)) {
        $story_player.jPlayer('stop');
        _gaq.push(['_trackEvent', 'Audio', 'Completed story audio', APP_CONFIG.PROJECT_NAME, 1]);
    }

    // Count down when playing but for the initial time, show the length of the audio.
    // Set the time to the current time ...
    var time_text = $.jPlayer.convertTime(e.jPlayer.status.currentTime);

    // ... unless it's the initial state. In that case, show the length of the audio.
    if (parseInt(e.jPlayer.status.currentTime, 0) === 0) {
        time_text = $.jPlayer.convertTime(story_end);
    }

    // Write the current time to our time div.
    $('.current-time').text(time_text);
};

var on_ambient_timeupdate = function(e) {
    /*
    * Handles the time updates for the ambient player.
    * Stops audio based on cue points rather than the end of the clip.
    */
    if (e.jPlayer.status.currentTime > parseInt(ambient_end, 0)) {

        // Don't pause the player, stop the player.
        $ambient_player.jPlayer('stop');
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

        if (ambient_is_paused) {
            return;
        }

        $ambient_player.jPlayerFade().to(1000, 0, volume_ambient_active);
        $ambient_player.jPlayer("play");
        currently_playing = true;
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
        mp3: 'http://stage-apps.npr.org/wolves/audio/ambient.mp3',
        oga: 'http://stage-apps.npr.org/wolves/audio/ambient.ogg'
    }).jPlayer('pause', ambient_start);
};

var on_toggle_ambient_click =  function() {
    /*
    * Handles the "mute/pause" button clicks.
    */
    $(this).toggleClass("ambi-mute");

    // Don't like this but it's viable.
    // We've got a global "is paused" state, too.
    if ($(this).hasClass('ambi-mute')) {

        // If the mute button is on, pause the audio.
        ambient_is_paused = true;
        $ambient_player.jPlayer('pause');

    } else {

        // Otherwise, let the player play.
        ambient_is_paused = false;
        $ambient_player.jPlayer('play');

    }
};

var on_begin_click = function() {
    /*
    * Handles clicks on the begin button.
    */
    // Remove the mute class.
    $toggle_ambient.removeClass("ambi-mute");

    // If this is a mobile device, start up the waterworks.
    if (Modernizr.touch) {
        on_ambient_player_ready();
        $( "#content" ).addClass( "touch-begin" );
    }

    // On all devices, start playing the audio.
    $ambient_player.jPlayer('play', ambient_start);

    //show the mute button
    $( "body" ).addClass( "ambient-begin" );

    // Smooth scroll us to the intro.
    $.smoothScroll({ speed: 800, scrollTarget: '#intro' });

    // Unpause.
    ambient_is_paused = false;

    // Don't do anything else.ß
    return false;
};

var button_toggle_caption_click = function() {
    /*
    * Click handler for the caption toggle.
    */
    _gaq.push(['_trackEvent', 'Captions', 'Clicked caption button', APP_CONFIG.PROJECT_NAME, 1]);
    $( this ).parent( ".captioned" ).toggleClass('cap-on');
};

var on_nav_click = function(){
    /*
    * Click handler for navigation element clicks.
    */
    var hash = $(this).attr('href').replace('#', '');
    $.smoothScroll({ speed: 800, scrollTarget: '#' + hash });
    return false;
};

var on_lightbox_click = function() {
    /*
    * Click handler for lightboxed photos.
    */
    if (!Modernizr.touch) {
        lightbox_image($(this).find('img'));
    }
};

var on_button_download_audio_click = function(){
    /*
    * Click handler for the download button.
    */
    _gaq.push(['_trackEvent', 'Audio', 'Downloaded story audio mp3', APP_CONFIG.PROJECT_NAME, 1]);
    console.log('Downloaded story audio mp3');
};

var on_story_player_button_click = function(){
    /*
    * Click handler for the story player "play" button.
    */
    _gaq.push(['_trackEvent', 'Audio', 'Played audio story', APP_CONFIG.PROJECT_NAME, 1]);
    $story_player.jPlayer('play');
};

var on_window_scroll = function() {
    /*
    * Fires on window scroll.
    * Largely for handling bottom-of-page or nearly bottom-of-page
    * events, because waypoints won't ever trigger.
    */
    if ($(window).scrollTop() + $(window).height() > $(document).height() - 25) {

        $ambient_player.jPlayerFade().to(1000, volume_ambient_active, 0);
        $('ul.nav li').removeClass('active');
        $('.listen-nav').addClass('active');

    } else {

        if ($('.listen-nav').hasClass('active')) {
            $('ul.nav li').removeClass('active');
            $('.tricks-nav').addClass('active');
            $ambient_player.jPlayerFade().to(1000, 0, volume_ambient_active);
            play_audio($('#tricks').attr('data-down-waypoint'));
        }
    }
};

var on_intro_advance_click = function() {
    /*
    * Click handler on intro advance.
    */
    $.smoothScroll({ speed: 800, scrollTarget: '#intro-copy' });
};

var on_waypoint = function(element, direction) {
    /*
    * Event for reaching a waypoint.
    */

    // Get the waypoint name.
    var waypoint = $(element).attr('id');
    var cuepoints = $(element).attr('data-' + direction + '-waypoint');

    // Get the directionally-varied waypoint for audio.
    if (cuepoints) {
        play_audio(cuepoints);
    }

    // Just hard code this because of reasons.
    if (direction == "down") {
        if ($(element).hasClass('chapter')) {
            $('ul.nav li').removeClass('active');
            $('.' + waypoint + '-nav').addClass('active');
        }
    }

    if (direction == "up") {
        var $previous_element = $(element).prev();
        if ($previous_element.hasClass('chapter')) {
            $('ul.nav li').removeClass('active');
            $('.' + $previous_element.attr('id') + '-nav').addClass('active');
        }
    }

    // If this is a chapter waypoint, run the chapter transitions.
    if ($(element).children('.edge-to-edge')){
        $(element).addClass('chapter-active');
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
    $('body').append('<div id="lightbox"><i class="fa fa-plus-circle close-lightbox"></i></div>');

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
    $ambient_audio = $('#audio-ambient');
    $ambient_player = $('#pop-audio-ambient');
    $story_audio = $('#audio');
    $story_player = $('#pop-audio');
    $nav = $('.nav a');
    $waypoints = $('.waypoint');
    $begin = $('.begin-bar');
    $toggle_ambient = $( '.toggle-ambi' );
    $button_download_audio = $('#download-audio');
    $button_toggle_caption = $('.caption-label');
    $overlay = $('#fluidbox-overlay');
    $story_player_button = $('#jp_container_1 .jp-play');
    $enlarge = $('.enlarge');
    $intro_advance = $("#intro-advance");


    //share popover
    $(function () {
        $('body').popover({
            selector: '[data-toggle="popover"]'
        });
    });

	$('.share').popover({
        'selector': '',
        'placement': 'left',
        'content': '<a target="_blank" href="https://twitter.com/intent/tweet?text=The elusive gray wolf and the people who love/hate them, via @nprnews. https://pbs.twimg.com/media/BfUL3tHIgAAqTnF.jpg&url=http://apps.npr.org/wolves/&original_referer=@nprviz"><i class="fa fa-twitter"></i></a> <a target="_blank" href="http://www.facebook.com/sharer/sharer.php?u=http://apps.npr.org/wolves/"><i class="fa fa-facebook-square"></i></a>',
        'html': 'true'
      });

    // Set up the STORY NARRATION player.
    $story_player.jPlayer({
        ready: function () {
            $(this).jPlayer('setMedia', {
                mp3: 'http://s.npr.org/news/specials/2014/wolves/wolf-ambient-draft.mp3',
                oga: 'http://s.npr.org/news/specials/2014/wolves/wolf-ambient-draft.ogg'
            }).jPlayer('pause');
        },
        timeupdate: on_story_timeupdate,
        swfPath: 'js/lib',
        supplied: 'mp3, oga',
        loop: false,
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
        timeupdate: on_ambient_timeupdate,
        volume: volume_ambient_active
    });

    $toggle_ambient.on('click', on_toggle_ambient_click);

    $button_toggle_caption.on('click', button_toggle_caption_click);

    $begin.on('click', on_begin_click);

    $nav.on('click', on_nav_click);

    $enlarge.on('click', on_lightbox_click);

    $button_download_audio.on('click', on_button_download_audio_click);

    $story_player_button.on('click', on_story_player_button_click);

    $w.on('scroll', on_window_scroll);

    $w.on('resize', on_window_resize);

    $intro_advance.on('click', on_intro_advance_click);

    on_window_resize();

    sub_responsive_images();

    $waypoints.waypoint(function(direction){
        on_waypoint(this, direction);
    }, { offset: $w.height() / 2 });

});

// Defer pointer events on animated header
$w.load(function (){
  $('header').css({
    'pointer-events': 'auto'
  });
});
