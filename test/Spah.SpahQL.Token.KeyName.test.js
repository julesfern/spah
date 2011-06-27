$(document).ready(function() {
  
  module("Spah.SpahQL.Token.KeyName");
  
  test("Returns a correct new index and found set when reading ahead for key names", function() {
    
    deepEqual(Spah.SpahQL.Token.KeyName.parseAt(0, "foo==3"), [3, new Spah.SpahQL.Token.KeyName("foo")]);
    deepEqual(Spah.SpahQL.Token.KeyName.parseAt(1, "_foo-bar==3"), [8, new Spah.SpahQL.Token.KeyName("foo-bar")]);
    deepEqual(Spah.SpahQL.Token.KeyName.parseAt(1, "_foo-bar97==3"), [10, new Spah.SpahQL.Token.KeyName("foo-bar97")]);
    
    equal(null, Spah.SpahQL.Token.KeyName.parseAt(10, "_foo-bar97==3"));
    
  });
  
});