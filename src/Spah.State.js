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
   * Spah.State#update(delta) -> Object hash of path modifications
   * - delta (Object): a hash to be deep-merged into the existing data construct. Deep merging always occurs at the root of the existing state.
   *
   * Deep-merges a hash of state changes into the current state:
   *
   *      myState.data //-> {foo: {chicken: "bkawk", cow: "mooo", cat: "meow"}}
   *      myState.update({
   *        foo: {
   *          chicken: "hello i am a chicken nice to meet you", 
   *          owl: "hoot",
   *          cat: null,
   *        }
   *      })
   *      //-> {"/foo": "~", "/foo/chicken": "~", "/foo/owl": "+", "/foo/cat": "-"}
   *
   * During the merge hashes are merged, while strings, arrays and booleans are replaced if re-specified in the delta.
   **/
  "update": function(delta) {
    updates = Spah.SpahQL.DataHelper.merge(delta, this.value);
    this.value = updates.data;
    return updates.modifications;
  }
  
});