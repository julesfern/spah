var html;
if(Spah.inBrowser()) {
	// TODO
}
else {
	var fs = require('fs');
	html = fs.readFileSync("./fixtures/layout.html", "utf-8");	
}


exports["Spah.DOM.Document"] = {
  
  "Runs against internal document logic": function(test) {
    test.done();

    // Load blueprint document
    	// Spawn basic Document instance from blueprint innards
  },

  "Adds default handlers when instantiated": function(test) {
    test.expect(Spah.DOM.Document.defaultModifiers.length + 1);

    // Compiles a blueprint and extracts to a Document instance
    Spah.DOM.Blueprint.compile(html, function(err, doc) {
      test.ok(!err);

      var tDoc = new Spah.DOM.Document(doc.jQ, doc.window);
      for(var i=0; i<Spah.DOM.Document.defaultModifiers.length; i++) {
      	test.ok(tDoc.modifiers.indexOf(Spah.DOM.Document.defaultModifiers[i]) >= 0);
      }
      
      test.done();
    });    
  },
  "Does not add a modifier if the modifier is already registered": function(test) {
  	test.expect(3);
  	Spah.DOM.Blueprint.compile(html, function(err, doc) {
      test.ok(!err);

      var tDoc = new Spah.DOM.Document(doc.jQ, doc.window);
      var count = tDoc.modifiers.length;
      test.ok(count > 0);
      tDoc.addModifiers(Spah.DOM.Modifiers.Show);
      test.equal(tDoc.modifiers.length, count);
      
      test.done();
    });    
  },
  "Calls modifier.added on addition, if the modifier defines it": function(test) {
  	test.expect(2);
  	Spah.DOM.Blueprint.compile(html, function(err, doc) {
      test.ok(!err);

      var tDoc = new Spah.DOM.Document(doc.jQ, doc.window);
      tDoc.addModifiers({
      	"added": function(d) {
      		d.ranTestModifier = true;
      	}
      });
      test.ok(tDoc.ranTestModifier);
      
      test.done();
    });    
  },
  "Calls modifer.removed on removal, if the modifier defines it": function(test) {
  	test.expect(4);
  	Spah.DOM.Blueprint.compile(html, function(err, doc) {
      test.ok(!err);

      var tDoc = new Spah.DOM.Document(doc.jQ, doc.window);
      var modifier = {
      	"removed": function(d) {
      		d.removedTestModifier = true;
      	}
      };
      test.ok(!tDoc.removedTestModifier);
      tDoc.addModifiers(modifier);
      test.ok(!tDoc.removedTestModifier);
      tDoc.removeModifiers(modifier);
      test.ok(tDoc.removedTestModifier);
      
      test.done();
  	});
  },
  
};