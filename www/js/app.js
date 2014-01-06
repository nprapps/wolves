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
var aspect_width;
var aspect_height;
var window_width;
var window_height;
var AUDIO_LENGTH;
var audio_supported;
var currently_playing;
var ambient_start;
var ambient_end;
var volume_ambient_active;
var volume_ambient_inactive;
var volume_narration_active;
var volume_narration_inactive;

var unveil_images = function() {
    /*
    * Loads images using jQuery unveil.
    * Current depth: 3x the window height.
    */
    $container.find('img').unveil($w.height() * 3);
};

var sub_responsive_images = function() {
    /*
    * Replaces large images with small ones for tiny devices.
    * Contains a test for non-tablet devices.
    */
    window_width = $w.width();
    if (window_width < 769 && Modernizr.touch === true) {
        _.each($container.find('img'), function(img){
            $(img).attr('data-src', $(img).attr('data-src').replace('_1500', '_750'));
        });
    }
    unveil_images();
};

var on_resize = function() {
    /*
    * Handles resizing our full-width images.
    */
    var w;
    var h;
    var w_optimal;
    var h_optimal;
    var w_offset = 0;
    var h_offset = 0;

    window_width = $w.width();
    window_height = $w.height();

    // calculate optimal width if height is constrained to window height
    w_optimal = (window_height * aspect_width) / aspect_height;

    // calculate optimal height if width is constrained to window width
    h_optimal = (window_width * aspect_height) / aspect_width;

    // decide whether to go with optimal height or width
    if (w_optimal > window_width) {
        w = w_optimal;
        h = window_height;
    } else {
        w = window_width;
        h = h_optimal;
    }
    w_offset = (window_width - w) / 2;
    h_offset = (window_height - h) / 2;

    // size the divs accordingly
    $titlecard.width(w + 'px').height(h + 'px');
    //$titlecard.css('margin', h_offset + 'px ' + w_offset + 'px');
    $titlecard_wrapper.height(window_height + 'px');
    $container.css('marginTop', window_height + 'px');
};

var check_cues = function(e) {
    /*
    * Handles actions based on the cue.
    * Example: Stops player when end cue is reached.
    */
    if (e.jPlayer.status.currentTime > parseInt(ambient_end, 0)) {
        console.log('stopping at ' + ambient_end);
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
    ambient_start = parseInt(times.split(',')[0], 0);
    ambient_end = parseInt(times.split(',')[1], 0);

    var init = function() {
        console.log('starting at ' + ambient_start);
        $ambient_player.jPlayer("play", ambient_start);
        $ambient_player.jPlayerFade().to(1000, 0, volume_ambient_active);
        currently_playing = ambient_start;
    };

    if (currently_playing !== ambient_start) {
        if (currently_playing !== false) {
            $ambient_player.jPlayerFade().to(1000, volume_ambient_active, 0, function(){
                console.log('fading!');
                init();
            });
        } else {
            console.log('starting!');
            init();
        }
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

    aspect_width = 16;
    aspect_height = 9;
    AUDIO_LENGTH = 60;
    audio_supported = true;
    currently_playing = false;

    volume_ambient_active = 0.5; // 0.3
    volume_ambient_inactive = 0.1; // 0.1
    volume_narration_active = 1; // 1
    volume_narration_inactive = 0; // 0

    $player.jPlayer({
        ready: function () {
            $(this).jPlayer('setMedia', {
                mp3: 'http://media.npr.org/news/specials/2014/wolves/wolf-ambient-draft.mp3',
                oga: 'http://media.npr.org/news/specials/2014/wolves/wolf-ambient-draft.ogg'
            }).jPlayer('pause');
        },
        play: function() { },
        ended: function (event) {
            $(this).jPlayer('pause', AUDIO_LENGTH - 1);
        },
        swfPath: 'js/lib',
        supplied: 'mp3, oga',
        timeupdate: check_cues,
        volume: volume_narration_active
    });

    $ambient_player.jPlayer({
        ready: function () {
            $(this).jPlayer('setMedia', {
                mp3: 'http://media.npr.org/news/specials/2014/wolves/wolf-ambient-draft.mp3',
                oga: 'http://media.npr.org/news/specials/2014/wolves/wolf-ambient-draft.ogg'
            }).jPlayer('pause');
        },
        swfPath: 'js/lib',
        cssSelectorAncestor: '#jp_container_2',
        loop: true,
        supplied: 'mp3, oga',
        timeupdate: check_cues,
        volume: volume_ambient_active
    });

    // waypoints
    $waypoints.waypoint(function(direction){
        play_audio($(this).attr('data-waypoint'));
    });

    //toggle ambi
    $( '.toggle-ambi' ).click(function() {
        $( this ).toggleClass( "ambi-mute" );
    });

    //captions
    $('.caption-label').click(function() {
        $( this ).parent( ".captioned" ).toggleClass('cap-on');
    });

    //scrollspy
    $('body').scrollspy({ target: '.controls' });

    //smooth scroll events
    $('.begin-bar').click(function() {
        $.smoothScroll({
            speed: 800,
            scrollTarget: '#intro'
        });
        return false;
    });

    $nav.on('click', function(){
        var anchor = $(this).attr('href');
        $.smoothScroll({
            speed: 800,
            scrollTarget: anchor
        });
        return false;
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
