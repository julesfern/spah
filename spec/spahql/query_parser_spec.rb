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
    lambda { Spah::SpahQL::QueryParser.read_ahead_string_literal(3, "---'foobar---") }.should raise_error
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
  
  it "Returns a correct new index and found string when reading ahead for filter queries" do
    res = Spah::SpahQL::QueryParser.read_ahead_filter_query(5, "/key1[/moo == ']']")
    res[0].should == 18
    res[1].should_not be_nil
  end
  
  it "Returns a correct new index and found string when reading ahead for selection queries" do
    res = Spah::SpahQL::QueryParser.read_ahead_selection_query(0, "/key1//key2[$/foo=='bar']/.explode[//foo == 2][//bar == 3]")
    res[0].should == 58
    res[1].should == {
      :use_root => false, 
      :path_components => [
        {:key => "key1", :property => nil, :recursive => false, :filter_queries => []},
        {:key => "key2", :property => nil, :recursive => true, :filter_queries => [
          Spah::SpahQL::QueryParser.parse_query("$/foo=='bar'")
        ]},
        {:key => nil, :property => "explode", :recursive => false, :filter_queries => [
          Spah::SpahQL::QueryParser.parse_query("//foo == 2"), 
          Spah::SpahQL::QueryParser.parse_query("//bar == 3")
        ]}
      ],
      :type => Spah::SpahQL::QueryParser::TOKEN_SELECTION_QUERY
    }
  end
  
  it "Returns a correct new index and found string when reading ahead for set literals" do
    Spah::SpahQL::QueryParser.read_ahead_set_literal(0, "{1,'2,',true}").should == [
      13, {:type => Spah::SpahQL::QueryParser::TOKEN_SET_LITERAL, :values => [1,"2,",true], :is_range => false}
    ]
    Spah::SpahQL::QueryParser.read_ahead_set_literal(2, "--{1.5,false,true}--").should == [
      18, {:type => Spah::SpahQL::QueryParser::TOKEN_SET_LITERAL, :values => [1.5,false,true], :is_range => false}
    ]
    Spah::SpahQL::QueryParser.read_ahead_set_literal(2, "--{'a'..'d'}--").should == [
      12, {:type => Spah::SpahQL::QueryParser::TOKEN_SET_LITERAL, :values => ['a','d'], :is_range => true}
    ]
    
    # Errors
    lambda { Spah::SpahQL::QueryParser.read_ahead_set_literal(0, "{'a'..'d',2}--") }.should raise_error
    lambda { Spah::SpahQL::QueryParser.read_ahead_set_literal(0, "{'b','a'..'d'}--") }.should raise_error
  end
  
  
  it "Returns the correct structure when parsing full queries" do
    q = Spah::SpahQL::QueryParser.parse_query("/foo//bar/.property/baz[$//bar]");
    q.primary_token.should == {
      :use_root => false,
      :path_components => [
        {:key => "foo", :property => nil, :recursive => false, :filter_queries => []},
        {:key => "bar", :property => nil, :recursive => true, :filter_queries => []},
        {:key => nil, :property => "property", :recursive => false, :filter_queries => []},
        {:key => "baz", :property => nil, :recursive => false, :filter_queries => [Spah::SpahQL::QueryParser.parse_query("$//bar")]}
      ],
      :type => Spah::SpahQL::QueryParser::TOKEN_SELECTION_QUERY
    }
    
    q.comparison_operator.should be_nil
    q.secondary_token.should be_nil
    q.assertion.should be_false
  end
  
  it "Parses a flat root query" do
    q = Spah::SpahQL::QueryParser.parse_query("/");
    q.primary_token.should == {
      :use_root => false,
      :path_components => [
        {:key => nil, :property => nil, :recursive => false, :filter_queries => []}
      ],
      :type => Spah::SpahQL::QueryParser::TOKEN_SELECTION_QUERY
    }
  end
end