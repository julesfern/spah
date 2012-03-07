exports["Spah.StateClient"] = {
	
	"Registers a reducer strategy": function(test) {
		var client = Spah.createClient();
		test.equal(client.reducers.length, 0);
		client.addReducer({"paths": "/*", "keep": "/*"});
		test.equal(client.reducers.length, 1);
		test.done();
	}

};