// I'm considering it okay to run the modifiers against a blueprint without reinstantiating as a raw document
// because document has its own modifier execution tests and I'm only concerned with the functionality of the
// built-in modifiers themselves in this suite.

var fs = require('fs');
var html = fs.readFileSync(__dirname+"/fixtures/layout.html", "utf-8");	
var state = Spah.SpahQL.db({
	"show-if": false,
	"class-if": false,
	"id-if": false,
	"stash-if": false
});

exports["Spah.DOM.Actions.Show"] = {

	"Runs up and down": function(test) {
		test.expect(6);

		Spah.DOM.Blueprint.compile(html, function(err, doc) {
			// Assert pre-run state
			//console.log("Pre-run", doc.toString());
			test.ok(doc.jQ("#show-if:visible").length == 1);
			test.ok(doc.jQ("#show-unless:visible").length == 1);

			// Run with false state
			doc.run(state, function(err, doc) {
				//console.log("First-run", doc.toString());
				test.ok(doc.jQ("#show-if:visible").length == 0);
				test.ok(doc.jQ("#show-unless:visible").length == 1);

				// Run with true state
				state.set("show-if", true);
				doc.run(state, function(err, doc) {
					//console.log("Second-run", doc.toString());
					test.ok(doc.jQ("#show-if:visible").length == 1);
					test.ok(doc.jQ("#show-unless:visible").length == 0);
					test.done();
				});			
			});
		});
	}
	
};

exports["Spah.DOM.Actions.ClassName"] = {
	"Runs up and down": function(test) {
		test.expect(6);

		Spah.DOM.Blueprint.compile(html, function(err, doc) {
			// Assert pre-run state
			//console.log("Pre-run", doc.toString());
			test.ok(doc.jQ("#class-if.foo-bar").length == 0);
			test.ok(doc.jQ("#class-unless.baz").length == 0);

			// Run with false state
			doc.run(state, function(err, doc) {
				//console.log("First-run", doc.toString());
				test.ok(doc.jQ("#class-if.foo-bar").length == 0);
				test.ok(doc.jQ("#class-unless.baz").length == 1);

				// Run with true state
				state.set("class-if", true);
				doc.run(state, function(err, doc) {
					//console.log("Second-run", doc.toString());
					test.ok(doc.jQ("#class-if.foo-bar").length == 1);
					test.ok(doc.jQ("#class-unless.baz").length == 0);
					test.done();
				});			
			});
		});
	}
};

exports["Spah.DOM.Actions.ElementId"] = {
	"Runs up and down": function(test) {
		test.expect(9);

		Spah.DOM.Blueprint.compile(html, function(err, doc) {
			// Assert pre-run state
			//console.log("Pre-run", doc.toString());
			test.ok(doc.jQ("#test-id.id-initial").length == 1);
			test.ok(doc.jQ("#test-id.id-if").length == 0);
			test.ok(doc.jQ("#test-id-2.id-unless").length == 0);

			// Run with false state
			doc.run(state, function(err, doc) {
				//console.log("First-run", doc.toString());
				test.ok(doc.jQ("#test-id.id-initial").length == 1);
				test.ok(doc.jQ("#test-id.id-if").length == 0);
				test.ok(doc.jQ("#test-id-2.id-unless").length == 1);

				// Run with true state
				state.set("id-if", true);
				doc.run(state, function(err, doc) {
					//console.log("Second-run", doc.toString());
					test.ok(doc.jQ("#test-id.id-initial").length == 0);
					test.ok(doc.jQ("#test-id.id-if").length == 1);
					test.ok(doc.jQ("#test-id-2.id-unless").length == 0);
					test.done();
				});			
			});
		});
	}
};

exports["Spah.DOM.Actions.Stash"] = {
	"Runs up and down": function(test) {
		test.expect(12);

		Spah.DOM.Blueprint.compile(html, function(err, doc) {
			// Assert pre-run state
			//console.log("Pre-run", doc.toString());
			var ifContent = doc.jQ("#stash-if").html();
			var unlessContent = doc.jQ("#stash-unless").html();

			test.equals(doc.jQ("#stash-if").html(), ifContent);
			test.ok(!doc.jQ("#stash-if").attr("data-stashed-content"));
			test.equals(doc.jQ("#stash-unless").html(), unlessContent);
			test.ok(!doc.jQ("#stash-unless").attr("data-stashed-content"));

			// Run with false state
			doc.run(state, function(err, doc) {
				//console.log("First-run", doc.toString());
				test.equals(doc.jQ("#stash-if").html(), ifContent);
				test.ok(!doc.jQ("#stash-if").attr("data-stashed-content"));
				test.equals(doc.jQ("#stash-unless").html(), "");
				test.equals(doc.jQ("#stash-unless").attr("data-stashed-content"), unlessContent);

				// Run with true state
				state.set("stash-if", true);
				doc.run(state, function(err, doc) {
					//console.log("Second-run", doc.toString());
					test.equals(doc.jQ("#stash-if").html(), "");
					test.equals(doc.jQ("#stash-if").attr("data-stashed-content"), ifContent);
					test.equals(doc.jQ("#stash-unless").html(), unlessContent);
					test.ok(!doc.jQ("#stash-unless").attr("data-stashed-content"));
					test.done();
				});			
			});
		});
	}
};

exports["Spah.DOM.Actions.Populate"] = {

	"Adds #addTemplate and #removeTemplate to the Document instance": function(test) {
		Spah.DOM.Blueprint.compile(html, function(err, doc) {
			doc.addModifiers(Spah.DOM.Actions.Populate);
			test.equal(typeof(doc.addTemplate), "function");
			test.equal(typeof(doc.removeTemplate), "function");
			test.done();
		});
	},

	"Removes #addTemplate and #removeTemplate when disabled": function(test) {
		Spah.DOM.Blueprint.compile(html, function(err, doc) {
			doc.addModifiers(Spah.DOM.Actions.Populate);
			doc.removeModifiers(Spah.DOM.Actions.Populate);

			test.equal(typeof(doc.addTemplate), "undefined");
			test.equal(typeof(doc.removeTemplate), "undefined");
			test.done();
		});
	},

	"addTemplate() adds the template, removeTemplate() removes it": function(test) {
		Spah.DOM.Blueprint.compile(html, function(err, doc) {
			doc.addModifiers(Spah.DOM.Actions.Populate);
			
			test.equal(doc.jQ("script#template-test").length, 0);
			doc.addTemplate("test", "&&&test&&&", "underscore");
			test.equal(doc.jQ("script#template-test").length, 1);
			test.equal(doc.jQ("script#template-test").html(), "&&&test&&&");

			test.ok(Spah.DOM.Actions.Populate.TemplateEngines.underscore.mimeType);
			test.equal(doc.jQ("script#template-test").attr("type"), Spah.DOM.Actions.Populate.TemplateEngines.underscore.mimeType);

			doc.removeTemplate("test");
			test.equal(doc.jQ("script#template-test").length, 0);

			test.done();
		});
	},

	"Runs up and down": function(test) {

	},

	"Renders a Mustache template": function(test) {

	},

	"Renders an Underscore template": function(test) {

	},

	"Renders a plain HTML template": function(test) {

	},

	"Registers the live event binding": function(test) {

	}

}
