/**
 * class Spah.State.Query
 *
 * A <code>Query</code> instance is the result of running a string state query such as "/foo/bar/baz == 1" through the <code>Spah.State.QueryParser</code>. 
 * Queries are parsed only once, upon registration. The QueryParser maintains a cache of pre-existing parsed queries keyed by the original query string.
 **/
 
 // Define and export
 Spah.State.Query = function() {};
 window["Spah"]["State"]["Query"] = Spah.State.Query;
 
 // Singletons
 jQuery.extend(Spah.State.Query, {
   
 });
 
 // Instance
 jQuery.extend(Spah.State.Query.prototype, {
   
   /**
    * Spah.State.Query#rawString -> String original representation
    * 
    * The string from which this query was originally parsed.
    **/
   "rawString": null,
   
   /**
    * Spah.State.Query#fragments -> Array of parsed query fragments
    *
    * The fragments into which this query was parsed. When the query is executed, 
    * each fragment is executed in turn on the data returned by the last. If any fragment
    * returns false or an empty resultset, the query is terminated and the failure result
    * returned.
    **/
   "fragments": [],
   
   /**
    * Spah.State.Query#isTruthy() -> Boolean isTruthy
    *
    * Responds with <code>true</code> if this query is a comparison query that should return <code>true</code> or <code>false</code>
    * instead of a resultset.
    **/
   "booleanQuery": function() {
     
   }
   
 });