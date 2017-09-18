(function ($) {
	$(function () {
		var $tr = $('#send_type_row');
		var $labels = $tr.find('label');
		var id = $tr.find('input:checked').attr('id');
		if (typeof id != 'undefined') {
			$tr.find('label[for="'+id+'"]').addClass('checked');
		}
		$labels.on('click', function () {
			if (!$(this).hasClass('checked')) {
				$labels.removeClass('checked');
				$(this).addClass('checked');
			}
		})
	})
})(jQuery);
