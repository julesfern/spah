$(document).ready(function() {
  
  module("Spah.SpahQL.Token.FilterQuery");
  
  test("Returns a correct new index and found number when reading ahead for filter queries", function() {
    deepEqual([18, new Spah.SpahQL.Token.FilterQuery(Spah.SpahQL.QueryParser.parseQuery("/moo == ']'"))], Spah.SpahQL.Token.FilterQuery.parseAt(5, "/key1[/moo == ']']"));
    
    equal(null, Spah.SpahQL.Token.FilterQuery.parseAt(5, "/key1/moo == ']'"));
  });
  
});