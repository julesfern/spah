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
  
  test("Triggers the modification callbacks at the modified path and all higher paths.", function() {
    var data = {foo: {bar: {baz: "val"}}};
    var callbackCounts = [0,0,0,0];
    var callback0 = function() { callbackCounts[0]++; };
    var callback1 = function() { callbackCounts[1]++; };
    var callback2 = function() { callbackCounts[2]++; };
    var callback3 = function() { callbackCounts[3]++; };
    
    var root = Spah.SpahQL.select("/", data).first();
    
    var foo = root.select("/foo").first();
    var bar = foo.select("/bar").first();
    var baz = bar.select("/baz").first();

    root.modified(callback0);
    foo.modified(callback1);
    bar.modified(callback2);
    baz.modified(callback3);
    
    // Try modifying each key descending
    root.set("newkey", "newvalue");
    deepEqual(callbackCounts, [1,0,0,0]);
    foo.set("newkey", "newvalue");
    deepEqual(callbackCounts, [2,1,0,0]);
    bar.set("newkey", "newvalue");
    deepEqual(callbackCounts, [3,2,1,0]);
    baz.replace("val-replaced");
    deepEqual(callbackCounts, [4,3,2,1]);
  });
    
});