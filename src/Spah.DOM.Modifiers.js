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
    this.add(Spah.DOM.Modifiers.Defaults.Show);
    this.add(Spah.DOM.Modifiers.Defaults.ClassName);
    this.add(Spah.DOM.Modifiers.Defaults.ElementId);
    this.add(Spah.DOM.Modifiers.Defaults.Stash);
    this.add(Spah.DOM.Modifiers.Defaults.Populate);
  },

  
  /**
   * Spah.DOM.Modifiers#add(module) -> Boolean
   * - module (Object): The modifier object to be registered. Expected to implement the modifier interface.
   *
   * The interface requires your module to contain the methods:
   *
   * - **actionName(element, $, window)** Returns the action name for this module. This is the attribute you want your modifier to respond to - for instance, the element ID modifier is interested in attributes like "data-id-foo-if", and therefore the action name is "id". Receives a jQuery containing the element in question as the only argument.
   * - **up(element, flags, state, $, window)** Runs the modification forwards. Used when the associated assertion flips from false to true for _if_ assertions and when the associated assertion flips from true to false for _unless_ assertions. The method will receive a jQuery containing the element, the state object and any flags. Flags are derived from the attribute - if we use the attribute <code>data-class-foo-bar-if</code> the actionName will be "class" and the flags will be "foo-bar". The up and down methods are expected to interpret the flags as appropriate.
   * - **down(element, flags, state, $, window)** Runs the modification backwards. Called when the associated assertion flips from true to false for _if_ assertions and when the associated assertion flips from false to true for _unless_ assertions. Receives the same arguments as <code>up</code>
   *
   * In each case the arguments are as follows:
   * - "element" is a jQuery containing the element in question
   * - "flags" are any arguments given by the attribute name (see below)
   * - "state" is the Spah state (a Spah.SpahQL.QueryResult object)
   * - "$" is the main jQuery object itself
   * - "window" is the context DOMWindow for the document runner. Call window.document for the document itself.
   *
   * Regarding flags, let's take a look at the ClassName modifier when it processes 
   * the attributes <code>data-class-foo-bar-if="/foo/bar"</code> and <code>data-class-baz-unless="/notbaz"</code>
   *
   * The ClassName modifier returns an actionName of "class" for all elements. When Spah's document runner
   * encounters this attribute, the ClassName modifier is matched and passed "foo-bar" as the flags for the
   * first attribute and "baz" for the second attribute.
   *
   * It is up to you how your modifiers process flags when they are asked to run up or down.
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