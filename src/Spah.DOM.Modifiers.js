/**
 * class Spah.DOM.Modifiers
 *
 * An instance of <code>Modifiers</code> exists on every instance of <code>Spah.DOM.Document</code>. 
 * The <code>Modifiers</code> instance acts as a router for applying helper code such as stashing, classnames and
 * any other document modification to elements.
 *
 * You may add your own helpers to Spah, or disable helpers that you don't need. See #add and #remove for details. 
 * Each instance of <code>Modifiers</code> registers the default helpers on creation.
 **/

Spah.classCreate("Spah.DOM.Modifiers", {
  
  // Singleton methods
  // -------------------------
  
}, {
  
  // Instance methods
  // -------------------------
  
  /**
   * Spah.DOM.Modifiers#modules -> Array
   *
   * The list of registered modifications.
   **/
  "modules": [],
  
  /**
   * new Spah.DOM.Modifiers()
   *
   * Initialises a new <code>Modifiers</code> router for use on a document, with the default helpers
   * already registered. See #defaults for details of the default helpers.
   **/
  "init": function() {
    this.reset();
    this.appendDefaults();
  },
  
  /**
   * Spah.DOM.Modifiers#reset() -> void
   *
   * Removes all registered modifiers.
   **/
  "reset": function() {
    this.modules = [];
  }
  
  /** 
   * Spah.DOM.Modifiers#appendDefaults() -> void
   *
   * Appends the default modifiers (show, class, id, stash, populate) to the current list of modifiers.
   * If any of the defaults are already registered, they will be omitted in this step.
   **/
  "appendDefaults": function() {
    
  },
  
  /**
   * Spah.DOM.Modifiers#modifierChainForElement(elem) -> Array<Spah.DOM.Modifier>
   * elem (HTMLElement): A jQuery object containing the element being processed.
   *
   * Analyses the attributes and content of the given element and returns an ordered array of tuples,
   * each containing the modifier instance to be triggered and the condition against which it will fire.
   **/
  "modifierChainForElement": function(elem) {
    var attrs = elem.attributes;
    if(attrs.length == 0) return;
    var modElements = [];
    for(var i=0; i < attrs.length; i++) {
      var aName = attrs.item(i).nodeName;
      if(aName.indexOf("data") == 0 && ((aName.indexOf("-if") == aName.length-3) || (aName.indexOf("-unless") == aName.length-7))) {
        // Found a Spah attribute
        
      }
    }
  },
  
  /**
   * Spah.DOM.Modifiers#add(module) -> Boolean
   * - moduleKlass (Spah.DOM.Modifier): The modifier object to be registered. Expected to implement the modifier interface.
   *
   * The interface requires your module to contain the instance methods:
   *
   * - **actionName()** Returns the action name for this module. This is the attribute you want your modifier to respond to - for instance, the element ID modifier is interested in attributes like "data-id-foo-if", and therefore the action name is "id".
   * - **up(element, state, flags)** Runs the modification forwards. Used when the associated assertion flips from false to true for _if_ assertions and when the associated assertion flips from true to false for _unless_ assertions. The method will receive a jQuery containing the element, the state object and any flags. Flags are derived from the attribute - if we use the attribute <code>data-class-foo-bar-if</code> the actionName will be "class" and the flags will be "foo-bar". The up and down methods are expected to interpret the flags as appropriate.
   * - **down(element, state, flags)** Runs the modification backwards. Called when the associated assertion flips from true to false for _if_ assertions and when the associated assertion flips from false to true for _unless_ assertions. Receives the same arguments as <code>up</code>
   *
   * An instance of your modifier class will be created for each document that requires it, so you may feel free to use state in the modifier instance.
   **/
  "add": function(module) {
    if(this.indexOf(module) < 0) {
      if(this.validate(module)) {
        // Not registered and valid to be registered
        this.modules.push(module);
        return true;
      }
    }
    else {
      // Already registered
      return false;
    }
  },
  
  /**
   * Spah.DOM.Modifiers#validate(module) -> Boolean
   * module (Spah.DOM.Modifier): The object to be validated against the modifier interface.
   * 
   * Validates an object as being compatible with the modifier interface. Called against any modules
   * before they are added using the #add method.
   **/
  "validate": function(module) {
    var klassMethods = [];
    var instanceMethods = ["actionName", "up", "down"];

    for(var i=0; i<klassMethods.length; i++) {
      if(typeof module[klassMethods[i]] != "function") {
        throw new Spah.DOM.Errors.InvalidModifierError("Module does not conform to the expected class method interface - should implement ::"+klassMethods[i]+". See documentation for Spah.DOM.Modifiers#add for more information.");
        return false;
      }
    }
    for(var j=0; j<instanceMethods.length; j++) {
      if(typeof module.prototype[instanceMethods[j]] != "function")  {
        throw new Spah.DOM.Errors.InvalidModifierError("Module does not conform to the expected instance method interface - should implement #"+instanceMethods[i]+". See documentation for Spah.DOM.Modifiers#add for more information.");
        return false;
      }
    }
    return true;
  },
  
  /**
   * Spah.DOM.Modifiers#indexOf(module) -> Number
   * module (Spah.DOM.Modifier): The modifier instance to detect on this modifier list
   *
   * Returns the found index of the given module, or -1 if it is not found.
   **/
  "indexOf": function(module) {
    return this.modules.indexOf(module);
  },
  
  /**
   * Spah.DOM.Modifiers#remove(module) -> void
   * module (Spah.DOM.Modifier): The modifier instance to deregister from this modifier list
   *
   * Deregisters a modifier from this list by removing any instances of the class passed in the first argument.
   **/
  "remove": function(module) {
    var i = this.indexOf(module);
    if(i >= 0) {
      this.modules.splice(i, 1);
      return true;
    }
    else {
      return false;
    }
  }
  
});