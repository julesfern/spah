$(document).ready(function() {
  
  module("Spah.SpahQL.Token.PathComponent");
  
  test("Returns a correct new index and found number when reading ahead for path components", function() {
    deepEqual(
              Spah.SpahQL.Token.PathComponent.parseAt(0, "/key1"), 
              [5, new Spah.SpahQL.Token.PathComponent(new Spah.SpahQL.Token.KeyName("key1"))]
            );
    deepEqual(
              Spah.SpahQL.Token.PathComponent.parseAt(5, "/key1//key2"),
              [11, new Spah.SpahQL.Token.PathComponent(new Spah.SpahQL.Token.KeyName("key2"), null, true)]
            );
    deepEqual(
              Spah.SpahQL.Token.PathComponent.parseAt(5, "/key1//.size"),
              [12, new Spah.SpahQL.Token.PathComponent(null, new Spah.SpahQL.Token.KeyName("size"), true)]
            );
    deepEqual(
              Spah.SpahQL.Token.PathComponent.parseAt(5, "/key1//foo[/a == /b][/foo == 3]"),
              [31, new Spah.SpahQL.Token.PathComponent(new Spah.SpahQL.Token.KeyName("foo"), null, true, [
                new Spah.SpahQL.Token.FilterQuery(Spah.SpahQL.QueryParser.parseQuery("/a == /b")),
                new Spah.SpahQL.Token.FilterQuery(Spah.SpahQL.QueryParser.parseQuery("/foo == 3"))
              ])]
            );
    
    equal(null, Spah.SpahQL.Token.PathComponent.parseAt(5, "/key1==3"));
    
  });
  
});