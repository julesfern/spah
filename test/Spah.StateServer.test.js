exports["Spah.StateServer"] = {
	
	"Registers an expander strategy": function(test) {
			var server = Spah.createServer();
			test.equal(server.expanders.length, 0);
			server.addExpander({"path": "/*", "if": "/a"}, function(results, root, attachments, strategy) {
					strategy.done();
			});
			test.equal(server.expanders.length, 1);
			test.done();
	}

};