/**
 * class Spah.State < Spah.SpahQL
 *
 * Spah.State is the wrapping class for the <code>state</code> defined by your application. 
 * It supports querying and assertions against the state and is also responsible for deep-merging
 * state updates from the server and dispatching modification events to your responders.
 **/

Spah.classExtend("Spah.State", Spah.SpahQL, {

}, {
  
  /**
   * new Spah.State(data[, reducers[, expanders]])
   * - data (Object): A hash of data to act as the starting state. Note that modification events are not fired during instantiation.
   * - reducers (Array): An array of rules to be applied when this state is reduced.
   * - expanders (Array): An array of rules to be applied when this state is expanded.
   **/
  "init": function(data, reducers, expanders) {
    this.path = "/"; 
    this.value = data || {};
    this.sourceData = this.value;
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
  
});