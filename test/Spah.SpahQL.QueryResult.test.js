var data;
var dataResult;
var setup = function() {
  data = {foo: {foo: "bar"}, booltest: {yes: true, no: false}, arrtest: ["a", "b", "c"], stringtest: "abc"};
}

exports["Spah.SpahQL.QueryResult"] = {
  
  "Retrieves the parent path": function(test) {
    setup();
    
    var res;
    res = new Spah.SpahQL.QueryResult("/", 0);
    test.equal(res.parentPath(), null);
    res = new Spah.SpahQL.QueryResult("/foo/bar/.baz", 0);
    test.equal(res.parentPath(), "/foo/bar");
    test.done();
  },
  
  "Retrieves the correct key name": function(test) {
    setup();
    
    var res;
    res = new Spah.SpahQL.QueryResult(null, 1);
    test.equal(res.keyName(), null);
    res = new Spah.SpahQL.QueryResult("/", 1);
    test.equal(res.keyName(), null);
    res = new Spah.SpahQL.QueryResult("/foo/bar/baz", 1);
    test.equal(res.keyName(), "baz");
    test.done();
  },
  
  "Retrieves the parent": function(test) {
    setup();
    
    var set = Spah.SpahQL.select("/foo/foo", data);
    test.deepEqual(set.first().parent(), Spah.SpahQL.select("/foo", data).first());
    test.done();
  },

  "Determines whether one result contains another": function(test) {
    setup();

    var foo = Spah.SpahQL.select("/foo", data).first();
    var foofoo = foo.select("/foo").first();
    var foofooclone = foo.detach();

    test.ok(foo && foofoo);
    test.ok(foo.contains(foofoo));
    test.ok(!foofoo.contains(foo));
    test.ok(!foo.contains(foofooclone));
    test.done();
  },
  
  "Allows sub-selections": function(test) {
    setup();
    
    test.deepEqual(Spah.SpahQL.select("/foo", data).first().select("/foo"), Spah.SpahQL.select("/foo/foo", data));
    test.done();
  },
  
  "Allows sub-assertions": function(test) {
    setup();
    
    test.ok(Spah.SpahQL.assert("/booltest/yes", data));
    test.ok(!Spah.SpahQL.assert("/booltest/no", data));
    test.ok(Spah.SpahQL.select("/booltest", data).first().assert("/yes"));
    test.ok(!Spah.SpahQL.select("/booltest", data).first().assert("/no"));
    test.done();
  },
  
  "May set a subkey on self and alter the root data construct in the process": function(test) {
    setup();
    
    var res;
    
    // Test objects
    res = Spah.SpahQL.select("/foo", data).first();
    test.ok(res.set(0, "zero"));
    test.ok(res.set("baz", "car"));
    test.ok(!res.set("", "empty"));
    test.ok(!res.set(" ", "spaces"));
    test.equal(data["foo"]["0"], "zero");
    test.equal(data["foo"]["baz"], "car");
    test.equal(data["foo"][""], null);
    test.equal(data["foo"][" "], null);
    
    // Test arrays
    res = Spah.SpahQL.select("/arrtest", data).first();
    test.ok(res.set(0, "replaced-a"));
    test.ok(res.set("1", "replaced-b"));
    test.ok(!res.set("stringkey", "stringval"));
    test.deepEqual(data["arrtest"], ["replaced-a", "replaced-b", "c"]);
    
    // Test strings, bools reject the set
    res = Spah.SpahQL.select("/stringtest", data).first();
    test.ok(!res.set(0, "_"));
    test.ok(!res.set("1", "_"));
    test.equal(data["stringtest"], "abc");
    test.done();
  },

  "May set subkey on self using a k/v hash of values to set": function(test) {
    setup();

    var res = Spah.SpahQL.select("/foo", data).first();
    test.ok(res.set({"new1": "val1", "new2": "val2"}));

    test.equal(res.select("/new1").first().value, "val1");
    test.equal(res.select("/new2").first().value, "val2");
    test.done();
  },
  
  "May replace own value on the parent": function(test) {
    setup();
    
    var res = Spah.SpahQL.select("/foo/foo", data).first();
    test.equal(res.value, "bar");
    test.ok(res.replace("bar-replaced"));
    
    test.equal(data.foo.foo, "bar-replaced");
    test.equal(res.value, "bar-replaced");
    res = Spah.SpahQL.select("/foo/foo", data).first();
    test.equal(res.value, "bar-replaced");    
    test.done();
  },
  
  "Registers a callback at a child path": function(test) {
    setup();
    
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
    test.deepEqual(callbackCounts, [1,0,0]);
    root.set("newkey", "newval");
    test.deepEqual(callbackCounts, [2,1,0]);
    foo.set("arbitrary", "arb");
    test.deepEqual(callbackCounts, [3,1,0]);
    foo.set("newkey", "newval");
    test.deepEqual(callbackCounts, [4,1,1]);
    test.done();
  },

  "Does not modify the original data or trigger events on the original data when detached": function(test) {
    setup();

    var data = {foo: {bar: {baz: "val"}}};
    var callbackCounts = [0,0];
    var callback0 = function() { callbackCounts[0]++; };
    var callback1 = function() { callbackCounts[1]++; };

    var root = Spah.SpahQL.select("/", data).first();
        root.modified(callback0);

    var detached = root.detach();
        detached.modified(callback1);

    root.set("foo", "bar");
    test.deepEqual(callbackCounts, [1,0]);

    detached.set("foo", "bar");
    test.deepEqual(callbackCounts, [1,1]);

    test.done();
  },
  
  "Deletes a child key in an array value": function(test) {
    setup();
    
    var data = {foo: [0,1,2,3]};
    var foo = Spah.SpahQL.select("/foo", data).first();
    var callbackCounts = [0,0];
    foo.modified("/1", function() { callbackCounts[0]++; });
    foo.modified("/2", function() { callbackCounts[1]++; });
    
    test.deepEqual(foo.value, [0,1,2,3]);
    foo.delete(1, "2");
    test.deepEqual(foo.value, [0,3]);
    test.deepEqual(callbackCounts, [1,1]);    
    test.done();
  },
  
  "Deletes a child key in a hash value": function(test) {
    setup();
    
    var data = {foo: {a: 1, b: 2, c:3}};
    var foo = Spah.SpahQL.select("/foo", data).first();
    var callbackCounts = [0,0];
    foo.modified("/a", function() { callbackCounts[0]++; });
    foo.modified("/b", function() { callbackCounts[1]++; });
    
    test.deepEqual(foo.value, {a: 1, b: 2, c:3});
    foo.delete("a", "b");
    test.deepEqual(foo.value, {c:3});
    test.deepEqual(callbackCounts, [1,1]);    
    test.done();
  },
  
  "Self-deletes from parent value": function(test) {
    setup();
    
    var data = {foo: {a: 1, b: 2, c:3}, bar: {a: 1, b: 2, c:3}};
    var bar = Spah.SpahQL.select("/bar", data).first();
    
    test.deepEqual(bar.value, {a: 1, b: 2, c:3});
    bar.delete();
    test.deepEqual(data, {foo: {a: 1, b: 2, c:3}}); // also asserts that data source was modified
    test.done();
  },

  "Appends to an array item and raises events": function(test) {
    setup();
    var dataResult = new Spah.SpahQL.QueryResult("/", data);

    var arrayModified = 0;
    var itemModified = 0;
    var otherModified = 0;

    var res = dataResult.select("/arrtest").first();
    var valueLength = res.value.length;

    dataResult.modified("/arrtest", function(path, result) {
        if(path == "/arrtest") arrayModified++;
        else otherModified++;
    });
    dataResult.modified("/arrtest/"+valueLength, function(path, result) {
        if(path == "/arrtest/"+valueLength) itemModified++;
        else otherModified++;
    });

    res.append("d");
    test.equal(res.value.length, valueLength+1);
    test.equal(arrayModified, 1);
    test.equal(itemModified, 1);
    test.equal(otherModified, 0);
    test.done();
  },

  "Appends to a string item and raises events": function(test) {
    setup();
    var dataResult = new Spah.SpahQL.QueryResult("/", data);

    var stringModified = 0;
    var otherModified = 0;

    var res = dataResult.select("/stringtest").first();

    dataResult.modified("/stringtest", function(path, result) {
        if(path == "/stringtest") stringModified++;
        else otherModified++;
    });
    
    var prev = res.value;
    res.append("d");
    test.equal(res.value, prev+"d");
    test.equal(stringModified, 1);
    test.equal(otherModified, 0);
    test.done();
  },

  "Prepends to an array item and raises events": function(test) {
    setup();
    var dataResult = new Spah.SpahQL.QueryResult("/", data);

    var arrayModified = 0;
    var itemModified = 0;
    var otherModified = 0;

    var res = dataResult.select("/arrtest").first();
    var valueLength = res.value.length;

    dataResult.modified("/arrtest", function(path, result) {
        if(path == "/arrtest") arrayModified++;
        else otherModified++;
    });
    dataResult.modified("/arrtest/0", function(path, result) {
        if(path == "/arrtest/0") itemModified++;
        else otherModified++;
    });

    res.prepend("d");
    test.equal(res.value[0], "d");
    test.equal(res.value.length, valueLength+1);
    test.equal(arrayModified, 1);
    test.equal(itemModified, 1);
    test.equal(otherModified, 0);
    test.done();
  },

  "Prepends to a string item and raises events": function(test) {
    setup();
    var dataResult = new Spah.SpahQL.QueryResult("/", data);

    var stringModified = 0;
    var otherModified = 0;

    var res = dataResult.select("/stringtest").first();

    dataResult.modified("/stringtest", function(path, result) {
        if(path == "/stringtest") stringModified++;
        else otherModified++;
    });
    
    var prev = res.value;
    res.prepend("d");
    test.equal(res.value, "d"+prev);
    test.equal(stringModified, 1);
    test.equal(otherModified, 0);
    test.done();
  }
  
};