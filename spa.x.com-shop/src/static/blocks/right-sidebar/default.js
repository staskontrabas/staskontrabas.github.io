$(document).ready(function() {

	$('.header__menu').click(function(event) {
		if($('body').hasClass('open')){
			$('body').removeClass('open');
			$('body').css('overflow', 'visible');
			$('html').css('overflow', 'visible');
		} else {
			$('body').addClass('open');
			$('body').css('overflow', 'hidden');
			$('html').css('overflow', 'hidden');
		}
		event.preventDefault();
	});

});