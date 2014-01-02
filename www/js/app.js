$(document).ready(function() {
    var $container = $('#content');
    var $titlecard = $('.titlecard')
    var $titlecard_wrapper = $('.titlecard-wrapper');
    var $w = $(window);
    var $ambient_audio = $('#audio-ambient');
    var $ambient_player = $('#pop-audio-ambient');
    var $audio = $('#audio');
    var $player = $('#pop-audio');
    var aspect_width = 16;
    var aspect_height = 9;
    var window_width;
    var window_height;
    var AUDIO_LENGTH = 60;
    var audio_supported = true;
    var currently_playing = null;
    
    var volume_ambient_active = .3; //.3
    var volume_ambient_inactive = .1; // .1
    var volume_narration_active = 1; //1
    var volume_narration_inactive = 0; //0
    
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
    
	
    
    //resize titlecard
    function on_resize() {
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
    }
    
    $(window).on('resize', on_resize);
    on_resize();
    
});
