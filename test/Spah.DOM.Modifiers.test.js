var goodModifier = {
  "actionName": function(elem) { return "good"; },
  "up": function(elem, state, flags) { },
  "down": function(elem, state, flags) { }
};

exports["Spah.DOM.Modifiers"] = {
  
  "Adds a module": function(test) {
    var modifiers = new Spah.DOM.Modifiers();
        modifiers.reset();
    test.equal(modifiers.modules.length, 0);
    test.ok(modifiers.add(goodModifier));
    test.equal(modifiers.modules.length, 1);
    test.done();
  },
  
  
  "Removes a module": function(test) { 
    var mod = goodModifier;
    var modifiers = new Spah.DOM.Modifiers();
        modifiers.reset();
        
    test.ok(modifiers.add(mod));
    test.equal(modifiers.modules.length, 1);
    modifiers.remove(mod);
    test.equal(modifiers.modules.length, 0);
    test.done();
  }
  
};