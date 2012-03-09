exports["Spah.StateServer"] = {
	
	"Registers an expander strategy": function(test) {
			var server = Spah.createServer();
			test.equal(server.strategiser.count(), 0);
			server.addExpander({"path": "/*", "if": "/a"}, function(results, root, attachments, strategy) {
					strategy.done();
			});
			test.equal(server.strategiser.count(), 1);
			test.done();
	}

};