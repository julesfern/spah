$(document).ready(function() {
  
  module("Spah.SpahQL.DataHelper");
  
  test("Correctly determines object types", function() {
    equal("string", Spah.SpahQL.DataHelper.objectType(""), "String type");
    equal("number", Spah.SpahQL.DataHelper.objectType(0), "Number type");
    equal("boolean", Spah.SpahQL.DataHelper.objectType(false), "Bool type");
    equal("object", Spah.SpahQL.DataHelper.objectType({}), "Hash type");
    equal("array", Spah.SpahQL.DataHelper.objectType([]), "Array type");
    equal("null", Spah.SpahQL.DataHelper.objectType(null), "Null type");
  })
  
  test("Determines simple object equality", function() {
    ok(Spah.SpahQL.DataHelper.eq(0,0,0), "Compares integers eq")
    ok(!Spah.SpahQL.DataHelper.eq(1,0,0), "Fails integers diff")
    ok(!Spah.SpahQL.DataHelper.eq(0,0,false), "Fails integer crosstype")
    
    ok(Spah.SpahQL.DataHelper.eq("a","a","a"), "Compares strings eq")
    ok(!Spah.SpahQL.DataHelper.eq("a", "b"), "Fails strings diff")
    ok(!Spah.SpahQL.DataHelper.eq("a","a","a", 2), "Fails strings crosstype")
    
    ok(Spah.SpahQL.DataHelper.eq(true,true,true,true), "Compares bools eq")
    ok(!Spah.SpahQL.DataHelper.eq(false, undefined), "Fails bools diff")
    ok(!Spah.SpahQL.DataHelper.eq(false, null), "Fails bools diff")
    ok(!Spah.SpahQL.DataHelper.eq("true",true), "Fails bools crosstype")
  });
  
  test("Determines array equality", function() {
    ok(Spah.SpahQL.DataHelper.eq([0,"1", false], [0,"1", false]), "Compares arrays eq")
    ok(!Spah.SpahQL.DataHelper.eq([0,"1", false], [0,"1"]), "Fails arrays diff lengths")
    ok(!Spah.SpahQL.DataHelper.eq([0,"1", false], [2,"1", false]), "Fails arrays diff")
  })
  
  test("Determines hash equality", function() {
    ok(Spah.SpahQL.DataHelper.eq({foo: "bar", bar: "baz"}, {foo: "bar", bar: "baz"}), "Compares hashes eq")
    ok(!Spah.SpahQL.DataHelper.eq({foo: "bar", bar: "baz"}, {foo: "bar", bar: "different"}), "Fails hashes diff root content")
    ok(!Spah.SpahQL.DataHelper.eq({foo: "bar", bar: "baz"}, {foo: "bar", barDifferent: "baz"}), "Fails hashes diff root keys")
    ok(!Spah.SpahQL.DataHelper.eq({foo: "bar", arr: [0,1,2]}, {foo: "bar", arr: [1,2,3]}), "Fails hashes diff inner content")
    ok(!Spah.SpahQL.DataHelper.eq({foo: "bar", arr: [0,1,2]}, {foo: "bar", arr: null}), "Fails hashes diff inner content types")
  })
  
  test("Detects modifications successfully", function() {
    var d = Spah.SpahQL.DataHelper;
    // Basic modification
    deepEqual(d.compare({a: 1, b: 2}, {a: 1, b: 3}, "/"), {"/": ["~", {a: 1, b: 2}, {a: 1, b: 3}], "/b": ["~", 2, 3]});
    // Basic addition
    deepEqual(d.compare({a: 1}, {a: 1, b: 2}, "/"), {"/": ["~", {a: 1}, {a: 1, b: 2}], "/b": ["+", undefined, 2]});
    // Basic removal
    deepEqual(d.compare({a: 1, b: 2}, {a: 1}, "/"), {"/": ["~", {a: 1, b: 2}, {a: 1}], "/b": ["-", 2, undefined]});
    // Nested modification via addition
    deepEqual(d.compare({a: 1, b: 2}, {a: 1, b: {a: ["1","2"]}}, "/"), 
                        { "/": ["~", {a: 1, b: 2}, {a: 1, b: {a: ["1","2"]}}], 
                          "/b": ["~", 2, {a: ["1","2"]}],
                          "/b/a": ["+", undefined, ["1","2"]],
                          "/b/a/0": ["+", undefined, "1"],
                          "/b/a/1": ["+", undefined, "2"]
                        });
    // Nested modification via removal
    deepEqual(d.compare({a: 1, b: {a: ["1","2"]}}, {a: 1, b: 2}, "/"), 
                        { "/": ["~", {a: 1, b: {a: ["1","2"]}}, {a: 1, b: 2}], 
                          "/b": ["~", {a: ["1","2"]}, 2],
                          "/b/a": ["-", ["1","2"], undefined],
                          "/b/a/0": ["-", "1", undefined],
                          "/b/a/1": ["-", "2", undefined]
                        });
  });
  
})