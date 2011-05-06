$(document).ready(function() {
  
  module("Spah.State.Merger");
  
  test("Correctly determines object types", function() {
    equal("string", Spah.State.Merger.objectType(""), "String type");
    equal("number", Spah.State.Merger.objectType(0), "Number type");
    equal("boolean", Spah.State.Merger.objectType(false), "Bool type");
    equal("object", Spah.State.Merger.objectType({}), "Hash type");
    equal("array", Spah.State.Merger.objectType([]), "Array type");
    equal("null", Spah.State.Merger.objectType(null), "Null type");
  })
  
  test("Merges arrays correctly", function() {
    mergeResult = Spah.State.Merger.merge(Fixtures.State.Arrays.delta, Fixtures.State.Arrays.target);
    updates = mergeResult.modifications; data = mergeResult.data;
    expectedState = Fixtures.State.Arrays.expected;
    
    // Manually assert everything about the updated data
    expectedModifications = {
      "/": "~",
      "/modify": "~",
      "/modify[2]": "~",
      "/modify[3]": "+",
      "/lengthen": "~",
      "/lengthen[0]": "+",
      "/lengthen[1]": "+",
      "/lengthen[2]": "+",
      "/shorten": "~",
      "/shorten[1]": "-",
      "/shorten[2]": "-",
      "/shorten[3]": "-",
      "/nullify": "-",
      "/nullify[0]": "-"
    }
    
    // Assert identical keys, values and counts
    var expectedCount = 0;
    for(expectedKey in expectedModifications) {
      equal(updates[expectedKey], expectedModifications[expectedKey], expectedKey+" matched update type");
      expectedCount++;
    }
    var actualCount = 0;
    for(countKey in updates) {
      actualCount++;
    }
    equal(actualCount, expectedCount, "Updates had correct key count");
    
    // Assert expected state equal to resulting state
    var hKey, hArr, hArrI;
    for(hKey in expectedState) {
      hArr = expectedState[hKey];
      if(hKey != "nullify") {
        // Equal lengths
        equal(hArr.length, data[hKey].length, hKey+" key has correct length");
        for(hArrI=0; hArrI<hArr.length; hArrI++) {
          equal(hArr[hArrI], data[hKey][hArrI], hKey+" key matches expected: "+hArr[hArrI]);
        } 
      }
      else {
        equal(null, hArr, "nullify key has null value");
      }
    }
  });
  
  test("Merges hashes correctly", function() {
    mergeResult = Spah.State.Merger.merge(Fixtures.State.Hashes.delta, Fixtures.State.Hashes.target);
    updates = mergeResult.modifications; data = mergeResult.data;
    expectedState = Fixtures.State.Hashes.expected;
    
    // Manually assert everything about the updated data
    expectedModifications = {
      "/": "~",
      "/modify": "~",
      "/modify/original": "~",
      "/lengthen": "~",
      "/lengthen/added": "+",
      "/shorten": "~",
      "/shorten/bar": "-",
      "/nullify": "-",
      "/nullify/foo": "-",
      "/nullify/bar": "-"
    }
    
    // Assert identical keys, values and counts
    var expectedCount = 0;
    for(expectedKey in expectedModifications) {
      equal(updates[expectedKey], expectedModifications[expectedKey], expectedKey+" matched update type");
      expectedCount++;
    }
    var actualCount = 0;
    for(countKey in updates) {
      actualCount++;
    }
    equal(actualCount, expectedCount, "Updates had correct key count");
    
    // Assert actual data content
    var rootKey, innerHash, innerKey, rootCount, innerCount, expectedInnerCount;
    rootCount = 0;
    for(rootKey in expectedState) {
      innerHash = expectedState[rootKey];
      innerCount = 0; expectedInnerCount = 0;
      if(rootKey == "nullify") {
        equal(null, innerHash, "nullified hash is nullified");
      } 
      else {
        for(innerKey in innerHash) {
          innerCount++;
          equal(innerHash[innerKey], data[rootKey][innerKey], "keys at /"+rootKey+"/"+innerKey+" match");
        }
        for(innerKey in data[rootKey]) {
          expectedInnerCount++;
        }
        equal(innerCount, expectedInnerCount, "Inner hashes at "+rootKey+" have same length");
      }
      
      rootCount++;
    }
  });
  
  test("Merges base object types correctly", function() {
    mergeResult = Spah.State.Merger.merge(Fixtures.State.BaseTypes.delta, Fixtures.State.BaseTypes.target);
    updates = mergeResult.modifications; data = mergeResult.data;
    expectedState = Fixtures.State.BaseTypes.expected;
    
    // Manually assert everything about the updated data
    expectedModifications = {
      "/": "~",
      "/modifyStr": "~",
      "/modifyBool": "~",
      "/modifyNum": "~",
      "/nullify": "-"
    }
    
    // Assert identical keys, values and counts
    var expectedCount = 0;
    for(expectedKey in expectedModifications) {
      equal(updates[expectedKey], expectedModifications[expectedKey], expectedKey+" matched update type");
      expectedCount++;
    }
    var actualCount = 0;
    for(countKey in updates) {
      actualCount++;
    }
    equal(actualCount, expectedCount, "Updates had correct key count");
    
    // Assert expected content
    var hKey;
    var actualCount = 0;
    var expectedCount = 0;
    for(hKey in expectedState) {
      equals(expectedState[hKey], data[hKey], "value at /"+hKey+" matches");
      actualCount++;
    }
    for(hKey in data) {
      expectedCount++;
    }
    equals(actualCount, expectedCount, "Equal object counts");
  });
  
  test("Merges the complex fixture correctly", function() {
    mergeResult = Spah.State.Merger.merge(Fixtures.State.Complex.delta, Fixtures.State.Complex.target);
    updates = mergeResult.modifications; data = mergeResult.data;
    
    // Manually assert everything about the updated data
    expectedModifications = {
      "/": "~",
      "/modify": "~",
      "/modify/nullify": "-",
      "/modify/str": "~",
      "/modify/array_modify": "~",
      "/modify/array_modify[3]": "~",
      "/modify/array_modify[5]": "-",
      "/modify/array_modify[6]": "+",
      "/modify/array_shorten": "~",
      "/modify/array_shorten[5]": "-",
      "/modify/bool": "~",
      "/modify/obj_modify": "~",
      "/modify/obj_modify/foo": "~",
      "/modify/created": "+",
      "/created": "+",
      "/created/created_inner": "+"
    }
    
    // Assert identical keys, values and counts
    var expectedCount = 0;
    for(expectedKey in expectedModifications) {
      equal(updates[expectedKey], expectedModifications[expectedKey], expectedKey+" matched update type");
      expectedCount++;
    }
    var actualCount = 0;
    for(countKey in updates) {
      actualCount++;
    }
    equal(actualCount, expectedCount, "Updates had correct key count")
  })
  
})