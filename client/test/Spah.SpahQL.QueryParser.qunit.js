$(document).ready(function() {
  
  module("Spah.SpahQL.QueryParser");
  
  test("Returns a correct new index and found string when reading ahead for string literals", function() {
    expect(12);
    // Double quotes
    deepEqual([5,"foo"], Spah.SpahQL.QueryParser.readAheadStringLiteral(0, '"foo", bar'));
    deepEqual([5,"foo"], Spah.SpahQL.QueryParser.readAheadStringLiteral(0, '"foo"'));
    deepEqual([11,"foobar"], Spah.SpahQL.QueryParser.readAheadStringLiteral(3, '---"foobar"---'));
    deepEqual([11,"foobar"], Spah.SpahQL.QueryParser.readAheadStringLiteral(3, '---"foobar"---'));
    deepEqual([13,'foo\"bar'], Spah.SpahQL.QueryParser.readAheadStringLiteral(3, '---"foo\\"bar"'));
    
    // Single quotes
    deepEqual([5,"foo"], Spah.SpahQL.QueryParser.readAheadStringLiteral(0, "'foo', bar"));
    deepEqual([5,"foo"], Spah.SpahQL.QueryParser.readAheadStringLiteral(0, "'foo'"));
    deepEqual([11,"foobar"], Spah.SpahQL.QueryParser.readAheadStringLiteral(3, "---'foobar'---"));
    deepEqual([11,"foobar"], Spah.SpahQL.QueryParser.readAheadStringLiteral(3, "---'foobar'---"));
    deepEqual([13,"foo'bar"], Spah.SpahQL.QueryParser.readAheadStringLiteral(3, "---'foo\\\'bar'-"));
    
    // No quotes
    equal(null, Spah.SpahQL.QueryParser.readAheadStringLiteral(0, "foo, bar"));
    
    // Errors
    try { Spah.SpahQL.QueryParser.readAheadStringLiteral(3, "---'foobar---") }
    catch(e) { ok(e) }
    
  });
  
  test("Returns a correct new index and found number when reading ahead for numeric literals", function() {
    // Ints
    deepEqual([1,7], Spah.SpahQL.QueryParser.readAheadNumericLiteral(0, '7, bar'));
    deepEqual([1,7], Spah.SpahQL.QueryParser.readAheadNumericLiteral(0, '7'));
    deepEqual([8,-7], Spah.SpahQL.QueryParser.readAheadNumericLiteral(6, 'foo,  -7, foo'));
      
    // Floats
    deepEqual([4,3.21], Spah.SpahQL.QueryParser.readAheadNumericLiteral(0, '3.21, bar'));
    deepEqual([3,1.5], Spah.SpahQL.QueryParser.readAheadNumericLiteral(0, '1.5'));
    deepEqual([10,-7.5], Spah.SpahQL.QueryParser.readAheadNumericLiteral(6, 'foo,  -7.5, foo'));
    
    // Not found
    equal(null, Spah.SpahQL.QueryParser.readAheadNumericLiteral(0, 'true'))
  });
  
  test("Returns a correct new index and found bool when reading ahead for boolean literals", function() {
    deepEqual([16,true], Spah.SpahQL.QueryParser.readAheadBooleanLiteral(12, '{3, "true", true}'));
    deepEqual([17,false], Spah.SpahQL.QueryParser.readAheadBooleanLiteral(12, '{3, "true", false}'));
    equal(null, Spah.SpahQL.QueryParser.readAheadBooleanLiteral(12, '{3, "true", "false"}'));
  })
  
  test("Returns a correct new index and found number when reading ahead for path components", function() {
    deepEqual(Spah.SpahQL.QueryParser.readAheadPathComponent(0, "/key1"), [5, {key: "key1", property: null, recursive: false, filterQueries: []}]);
    deepEqual(Spah.SpahQL.QueryParser.readAheadPathComponent(5, "/key1//key2"), [11, {key: "key2", property: null, recursive: true, filterQueries: []}]);
    deepEqual(Spah.SpahQL.QueryParser.readAheadPathComponent(5, "/key1//.size"), [12, {key: null, property: "size", recursive: true, filterQueries: []}]);
    
    // Property with filter query
    var path_comp = Spah.SpahQL.QueryParser.readAheadPathComponent(5, "/key1//foo[/a == /b][/foo == 3]");
    equal(31, path_comp[0]);
    equal("foo", path_comp[1].key);
    equal(null, path_comp[1].property);
    equal(true, path_comp[1].recursive);
    equal(2, path_comp[1].filterQueries.length);
  });
  
  test("Returns a correct new index and found number when reading ahead for filter queries", function() {
    deepEqual(Spah.SpahQL.QueryParser.readAheadFilterQuery(5, "/key1[/moo == ']']"), [18, Spah.SpahQL.QueryParser.parseQuery("/moo == ']'")]);
  });
  
  test("Returns a correct new index and found set when reading ahead for set literals", function() {
    expect(5);
    
    deepEqual(Spah.SpahQL.QueryParser.readAheadSetLiteral(0, "{1,'2,',true}"), [13, {type: Spah.SpahQL.QueryParser.TOKEN_SET_LITERAL, values: [1,"2,",true], isRange: false}]);
    deepEqual(Spah.SpahQL.QueryParser.readAheadSetLiteral(2, "--{1.5,false,true}--"), [18, {type: Spah.SpahQL.QueryParser.TOKEN_SET_LITERAL, values: [1.5,false,true], isRange: false}]);
    deepEqual(Spah.SpahQL.QueryParser.readAheadSetLiteral(2, "--{'a'..'d'}--"), [12, {type: Spah.SpahQL.QueryParser.TOKEN_SET_LITERAL, values: ['a','d'], isRange: true}]);
    
    // Errors
    try { Spah.SpahQL.QueryParser.readAheadSetLiteral(0, "{'a'..'d',2}--") } catch(e) { ok(e, e.message) };
    try { Spah.SpahQL.QueryParser.readAheadSetLiteral(0, "{'b','a'..'d'}--") } catch(e) { ok(e, e.message) };
  });
  
  test("Returns a correct new index and found number when reading ahead for selection queries", function() {
    deepEqual(Spah.SpahQL.QueryParser.readAheadSelectionQuery(0, "/key1//key2[$/foo=='bar']/.explode[//foo == 2][//bar == 3]"), [58, {
      useRoot: false, 
      pathComponents: [
        {key: "key1", property: null, recursive: false, filterQueries: []},
        {key: "key2", property: null, recursive: true, filterQueries: [Spah.SpahQL.QueryParser.parseQuery("$/foo=='bar'")]},
        {key: null, property: "explode", recursive: false, filterQueries: [Spah.SpahQL.QueryParser.parseQuery("//foo == 2"), Spah.SpahQL.QueryParser.parseQuery("//bar == 3")]},
      ],
      type: Spah.SpahQL.QueryParser.TOKEN_SELECTION_QUERY
    }]);
  });
  
  test("Returns the correct structure when parsing full queries", function() {
    var q = Spah.SpahQL.QueryParser.parseQuery("/foo//bar/.property/baz[$//bar]");
    deepEqual(q.primaryToken, {
      useRoot: false,
      pathComponents: [
        {key: "foo", property: null, recursive: false, filterQueries: []},
        {key: "bar", property: null, recursive: true, filterQueries: []},
        {key: null, property: "property", recursive: false, filterQueries: []},
        {key: "baz", property: null, recursive: false, filterQueries: [Spah.SpahQL.QueryParser.parseQuery("$//bar")]}
      ],
      type: Spah.SpahQL.QueryParser.TOKEN_SELECTION_QUERY
    });
    ok(!q.comparisonOperator && !q.secondaryToken);
  });
  
  test("Parses a flat root query", function() {
    var q = Spah.SpahQL.QueryParser.parseQuery("/");
    deepEqual(q.primaryToken, {
      useRoot: false,
      pathComponents: [
        {key: null, property: null, recursive: false, filterQueries: []}
      ],
      type: Spah.SpahQL.QueryParser.TOKEN_SELECTION_QUERY
    })
  });
  
});