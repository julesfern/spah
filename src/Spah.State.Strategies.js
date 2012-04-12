/**
 * class Spah.State.Strategies
 *
 * A package of pre-made SpahQL Strategiser actions provided for convience.
 **/
Spah.classCreate("Spah.State.Strategies", {
	
	/**
   * Spah.State.Strategies.remover(pathOrArrayOfPaths[,path2][,pathN]) -> Function
   *
   * Generates a SpahQL Strategy action which will remove all sub-paths matching those
   * passed to this method from all paths handled by the strategy.
   **/
  "remover": function(arr) {
  	var queries = (typeof(arr)=="string")? arguments : arr;
  	return function(results, root, attachments, strategy) {
  		for(var i=0; i<queries.length; i++) {
  			var query = queries[i];
  			results.select(query).deleteAll();
  		}
  		strategy.done();
  	};
  },

  /**
   * Spah.State.Strategies.keeper(pathOrArrayOfPaths[,path2][,pathN]) -> Function
   *
   * Generates a SpahQL Strategy action which will completely clear all paths handled
   * by the strategy, excluding any sub-paths (or their containing paths) matched by the paths
   * handed to this method.
   **/
  "keeper": function(arr) {
  	var queries = (typeof(arr)=="string")? arguments : arr;
  	return function(results, root, attachments, strategy) {
  		// Explode the matches into all keys
  		var explodedTargets = results.select("//*");
  		// Set up a collector for sets matched by the given queries
  		var queryResultSets = [];

  		// Get all the matches for each query
  		// and stash the retrieved sets on the collector
  		for(var i=0; i<queries.length; i++) {
  			var query = queries[i];
  			queryResultSets.push(results.select(query));
  		}

  		// We've now got a full tree for this path scope and a full tree of matched results
      // Any result in the full exploded tree that doesn't appear in, or contain something 
      // appearing in, the matcher results, should be deleted.

      var exemptPaths = [];

      // Iterate over the entire tree matched by the strategy
      explodedTargets.each(function() {
        var explodedResult = this;

        for(var qrs in queryResultSets) {
        	// For each set of results matched by this keeper...
          var rs = queryResultSets[qrs];
          rs.each(function() {
          	// Inspect the matching results and determine if it should be kept
            var mr = this;
            // Is this matcher result contained in the exploded results?
            if(explodedResult.containing(mr).length > 0) {
              exemptPaths.push(explodedResult.path());
            }
          })
        }
      });

      explodedTargets.each(function() {
        if(exemptPaths.indexOf(this.path()) < 0) {
          this.delete();
        }
      });

  		strategy.done();
  	};
  },

});