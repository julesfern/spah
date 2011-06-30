$(document).ready(function() {
  
  module("Spah.SpahQL.Callbacks", {
    setup: function() {
      Spah.SpahQL.Callbacks.reset();
    }
  });
  
  test("Registers the callbacks", function() {
    var data = {foo: "bar"};
    var callback = function() { return 0; };
    Spah.SpahQL.Callbacks.addCallbackForPathModifiedOnObject("/foo", data, callback);
    deepEqual(Spah.SpahQL.Callbacks.callbacks, {"/foo": [[data, callback]]});
  });
  
  test("Removes the callbacks", function() {
    var data = {foo: "bar"};
    var callback1 = function() { return 0; };
    var callback2 = function() { return 1; };
    Spah.SpahQL.Callbacks.addCallbackForPathModifiedOnObject("/foo", data, callback1);
    Spah.SpahQL.Callbacks.addCallbackForPathModifiedOnObject("/foo", data, callback2);
    deepEqual(Spah.SpahQL.Callbacks.callbacks, {"/foo": [[data, callback1], [data, callback2]]});
    
    Spah.SpahQL.Callbacks.removeCallbackForPathModifiedOnObject("/foo", data, callback2);
    deepEqual(Spah.SpahQL.Callbacks.callbacks, {"/foo": [[data, callback1]]});
  });
  
});