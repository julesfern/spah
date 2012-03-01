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
   * new Spah.State(data)
   * - data (Object): A hash of data to act as the starting state. Note that modification events are not fired during instantiation.
   **/
  "init": function(data) {
    this.path = "/"; 
    this.value = data || {};
    this.sourceData = this.value;
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
    
  }
  
});