$(document).ready(function() {
  
  var data;
  
  module("Spah.SpahQL.QueryResult", {
    setup: function() {
      data = {foo: {foo: "bar"}, booltest: {yes: true, no: false}};
    }
  });
  
  test("Retrieves the parent path", function() {
    var res;
    res = new Spah.SpahQL.QueryResult("/", 0);
    equal(res.parentPath(), null);
    res = new Spah.SpahQL.QueryResult("/foo/bar/.baz", 0);
    equal(res.parentPath(), "/foo/bar");
  });
  
  test("Retrieves the parent", function() {
    var set = Spah.SpahQL.select("/foo/foo", data);
    deepEqual(set.first().parent(), Spah.SpahQL.select("/foo", data).first());
  });
  
  test("Allows sub-selections", function() {
    deepEqual(Spah.SpahQL.select("/foo", data).first().select("/foo"), Spah.SpahQL.select("/foo/foo", data));
  });
  
  test("Allows sub-assertions", function() {
    ok(Spah.SpahQL.assert("/booltest/yes", data));
    ok(!Spah.SpahQL.assert("/booltest/no", data));
    ok(Spah.SpahQL.select("/booltest", data).first().assert("/yes"));
    ok(!Spah.SpahQL.select("/booltest", data).first().assert("/no"));
  });
  
});