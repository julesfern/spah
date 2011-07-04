$(document).ready(function() {
  
  var data;
  
  module("Spah.SpahQL.QueryResult", {
    setup: function() {
      data = {foo: {foo: "bar"}, booltest: {yes: true, no: false}, arrtest: ["a", "b", "c"], stringtest: "abc"};
    }
  });
  
  test("Retrieves the parent path", function() {
    var res;
    res = new Spah.SpahQL.QueryResult("/", 0);
    equal(res.parentPath(), null);
    res = new Spah.SpahQL.QueryResult("/foo/bar/.baz", 0);
    equal(res.parentPath(), "/foo/bar");
  });
  
  test("Retrieves the correct key name", function() {
    var res;
    res = new Spah.SpahQL.QueryResult(null, 1);
    equal(res.keyName(), null);
    res = new Spah.SpahQL.QueryResult("/", 1);
    equal(res.keyName(), null);
    res = new Spah.SpahQL.QueryResult("/foo/bar/baz", 1);
    equal(res.keyName(), "baz");
  });
  
  test("Retrieves the parent", function() {
    var set = Spah.SpahQL.select("/foo/foo", data);
    deepEqual(set.first().parent(), Spah.SpahQL.select("/foo", data).first());
  });
  
  test("Allows sub-selections", function() {
    deepEqual(Spah.SpahQL.select("/foo", data).first().select("/foo"), Spah.SpahQL.select("/foo/foo", data));
  });
  
  test("Allows sub-assertions", function() {
    ok(Spah.SpahQL.assert("/booltest/yes", data));
    ok(!Spah.SpahQL.assert("/booltest/no", data));
    ok(Spah.SpahQL.select("/booltest", data).first().assert("/yes"));
    ok(!Spah.SpahQL.select("/booltest", data).first().assert("/no"));
  });
  
  test("May set a subkey on self and alter the root data construct in the process", function() {
    var res;
    
    // Test objects
    res = Spah.SpahQL.select("/foo", data).first();
    ok(res.set(0, "zero"));
    ok(res.set("baz", "car"));
    ok(!res.set("", "empty"));
    ok(!res.set(" ", "spaces"));
    equal(data["foo"]["0"], "zero");
    equal(data["foo"]["baz"], "car");
    equal(data["foo"][""], null);
    equal(data["foo"][" "], null);
    
    // Test arrays
    res = Spah.SpahQL.select("/arrtest", data).first();
    ok(res.set(0, "replaced-a"));
    ok(res.set("1", "replaced-b"));
    ok(!res.set("stringkey", "stringval"));
    deepEqual(data["arrtest"], ["replaced-a", "replaced-b", "c"]);
    
    // Test strings, bools reject the set
    res = Spah.SpahQL.select("/stringtest", data).first();
    ok(!res.set(0, "_"));
    ok(!res.set("1", "_"));
    equal(data["stringtest"], "abc");
  });
  
  test("May replace own value on the parent", function() {
    var res = Spah.SpahQL.select("/foo/foo", data).first();
    equal(res.value, "bar");
    ok(res.replace("bar-replaced"));
    
    equal(data.foo.foo, "bar-replaced");
    equal(res.value, "bar-replaced");
    res = Spah.SpahQL.select("/foo/foo", data).first();
    equal(res.value, "bar-replaced");    
  })
  
  test("Registers a callback at a child path", function() {
    var data = {foo: {bar: {baz: "val"}}};
    var callbackCounts = [0,0,0];
    var callback0 = function() { callbackCounts[0]++; };
    var callback1 = function() { callbackCounts[1]++; };
    var callback2 = function() { callbackCounts[2]++; };
    
    var root = Spah.SpahQL.select("/", data).first();
        root.modified(callback0);
        root.modified("/newkey", callback1);
        
    var foo = root.select("/foo").first();
        foo.modified("/newkey", callback2);
    
    root.set("foo", "bar");
    deepEqual(callbackCounts, [1,0,0]);
    root.set("newkey", "newval");
    deepEqual(callbackCounts, [2,1,0]);
    foo.set("arbitrary", "arb");
    deepEqual(callbackCounts, [3,1,0]);
    foo.set("newkey", "newval");
    deepEqual(callbackCounts, [4,1,1]);
    
  });
  
});