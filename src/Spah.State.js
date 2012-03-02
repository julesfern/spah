/**
 * class Spah.State < Spah.SpahQL.QueryResult
 *
 * Spah.State is the wrapping class for the <code>state</code> defined by your application. 
 * It supports querying and assertions against the state and is also responsible for deep-merging
 * state updates from the server and dispatching modification events to your responders.
 **/

Spah.classExtend("Spah.State", Spah.SpahQL.QueryResult, {

}, {
  
  /**
   * new Spah.State(data[, reducers, expanders])
   * - data (Object): A hash of data to act as the starting state. Note that modification events are not fired during instantiation.
   * - reducers (Array<Object>): An array of rules to be applied when this state is reduced.
   * - expanders (Array<Object>): An array of rules to be applied when this state is expanded.
   **/
  "init": function(data, reducers, expanders) {
    this.path = "/"; 
    this.value = data || {};
    this.sourceData = this.value;

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
   * Spah.State#reduce() -> Spah.State
   * 
   * Creates a clone of this state instance and applies all reducer strategies specified with #addReducer
   * to the clone. Returns the reduced clone. See #addReducer for details of reducer strategies.
   *
   * This method will be called by the Spah Client any time the state is about to be sent up the
   * wire to the Spah Server.
   **/
  "reduce": function() {
    var target = this.clone();

    for(var r in this.reducers) {
      var reducer = this.reducers[r];
      target.applyReducer(reducer);
    }

    return target;
  },

  /**
   * Spah.State#addReducer(reducer) -> Spah.State
   * reducer (Object): A hash containing the reducer properties. Should contain keys ("path" or "paths") and ("keep" or "remove").
   *
   * Adds a new reducer strategy to this state. Reducer strategies are used to shrink the state so that
   * only the necessary data is sent up the wire to the Spah Server.
   *
   * Whenever the Spah Client makes a request to the Spah Server, a reduced version of the state is sent
   * along with the request, allowing the server to make decisions based on the current UI state. You should
   * specify how the state is reduced by using this method to add reducer strategies.
   *
   * A reducer is a hash made up of one or more paths that you want to reduce, and a set of keys
   * that you either want removed from those paths or a set of keys that should be kept while all
   * other keys are removed. All the queries involved are selection queries, not assertions. 
   * 
   * Here's some examples:
   *
   *    // Remove /tweets from the root
   *    {"path": "/", "remove": "/tweets"}
   *
   *    // Remove anything that contains a key "type" with value "tweet"
   *    {"path": "/", "remove": "//*[/type=='tweet']"} 
   *
   *    // Find everything with type=tweet and reduce it to only the "id" and "type" keys
   *    {"path": "//*[/type=='tweet']", "keep": ["/id", "/type"]} 
   *
   *    // Keep only the first item in the arrays at /mentions and /direct_messages
   *    {"paths": ["/mentions", "/direct_messages"], "keep": "/0"}
   *
   *    // Keep only entries that are tweets any entry containing a tweet at any level
   *    {"paths": "//*", "keep": "/*[/type=='tweet']"}
   *
   * The mechanism uses the basic SpahQL helpers - a set of results to reduce is selected based on the
   * "path" or "paths" key, and then if the reducer specifies a "keep" key, all entries *except* those matching
   * one or more of the "keep" queries are destroyed. If the reducer specifies a "remove" key, all entries matching
   * one or more of the "remove" queries are destroyed.
   *
   * Call state.reduce() to run your reducers. Reducers are run in the order in which you added them.
   * 
   * The "keep" and "remove" keys are mutually exclusive, and using both in the same reducer
   * will throw an error. If for some reason you specify both "path" and "paths", "paths" will
   * take priority and "path" will be ignored.
   *
   * This method returns this state instance so that you may chain addReducer calls.
   **/
  "addReducer": function(reducer) {
      var commonisedReducer = (reducer._commonised)? reducer : this.commoniseReducer(reducer);
      Spah.log("Attaching reducer to Spah.State instance: ", this, commonisedReducer);
      this.reducers.push(commonisedReducer);
      return this;
  },

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
              Spah.log("EXEMPT "+explodedResult.path+" as it contains "+mr.path);
              exemptPaths.push(explodedResult.path);
            }
          })
        }
      });

      explodedPathResults.each(function() {
        if(exemptPaths.indexOf(this.path) < 0) {
          Spah.log("DELETE "+this.path+" as not exempted");
          this.delete();
        }
      })

 
    }
  },

  /**
   * Spah.State#expand(callback) -> Spah.State
   *
   * Expands only if the found path is in the /_reduced list.
   **/
  "expand": function(callback) {
    var target = this.clone();
  },

  "addExpander": function(expander) {

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