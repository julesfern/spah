exports["Spah.SpahQL.Token.KeyName"] = {
  
  "Returns a correct new index and found set when reading ahead for key names": function(test) {
    test.deepEqual(Spah.SpahQL.Token.KeyName.parseAt(0, "foo==3"), [3, new Spah.SpahQL.Token.KeyName("foo")]);
    test.deepEqual(Spah.SpahQL.Token.KeyName.parseAt(1, "_foo-bar==3"), [8, new Spah.SpahQL.Token.KeyName("foo-bar")]);
    test.deepEqual(Spah.SpahQL.Token.KeyName.parseAt(1, "_foo-bar97==3"), [10, new Spah.SpahQL.Token.KeyName("foo-bar97")]);
    test.equal(null, Spah.SpahQL.Token.KeyName.parseAt(10, "_foo-bar97==3"));
    test.done();
  }
  
};