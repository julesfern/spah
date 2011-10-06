/**
 * class Spah.DOM.Document
 *
 * Wraps behaviour for any HTML document - either the current loaded document on the client-side, or a Blueprint
 * document on the server side. Provides behaviour for running document modifiers when the SpahQL assertion 
 * associated with an element flips between true and false. Also stores the results of each assertion on each
 * run-through so that modifiers may be triggered or left alone, as appropriate.
 **/
Spah.classCreate("Spah.DOM.Document", {
  
  /**
   * Spah.DOM.Document.defaultModifiers -> Array
   *
   * The list of modifiers to be registered by default on new Document instances where a list of modifiers is not specified in the constructor.
   **/
  "defaultModifiers": [
    Spah.DOM.Modifiers.Show,
    Spah.DOM.Modifiers.ClassName,
    Spah.DOM.Modifiers.ElementId,
    Spah.DOM.Modifiers.Stash,
    Spah.DOM.Modifiers.Populate
  ]

}, {
  
  "modifiers": null,
  "jQ": null,
  "window": null,
  "docType": null,
  
  "queryResultsLastRun": {},
  "queryResultsThisRun": {},
  
  /**
   * new Spah.DOM.Document(jQ, jQDocument, docType, modifiers)
   * - jQ (Object): The jQuery context for this document.
   * - contextWindow (DOMWindow): The window containing the jQuery context.
   * - docType (String): The docType for rendering purposes. Defaults to the HTML5 doctype "<!DOCTYPE html>"
   * - modifiers (Array): An optional array of modifiers to be registered. If not supplied, the default modifiers are registered. See #addModifier to learn about document modifiers. You may always append Spah.DOM.Document.defaultModifiers later, if you wish.
   *
   * Create a new Document instance ready for manipulation.
   **/
  "init": function(jQ, contextWindow, docType, modifiers) {
    this.jQ = jQ;
    this.window = contextWindow;
    this.docType = docType || '<!DOCTYPE html>';
    this.modifiers = [];
    this.addModifiers(modifiers || Spah.DOM.Document.defaultModifiers);
    
    this.queryResultsLastRun = {};
    this.queryResultsThisRun = {};
  },

   /**
    * Spah.DOM.Document#addModifiers(modifierOrArrayOfModifiers, modifer1, modifierN) -> void
    * - modifierOrArrayOfModifiers (Object, Array<Object>): The modifier object to be registered. Expected to implement the modifier interface.
    * - modifier1 (Object): If modifierOrArrayOfModifiers is not an array, then all arguments passed to this method will be added as modifiers.
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
    *
    * Modifiers may also add new capabilities to the document. If your modifier includes the "added" method,
    * Spah will call this function when the modifier is added to the document. The function receives the 
    * document instance as an argument. You may use this to extend the document's capabilities - for example
    * Spah's built-in Populate modifier adds the addTemplate and removeTemplate methods to the document instance,
    * allowing you to register mustache templates with the document.
    **/
  "addModifiers": function(modifier) {
    var m = (Spah.SpahQL.DataHelper.objectType(modifier) == "array")? modifier : arguments;
    for(var i=0; i<m.length; i++) {
      var mod = m[i];

      if(this.modifiers.indexOf(mod) >= 0) {
        Spah.log("Ignoring modifier as it is already registered on this document", mod);
        continue;
      }
      else {
        this.modifiers.push(mod);
        if(mod.added) {
          Spah.log("Registering modifier on a Document and calling modifier.added", mod);
          mod.added(this);
        }
        else {
          Spah.log("Registered modifier on a Document", mod);
        }
      }
    }
  },

  /**
    * Spah.DOM.Document#removeModifiers(modifierOrArrayOfModifiers, modifer1, modifierN) -> void
    * - modifierOrArrayOfModifiers (Object, Array<Object>): The modifier object to be deregistered. 
    * - modifier1 (Object): If modifierOrArrayOfModifiers is not an array, then all arguments passed to this method will be added as modifiers.
    *
    * Deregisters one or more modifiers from this document instance.
    *
    * If your modifier implements the "removed" method, this will be called with this document instance as the only
    * argument. This allows you to clean up any customisations made by the "added" method, if your modifier provided it.
    **/
  "removeModifiers": function(modifier) {
    var m = (Spah.SpahQL.DataHelper.objectType(modifier) == "array")? modifier : arguments;
    for(var i=0; i<m.length; m++) {
      var mod = m[i];
      var index = this.modifiers.indexOf(mod);
      if(index >= 0) {
        // Has modifier, remove
        this.modifiers = this.modifiers.splice(index, 1);
        if(mod.removed) {
          Spah.log("Removing modifier from document and calling modifier.removed", m[i]);  
          mod.removed(this);
        }
        else {
          Spah.log("Removed modifier from document", m[i]);  
        }
      }
      else {
        // Skip
        Spah.log("Did not remove modifier as it is not registered.", m[i]);
      }
    }
  },
  
  /**
   * Spah.DOM.Document#run(stateQueryResult) -> void
   * - stateQueryResult (Spah.SpahQL.QueryResult): The root-level state object with path "/"
   * - callback (Function): (Server-side only) A callback function to be executed when the run has completed. The callback will receive the document as an argument.
   * 
   * Runs all conditional logic in the document and modifies the document accordingly. Runs synchronously
   * in the browser and asynchronously in the Node.js environment.
   **/
  "run": function(stateQueryResult, callback) {
    var d = this;
    
    if(Spah.inBrowser()) {
      // Synchronous Browser implementation
      d.runSync(stateQueryResult);
    }
    else {
      // Async server implementation
      process.nextTick(function() {
        d.runSync(stateQueryResult);
        callback(d);
      });
    }
  },
  
  /**
   * Spah.DOM.Document#runSync(stateQueryResult) -> void
   * - stateQueryResult (Spah.SpahQL.QueryResult): The root-level state object with path "/"
   *
   * Synchronous version of #run.
   **/
  "runSync": function(stateQueryResult) {
    // Start at document level
    this.runElementSync(this.jQ("head"), stateQueryResult);
    this.runElementSync(this.jQ("body"), stateQueryResult);
    // Reset result comparisons
    this.queryResultsLastRun = this.queryResultsThisRun;
    this.queryResultsThisRun = {};
  },
  
  /**
   * Spah.DOM.Document#runElementSync(elem, stateQueryResult) -> void
   * - elem (DOMElement): The element to be examined and run through the modifier chain
   * - stateQueryResult (Spah.SpahQL.QueryResult): The query result object that will be the scope for this element's assertion queries.
   *
   * Runs a DOM element through the modifier chain, running any modifiers that apply to the element.
   **/
  "runElementSync": function(elem, stateQueryResult) {
    var modChain = this.modifiers;
    var attrs = elem[0].attributes;
    
    // Run this element through any matching modifiers
    for(var i=0; i<modChain.length; i++) {
      var modifier = modChain[i];
      var actionName = modifier.actionName(elem, this.jQ, this.window);
      var expectation, assertion, modifierArgs;
      var actionPrefix = "data-"+actionName;
      
      // Determine the assertion to be run for this modifier, and the expected
      // result of the assertion. Also determine the arg flags for the action.
      for(var j=0; j<attrs.length; j++) {
        var attr = attrs.item(j);
        
        if(attr.nodeName.indexOf(actionPrefix) == 0) {
          // Matched action name, now try to match condition
          if(attr.nodeName.indexOf("-if") == attr.nodeName.length-3) expectation = true;
          else if(attr.nodeName.indexOf("-unless") == attr.nodeName.length-7) expectation = false;
          else continue; // Break out if we didn't match this
          
          // Matched action and condition, extract assertion
          assertion = attr.nodeValue;
          // Extract arguments
          if(attr.nodeName.length == actionPrefix.length + (expectation ? 3 : 7)) {
            modifierArgs = null;
          }
          else {
            modifierArgs = attr.nodeName.substring(actionPrefix.length+1, attr.nodeName.length - (expectation ? 3 : 7));
          }
        }
      }
      
      if(assertion) {
        // Now run the assertion
        var result = stateQueryResult.assert(assertion);
        // Is the result different to the result last run?
        var resultLastRun = this.queryResultsLastRun[assertion];
        if(result != resultLastRun) {
          // If so, call the appropriate up/down method on the modifier
          // Up: result matches expectation
          // Down: result opposeses expectation
          if(result == expectation) modifier.up(elem, modifierArgs, stateQueryResult, this.jQ, this.window);
          else modifier.down(elem, modifierArgs, stateQueryResult, this.jQ, this.window);
        }
        // Also stash the results from this run
        this.queryResultsThisRun[assertion] = result;
      }
      else {
        // Move forward with the modifier chain if the assertion wasn't found
        continue;
      }
    }
    
    // Run each child through the modifiers, recursively
    var d = this;
    elem.children().each(function() {
      d.runElementSync(d.jQ(this), stateQueryResult);
    });
  }
  
});