$(document).ready(function() {
  
  module("Spah.State");
  
  test("Stores the data when initialised", function() {
    var state = new Spah.State({foo: "bar"});
    ok(state.data, "State stored");
    equal("bar", state.data.foo, "State matches");
  });
  
})