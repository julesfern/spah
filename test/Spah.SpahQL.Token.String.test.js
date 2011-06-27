$(document).ready(function() {
  
  module("Spah.SpahQL.Token.String");
  
  test("Returns a correct new index and found string when reading ahead for string literals", function() {
    expect(12);
    
    deepEqual([5, new Spah.SpahQL.Token.String("foo")], Spah.SpahQL.Token.String.parseAt(0, '"foo", bar'));
    deepEqual([5, new Spah.SpahQL.Token.String("foo")], Spah.SpahQL.Token.String.parseAt(0, '"foo"'));
    deepEqual([11, new Spah.SpahQL.Token.String("foobar")], Spah.SpahQL.Token.String.parseAt(3, '---"foobar"---'));
    deepEqual([11, new Spah.SpahQL.Token.String("foobar")], Spah.SpahQL.Token.String.parseAt(3, '---"foobar"---'));
    deepEqual([13, new Spah.SpahQL.Token.String('foo\"bar')], Spah.SpahQL.Token.String.parseAt(3, '---"foo\\"bar"'));
    deepEqual([5, new Spah.SpahQL.Token.String("foo")], Spah.SpahQL.Token.String.parseAt(0, "'foo', bar"));
    deepEqual([5, new Spah.SpahQL.Token.String("foo")], Spah.SpahQL.Token.String.parseAt(0, "'foo'"));
    deepEqual([11, new Spah.SpahQL.Token.String("foobar")], Spah.SpahQL.Token.String.parseAt(3, "---'foobar'---"));
    deepEqual([11, new Spah.SpahQL.Token.String("foobar")], Spah.SpahQL.Token.String.parseAt(3, "---'foobar'---"));
    deepEqual([13, new Spah.SpahQL.Token.String("foo'bar")], Spah.SpahQL.Token.String.parseAt(3, "---'foo\\'bar'"));
    
    // No quotes
    equal(null, Spah.SpahQL.Token.String.parseAt(0, "foo, bar"));
    
    // Errors
    try { Spah.SpahQL.Token.String.parseAt(3, "---'foobar---") }
    catch(e) { ok(e) }
    
  });
  
});