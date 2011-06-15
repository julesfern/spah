$(document).ready(function() {
  
  module("Spah.SpahQL.Token.SelectionQuery");
  
  test("Returns a correct new index and found number when reading ahead for selection queries", function() {
    deepEqual(
      Spah.SpahQL.Token.SelectionQuery.parseAt(0, "/key1//key2[$/foo=='bar']/.explode[//foo == 2][//bar == 3]"), 
      [58, new Spah.SpahQL.Token.SelectionQuery(
        [
          new Spah.SpahQL.Token.PathComponent(new Spah.SpahQL.Token.KeyName("key1")),
          new Spah.SpahQL.Token.PathComponent(new Spah.SpahQL.Token.KeyName("key2"), null, true, [
            new Spah.SpahQL.Token.FilterQuery(Spah.SpahQL.QueryParser.parseQuery("$/foo=='bar'"))
          ]),
          new Spah.SpahQL.Token.PathComponent(null, new Spah.SpahQL.Token.KeyName("explode"), false, [
            new Spah.SpahQL.Token.FilterQuery(Spah.SpahQL.QueryParser.parseQuery("//foo == 2")),
            new Spah.SpahQL.Token.FilterQuery(Spah.SpahQL.QueryParser.parseQuery("//bar == 3"))
          ]),
        ]
      )]);
      
    equal(null, Spah.SpahQL.Token.SelectionQuery.parseAt(0, "0000"));
  });
  
});