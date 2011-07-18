var data;
var setup = function() {
  data = {foo: {foo: "bar"}, str1: "1", str2: "2"};
}

exports["Spah.SpahQL.QueryResultSet"] = {
  
  "all() returns all results": function(test) {
    setup();
    
    var set = Spah.SpahQL.select("//foo", data);
    test.equal(set.all().length, set.results.length);
    test.done();
  },
  
  "first() returns the first result": function(test) {
    setup();
  
    var set = Spah.SpahQL.select("//foo", data);
    test.ok(set.first() instanceof Spah.SpahQL.QueryResult);
    test.done();
  },
  
  "each() returns true on completion, false on a halt": function(test) {
    setup();
  
    var set = Spah.SpahQL.select("//foo", data);
    test.ok(set.each(function(index, total) {}));
    test.ok(!set.each(function(index, total) { return false; }));
    test.done();
  },
  
  "map() returns an ordered array": function(test) {
    setup();
  
    var set = Spah.SpahQL.select("//foo", data);
    test.deepEqual(set.map(function(i,t) { return [i,t]; }), [[0,2],[1,2]]);
    test.done();
  },
  
  "parentPath() acts on the first result": function(test) {
    setup();
  
    var set = Spah.SpahQL.select("/foo/foo", data);
    test.equal(set.parentPath(), "/foo");
    test.done();
  },
  
  "parent() acts on the first result": function(test) {
    setup();
  
    var set = Spah.SpahQL.select("/foo/foo", data);
    test.deepEqual(set.parent(), Spah.SpahQL.select("/foo", data).first());
    test.done();
  },
  
  "select() executes against every item in the set": function(test) {
    setup();
  
    var data = {bar: {bar: {baz: "foo", boop: "foop"}}};
    var set = Spah.SpahQL.select("//bar", data);
    
    test.deepEqual(set.select("//baz"), Spah.SpahQL.select("//baz", data));
    test.deepEqual(set.select("/baz"), Spah.SpahQL.select("/bar/bar/baz", data));
    test.done();
  },
  
  "assert() executes against every item in the set": function(test) {
    setup();
  
    var data = {foo: {yes: true, no: false}};
    
    test.ok(Spah.SpahQL.select("/foo", data).assert("/yes"));
    test.ok(!Spah.SpahQL.select("/foo", data).assert("/no"));
    test.ok(Spah.SpahQL.select("/foo", data).assert("/*"));
    test.done();
  },
  
  "set() works on the first result in the set": function(test) {
    setup();
  
    var set = Spah.SpahQL.select("//foo", data);
    test.ok(set.set("inner", "ok"));
    test.equal(data["foo"]["inner"], "ok");
    test.done();
  },
  
  "replace() works on the first result in the set": function(test) {
    setup();
  
    var set = Spah.SpahQL.select("//foo", data);
    test.ok(set.replace("replaced"));
    test.equal(data["foo"], "replaced");
    test.done();
  },
  
  "replaceAll() works on all values": function(test) {
    setup();
  
    var set = Spah.SpahQL.select("/*[/.type == 'string']", data);
    var prev = data.foo;
    test.ok(set.replaceAll("replaced"));
    test.equal(prev, data.foo);
    test.equal(data.str1, "replaced");
    test.equal(data.str2, "replaced");
    test.done();
  },
  
  "replaceEach() replaces only if the test function returns true": function(test) {
    setup();
  
    var set = Spah.SpahQL.select("/*[/.type == 'string']", data);
    set.replaceEach("replaced", function() {
      return this.path == "/str1";
    });
    test.equal(data.str1, "replaced");
    test.equal(data.str2, "2");
    test.done();
  },
  
  "modified(callback) registers callbacks for every result": function(test) {
    setup();
  
    Spah.SpahQL.Callbacks.reset();
    var set = Spah.SpahQL.select("/*[/.type == 'string']", data);
    
    set.modified(function() { return 15; });
    
    test.ok(Spah.SpahQL.Callbacks.callbacks["/str1"]);
    test.ok(Spah.SpahQL.Callbacks.callbacks["/str2"]);
    test.done();
  },
  
  "delete() acts on the first result": function(test) {
    setup();
  
    var set = Spah.SpahQL.select("/foo/foo", data);
    set.delete();
    test.deepEqual(data.foo, {});
    test.done();
  },
  
  "deleteAll() works on the entire set": function(test) {
    setup();
  
    var set  = Spah.SpahQL.select("/*", data);
    set.deleteAll();
    test.deepEqual(data, {});
    test.done();
  }
  
};