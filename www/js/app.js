var $container;
var $titlecard;
var $titlecard_wrapper;
var $w;
var $ambient_audio;
var $ambient_player;
var $audio;
var $player;
var aspect_width;
var aspect_height;
var window_width;
var window_height;
var AUDIO_LENGTH;
var audio_supported;
var currently_playing;
var volume_ambient_active;
var volume_ambient_inactive;
var volume_narration_active;
var volume_narration_inactive;

var unveil_images = function() {
    $container.find('img').unveil(800);
};

var on_resize = function() {
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

$(document).ready(function() {
    $container = $('#content');
    $titlecard = $('.titlecard');
    $titlecard_wrapper = $('.titlecard-wrapper');
    $w = $(window);
    $ambient_audio = $('#audio-ambient');
    $ambient_player = $('#pop-audio-ambient');
    $audio = $('#audio');
    $player = $('#pop-audio');
    aspect_width = 16;
    aspect_height = 9;
    AUDIO_LENGTH = 60;
    audio_supported = true;
    currently_playing = null;

    volume_ambient_active = 0.3; // 0.3
    volume_ambient_inactive = 0.1; // 0.1
    volume_narration_active = 1; // 1
    volume_narration_inactive = 0; // 0

    var cuepoints = [
        { 'id': 0, 'audio_cue': 0, 'audio_end': 10 },
        { 'id': 1, 'audio_cue': 20, 'audio_end': 30 },
        { 'id': 2, 'audio_cue': 40, 'audio_end': 50 },
        { 'id': 3, 'audio_cue': 60, 'audio_end': 70 },
        { 'id': 4, 'audio_cue': 80, 'audio_end': 90 },
        { 'id': 5, 'audio_cue': 100, 'audio_end': 110 }
    ];

    //toggle ambi
    $( '.toggle-ambi' ).click(function() {
        $( this ).toggleClass( "ambi-mute" );
    });

    //captions
    $('.captioned').click(function() {
        $( this ).toggleClass('cap-on');
    });


    /*
    $('.pt').click(function() {
        $( '.titlecard-first' ).toggleClass('fadeOut');
        if ($(this).text() == 'Hide Wolf')
        $(this).text('Show Wolf');
        else
        $(this).text('Hide Wolf');
        $('body').toggleClass('focused');
        if ($(this).find('p').text() == 'Show Captions')
        $(this).find('p').text('Hide Captions');
        else
        $(this).find('p').text('Show Captions');
    });*/

    //titlecard smooth scroll
    $('.begin-bar').click(function() {
        $.smoothScroll({
            speed: 800,
            scrollTarget: '.intro'
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
    on_resize();
    unveil_images();
});
