/**
 * class Spah.State < Spah.SpahQL.QueryResult
 *
 * Spah.State is the wrapping class for the <code>state</code> defined by your application. 
 * It supports querying and assertions against the state and is also responsible for deep-merging
 * state updates from the server and dispatching modification events to your responders.
 **/

Spah.classExtend("Spah.State", Spah.SpahQL.QueryResult, {

  "commoniseReducer": function(reducer) {
      if(reducer._commonised) return reducer;

      var paths = reducer.paths || reducer.path;
      if(typeof(paths) == "string") paths = [paths];

      var isKeeper = (reducer.keep)? true : false;
      if(reducer.keep && reducer.remove) throw new Error("Reducer is ambiguous. Use 'keep' or 'remove', not both.");
      var matchers = (isKeeper)? reducer.keep : reducer.remove;
      if(typeof(matchers) == "string") matchers = [matchers];

      var commonisedReducer = {};
      commonisedReducer._commonised = true;
      commonisedReducer.paths = paths;
      commonisedReducer.isKeeper = isKeeper;
      commonisedReducer.matchers = matchers;

      return commonisedReducer;
  },

  "commoniseExpander": function(expander, callback) {
      if(expander._commonised) return expander;

      var paths = expander.paths || expander.path;
      if(typeof(paths) == "string") paths = [paths];

      var expectation = (expander["if"])? true : false;
      var condition = (expectation ? expander["if"] : expander["unless"]) || null;
      var action = expander.action || callback;

      var commonisedExpander = {
        "paths": paths,
        "expectation": expectation,
        "condition": condition,
        "action": action,
        "_commonised": true
      };

      return commonisedExpander;
  }

}, {
  
  /**
   * new Spah.State(data[, reducers[, expanders]])
   * - data (Object): A hash of data to act as the starting state. Note that modification events are not fired during instantiation.
   * - reducers (Array<Object>): An array of rules to be applied when this state is reduced.
   * - expanders (Array<Object>): An array of rules to be applied when this state is expanded.
   **/
  "init": function(data, reducers, expanders) {
    this.path = "/"; 
    this.value = data || {};
    this.sourceData = this.value;

    /**
     * Spah.State#expanderLocked -> Boolean
     *
     * Indicates whether an expander process is already running on this State instance.
     **/
    this.expanderLocked = false;

    /**
     * Spah.State#reducers -> Array<Object>
     *
     * The array of reducers, each of which is an object. See #addReducer for details on reducers.
     **/
    this.reducers = reducers || [];
    /**
     * Spah.State#expanders -> Array<Object>
     *
     * The array of expanders, each of which is an object. See #addExpander for details on expanders.
     **/
    this.expanders = expanders || [];
  },

  /**
   * Spah.State#clone() -> Spah.State
   *
   * Creates a new, deep clone of this State, the value of which may be freely modified
   * without embuggering the original.
   *
   * However, this new state will share a set of reducer and expander rules
   * with the original.
   **/
  "clone": function() {
    return new Spah.State(
      Spah.SpahQL.DataHelper.deepClone(this.value),
      this.reducers,
      this.expanders
    );
  },

  /**
   * Spah.State#reduce([useReducers]) -> Spah.State
   * useReducers (Array): An optional array of reducer objects to be used instead of those already registered on
   * this state instance.
   * 
   * Creates a clone of this state instance and applies all reducer strategies specified with #addReducer
   * to the clone. Returns the reduced clone. See #addReducer for details of reducer strategies.
   *
   * This method will be called by the Spah Client any time the state is about to be sent up the
   * wire to the Spah Server.
   **/
  "reduce": function(useReducers) {
    var target = this.clone();
    var reducers = useReducers || this.reducers;

    for(var r in reducers) {
      var reducer = reducers[r];
      target.applyReducer(reducer);
    }

    return target;
  },

  "commoniseReducer": function(reducer) {
    return Spah.State.commoniseReducer(reducer);
  },

  "commoniseExpander": function(expander, callback) {
    return Spah.State.commoniseExpander(expander, callback);
  },

  /**
   * Spah.State#applyReducer(reducer) -> void
   * reducer (Object): The reducer strategy to apply.
   *
   * Applies a reducer strategy to this state instance. Used during reduction when #reduce is called.
   **/
  "applyReducer": function(reducer) {
    var commonisedReducer = (reducer._commonised)? reducer : this.commoniseReducer(reducer);
    if(commonisedReducer.isKeeper) {
      return this.applyKeepReducer(reducer);
    }
    else {
      return this.applyRemoveReducer(reducer);
    }
  },

  /**
   * Spah.State#applyRemoveReducer(reducer) -> void
   *
   * Applies a remove-type reducer strategy to this state instance. See #addReducer for more.
   **/
  "applyRemoveReducer": function(reducer) {
    var commonisedReducer = (reducer._commonised)? reducer : this.commoniseReducer(reducer);
    // For each of the paths targeted by the reducer...
    for(var p in commonisedReducer.paths) {
      // Gather the portions of the state targeted by the reducer
      var path = commonisedReducer.paths[p];
      var pathResults = this.select(path);

      // Targets acquired. 
      pathResults.each(function(index, total) {
        // Now isolate the matches within each result's scope
        for(var m in commonisedReducer.matchers) {
          var resultMatcher = commonisedReducer.matchers[m];
          var resultMatches = this.select(resultMatcher);
          resultMatches.deleteAll();
        }
      });
    }
  },

  /**
   * Spah.State#applyKeepReducer(reducer) -> void
   *
   * Applies a keep-type reducer strategy to this state instance. See #addReducer for more.
   **/
  "applyKeepReducer": function(reducer) {
    var commonisedReducer = (reducer._commonised)? reducer : this.commoniseReducer(reducer);

    // Build a set of queries for objects we want to keep
    for(var p in commonisedReducer.paths) {
      // Execute scoped reductions for this path
      var path = commonisedReducer.paths[p];
      var pathResults = this.select(path);
      var explodedPathResults = pathResults.select("//*");

      // Now delete everything in this path scope that doesn't match one of the
      // matcher queries.

      // Start by exploding this scope
      var matcherResultSets = [];
      // Then build the matcher results
      for(var m in commonisedReducer.matchers) {
        var matcherQuery = commonisedReducer.matchers[m];
        var matcherResultSet = pathResults.select(matcherQuery);
        matcherResultSets.push(matcherResultSet);
      }

      // We've now got a full tree for this path scope and a full tree of matched results
      // Any result in the full exploded tree that doesn't appear in, or contain something 
      // appearing in, the matcher results, should be deleted.

      var exemptPaths = [];
      explodedPathResults.each(function() {
        var explodedResult = this;
        var deleteExplodedResult = true;

        for(var mrs in matcherResultSets) {
          var rs = matcherResultSets[mrs];
          rs.each(function() {
            var mr = this;
            // Is this matcher result contained in the exploded results?
            if(explodedResult.contains(mr)) {
              exemptPaths.push(explodedResult.path);
            }
          })
        }
      });

      explodedPathResults.each(function() {
        if(exemptPaths.indexOf(this.path) < 0) {
          this.delete();
        }
      })

    }
  },

  /**
   * Spah.State#expand(callback[, attachments][, useExpanders]) -> Spah.State
   * callback (Function): The function to call when all expanders have run.
   * attachments (Object): A hash to be passed to the individual strategies for convenience
   * useExpanders (Array): An array of expanders to use instead of the expanders registered directly on this State.
   *
   * Clones this state instance and executes all expander strategies against the clone.
   **/
  "expand": function(callback, attachments, useExpanders) {
    if(this.expanderLocked) throw new Error("Attempting to expand state while expansion already in progress");
    this.expanderLocked = true;

    var target = this.clone();
    var expanders = useExpanders || this.expanders;
    Spah.log("Starting to execute expander strategies on Spah.State instance");

    target.execExpanderStrategyLoop(0, expanders, attachments, callback);
  },

  "completedExpanding": function(target, callback) {
    this.expanderLocked = false;
    callback(target);
  },

  "execExpanderStrategyLoop": function(expanderIndex, expanders, attachments, exitCallback) {
    // Check for global exit condition
    if(expanderIndex >= expanders.length) return this.completedExpanding(this, exitCallback);
    // Otherwise get expander
    var expander = this.commoniseExpander(expanders[expanderIndex]);

    // Check validity of expander
    var paths = expander.paths;
    var condition = expander.condition;
    var expectation = expander.expectation;

    // Set up the exit for the 
    var scope = this;
    function handControlBackToStrategyLoop() {
      scope.execExpanderStrategyLoop(expanderIndex+1, expanders, attachments, exitCallback);
    };

    if(!condition || (this.assert(condition) == expectation)) {
      Spah.log("State Expander: Executing strategy for ["+paths.join(",")+"]");

      // Enter the loop for queries/paths in this strategy
      return this.execExpanderQueryLoop(0, expander, attachments, exitCallback, handControlBackToStrategyLoop);
    }
    else {
      Spah.log("State Expander: Skipping strategy for ["+paths.join(",")+"] - condition ("+condition+" == "+expectation+") not met");
      // Hand off to the next strategy
      return handControlBackToStrategyLoop();
    }
  },

  "execExpanderQueryLoop": function(pathIndex, expander, attachments, exitCallback, handControlBackToStrategyLoop) {
    // Check for strategy exit condition - exit strategy and move on to next
    if(pathIndex >= expander.paths.length) {
      Spah.log("State expander: Strategy for paths ["+expander.paths.join(",")+"] exiting after running out of paths");
      return handControlBackToStrategyLoop();
    }
    
    var path = expander.paths[pathIndex];
    var action = expander.action;
    var results = this.select(path);

    // Create the strategy callback, passing control back to the query loop from an indivudal expander strategy    
    var scope = this;
    function handControlBackToQueryLoop() {
      Spah.log("State Expander: Strategy for path "+path+" completed expanding, resuming expander loop");
      scope.execExpanderQueryLoop(pathIndex+1, expander, attachments, exitCallback, handControlBackToStrategyLoop);
    }

    // Exit to next step early if there's no results
    if(results.length() == 0) return handControlBackToStrategyLoop();

    var strategyCallbacks = {done: handControlBackToQueryLoop};
    
    action(results, this, attachments, strategyCallbacks);
  },


  /**
   * Spah.State#apply(query, ruleFunc) -> Spah.State
   * query (String): A SpahQL query limiting the results against which the rule will be run.
   * ruleFunc (Function): A function to be applied to all matching SpahQL results. Takes an individual QueryResult as the only argument.
   *
   * Applies the given function to all matches for the given SpahQL query, leaving this
   * instance unchanged and returning a new Spah.State instance with the changes applied.
   **/
  "apply": function(query, ruleFunc) {
    var target = this.clone();
  }
  
});