$(document).ready(function() {
  
  module("Spah.SpahQL.Token.Boolean");
  
  test("Returns a correct new index and found bool when reading ahead for boolean literals", function() {
    deepEqual([16,new Spah.SpahQL.Token.Boolean(true)], Spah.SpahQL.Token.Boolean.parseAt(12, '{3, "true", true}'));
    deepEqual([17,new Spah.SpahQL.Token.Boolean(false)], Spah.SpahQL.Token.Boolean.parseAt(12, '{3, "true", false}'));
    equal(null, Spah.SpahQL.Token.Boolean.parseAt(12, '{3, "true", "false"}'));
  })
  
});