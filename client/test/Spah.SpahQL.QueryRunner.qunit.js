$(document).ready(function() {
  
  var qp = Spah.SpahQL.QueryParser;
  var qr = Spah.SpahQL.QueryRunner;
  
  module("Spah.SpahQL.QueryRunner");
  
  // returns results from a basic set literal
  // returns results from a string range literal
  // returns results from a numeric range literal
  // steps over numeric literals in integer steps
  // returns results from a basic set literal containing a basic query
  
  // error on #select with an assertion query
  
  
  test("Runs the root selection query", function() {
    var q = qp.parseQuery(Fixtures.Query.Selection.root);
    var r = qr.select(q, Fixtures.Query.Data);
    equal(r.length, 1);
    equal(r[0].path, "/");
    deepEqual(r[0].value, Fixtures.Query.Data);
  });
  
  test("Runs a basic key selection query against a hash", function() {
    var q = qp.parseQuery(Fixtures.Query.Selection.basicObjectKey);
    var r = qr.select(q, Fixtures.Query.Data);
    equal(r.length, 1);
    equal(r[0].path, Fixtures.Query.Selection.basicObjectKey);
    deepEqual(r[0].value, Fixtures.Query.Data.obj);
  });
  
  test("Runs a basic key selection query against an array", function() {
    var q = qp.parseQuery(Fixtures.Query.Selection.basicArrayKey);
    var r = qr.select(q, Fixtures.Query.Data.arr);
    equal(r.length, 1);
    equal(r[0].path, Fixtures.Query.Selection.basicArrayKey);
    deepEqual(r[0].value, Fixtures.Query.Data.arr[1]);
  });
  
  test("Runs a nested key selection query against arrays in hashes", function() {
    var q = qp.parseQuery(Fixtures.Query.Selection.nestedKeysObject);
    var r = qr.select(q, Fixtures.Query.Data);
    equal(r.length, 1);
    equal(r[0].path, Fixtures.Query.Selection.nestedKeysObject);
    equal(r[0].value, Fixtures.Query.Data["objNested"]["c"]["j"][1]);
  });  
  
  test("Runs a nested key selection query against hashes in arrays", function() {
    var q = qp.parseQuery(Fixtures.Query.Selection.nestedKeysArray);
    var r = qr.select(q, Fixtures.Query.Data);
    equal(r.length, 1);
    equal(r[0].path, Fixtures.Query.Selection.nestedKeysArray);
    equal(r[0].value, Fixtures.Query.Data["arrNested"][2][2]);
  });
  
  test("Runs a selection query with single-level wildcard specificity", function() {
    var q = qp.parseQuery(Fixtures.Query.Selection.wildcardSingleDepth);
    var r = qr.select(q, Fixtures.Query.Data);
    
    expect((Fixtures.Query.Data.arrNested.length*2)+1);
    equal(r.length, Fixtures.Query.Data.arrNested.length);
    for(var i in r) {
      equal(r[i].path, "/arrNested/"+i);
      equal(r[i].value, Fixtures.Query.Data.arrNested[i]);
    }
  });
  
  test("Runs a selection query with double-level wildcard depth specificity", function() {
    var q = qp.parseQuery(Fixtures.Query.Selection.wildcardDoubleDepth);
    var r = qr.select(q, Fixtures.Query.Data);
    
    equal(r.length, 9);
    fail(); // todo assert results and paths
  });
  
  test("Runs a selection query with triple-level wildcard depth specificity", function() {
    var q = qp.parseQuery(Fixtures.Query.Selection.wildcardTripleDepth);
    var r = qr.select(q, Fixtures.Query.Data);
    
    equal(r.length, 3);
    equal(r[0].path, "/arrNested/2/2/a"); equal(r[0].value, Fixtures.Query.Data.arrNested[2][2]["a"]);
    equal(r[1].path, "/arrNested/2/2/b"); equal(r[1].value, Fixtures.Query.Data.arrNested[2][2]["b"]);
    equal(r[2].path, "/arrNested/2/2/c"); equal(r[2].value, Fixtures.Query.Data.arrNested[2][2]["c"]);
  });
  
  // zero results on bad key reference (end and midway)
  // recursive queries
  // wildcard queries
  // runs the filter query
  // runs the nested filter query
  // translates the .size property
  // translates the .explode property
  // translates the .type property
  
  // assertion tests
  
});