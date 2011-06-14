describe Spah::SpahQL::Token::FilterQuery do
  
  it "Returns a correct new index and found string when reading ahead for filter queries" do
    
    tests = {
      [5, "/key1[/moo == ']']"] => [18, Spah::SpahQL::QueryParser.parse_query("/moo == ']'")]
    }
    
    tests.each_pair do |key, value| 
      index, query = Spah::SpahQL::Token::FilterQuery.parse_at(*key)
      index.should == value[0]
      query.value.should == value[1]
    end
    
  end
  
end