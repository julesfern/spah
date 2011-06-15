$(document).ready(function() {
  
  module("Spah.SpahQL.Token.Numeric");
  
  test("Returns a correct new index and found number when reading ahead for numeric literals", function() {
    // Ints
    deepEqual([1,new Spah.SpahQL.Token.Numeric(7)], Spah.SpahQL.Token.Numeric.parseAt(0, '7, bar'));
    deepEqual([1,new Spah.SpahQL.Token.Numeric(7)], Spah.SpahQL.Token.Numeric.parseAt(0, '7'));
    deepEqual([8,new Spah.SpahQL.Token.Numeric(-7)], Spah.SpahQL.Token.Numeric.parseAt(6, 'foo,  -7, foo'));
      
    // Floats
    deepEqual([4,new Spah.SpahQL.Token.Numeric(3.21)], Spah.SpahQL.Token.Numeric.parseAt(0, '3.21, bar'));
    deepEqual([3,new Spah.SpahQL.Token.Numeric(1.5)], Spah.SpahQL.Token.Numeric.parseAt(0, '1.5'));
    deepEqual([10,new Spah.SpahQL.Token.Numeric(-7.5)], Spah.SpahQL.Token.Numeric.parseAt(6, 'foo,  -7.5, foo'));
    
    // Not found
    equal(null, Spah.SpahQL.Token.Numeric.parseAt(0, 'true'))
  });
  
});