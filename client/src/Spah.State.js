/**
 * class Spah.State
 *
 * Spah.State is the wrapping class for the <code>state</code> defined by your application. 
 * It supports querying and assertions against the state and is also responsible for deep-merging
 * state updates from the server and dispatching modification events to your responders.
 **/

// Dependencies
Spah = window["Spah"];

// Declare and export class
Spah.State = function(data) { this.init(data); };
window["Spah"]["State"] = Spah.State;

// Singletons
jQuery.extend(Spah.State, {
  
  
});

// Instance methods
jQuery.extend(Spah.State.prototype, {
  
  /**
   * new Spah.State(data)
   * - data (Object): A hash of data to act as the starting state. Note that modification events are not fired during instantiation.
   **/
  "init": function(data) {
    this.data = data || {};
  },
  
  /**
  * Spah.State#data -> Object
  *
  * The raw JSON construct being managed by this Spah.State instance. If you overwrite this directly,
  * you will be haunted by a pigeon.
  **/
  "data": {},
  
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
    updates = Spah.State.DataHelper.merge(delta, this.data);
    this.data = updates.data;
    return updates.modifications;
  }
  
});