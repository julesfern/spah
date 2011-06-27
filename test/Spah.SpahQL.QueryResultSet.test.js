$(document).ready(function() {
  
  var data;
  
  module("Spah.SpahQL.QueryResultSet", {
    setup: function() {
      data = {foo: {foo: "bar"}};
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
  
});