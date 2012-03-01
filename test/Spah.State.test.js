exports["Spah.State"] = {
  
  "Initialises as a root-level query result": function(test) {
  	var data = {"foo": "bar"};
  	var state = new Spah.State(data);

  	test.equals(state.path, "/");
  	test.ok(Spah.SpahQL.DataHelper.eq(state.value, data));
  	test.done();
  },

  "May have a query rule applied to it": function(test) {
  	var data = {
  		"foo": {"bar": "baz", "finangle": "patang"},
  		"bar": "baz"
  	};
  	var expected = {
  		"foo": {"bar": "baz2"},
  		"bar": "baz2"
  	};

  	var state = new Spah.State(data);
  	var modifiedState = state.apply("//bar", function(result) {
  		result.replace("baz2");
  	});

  	test.ok(Spah.SpahQL.DataHelper.eq(data, state.value))
  	test.ok(Spah.SpahQL.DataHelper.eq(expected, modifiedState.value));
  	test.done();
  }
  
};