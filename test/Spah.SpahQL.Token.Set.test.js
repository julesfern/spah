exports["Spah.SpahQL.Token.Set"] = {
  
  "Returns a correct new index and found set when reading ahead for set literals": function(test) {
    test.expect(6);
    
    test.deepEqual(
      Spah.SpahQL.Token.Set.parseAt(0, "{1,'2,',true}"), 
      [13, new Spah.SpahQL.Token.Set([
        new Spah.SpahQL.Token.Numeric(1),
        new Spah.SpahQL.Token.String("2,"),
        new Spah.SpahQL.Token.Boolean(true)
      ])]
    );
    test.deepEqual(
      Spah.SpahQL.Token.Set.parseAt(2, "--{1.5,false,true}--"), 
      [18, new Spah.SpahQL.Token.Set([
        new Spah.SpahQL.Token.Numeric(1.5),
        new Spah.SpahQL.Token.Boolean(false),
        new Spah.SpahQL.Token.Boolean(true)
      ])]
    );
    test.deepEqual(
      Spah.SpahQL.Token.Set.parseAt(2, "--{'a'..'d'}--"), 
      [12, new Spah.SpahQL.Token.Set([
        new Spah.SpahQL.Token.String("a"),
        new Spah.SpahQL.Token.String("d")
      ], true)]
    );
    
    test.deepEqual(
      Spah.SpahQL.Token.Set.parseAt(2, "--{1,2,/foo}--"), 
      [12, new Spah.SpahQL.Token.Set([
        new Spah.SpahQL.Token.Numeric(1),
        new Spah.SpahQL.Token.Numeric(2),
        new Spah.SpahQL.Token.SelectionQuery([
          new Spah.SpahQL.Token.PathComponent(new Spah.SpahQL.Token.KeyName("foo"))
        ])
      ])]
    );
    
    // Errors
    try { Spah.SpahQL.Token.Set.parseAt(0, "{'a'..'d',2}--") } catch(e) { test.ok(e, e.message) };
    try { Spah.SpahQL.Token.Set.parseAt(0, "{'b','a'..'d'}--") } catch(e) { test.ok(e, e.message) };
    
    test.done();
  }
  
}