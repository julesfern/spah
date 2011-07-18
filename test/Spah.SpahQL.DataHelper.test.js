exports["Spah.SpahQL.DataHelper"] = {
  
  "Correctly determines object types": function(test) {
    test.equal("string", Spah.SpahQL.DataHelper.objectType(""), "String type");
    test.equal("number", Spah.SpahQL.DataHelper.objectType(0), "Number type");
    test.equal("boolean", Spah.SpahQL.DataHelper.objectType(false), "Bool type");
    test.equal("object", Spah.SpahQL.DataHelper.objectType({}), "Hash type");
    test.equal("array", Spah.SpahQL.DataHelper.objectType([]), "Array type");
    test.equal("null", Spah.SpahQL.DataHelper.objectType(null), "Null type");
    test.done();
  },
  
  "Determines simple object equality": function(test) {
    test.ok(Spah.SpahQL.DataHelper.eq(0,0,0), "Compares integers eq")
    test.ok(!Spah.SpahQL.DataHelper.eq(1,0,0), "Fails integers diff")
    test.ok(!Spah.SpahQL.DataHelper.eq(0,0,false), "Fails integer crosstype")
    
    test.ok(Spah.SpahQL.DataHelper.eq("a","a","a"), "Compares strings eq")
    test.ok(!Spah.SpahQL.DataHelper.eq("a", "b"), "Fails strings diff")
    test.ok(!Spah.SpahQL.DataHelper.eq("a","a","a", 2), "Fails strings crosstype")
    
    test.ok(Spah.SpahQL.DataHelper.eq(true,true,true,true), "Compares bools eq")
    test.ok(!Spah.SpahQL.DataHelper.eq(false, undefined), "Fails bools diff")
    test.ok(!Spah.SpahQL.DataHelper.eq(false, null), "Fails bools diff")
    test.ok(!Spah.SpahQL.DataHelper.eq("true",true), "Fails bools crosstype")
    test.done();
  },
  
  "Determines array equality": function(test) {
    test.ok(Spah.SpahQL.DataHelper.eq([0,"1", false], [0,"1", false]), "Compares arrays eq")
    test.ok(!Spah.SpahQL.DataHelper.eq([0,"1", false], [0,"1"]), "Fails arrays diff lengths")
    test.ok(!Spah.SpahQL.DataHelper.eq([0,"1", false], [2,"1", false]), "Fails arrays diff")
    test.done();
  },
  
  "Determines hash equality": function(test) {
    test.ok(Spah.SpahQL.DataHelper.eq({foo: "bar", bar: "baz"}, {foo: "bar", bar: "baz"}), "Compares hashes eq")
    test.ok(!Spah.SpahQL.DataHelper.eq({foo: "bar", bar: "baz"}, {foo: "bar", bar: "different"}), "Fails hashes diff root content")
    test.ok(!Spah.SpahQL.DataHelper.eq({foo: "bar", bar: "baz"}, {foo: "bar", barDifferent: "baz"}), "Fails hashes diff root keys")
    test.ok(!Spah.SpahQL.DataHelper.eq({foo: "bar", arr: [0,1,2]}, {foo: "bar", arr: [1,2,3]}), "Fails hashes diff inner content")
    test.ok(!Spah.SpahQL.DataHelper.eq({foo: "bar", arr: [0,1,2]}, {foo: "bar", arr: null}), "Fails hashes diff inner content types")
    test.done();
  },
  
  "Detects modifications successfully": function(test) {
    var d = Spah.SpahQL.DataHelper;
    // Basic modification
    test.deepEqual(d.compare({a: 1, b: 2}, {a: 1, b: 3}, "/"), {"/": ["~", {a: 1, b: 2}, {a: 1, b: 3}], "/b": ["~", 2, 3]});
    // Basic addition
    test.deepEqual(d.compare({a: 1}, {a: 1, b: 2}, "/"), {"/": ["~", {a: 1}, {a: 1, b: 2}], "/b": ["+", undefined, 2]});
    // Basic removal
    test.deepEqual(d.compare({a: 1, b: 2}, {a: 1}, "/"), {"/": ["~", {a: 1, b: 2}, {a: 1}], "/b": ["-", 2, undefined]});
    // Nested modification via addition
    test.deepEqual(d.compare({a: 1, b: 2}, {a: 1, b: {a: ["1","2"]}}, "/"), 
                        { "/": ["~", {a: 1, b: 2}, {a: 1, b: {a: ["1","2"]}}], 
                          "/b": ["~", 2, {a: ["1","2"]}],
                          "/b/a": ["+", undefined, ["1","2"]],
                          "/b/a/0": ["+", undefined, "1"],
                          "/b/a/1": ["+", undefined, "2"]
                        });
    // Nested modification via removal
    test.deepEqual(d.compare({a: 1, b: {a: ["1","2"]}}, {a: 1, b: 2}, "/"), 
                        { "/": ["~", {a: 1, b: {a: ["1","2"]}}, {a: 1, b: 2}], 
                          "/b": ["~", {a: ["1","2"]}, 2],
                          "/b/a": ["-", ["1","2"], undefined],
                          "/b/a/0": ["-", "1", undefined],
                          "/b/a/1": ["-", "2", undefined]
                        });
    test.done();
  }
  
};