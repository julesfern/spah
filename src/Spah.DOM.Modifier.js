/**
 * class Spah.DOM.Modifier
 *
 * A generic superclass for other Modifiers to extend. Spah includes a number of built-in 
 * modifiers which are part of the default set, but you can create your own for use on both the
 * client and server.
 **/

Spah.classCreate("Spah.DOM.Modifier", {
 
  // Singletons
  // ----------------------
  
}, {
  
  // Instance methods
  // ----------------------
  
  // action names. In attribute data-class-foo-bar-if, the action is "class" and the args are "foo-bar"
  "actionName": function(element) {
    throw new Error("Shoulda implemented modifier.actionName()");
  },
  
  // return false if you want to break the modification chain
  // up will be triggered when the associated query flips value to true (if) or false (unless)
  "up": function(element, state, args) {
    throw new Error("Shoulda implemented modifier.up()");
  },
  
  // return false if you want to break the modification chain
  // down will be triggered when the associated query flips value to false (if) or true(unless)
  "down": function(element, state, args) {
    throw new Error("Shoulda implemented modifier.down()");
    
  }

});