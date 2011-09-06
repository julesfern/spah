exports["Spah.DOM.Blueprint"] = {
  
  "Compiles the blueprint asynchronously": function(test) {
    test.expect(5);
    Spah.verbose = true;
    
    Spah.DOM.Blueprint.compile("./fixtures/layout.html", "./fixtures/views", "/**/*.mustache", function(err, doc) {
      test.ok(!err);
      test.ok(doc instanceof Spah.DOM.Blueprint);
      test.ok(doc.jQ);
      test.ok(doc.window);
      test.equal(doc.docType, '<!DOCTYPE html>');
      Spah.verbose = false;
      test.done();
    });    
  },
  
  "Injects jQuery without modifying the markup": function(test) {
    test.expect(1);
    Spah.DOM.Blueprint.compile("./fixtures/layout.html", "./fixtures/views", "/**/*.notexist", function(err, doc) {
      test.equal(doc.jQ("script").length, 0);
      test.done();
    });
  }
  
}