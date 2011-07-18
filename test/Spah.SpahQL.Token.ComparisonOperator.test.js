exports["Spah.SpahQL.Token.ComparisonOperator"] = {
  
  "Returns the correct index and found token when reading ahead for comparison operators": function(test) {
    test.deepEqual([2, new Spah.SpahQL.Token.ComparisonOperator(">")], Spah.SpahQL.Token.ComparisonOperator.parseAt(1, "3>4"));
    test.deepEqual([3, new Spah.SpahQL.Token.ComparisonOperator("==")], Spah.SpahQL.Token.ComparisonOperator.parseAt(1, "3==4"));
    test.deepEqual([4, new Spah.SpahQL.Token.ComparisonOperator("}!{")], Spah.SpahQL.Token.ComparisonOperator.parseAt(1, "3}!{4"));
    test.equal(null, Spah.SpahQL.Token.ComparisonOperator.parseAt(1, "3!4")); 
    test.done();
  }
  
};