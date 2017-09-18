$(document).ready(function() {

	var search = $('.search');

	$('a[data-type="open-search"]').bind('click', function(event) {
		if(search.hasClass('show')){
			$(this).removeClass('active');
			search.removeClass('show open_suggest');
		} else {
			$(this).addClass('active');
			search.addClass('show');
		}
	});

	$('.search__input .input').keyup(function(event) {
		if($(this).val().length > 0){
			search.addClass('open_suggest');
		} else {
			search.removeClass('open_suggest');
		}
	});

	$('a[data-type="search-clear"]').bind('click', function(event) {
		search.removeClass('open_suggest');
		$('.search__input .input').val('').focus();
		event.preventDefault();
	});

});