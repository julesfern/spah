$(document).ready(function() {
  
  module("Spah.SpahQL.QueryParser");
  
  test("Returns the correct structure when parsing full queries", function() {
    var q = Spah.SpahQL.QueryParser.parseQuery("/foo//bar/.property/baz[$//bar] == {1,'2', /foo, true}");
    deepEqual(
      q.primaryToken,
      new Spah.SpahQL.Token.SelectionQuery([
        new Spah.SpahQL.Token.PathComponent(new Spah.SpahQL.Token.KeyName("foo")),
        new Spah.SpahQL.Token.PathComponent(new Spah.SpahQL.Token.KeyName("bar"), null, true),
        new Spah.SpahQL.Token.PathComponent(null, new Spah.SpahQL.Token.KeyName("property")),
        new Spah.SpahQL.Token.PathComponent(new Spah.SpahQL.Token.KeyName("baz"), null, false, [
          new Spah.SpahQL.Token.FilterQuery(Spah.SpahQL.QueryParser.parseQuery("$//bar"))
        ])
      ])
    );
    
    deepEqual(
      q.comparisonOperator,
      new Spah.SpahQL.Token.ComparisonOperator("==")
    );
    
    deepEqual(
      q.secondaryToken,
      new Spah.SpahQL.Token.Set([
        new Spah.SpahQL.Token.Numeric(1),
        new Spah.SpahQL.Token.String("2"),
        new Spah.SpahQL.Token.SelectionQuery([
          new Spah.SpahQL.Token.PathComponent(new Spah.SpahQL.Token.KeyName("foo"))
        ]),
        new Spah.SpahQL.Token.Boolean(true)
      ])
    );
  });
  
  test("Parses a flat root query", function() {
    var q = Spah.SpahQL.QueryParser.parseQuery("/");
    deepEqual(q.primaryToken, new Spah.SpahQL.Token.SelectionQuery([new Spah.SpahQL.Token.PathComponent()]));
  });
  
});