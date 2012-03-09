exports["Spah.State"] = {
  
  "Initialises as a root-level query result": function(test) {
  	var data = {"foo": "bar"};
  	var state = new Spah.State(data);

  	test.equals(state.path, "/");
  	test.ok(Spah.SpahQL.DataHelper.eq(state.value, data));
  	test.done();
  },
  
};