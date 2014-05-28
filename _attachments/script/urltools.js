/*
Function to pull off the URL parameters into an array
or to pull them off by their name

Usage

// Get object of URL parameters
var allVars = $.getUrlVars();

// Getting URL var by its name
var byName = $.getUrlVar('name');

*/

$.extend({
  getUrlVars: function(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },
  getUrlVar: function(name){
    return $.getUrlVars()[name];
  }
});