exports["Spah.SpahQL.Strategiser"] = {
	
	"Converts strategies with convenience keys to the standarised schema": function(test) {
		var strategiser = new Spah.SpahQL.Strategiser();
		var strat;
		var action = function(){};

		strat = {"path": "/*", "if": "//*", "action": action};
		test.deepEqual(strategiser.commoniseStrategy(strat), {"paths": ["/*"], "condition": "//*", "expectation": true, "action": action, "_commonised": true});

		strat = {"paths": "/*", "if": "//*", "action": action};
		test.deepEqual(strategiser.commoniseStrategy(strat), {"paths": ["/*"], "condition": "//*", "expectation": true, "action": action, "_commonised": true});

		strat = {"paths": ["/a", "/b"], "unless": "//*", "action": action};
		test.deepEqual(strategiser.commoniseStrategy(strat), {"paths": ["/a", "/b"], "condition": "//*", "expectation": false, "action": action, "_commonised": true});

		strat = {"paths": ["/a", "/b"], "unless": "//*"};
		test.deepEqual(strategiser.commoniseStrategy(strat, action), {"paths": ["/a", "/b"], "condition": "//*", "expectation": false, "action": action, "_commonised": true});


		test.done();
	},

	"Registers and retrieves a strategy by category": function(test) {

	},

	"Registers and retrieves a strategy by wildcard category": function(test) {

	},

};