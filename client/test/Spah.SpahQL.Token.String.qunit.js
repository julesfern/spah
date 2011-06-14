$(document).ready(function() {
  
  module("Spah.SpahQL.Token.String");
  
  test("Returns a correct new index and found string when reading ahead for string literals", function() {
    expect(22);
    
    var tests = [
      [[0, '"foo", bar'], [5,"foo"]],
      [[0, '"foo"'], [5,"foo"]],
      [[3, '---"foobar"---'], [11,"foobar"]],
      [[3, '---"foobar"---'], [11,"foobar"]],
      [[3, '---"foo\\"bar"'], [13,'foo\"bar']],
      [[0, "'foo', bar"], [5,"foo"]],
      [[0, "'foo'"], [5,"foo"]],
      [[3, "---'foobar'---"], [11,"foobar"]],
      [[3, "---'foobar'---"], [11,"foobar"]],
      [[3, "---'foo\\\'bar'-"], [13,"foo'bar"]],
    ];
    
    for(var i in tests) {
      var input = tests[i][0];
      var output = tests[i][1];
      var result = Spah.SpahQL.Token.String.parseAt(input[0], input[1]);
      
      equal(result[0], output[0]);
      equal(result[1].value, output[1]);
    }
    
    // No quotes
    equal(null, Spah.SpahQL.Token.String.parseAt(0, "foo, bar"));
    
    // Errors
    try { Spah.SpahQL.Token.String.parseAt(3, "---'foobar---") }
    catch(e) { ok(e) }
  });
  
})