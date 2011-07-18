exports["Spah.SpahQL.Token.Boolean"] = {
  
  "Returns a correct new index and found bool when reading ahead for boolean literals": function(test) {
    test.deepEqual([16,new Spah.SpahQL.Token.Boolean(true)], Spah.SpahQL.Token.Boolean.parseAt(12, '{3, "true", true}'));
    test.deepEqual([17,new Spah.SpahQL.Token.Boolean(false)], Spah.SpahQL.Token.Boolean.parseAt(12, '{3, "true", false}'));
    test.equal(null, Spah.SpahQL.Token.Boolean.parseAt(12, '{3, "true", "false"}'));
    test.done();
  }
  
}