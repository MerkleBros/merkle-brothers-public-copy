$(function() {
    $('.list-group-item').on('click',function(e){
     	  var previous = $(this).closest(".list-group").children(".active");
     	  previous.removeClass('active');
     	  $(e.target).addClass('active');
 	})
});