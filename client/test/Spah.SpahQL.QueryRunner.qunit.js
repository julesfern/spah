$(document).ready(function() {
  
  var qp = Spah.SpahQL.QueryParser;
  var qr = Spah.SpahQL.QueryRunner;
  
  module("Spah.SpahQL.QueryRunner");
  
  // error on #select with an assertion query
  
  // Run all selection queries
  test("Selection Query Fixtures: Runs the fixture set with the correct results", function() {
    for(var s in Fixtures.Query.Selection) {
      var qfix = Fixtures.Query.Selection[s];
      var n = qfix.name;
      var q = qp.parseQuery(qfix.query);
      var actual = qr.select(q, Fixtures.Query.Data);
      var expected = qfix.result;
    
      equal(actual.length, expected.length, n+": Result count matched ("+jQuery.map(actual, function(result, index) {return [result.path, result.value]}).join(", ")+")");
    
      for(var e in expected) {
        // Assert presence of each result
        var exPath = expected[e][0]; var exValue = expected[e][1];
        equal(actual[e].path, exPath, n+": Paths matched at index '"+e+"'");
        deepEqual(actual[e].value, exValue, n+": Values matched at index '"+e+"'");
      }
    }
  });
  
  // Run all assertion queries
  test("Assertion query fixtures: Runs the fixture set with the correct results", function() {
    for(var s in Fixtures.Query.Assertion) {
      var qfix = Fixtures.Query.Assertion[s];
      var n = qfix.name;
      var q = qp.parseQuery(qfix.query);
      var actual = qr.assert(q, Fixtures.Query.Data);
      var expected = qfix.result;
      equal(actual, expected, n+": Expected boolean returned ('"+qfix.query+"' -> "+expected+")");
    }
  });
  
});