/**
 * class Spah.State.Merger
 *
 * This is a singleton helper dedicated to deep-merging complex JSON structures and returning both
 * the merged data and a digest of modified paths within the structure.
 **/

// Dependencies
Spah = window["Spah"];
Spah.State = window["Spah"]["State"];

// Declare and export class
Spah.State.Merger = function() { };
window["Spah"]["State"]["Merger"] = Spah.State.Merger;

// Singletons
jQuery.extend(Spah.State.Merger, {
  
  /**
   * Spah.State.Merger.merge(src, dest [, path]) -> Object mergeData
   * - src (Object): The source object containing deltas intended to be written into the destination object.
   * - dest (Object): The destination object for the updated data.
   * - path (String): A path used in recursion to collect modifications and act as a stack tracer.
   *
   * Merges the given objects and returns an object like:
   * 
   *      {
   *        data: updatedObject,
   *        modifications: modificationsKeyedByPath,
   *        modified: booleanIndicatingChangesWereMade
   *      }
   **/
  "merge": function(src, dest, path) {
    var path = path || ""; // the current path stack
    var modifications = {}; // a collector for paths and their modification types
    var modified = false; // set to true if a modification occurred at this tree depth
    var mergeResult = null;
    var srcType = this.objectType(src);
    var destType = this.objectType(dest);
    
    switch(destType) {
      case "object":
        if(srcType == destType) {
          // hash->hash deep merge (recurses back up to this method)
          mergeResult = this.mergeHashes(src, dest, path);
        }
        else {
          // newType -> object replacement
          mergeResult = this.replaceObject(src, dest, path);
        }
        break;
      case "array":
        if(srcType == destType) {
          // array->array replacement
          mergeResult = this.mergeArrays(src, dest, path);
        }
        else {
          // newType->array replacement
          mergeResult = this.replaceObject(src, dest, path);
        }
        break;
      case "null":
        Spah.log("Overwriting null value at "+path+" with "+srcType+":", src);
        if(srcType == "array") {
          mergeResult = this.createArray(src, path);
        }
        else if(srcType == "object") {
          mergeResult = this.createHash(src, path);
        }
        else {
          // Simple assignment
          mergeResult = this.mergeSimple(src, dest, path);
        }
        break;
      default:
        // Simple string/number/bool modification, or nullification
        mergeResult = this.mergeSimple(src, dest, path);
        break;
    }
    
    if(mergeResult.modified) {
      modified = true;
      modifications = jQuery.extend(mergeResult.modifications, modifications);
      dest = mergeResult.data;
    }
    
    if(modifications[""]) {
      modifications["/"] = modifications[""];
      delete modifications[""];
    }
    return {"data": dest, "modifications": modifications, "modified": modified};
  },
  
  "mergeArrays": function(src, dest, path) {
    var modifications = {};
    var modified = false;
    var a, arrPath;
    var arrModified = false;
    
    Spah.log("State update: Processing array merge at "+path);
    for(a=0; a<Math.max(src.length, dest.length); a++) {
      arrPath = path+"["+a+"]";
      if(a < src.length) {
        // Modify
        if(a < dest.length) {
          // inside src length and dest length - modifying
          mergeResult = this.mergeSimple(src[a], dest[a], arrPath);
          if(mergeResult.modified) {
            Spah.log("Modification detected in array at "+arrPath);
            arrModified = true;
            modifications = jQuery.extend(mergeResult.modifications, modifications);
          }
        }
        else {
          // inside src length but outside dest length - added
          arrModified = true;
          o = {}; o[arrPath] = "+";
          modifications = jQuery.extend(o, modifications);
        }
      }
      else {
        // inside dest length but outside src length - deleting entries from dest
        arrModified = true;
        o = {}; o[arrPath] = "-";
        modifications = jQuery.extend(o, modifications);
      }
    }
    if(arrModified) {
      modified = true;
      o = {}; o[path] = "~";
      modifications = jQuery.extend(o, modifications);
    }
    
    return {"data": src, "modifications": modifications, "modified": modified};
  },
  
  "createArray": function(src, path) {
    var modifications = {};
    var modified = true;
    var mergeResult = null;
    var i, arrPath;
    
    // Log modification at root
    modifications[path] = this.modificationSymbol(src, null);
    // Create modifications for inner keys
    dest = [];
    for(i=0; i<src.length; i++) {
      arrPath = path+"["+i+"]";
      mergeResult = this.merge(src[i], dest[i], arrPath);
      modifications = jQuery.extend(mergeResult.modifications, modifications);
      dest[i] = mergeResult.data;
    }
    
    return {"data": src, "modifications": modifications, "modified": modified};
  },
  
  "nullifyArray": function(dest, path) {
    var modifications = {};
    var modified = true;
    var i, arrPath;

    // Log modifications at hash root
    modifications[path] = this.modificationSymbol(null, dest);
    // Log removal of each key
    for(i=0; i<dest.length; i++) {
      arrPath = path+"["+i+"]";
      mergeResult = this.merge(null, dest[i], arrPath);
      modifications = jQuery.extend(mergeResult.modifications, modifications);
    }
    return {"data": null, "modifications": modifications, "modified": modified};
  },
  
  "mergeHashes": function(src, dest, path) {
    var modifications = {};
    var modified = false;
    var k, keyList, key, sKey;
    
    keyList = [];
    for(key in src) {
      keyList.push(key)
    }
    
    Spah.log("State update: Beginning hash merge at path '"+path+"' with keys, src, dest:", keyList, src, dest);
    
    for(var k=0; k<keyList.length; k++) {
      sKey = keyList[k];
      mergeResult = this.merge(src[sKey], dest[sKey], path+"/"+sKey);
      modifications = jQuery.extend(mergeResult.modifications, modifications);      
      // If modified, log modification at this level
      if(mergeResult.modified) {
        modified = mergeResult.modified;
        o = {}; o[path] = "~";
        modifications = jQuery.extend(o, modifications);
      }
      
      dest[sKey] = mergeResult.data;
    }    
    return {"data": dest, "modifications": modifications, "modified": modified};
  },
  
  "createHash": function(src, path) {
    var modifications = {};
    var modified = true;
    var mergeResult = null;
    var hKey, hashPath;
    
    // Log modification at hash root
    modifications[path] = this.modificationSymbol(src, null);
    // Create modifications for inner keys
    dest = {};
    for(hKey in src) {
      hashPath = path+"/"+hKey;
      mergeResult = this.merge(src[hKey], dest[hKey], hashPath);
      modifications = jQuery.extend(mergeResult.modifications, modifications);
    }
    
    return {"data": src, "modifications": modifications, "modified": modified};
  },
  
  "nullifyHash": function(dest, path) {
    var modifications = {};
    var modified = true;
    var hKey, hashPath;

    // Log modifications at hash root
    modifications[path] = this.modificationSymbol(null, dest);
    // Log removal of each key
    for(hKey in dest) {
      hashPath = path+"/"+hKey;
      mergeResult = this.merge(null, dest[hKey], hashPath);
      modifications = jQuery.extend(mergeResult.modifications, modifications);
    }
    return {"data": null, "modifications": modifications, "modified": modified};
  },
  
  "replaceObject": function(src, dest, path) {
    var modifications = {};
    var modified = true;
    var mergeResult = null;
    var destType = this.objectType(dest);
    
    // Nullify the destination object
    if(destType == "object") {
      mergeResult = this.nullifyHash(dest, path);
    }
    else if(destType == "array") {
      mergeResult = this.nullifyArray(dest, path);
    }
    else {
      mergeResult = this.mergeSimple(src, dest, path);
    }
    modifications = jQuery.extend(mergeResult.modifications, modifications);
    
    // Stage in the replacement, overwriting the nullification modifications
    mergeResult = this.merge(src, null, path);
    modifications = jQuery.extend(modifications, mergeResult.modifications);
    
    return {"data": src, "modifications": modifications, "modified": modified};
  },
  
  "mergeSimple": function(src, dest, path) {
    var srcType = this.objectType(src);
    var destType = this.objectType(dest);
    var modifications = {};
    var modified = (src != dest);
    if(modified) {
      modifications[path] = modifications[path] || this.modificationSymbol(src, dest);
      Spah.log("State update: modification of simple type at "+path+" ("+modifications[path]+") "+dest+" ("+destType+") -> "+ src + " ("+srcType+")");
    }
    return {"data": src, "modifications": modifications, "modified": modified};
  },
  
  "mergeReplace": function(src, dest, path) {
    
  },
  
  /**
   * Spah.State.Merger.modificationSymbol(src, dest) -> String symbol
   * 
   * Determines whether the change between two objects, assuming content inequality, is a "+" (addition), "-" (nullification) or "~" (alteration).
   **/
  "modificationSymbol": function(src, dest) {
    if(this.objectType(dest) == "null") return "+";
    else if(this.objectType(src) == "null") return "-";
    else if(src != dest) return "~";
  },
  
  /**
   * Spah.State.Merger.objectType(obj) -> String type
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
  }
  
});