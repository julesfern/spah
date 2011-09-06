/**
 * class Spah.DOM.Document
 *
 * Wraps behaviour for any HTML document - either the current loaded document on the client-side, or a Blueprint
 * document on the server side. Provides behaviour for running document modifiers when the SpahQL assertion 
 * associated with an element flips between true and false. Also stores the results of each assertion on each
 * run-through so that modifiers may be triggered or left alone, as appropriate.
 **/
Spah.classCreate("Spah.DOM.Document", {
  
}, {
  
  "modifiers": null,
  "jQ": null,
  "window": null,
  "docType": null,
  
  "queryResultsLastRun": {},
  "queryResultsThisRun": {},
  
  /**
   * new Spah.DOM.Document(jQ, jQDocument, docType)
   * - jQ (Object): The jQuery context for this document.
   * - contextWindow (DOMWindow): The window containing the jQuery context.
   * - docType (String): The docType for rendering purposes. Defaults to the HTML5 doctype "<!DOCTYPE html>"
   *
   * Create a new Document instance ready for manipulation.
   **/
  "init": function(jQ, contextWindow, docType) {
    this.jQ = jQ;
    this.window = contextWindow;
    this.docType = docType || '<!DOCTYPE html>';
    this.modifiers = new Spah.DOM.Modifiers();
    
    this.queryResultsLastRun = {};
    this.queryResultsThisRun = {};
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
    this.runElementSync(this.jQ("head"), state);
    this.runElementSync(this.jQ("body"), state);
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
    var modChain = this.modifiers.modules;
    var attrs = elem[0].attributes;
    
    // Run this element through any matching modifiers
    for(var i=0; i<modChain.length; i++) {
      var modifier = modChain[i];
      var actionName = modifier.actionName(elem);
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
          if(result == expectation) modifier.up(elem, stateQueryResult, modifierArgs);
          else modifier.down(elem, stateQueryResult, modifierArgs);
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
      d.runElementSync($(this), stateQueryResult);
    });
  }
  
});