$(document).ready(function() {
 $(window).on('load', function() {

  $('.radio-group_home .radio__input').change(function(event) {
   
   $('.carousel').trigger('destroy.owl.carousel');
    
    $('.carousel').each(function(index, el) {
       var sliderOwl = $(this),
          sliderParametrs = {},
          attrParametrs = $(this).attr('data-options');
      if (typeof attrParametrs != 'undefined')
        sliderParametrs = JSON.parse(attrParametrs);
      sliderOwl.owlCarousel(sliderParametrs);
    });

   });

 });

});