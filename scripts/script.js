$(document).ready(function(){

  // Add smooth scrolling 
  $("a").on('click', function(event) {

    if (this.hash !== "") {
      event.preventDefault();

      var hash = this.hash;

      $('html, body').stop().animate({
        scrollTop: $(hash).offset().top
      }, 800, function(){
   
        window.location.hash = hash;
      });
    }
    
  });

});

$(document).ready(function() {
  $(".mobile-menu").on('click', function() {
    $(".mobile-dropdown").slideToggle("fast");
  });
});