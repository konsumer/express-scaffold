$(function(){
  $('.carousel').carousel();
  $('ul.nav > li > a[href="' + document.location.pathname + '"]').parent().addClass('active');
});