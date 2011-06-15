describe Spah::SpahQL::Token::PathComponent do
  
  it "Returns a correct new index and found string when reading ahead for path components" do
    tests = {
      [0, "/key1"] => [5, {:key => Spah::SpahQL::Token::KeyName.new("key1"), :property => nil, :recursive => false, :filter_queries => []}],
      [5, "/key1//key2"] => [11, {:key => Spah::SpahQL::Token::KeyName.new("key2"), :property => nil, :recursive => true, :filter_queries => []}],
      [5, "/key1//.size"] => [12, {:key => nil, :property => Spah::SpahQL::Token::KeyName.new("size"), :recursive => true, :filter_queries => []}],
      [5, "/key1//foo[/a == /b][/foo == 3]"] => [31, {:key => Spah::SpahQL::Token::KeyName.new("foo"), :property => nil, :recursive => true, :filter_queries => [
        Spah::SpahQL::Token::FilterQuery.new(Spah::SpahQL::QueryParser.parse_query("/a == /b")),
        Spah::SpahQL::Token::FilterQuery.new(Spah::SpahQL::QueryParser.parse_query("/foo == 3")),
      ]}]
    }
    
    tests.each_pair do |key, value|
      index, component = Spah::SpahQL::Token::PathComponent.parse_at(*key)
      index.should == value[0]
      
      value[1].each_pair do |method, response|
        component.send(method).should == response
      end
    end
  end
  
end