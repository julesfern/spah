describe Spah::SpahQL::Token::String do
  
  it "Returns a correct new index and found string when reading ahead for string literals" do
    # Double quotes
    tests = {
      # Format [index, query] => [resumeindex, token_value]
      
      # Dbl quotes
      [0,'"foo", bar'] => [5,"foo"],
      [0,'"foo"'] => [5,"foo"],
      [3, '---"foobar"---'] => [11,"foobar"],
      [3, '---"foo\\"bar"'] => [13,'foo"bar'],
      
      # Single quotes
      [0, "'foo', bar"] => [5,"foo"],
      [0, "'foo'"] => [5,"foo"],
      [3, "---'foobar'---"] => [11,"foobar"],
      [3, "---'foo\\\'bar'-"] => [13,"foo'bar"]
    }
    
    tests.each_pair do |key, value|
      res = Spah::SpahQL::Token::String.parse_at(*key)
      res[0].should == value[0]
      res[1].value.should == value[1]
    end
        
    # No quotes
    Spah::SpahQL::Token::String.parse_at(0, "foo, bar").should be_nil
    
    # Errors
    lambda { Spah::SpahQL::Token::String.parse_at(3, "---'foobar---") }.should raise_error
  end
  
end