exports["Spah"] = {
  
  "registers a class with both browser-style and commonjs-style class names": function(test) {
    var klass = Spah.classCreate("Spah.Foo.Bar.Baz");
    test.equal(klass, Spah.foo.bar.baz);
    test.equal(klass, Spah.Foo.Bar.Baz);
    test.done();
  }
  
};