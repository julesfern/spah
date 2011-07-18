exports["Spah.SpahQL.Callbacks"] = {
  
  "Registers the callbacks": function(test) {
    Spah.SpahQL.Callbacks.reset();
    
    var data = {foo: "bar"};
    var callback = function() { return 0; };
    Spah.SpahQL.Callbacks.addCallbackForPathModifiedOnObject("/foo", data, callback);
    test.deepEqual(Spah.SpahQL.Callbacks.callbacks, {"/foo": [[data, callback]]});
    test.done();
  },
  
  "Removes the callbacks": function(test) {
    Spah.SpahQL.Callbacks.reset();
    
    var data = {foo: "bar"};
    var callback1 = function() { return 0; };
    var callback2 = function() { return 1; };
    Spah.SpahQL.Callbacks.addCallbackForPathModifiedOnObject("/foo", data, callback1);
    Spah.SpahQL.Callbacks.addCallbackForPathModifiedOnObject("/foo", data, callback2);
    test.deepEqual(Spah.SpahQL.Callbacks.callbacks, {"/foo": [[data, callback1], [data, callback2]]});
    
    Spah.SpahQL.Callbacks.removeCallbackForPathModifiedOnObject("/foo", data, callback2);
    test.deepEqual(Spah.SpahQL.Callbacks.callbacks, {"/foo": [[data, callback1]]});
    test.done();
  },
  
  "Triggers the modification callbacks at the modified path and all higher paths.": function(test) {
    Spah.SpahQL.Callbacks.reset();
    
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
    test.deepEqual(callbackCounts, [1,0,0,0]);
    foo.set("newkey", "newvalue");
    test.deepEqual(callbackCounts, [2,1,0,0]);
    bar.set("newkey", "newvalue");
    test.deepEqual(callbackCounts, [3,2,1,0]);
    baz.replace("val-replaced");
    test.deepEqual(callbackCounts, [4,3,2,1]);
    test.done();
  },
  
  "Attaches the query result and path to the modification callback": function(test) {
    Spah.SpahQL.Callbacks.reset();
    
    var data = {foo: {bar: {baz: "val"}}};
    var root = Spah.SpahQL.select("/", data).first();
    var foo = root.select("/foo").first();
    
    test.expect(3);
    foo.modified(function(path, result) {
      test.equal(path, foo.path);
      test.equal(result.path, foo.path);
      test.deepEqual(result.value, {bar: {baz: "val"}, newkey: "newvalue"});
    });
    foo.set("newkey", "newvalue");
    test.done();
  },
  
  "Triggers modification callbacks on non-existent paths when setting complex values": function(test) {
    Spah.SpahQL.Callbacks.reset();
    var data = {foo: {bar: {baz: "val"}}};
    var root = Spah.SpahQL.select("/", data).first();

    test.expect(3);
    root.modified("/foo/newarr", function(path, result) {
      test.equal(path, "/foo/newarr");
      test.equal(result.path, path);
      test.deepEqual(result.value, ["a","b","c"]);
    });
    root.select("/foo").set("newarr", ["a","b","c"]);
    test.done();
  }
    
};