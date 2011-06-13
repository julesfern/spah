describe Spah::SpahQL::QueryParser do
  it "Returns a correct new index and found string when reading ahead for string literals" do
    # Double quotes
    Spah::SpahQL::QueryParser.read_ahead_string_literal(0, '"foo", bar').should == [5,"foo"]
    Spah::SpahQL::QueryParser.read_ahead_string_literal(0, '"foo"').should == [5, "foo"]
    Spah::SpahQL::QueryParser.read_ahead_string_literal(3, '---"foobar"---').should == [11,"foobar"]
    Spah::SpahQL::QueryParser.read_ahead_string_literal(3, '---"foobar"---').should == [11,"foobar"]
    Spah::SpahQL::QueryParser.read_ahead_string_literal(3, '---"foo\\"bar"').should == [13,'foo"bar']
    
    # Single quotes
    Spah::SpahQL::QueryParser.read_ahead_string_literal(0, "'foo', bar").should == [5,"foo"]
    Spah::SpahQL::QueryParser.read_ahead_string_literal(0, "'foo'").should == [5,"foo"]
    Spah::SpahQL::QueryParser.read_ahead_string_literal(3, "---'foobar'---").should == [11,"foobar"]
    Spah::SpahQL::QueryParser.read_ahead_string_literal(3, "---'foobar'---").should == [11,"foobar"]
    Spah::SpahQL::QueryParser.read_ahead_string_literal(3, "---'foo\\\'bar'-").should == [13,"foo'bar"]
    
    # No quotes
    Spah::SpahQL::QueryParser.read_ahead_string_literal(0, "foo, bar").should be_nil
    
    # Errors
    begin
      Spah::SpahQL::QueryParser.read_ahead_string_literal(3, "---'foobar---")
      [].should == "exception wasn't raised"
    rescue
    end
  end
  
  it "Returns a correct new index and found string when reading ahead for numeric literals" do
    # Ints
    Spah::SpahQL::QueryParser.read_ahead_numeric_literal(0, '7, bar').should == [1,7]
    Spah::SpahQL::QueryParser.read_ahead_numeric_literal(0, '7').should == [1,7]
    Spah::SpahQL::QueryParser.read_ahead_numeric_literal(6, 'foo,  -7, foo').should == [8,-7]
      
    # Floats
    Spah::SpahQL::QueryParser.read_ahead_numeric_literal(0, '3.21, bar').should == [4,3.21]
    Spah::SpahQL::QueryParser.read_ahead_numeric_literal(0, '1.5').should == [3,1.5]
    Spah::SpahQL::QueryParser.read_ahead_numeric_literal(6, 'foo,  -7.5, foo').should == [10,-7.5]
    
    # Not found
    Spah::SpahQL::QueryParser.read_ahead_numeric_literal(0, 'true').should be_nil    
  end
  
  
  it "Returns a correct new index and found string when reading ahead for boolean literals" do
    Spah::SpahQL::QueryParser.read_ahead_boolean_literal(12, '{3, "true", true}').should == [16,true]
    Spah::SpahQL::QueryParser.read_ahead_boolean_literal(12, '{3, "true", false}').should == [17,false]
    Spah::SpahQL::QueryParser.read_ahead_boolean_literal(12, '{3, "true", "false"}').should be_nil
  end
  
  it "Returns a correct new index and found string when reading ahead for path components" do
    Spah::SpahQL::QueryParser.read_ahead_path_component(0, "/key1").should == [5, {:key => "key1", :property => nil, :recursive => false, :filter_queries => []}]
    Spah::SpahQL::QueryParser.read_ahead_path_component(5, "/key1//key2").should == [11, {:key => "key2", :property => nil, :recursive => true, :filter_queries => []}]
    Spah::SpahQL::QueryParser.read_ahead_path_component(5, "/key1//.size").should == [12, {:key => nil, :property => "size", :recursive => true, :filter_queries => []}]
    
    path_comp = Spah::SpahQL::QueryParser.read_ahead_path_component(5, "/key1//foo[/a == /b][/foo == 3]")
    path_comp[0].should == 31
    path_comp[1][:key].should == "foo"
    path_comp[1][:property].should be_nil
    path_comp[1][:recursive].should be_true
    path_comp[1][:filter_queries].length.should == 2
  end
  it "Returns a correct new index and found string when reading ahead for filter queries"
  it "Returns a correct new index and found string when reading ahead for set literals"
  it "Returns a correct new index and found string when reading ahead for selection queries"
  it "Returns the correct structure when parsing full queries"
  it "Parses a flat root query"
end