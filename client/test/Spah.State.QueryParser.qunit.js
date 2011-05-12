$(document).ready(function() {
  
  module("Spah.State.QueryParser");
  
  test("Returns a correct new index and found string when reading ahead for string literals", function() {
    expect(12);
    // Double quotes
    deepEqual([5,"foo"], Spah.State.QueryParser.readAheadStringLiteral(0, '"foo", bar'));
    deepEqual([5,"foo"], Spah.State.QueryParser.readAheadStringLiteral(0, '"foo"'));
    deepEqual([11,"foobar"], Spah.State.QueryParser.readAheadStringLiteral(3, '---"foobar"---'));
    deepEqual([11,"foobar"], Spah.State.QueryParser.readAheadStringLiteral(3, '---"foobar"---'));
    deepEqual([13,'foo\"bar'], Spah.State.QueryParser.readAheadStringLiteral(3, '---"foo\\"bar"'));
    
    // Single quotes
    deepEqual([5,"foo"], Spah.State.QueryParser.readAheadStringLiteral(0, "'foo', bar"));
    deepEqual([5,"foo"], Spah.State.QueryParser.readAheadStringLiteral(0, "'foo'"));
    deepEqual([11,"foobar"], Spah.State.QueryParser.readAheadStringLiteral(3, "---'foobar'---"));
    deepEqual([11,"foobar"], Spah.State.QueryParser.readAheadStringLiteral(3, "---'foobar'---"));
    deepEqual([13,"foo'bar"], Spah.State.QueryParser.readAheadStringLiteral(3, "---'foo\\\'bar'-"));
    
    // No quotes
    equal(null, Spah.State.QueryParser.readAheadStringLiteral(0, "foo, bar"));
    
    // Errors
    try { Spah.State.QueryParser.readAheadStringLiteral(3, "---'foobar---") }
    catch(e) { ok(e) }
    
  });
  
  test("Returns a correct new index and found number when reading ahead for numeric literals", function() {
    expect(8);
    // Ints
    deepEqual([1,7], Spah.State.QueryParser.readAheadNumericLiteral(0, '7, bar'));
    deepEqual([1,7], Spah.State.QueryParser.readAheadNumericLiteral(0, '7'));
    deepEqual([8,-7], Spah.State.QueryParser.readAheadNumericLiteral(6, 'foo,  -7, foo'));
      
    // Floats
    deepEqual([4,3.21], Spah.State.QueryParser.readAheadNumericLiteral(0, '3.21, bar'));
    deepEqual([3,1.5], Spah.State.QueryParser.readAheadNumericLiteral(0, '1.5'));
    deepEqual([10,-7.5], Spah.State.QueryParser.readAheadNumericLiteral(6, 'foo,  -7.5, foo'));
    
    // Not found
    equal(null, Spah.State.QueryParser.readAheadNumericLiteral(0, 'true'))
    
    // Errors
    try { Spah.State.QueryParser.readAheadNumericLiteral(0, '7.5.5') }
    catch(e) { ok(e) }
  });
  
  test("Returns a correct new index and found bool when reading ahead for boolean literals", function() {
    deepEqual([16,true], Spah.State.QueryParser.readAheadBooleanLiteral(12, '{3, "true", true}'));
    deepEqual([17,false], Spah.State.QueryParser.readAheadBooleanLiteral(12, '{3, "true", false}'));
    equal(null, Spah.State.QueryParser.readAheadBooleanLiteral(12, '{3, "true", "false"}'));
  })
  
  test("Parses the basic query", function() {
    var q = Spah.State.QueryParser.parseQuery("/foo");
  });
  
  test("Ignores stack operators and other special chars when inside a string", function() {
    
  });
  
});