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
  
  "queryResultsLastRun": {},
  "queryResultsThisRun": {},
  
  /**
   * new Spah.DOM.Document(jQ, jQDocument)
   **/
  "init": function(jQ, contextWindow) {
    this.jQ = jQ;
    this.window = contextWindow;
    this.modifiers = new Spah.DOM.Modifiers();
    
    this.queryResultsLastRun = {};
    this.queryResultsThisRun = {};
  },
  
  "run": function(stateQueryResult) {
    // Start at document level
    this.runElement(this.jQ("html"), state);
    // Reset result comparisons
    this.queryResultsLastRun = this.queryResultsThisRun;
    this.queryResultsThisRun = {};
  },
  
  // run a single element
  "runElement": function(context, state) {
    // Run this element through the matched modifiers
    // Run each child through the modifiers, recursively
  }
  
});