$(document).ready(function() {
  
  var qp = Spah.SpahQL.QueryParser;
  var qr = Spah.SpahQL.QueryRunner;
  // Load fixtures
  var queryData, queryTests;
  
  module("Spah.SpahQL.QueryRunner", {
    setup: function() {
      console.log("Loading query data and fixtures...");
      
      $.ajax("/client/test/fixtures/queryData.json", {
        dataType: 'json',
        async: false,
        success: function(data, textStatus, jqXHR) {
          console.log("Loaded data fixture:", data);
          queryData = data;
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log("Failed to load query data: ", textStatus, errorThrown, jqXHR);
        }
      });
      
      $.ajax("/client/test/fixtures/queryTests.json", {
        dataType: 'json',
        async: false,
        success: function(data, textStatus, jqXHR) {
          console.log("Loaded test fixture:", data);
          queryTests = data;
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log("Failed to load query data: ", textStatus, errorThrown, jqXHR);
        }
      });
      
    }
  });
  
  // error on #select with an assertion query
  
  // Run all selection queries
  test("Selection Query Fixtures: Runs the fixture set with the correct results", function() {
    for(var s in queryTests.Selection) {
      var qfix = queryTests.Selection[s];
      var n = qfix.name;
      var q = qp.parseQuery(qfix.query);
      var actual = qr.select(q, (qfix.data || queryData));
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
    for(var s in queryTests.Assertion) {
      var qfix = queryTests.Assertion[s];
      var n = qfix.name;
      var q = qp.parseQuery(qfix.query);
      var actual = qr.assert(q, (qfix.data || queryData));
      var expected = qfix.result;
      equal(actual, expected, n+": Expected boolean returned ('"+qfix.query+"' -> "+expected+")");
    }
  });
  
});