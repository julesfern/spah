$(document).ready(function() {
  
  module("Spah.SpahQL.Token.ComparisonOperator");
  
  test("Returns the correct index and found token when reading ahead for comparison operators", function() {
    
      deepEqual([2, new Spah.SpahQL.Token.ComparisonOperator(">")], Spah.SpahQL.Token.ComparisonOperator.parseAt(1, "3>4"));
      deepEqual([3, new Spah.SpahQL.Token.ComparisonOperator("==")], Spah.SpahQL.Token.ComparisonOperator.parseAt(1, "3==4"));
      deepEqual([4, new Spah.SpahQL.Token.ComparisonOperator("}!{")], Spah.SpahQL.Token.ComparisonOperator.parseAt(1, "3}!{4"));
    
      equal(null, Spah.SpahQL.Token.ComparisonOperator.parseAt(1, "3!4"));
    
  });
  
});