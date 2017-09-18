$(document).ready(function() {

  $('.basket-item__control').click(function(event) {
    event.preventDefault();

    var elemSum = $(this).parent().children('.basket-item__sum');
    var sum = parseInt(elemSum.val(), 10);
    var isMinus = $(this).hasClass('basket-item__control_minus');
    var buttonDisabled = $(this).parent().children('.basket-item__control_minus');

    if (isNaN(sum)) {
      sum = 1;
    }

    if (isMinus){
      --sum;
    } else {
      ++sum;
    }

    if (sum <= 1) {
      sum = 1;
      buttonDisabled.prop('disabled',true);
    } else {
      buttonDisabled.prop('disabled',false);
    }

    elemSum.val(sum);

  });

  controlDisabled();
});

function controlDisabled() {
  $('.basket-item__control-wrapper').each(function(index, el) {
    var elemSum = $(this).children('.basket-item__sum');
    var sum = parseInt(elemSum.val(), 10);
    var buttonDisabled = $(this).children('.basket-item__control_minus');

    if (isNaN(sum)) {
      sum = 1;
    }

    if (sum <= 1) {
      sum = 1;
      buttonDisabled.prop('disabled',true);
    } else {
      buttonDisabled.prop('disabled',false);
    }
  });
}