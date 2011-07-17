$(document).ready(function() {
  
  var data;
  
  module("Spah.SpahQL.QueryResultSet", {
    setup: function() {
      data = {foo: {foo: "bar"}, str1: "1", str2: "2"};
    }
  });
  
  test("all() returns all results", function() {
    var set = Spah.SpahQL.select("//foo", data);
    equal(set.all().length, set.results.length);
  });
  
  test("first() returns the first result", function() {
    var set = Spah.SpahQL.select("//foo", data);
    ok(set.first() instanceof Spah.SpahQL.QueryResult);
  });
  
  test("each() returns true on completion, false on a halt", function() {
    var set = Spah.SpahQL.select("//foo", data);
    ok(set.each(function(index, total) {}));
    ok(!set.each(function(index, total) { return false; }));
  });
  
  test("map() returns an ordered array", function() {
    var set = Spah.SpahQL.select("//foo", data);
    deepEqual(set.map(function(i,t) { return [i,t]; }), [[0,2],[1,2]]);
  });
  
  test("parentPath() acts on the first result", function() {
    var set = Spah.SpahQL.select("/foo/foo", data);
    equal(set.parentPath(), "/foo");
  });
  
  test("parent() acts on the first result", function() {
    var set = Spah.SpahQL.select("/foo/foo", data);
    deepEqual(set.parent(), Spah.SpahQL.select("/foo", data).first());
  });
  
  test("select() executes against every item in the set", function() {
    var data = {bar: {bar: {baz: "foo", boop: "foop"}}};
    var set = Spah.SpahQL.select("//bar", data);
    
    deepEqual(set.select("//baz"), Spah.SpahQL.select("//baz", data));
    deepEqual(set.select("/baz"), Spah.SpahQL.select("/bar/bar/baz", data));
  });
  
  test("assert() executes against every item in the set", function() {
    var data = {foo: {yes: true, no: false}};
    
    ok(Spah.SpahQL.select("/foo", data).assert("/yes"));
    ok(!Spah.SpahQL.select("/foo", data).assert("/no"));
    ok(Spah.SpahQL.select("/foo", data).assert("/*"));
  });
  
  test("set() works on the first result in the set", function() {
    var set = Spah.SpahQL.select("//foo", data);
    ok(set.set("inner", "ok"));
    equal(data["foo"]["inner"], "ok");
  });
  
  test("replace() works on the first result in the set", function() {
    var set = Spah.SpahQL.select("//foo", data);
    ok(set.replace("replaced"));
    equal(data["foo"], "replaced");
  });
  
  test("replaceAll() works on all values", function() {
    var set = Spah.SpahQL.select("/*[/.type == 'string']", data);
    var prev = data.foo;
    ok(set.replaceAll("replaced"));
    equal(prev, data.foo);
    equal(data.str1, "replaced");
    equal(data.str2, "replaced");
  });
  
  test("replaceEach() replaces only if the test function returns true", function() {
    var set = Spah.SpahQL.select("/*[/.type == 'string']", data);
    set.replaceEach("replaced", function() {
      return this.path == "/str1";
    });
    equal(data.str1, "replaced");
    equal(data.str2, "2");
  });
  
  test("modified(callback) registers callbacks for every result", function() {
    Spah.SpahQL.Callbacks.reset();
    var set = Spah.SpahQL.select("/*[/.type == 'string']", data);
    
    set.modified(function() { return 15; });
    
    ok(Spah.SpahQL.Callbacks.callbacks["/str1"]);
    ok(Spah.SpahQL.Callbacks.callbacks["/str2"]);
  });
  
  test("delete() acts on the first result", function() {
    var set = Spah.SpahQL.select("/foo/foo", data);
    set.delete();
    deepEqual(data.foo, {});
  });
  
  test("deleteAll() works on the entire set", function() {
    var set  = Spah.SpahQL.select("/*", data);
    set.deleteAll();
    deepEqual(data, {});
  });
  
});