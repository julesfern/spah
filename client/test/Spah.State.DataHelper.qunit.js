$(document).ready(function() {
  
  module("Spah.State.DataHelper");
  
  test("Correctly determines object types", function() {
    equal("string", Spah.State.DataHelper.objectType(""), "String type");
    equal("number", Spah.State.DataHelper.objectType(0), "Number type");
    equal("boolean", Spah.State.DataHelper.objectType(false), "Bool type");
    equal("object", Spah.State.DataHelper.objectType({}), "Hash type");
    equal("array", Spah.State.DataHelper.objectType([]), "Array type");
    equal("null", Spah.State.DataHelper.objectType(null), "Null type");
  })
  
  test("Determines simple object equality", function() {
    ok(Spah.State.DataHelper.eq(0,0,0), "Compares integers eq")
    ok(!Spah.State.DataHelper.eq(1,0,0), "Fails integers diff")
    ok(!Spah.State.DataHelper.eq(0,0,false), "Fails integer crosstype")
    
    ok(Spah.State.DataHelper.eq("a","a","a"), "Compares strings eq")
    ok(!Spah.State.DataHelper.eq("a", "b"), "Fails strings diff")
    ok(!Spah.State.DataHelper.eq("a","a","a", 2), "Fails strings crosstype")
    
    ok(Spah.State.DataHelper.eq(true,true,true,true), "Compares bools eq")
    ok(!Spah.State.DataHelper.eq(false, undefined), "Fails bools diff")
    ok(!Spah.State.DataHelper.eq(false, null), "Fails bools diff")
    ok(!Spah.State.DataHelper.eq("true",true), "Fails bools crosstype")
  });
  
  test("Determines array equality", function() {
    ok(Spah.State.DataHelper.eq([0,"1", false], [0,"1", false]), "Compares arrays eq")
    ok(!Spah.State.DataHelper.eq([0,"1", false], [0,"1"]), "Fails arrays diff lengths")
    ok(!Spah.State.DataHelper.eq([0,"1", false], [2,"1", false]), "Fails arrays diff")
  })
  
  test("Determines hash equality", function() {
    ok(Spah.State.DataHelper.eq({foo: "bar", bar: "baz"}, {foo: "bar", bar: "baz"}), "Compares hashes eq")
    ok(!Spah.State.DataHelper.eq({foo: "bar", bar: "baz"}, {foo: "bar", bar: "different"}), "Fails hashes diff root content")
    ok(!Spah.State.DataHelper.eq({foo: "bar", bar: "baz"}, {foo: "bar", barDifferent: "baz"}), "Fails hashes diff root keys")
    ok(!Spah.State.DataHelper.eq({foo: "bar", arr: [0,1,2]}, {foo: "bar", arr: [1,2,3]}), "Fails hashes diff inner content")
    ok(!Spah.State.DataHelper.eq({foo: "bar", arr: [0,1,2]}, {foo: "bar", arr: null}), "Fails hashes diff inner content types")
  })
  
  test("Merges arrays correctly", function() {
    var mergeResult = Spah.State.DataHelper.merge(Fixtures.State.Arrays.delta, Fixtures.State.Arrays.target);
    var updates = mergeResult.modifications; data = mergeResult.data;
    var expectedState = Fixtures.State.Arrays.expected;
    
    // Manually assert everything about the updated data
    var expectedModifications = {
      "/modify": "~",
      "/modify/2": "~",
      "/modify/3": "+",
      "/lengthen": "~",
      "/lengthen/0": "+",
      "/lengthen/1": "+",
      "/lengthen/2": "+",
      "/shorten": "~",
      "/shorten/1": "-",
      "/shorten/2": "-",
      "/shorten/3": "-",
      "/nullify": "-",
      "/nullify/0": "-"
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
      var hArr = expectedState[hKey];
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
    var mergeResult = Spah.State.DataHelper.merge(Fixtures.State.Hashes.delta, Fixtures.State.Hashes.target);
    var updates = mergeResult.modifications; data = mergeResult.data;
    var expectedState = Fixtures.State.Hashes.expected;
    
    // Manually assert everything about the updated data
    var expectedModifications = {
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
    var rootCount = 0;
    for(rootKey in expectedState) {
      var innerHash = expectedState[rootKey];
      var innerCount = 0; expectedInnerCount = 0;
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
    var mergeResult = Spah.State.DataHelper.merge(Fixtures.State.BaseTypes.delta, Fixtures.State.BaseTypes.target);
    var updates = mergeResult.modifications; data = mergeResult.data;
    var expectedState = Fixtures.State.BaseTypes.expected;
    
    // Manually assert everything about the updated data
    var expectedModifications = {
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
    var mergeResult = Spah.State.DataHelper.merge(Fixtures.State.Complex.delta, Fixtures.State.Complex.target);
    var updates = mergeResult.modifications; data = mergeResult.data;
    
    // Manually assert everything about the updated data
    var expectedModifications = {
      "/modify": "~",
      "/modify/nullify": "-",
      "/modify/str": "~",
      "/modify/array_modify": "~",
      "/modify/array_modify/3": "~",
      "/modify/array_modify/5": "-",
      "/modify/array_modify/6": "+",
      "/modify/array_shorten": "~",
      "/modify/array_shorten/5": "-",
      "/modify/bool": "~",
      "/modify/obj_modify": "~",
      "/modify/obj_modify/foo": "~",
      "/modify/created": "+",
      "/modify/array_replace_with_object": "~",
      "/modify/array_replace_with_object/0": "-",
      "/modify/array_replace_with_object/1": "-",
      "/modify/array_replace_with_object/foo": "+",
      "/modify/object_replace_with_array": "~",
      "/modify/object_replace_with_array/foo": "-",
      "/modify/object_replace_with_array/0": "+",
      "/modify/object_replace_with_array/1": "+",
      "/modify/remove_hash_in_array": "~",
      "/modify/remove_hash_in_array/2": "-",
      "/modify/remove_hash_in_array/2/foo": "-",
      "/created": "+",
      "/created/created_str": "+",
      "/created/created_arr": "+",
      "/created/created_arr/0": "+",
      "/created/created_obj": "+",
      "/created/created_obj/foo": "+",
    }
    
    // Assert identical keys, values and counts
    var expectedCount = 0;
    var expectedKey, countKey;
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