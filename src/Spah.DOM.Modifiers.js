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
  },
  
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
    
  },
  
  /**
   * Spah.DOM.Modifiers#add(module) -> Boolean
   * - moduleKlass (Spah.DOM.Modifier): The modifier object to be registered. Expected to implement the modifier interface.
   *
   * The interface requires your module to contain the instance methods:
   *
   * - **actionName(element)** Returns the action name for this module. This is the attribute you want your modifier to respond to - for instance, the element ID modifier is interested in attributes like "data-id-foo-if", and therefore the action name is "id". Receives a jQuery containing the element in question as the only argument.
   * - **up(element, state, flags)** Runs the modification forwards. Used when the associated assertion flips from false to true for _if_ assertions and when the associated assertion flips from true to false for _unless_ assertions. The method will receive a jQuery containing the element, the state object and any flags. Flags are derived from the attribute - if we use the attribute <code>data-class-foo-bar-if</code> the actionName will be "class" and the flags will be "foo-bar". The up and down methods are expected to interpret the flags as appropriate.
   * - **down(element, state, flags)** Runs the modification backwards. Called when the associated assertion flips from true to false for _if_ assertions and when the associated assertion flips from false to true for _unless_ assertions. Receives the same arguments as <code>up</code>
   *
   * An instance of your modifier class will be created for each document that requires it, so you may feel free to use state in the modifier instance.
   **/
  "add": function(module) {
    if(this.indexOf(module) < 0) {
      // Not registered
      this.modules.push(module);
      return true;
    }
    else {
      // Already registered
      return false;
    }
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