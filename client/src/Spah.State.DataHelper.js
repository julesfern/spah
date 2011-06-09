/**
 * class Spah.State.DataHelper
 *
 * This is a singleton helper dedicated to deep-merging complex JSON structures and returning both
 * the merged data and a digest of modified paths within the structure.
 **/

// Dependencies
Spah = window["Spah"];
Spah.State = window["Spah"]["State"];

// Declare and export class
Spah.State.DataHelper = function() { };
window["Spah"]["State"]["Merger"] = Spah.State.DataHelper;

// Singletons
jQuery.extend(Spah.State.DataHelper, {
  
  /**
   * Spah.State.DataHelper.merge(delta, target [, path]) -> Object mergeData
   * - delta (Object): The source object containing deltas intended to be written into the destination object.
   * - target (Object): The destination object for the updated data.
   * - path (String): A path used in recursion to collect modifications and act as a stack tracer.
   *
   * Merges the given objects and returns an object like:
   * 
   *      {
   *        data: updatedObject,
   *        modifications: modificationsKeyedByPath,
   *        modified: booleanIndicatingChangesWereMade
   *      }
   *
   * For instance:
   * 
   *      var originalState = {
   *        user_authenticated: true, 
   *        items: [{type: "Item", id: 1}, {type: "Item", id: 2}],
   *        user: {id: 9, name: "My user"}
   *      }
   *      var delta = {
   *        items: [{type: "Item", id: 1}],
   *        user: {name: "User got a new name"}
   *      }
   *      mergeResult = Spah.State.DataHelper.merge(delta, originalState);
   *      mergeResult.data; //-> The merged data: {
   *      //  user_authenticated: true, 
   *      //  items: [{type: "Item", id: 888}], // Note that arrays are REPLACED during a merge
   *      //  user: {id: 9, name: "User got a new name"} // Note hashes are MERGED during a merge
   *      //}
   *      mergeResult.modifications; //-> Modifications: {
   *      //  "/items": "~", // The "items" array was altered
   *      //  "/items[1]": "-", // The "items" array was shortened
   *      //  "/items[1]/type": "-", // The hash inside the array was deleted
   *      //  "/items[1]/id": "-",
   *      //  "/user": "~", // Value inside "/user" was modified
   *      //  "/user/name": "~" // User's name was modified
   *      //} 
   **/
  "merge": function(delta, target, path) {
    var topStack = (!path);
    var path = path || ""; // the current path stack
    var modifications = {}; // a collector for paths and their modification types
    var modified = false; // set to true if a modification occurred at this tree depth
    var mergeResult = null;
    var deltaType = this.objectType(delta);
    var targetType = this.objectType(target);
    var target = target;
    
    if(topStack) {
      Spah.log("State merge: Beginning merge of delta->target :", delta, target);
      var target = jQuery.extend({}, target);
    }
    
    
    switch(targetType) {
      case "object":
        if(deltaType == targetType) {
          // hash->hash deep merge (recurses back up to this method)
          mergeResult = this.mergeHashes(delta, target, path);
        }
        else {
          // newType -> object replacement
          mergeResult = this.replaceObject(delta, target, path);
        }
        break;
      case "array":
        if(deltaType == targetType) {
          // array->array replacement
          mergeResult = this.mergeArrays(delta, target, path);
        }
        else {
          // newType->array replacement
          mergeResult = this.replaceObject(delta, target, path);
        }
        break;
      case "null":
        //Spah.log("Overwriting null value at "+path+" with "+deltaType+":", delta);
        if(deltaType == "array") {
          mergeResult = this.createArray(delta, path);
        }
        else if(deltaType == "object") {
          mergeResult = this.createHash(delta, path);
        }
        else {
          // Simple assignment
          mergeResult = this.mergeSimple(delta, target, path);
        }
        break;
      default:
        // Simple string/number/bool modification, or nullification
        mergeResult = this.mergeSimple(delta, target, path);
        break;
    }
    
    if(mergeResult.modified) {
      modified = true;
      jQuery.extend(modifications, mergeResult.modifications);
      target = mergeResult.data;
    }
    
    if(modifications[""]) {
      delete modifications[""];
    }
    
    if(topStack) Spah.log("State merge: Completed merge, data and modifications follow :", target, modifications);
    return {"data": target, "modifications": modifications, "modified": modified};
  },
  
  "objectToPathMap": function(obj, path, mergeMap) {
    var path = path || "";
    var map = mergeMap || {};
    var k;
    
    // Register object at path
    map[(path=="")?"/":path] = obj;
    switch(this.objectType(obj)) {
      case "array":
        // Sub-items
        for(k=0; k<obj.length; k++) {
          map = this.objectToPathMap(obj[k], path+"["+k+"]", map);
        }
        break;
      case "object":
        // Subtree
        for(k in obj) {
          map = this.objectToPathMap(obj[k], path+"/"+k, map);
        }
        break;
    }
    return map;
  },
  
  "mergeArrays": function(delta, target, path) {
    var modifications = {};
    var modified = false;
    var a, arrPath;
    var arrModified = false;
    
    //Spah.log("State update: Processing array merge at "+path);
    for(a=0; a<Math.max(delta.length, target.length); a++) {
      arrPath = path+"/"+a;
      mergeResult = this.merge(delta[a], target[a], arrPath);
      
      if(a < delta.length) {
        // Modify
        if(a < target.length) {
          // inside delta length and target length - modifying
          if(mergeResult.modified) arrModified = true;
        }
        else {
          // inside delta length but outside target length - added
          arrModified = true;
        }
      }
      else {
        // inside target length but outside delta length - deleting entries from target
        arrModified = true; 
      }
      jQuery.extend(modifications, mergeResult.modifications);
    }
    if(arrModified) {
      modified = true;
      modifications[path] = modifications[path] || "~";
    }
    
    return {"data": delta, "modifications": modifications, "modified": modified};
  },
  
  "createArray": function(delta, path) {
    var modifications = {};
    var modified = true;
    var mergeResult = null;
    var i, arrPath;
    
    // Log modification at root
    modifications[path] = this.modificationSymbol(delta, null);
    // Create modifications for inner keys
    target = [];
    for(i=0; i<delta.length; i++) {
      arrPath = path+"/"+i;
      mergeResult = this.merge(delta[i], target[i], arrPath);
      jQuery.extend(modifications, mergeResult.modifications);
      target[i] = mergeResult.data;
    }
    
    return {"data": delta, "modifications": modifications, "modified": modified};
  },
  
  "nullifyArray": function(target, path) {
    var modifications = {};
    var modified = true;
    var i, arrPath;

    // Log modifications at hash root
    modifications[path] = this.modificationSymbol(null, target);
    // Log removal of each key
    for(i=0; i<target.length; i++) {
      arrPath = path+"/"+i;
      mergeResult = this.merge(null, target[i], arrPath);
      jQuery.extend(modifications, mergeResult.modifications);
    }
    return {"data": null, "modifications": modifications, "modified": modified};
  },
  
  "mergeHashes": function(delta, target, path) {
    var modifications = {};
    var modified = false;
    var k, keyList, key, sKey;
    
    keyList = [];
    for(key in delta) {
      keyList.push(key)
    }
    
    //Spah.log("State update: Beginning hash merge at path '"+path+"' with keys, delta, target:", keyList, delta, target);
    
    for(var k=0; k<keyList.length; k++) {
      sKey = keyList[k];
      mergeResult = this.merge(delta[sKey], target[sKey], path+"/"+sKey);
      jQuery.extend(modifications, mergeResult.modifications);      
      // If modified, log modification at this level
      if(mergeResult.modified) {
        modified = mergeResult.modified;
        modifications[path] =  modifications[path] || "~";
      }
      
      target[sKey] = mergeResult.data;
    }    
    return {"data": target, "modifications": modifications, "modified": modified};
  },
  
  "createHash": function(delta, path) {
    var modifications = {};
    var modified = true;
    var mergeResult = null;
    var hKey, hashPath;
    
    // Log modification at hash root
    modifications[path] = this.modificationSymbol(delta, null);
    // Create modifications for inner keys
    target = {};
    for(hKey in delta) {
      hashPath = path+"/"+hKey;
      mergeResult = this.merge(delta[hKey], target[hKey], hashPath);
      jQuery.extend(modifications, mergeResult.modifications);
    }
    
    return {"data": delta, "modifications": modifications, "modified": modified};
  },
  
  "nullifyHash": function(target, path) {
    var modifications = {};
    var modified = true;
    var hKey, hashPath;

    // Log modifications at hash root
    modifications[path] = this.modificationSymbol(null, target);
    // Log removal of each key
    for(hKey in target) {
      hashPath = path+"/"+hKey;
      mergeResult = this.merge(null, target[hKey], hashPath);
      jQuery.extend(modifications, mergeResult.modifications);
    }
    return {"data": null, "modifications": modifications, "modified": modified};
  },
  
  "replaceObject": function(delta, target, path) {
    var modifications = {};
    var modified = true;
    var mergeResult = null;
    var targetType = this.objectType(target);
    var deltaType = this.objectType(delta);
    var mSym = this.modificationSymbol(delta, target); // precompare to get symbol
    
    // Spah.log("Complex object replacement at "+path+" : "+targetType+" -> "+deltaType, delta, target);
    
    // Nullify the destination object
    if(targetType == "object") {
      mergeResult = this.nullifyHash(target, path);
    }
    else if(targetType == "array") {
      mergeResult = this.nullifyArray(target, path);
    }
    else {
      mergeResult = this.mergeSimple(delta, target, path);
    }
    jQuery.extend(modifications, mergeResult.modifications);
    
    // Stage in the replacement, overwriting the nullification modifications
    mergeResult = this.merge(delta, null, path);
    jQuery.extend(modifications, mergeResult.modifications);
    // Write change symbol back into mod hash at this path
    modifications[path] = mSym;
    
    return {"data": delta, "modifications": modifications, "modified": modified};
  },
  
  "mergeSimple": function(delta, target, path) {
    var deltaType = this.objectType(delta);
    var targetType = this.objectType(target);
    var modifications = {};
    var modified = (delta != target);
    if(modified) {
      modifications[path] = modifications[path] || this.modificationSymbol(delta, target);
      //Spah.log("State update: modification of simple type at "+path+" ("+modifications[path]+") "+target+" ("+targetType+") -> "+ delta + " ("+deltaType+")");
    }
    return {"data": delta, "modifications": modifications, "modified": modified};
  },
  
  "mergeReplace": function(delta, target, path) {
    
  },
  
  /**
   * Spah.State.DataHelper.modificationSymbol(delta, target) -> String symbol
   * 
   * Determines whether the change between two objects, assuming content inequality, is a "+" (addition), "-" (nullification) or "~" (alteration).
   **/
  "modificationSymbol": function(delta, target) {
    if(this.objectType(target) == "null") return "+";
    else if(this.objectType(delta) == "null") return "-";
    else if(delta != target) return "~";
  },
  
  /**
   * Spah.State.DataHelper.objectType(obj) -> String type
   * 
   * Extends the core typeof(obj) function by adding types "array" and "null".
   **/
  "objectType": function(obj) {
    if(obj == null || obj == undefined) return "null";
    if(typeof(obj) == "object") {
      if(jQuery.isArray(obj)) return "array";
      else return "object";
    } else {
      return typeof(obj);
    }
  },
  
  /**
   * Spah.State.DataHelper.eq(obj1, obj2[, objN]) -> Boolean equality result
   *
   * Determines content equality of two or more objects. Booleans, null values, numbers and strings are compared using 
   * the <code>Spah.State.DataHelper.objectType</code> method and the built-in <code>==</code> operator, but arrays 
   * and hashes are traversed recursively and have their values compared.
   **/
  "eq": function() {
    // Grab the types. If they're not equal, fail out early.
    var oType, oI;
    for(oI=0; oI < arguments.length; oI++) {
      var aType = this.objectType(arguments[oI]);
      if(oType && oType != aType) return false;
      oType = aType;
    }
    // All objects are same type - continue w/ comparison
    switch(oType) {
      case "array":
        return this.eqArray.apply(this, arguments);
        break;
      case "object":
        return this.eqHash.apply(this, arguments);
        break;
      default:
        return this.eqSimple.apply(this, arguments);
        break;
    }
  },
  
  "eqHash": function() {
    // Keys may be in any order but must have 1:1 mapping
    var hP, hI, hKeys;
    hP = arguments[0]; hKeys = this.hashKeys(arguments[0]);
    for(hI=1; hI<arguments.length; hI++) {
      var h = arguments[hI];
      var k = this.hashKeys(h);
      // Compare keys
      if(!this.eq(k, hKeys)) return false;
      // Compare values
      for(var iK in h) {
        if(!this.eq(h[iK], hP[iK])) return false;
      }      
      hKeys = k; hP = h;
    }
    return true;
  },
  
  "eqArray": function() {
    // Length, order and subequality must match
    var aP, aI;
    aP = arguments[0];
    for(aI=1; aI<arguments.length; aI++) {
      var a = arguments[aI];
      var iI;
      
      // Compare a and aP
      if(a.length != aP.length) return false;
      // Values
      for(iI=0; iI<a.length; iI++) {
        if(!this.eq(a[iI], aP[iI])) return false;
      }
      
      aP = a;
    }
    return true;
  },

  
  "eqSimple": function() {
    var aP, aI, aT;
    aP = arguments[0]; aT = this.objectType(arguments[0]);
    for(aI=1; aI<arguments.length; aI++) {
      var a=arguments[aI]; var t=this.objectType(a)
      if(a != aP || t != aT) return false;
      aP = a; aT = t;
    }
    return true;
  },
  
  "hashKeys": function(hash) {
    var keys = [];
    for(var k in hash) {
      keys.push(k);
    }
    return keys.sort();
  },
  
  "hashValues": function(hash) {
    var values = [];
    for(var k in hash) {
      values.push(hash[k]);
    }
    return values;
  },
  
  "mathGte": function(left, right) {
    return this.mathCompare(left, right, function(a,b) { return a >= b; });
  },
  
  "mathGt": function(left, right) {
    return this.mathCompare(left, right, function(a,b) { return a > b; });
  },
  
  "mathLte": function(left, right) {
    return this.mathCompare(left, right, function(a,b) { return a <= b; });
  },
  
  "mathLt": function(left, right) {
    return this.mathCompare(left, right, function(a,b) { return a < b; });
  },
  
  "mathCompare": function(left, right, callback) {
    var leftType = this.objectType(left);
    var rightType = this.objectType(right);
    if(leftType == rightType && (leftType == "number" || leftType == "string")) {
      return callback.apply(this, [left, right]);
    }
    return false;
  },
  
  /**
   * Spah.State.DataHelper.eqRough(left, right) -> Boolean result
   * - left (*): The value at the left-hand side of the comparator
   * - right (*): The value at the right-hand side of the comparator
   *
   * Compares two objects under the rules of rough equality. See readme for details.
   **/
  "eqRough": function(left, right) {
    var leftType = this.objectType(left);
    var rightType = this.objectType(right);
    if(leftType != rightType) {
      return false;
    }
    else {
      switch(leftType) {
        case "string":
          return this.eqStringRough(left, right);
          break;
        case "number":
          return this.eqNumberRough(left, right);
          break;
        case "array":
          return this.eqArrayRough(left, right);
          break;
        case "object":
          return this.eqHashRough(left, right);
          break;
        case "boolean":
          return this.eqBooleanRough(left, right);
          break;
        default:
          return false;
      }
    }
  },
  
  "eqStringRough": function(left, right) {
    return (left.match(new RegExp(right, "g")));
  },
  
  "eqNumberRough": function(left, right) {
    return (Math.floor(left) == Math.floor(right));
  },
  
  "eqArrayRough": function(left, right) {
    return this.jointSet(left, right);
  },
  
  "eqHashRough": function(left, right) {
    for(var k in left) {
      if(right[k] && this.eq(left[k], right[k])) return true;
    }
    return false;
  },
  
  "eqBooleanRough": function(left, right) {
    return ((left && right) || (!left && !right));
  },
  
  "eqSetStrict": function(set1, set2) {
    if(set1.length != set2.length) return false;
    var foundIndexMap = [];
    for(var i=0; i < set1.length; i++) {
      var val = set1[i];
      for(var j=0; j < set2.length; j++) {
        // Search for equality values in the second set
        var candidate = set2[j];
        if(this.eq(val, candidate) && (foundIndexMap.indexOf(j) < 0)) {
          foundIndexMap.push(j);
        }
      }
    }
    return (foundIndexMap.length == set1.length);
  },

  "eqSetRough": function(set1, set2) {
    return this.jointSetWithCallback(set1, set2, function(a,b) { return this.eqRough(a,b); });
  },
  
  "jointSet": function(set1, set2) {
    return this.jointSetWithCallback(set1, set2, function(a,b) { return this.eq(a,b); });
  },
  
  "gteSet": function(set1, set2) {
    return this.jointSetWithCallback(set1, set2, function(a,b) { return this.mathGte(a,b) });
  },
  
  "lteSet": function(set1, set2) {
    return this.jointSetWithCallback(set1, set2, function(a,b) { return this.mathLte(a,b) });
  },
  
  "gtSet": function(set1, set2) {
    return this.jointSetWithCallback(set1, set2, function(a,b) { return this.mathGt(a,b) });
  },
  
  "ltSet": function(set1, set2) {
    return this.jointSetWithCallback(set1, set2, function(a,b) { return this.mathLt(a,b) });
  },
  
  "jointSetWithCallback": function(set1, set2, callback) {
    for(var i=0; i < set2.length; i++) {
      for(j=0; j < set1.length; j++) {
        if(callback.apply(this, [set1[j], set2[i]])) return true;
      }
    }
    return false;
  },
  
  "superSet": function(superset, subset) {
    var foundIndexMap = [];
    isubset: for(var i=0; i < subset.length; i++) {
      var subVal = subset[i];
      isuperset: for(var j=0; j < superset.length; j++) {
        var superVal = superset[j];
        if((foundIndexMap.indexOf(j) == -1) && this.eq(subVal, superVal)) {
          foundIndexMap.push(j);
          break isuperset;
        }
      }
    }
    return (subset.length == foundIndexMap.length);
  }
  
});