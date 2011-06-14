describe Spah::SpahQL::Token::SelectionQuery do
  
  it "Returns a correct new index and found string when reading ahead for selection queries" do
    
    tests = {
     [0, "/key1//key2[$/foo=='bar']/.explode[//foo == 2][//bar == 3]"]  => [58, {
       :use_root => false, 
       :path_components => [
         Spah::SpahQL::Token::PathComponent.parse_at(0, "/key1"),
         Spah::SpahQL::Token::PathComponent.parse_at(5, "//key2[$/foo=='bar']"),
         Spah::SpahQL::Token::PathComponent.parse_at(25, "/.explode[//foo == 2][//bar == 3]")
       ]
     }]
    }
    
    tests.each_pair do |key, value|
      index, query = Spah::SpahQL::Token::SelectionQuery.parse_at(*key)
      index.should == value[0]
      
    end
    
    
  end
  
end