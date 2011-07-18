exports["Spah.SpahQL.QueryParser"] = {
  
  "Returns the correct structure when parsing full queries": function(test) {
    var q = Spah.SpahQL.QueryParser.parseQuery("/foo//bar/.property/baz[$//bar] == {1,'2', /foo, true}");
    test.deepEqual(
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
    
    test.deepEqual(
      q.comparisonOperator,
      new Spah.SpahQL.Token.ComparisonOperator("==")
    );
    
    test.deepEqual(
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
    test.done();
  },
  
  "Parses a flat root query": function(test) {
    var q = Spah.SpahQL.QueryParser.parseQuery("/");
    test.deepEqual(q.primaryToken, new Spah.SpahQL.Token.SelectionQuery([new Spah.SpahQL.Token.PathComponent()]));
    test.done();
  }
  
};