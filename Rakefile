LIB_NAME = "Spah"
LIB_GITHUB_URL = "http://github.com/danski/spah"
LIB_HOMEPAGE_URL = LIB_GITHUB_URL
LIB_LICENSE_TYPE = "MIT"
LIB_DESCRIPTION_SHORT = "Short description"
LIB_DESCRIPTION_LONG = "Looooooong deeessssscriiiiiptioooonnnnnnn"
LIB_AUTHORS = ["Dan Glegg"]
LIB_AUTHOR_EMAIL = "dan@angryamoeba.co.uk"
LIB_VERSION = File.open(File.join(File.dirname(__FILE__), "VERSION")).read

require 'rubygems'
require 'bundler'
begin
  Bundler.setup(:default, :development)
rescue Bundler::BundlerError => e
  $stderr.puts e.message
  $stderr.puts "Run `bundle install` to install missing gems"
  exit e.status_code
end
require 'rake'

task :docs do
  puts "Generating client docs using PDOC"
  Rake::Task["client:docs"].invoke
end

namespace :client do
  desc "Build the javascript application from source. N.B. Google Closure must be in your environment path."
  task :build, :compiler do |t, args|
    puts "Building"
  end
  
  desc "Runs lint against the client's javascript source. Defaults to the Google Closure linter."
  task :lint, :linter do |t, args|
    
  end  
  
  desc "Run the client-side javascript tests"
  task :test, :environment, :needs=>:build do |t, args|
    puts "testing"
  end
      
  task :docs do
    Rake::Task["client:docs:generate"].invoke
  end
  namespace :docs do
    task :generate do
      require 'PDoc'
      require 'json'
      require 'maruku'
      
      input_dir = File.join(File.dirname(__FILE__), "src")
      output_dir = File.join(File.dirname(__FILE__), "doc-html")
      puts "Generating documents #{input_dir} => #{output_dir}..."
    
      #if(Dir.exist?(output_dir))
      #  puts "Purging existing doc folder"
      #  Dir.rmdir
      #end
      #Dir.mkdir(output_dir)
      
      PDoc.run({
          :source_files => Dir.glob(File.join(input_dir, "**", "/*.js")),
          :index_page=>File.join(File.dirname(__FILE__), "readme.mdown"),
          :destination => output_dir,
          :syntax_highlighter => :pygments,
          :markdown_parser => :maruku,
          :src_code_href => proc { |model|
            "#{LIB_GITHUB_URL}/blob/master/#{model.file.gsub(File.dirname(__FILE__)+"/", "")}##{model.line_number}"
          },
          :pretty_urls => false,
          :bust_cache => true,
          :name => LIB_NAME,
          :short_name => 'Spah',
          :home_url => LIB_HOMEPAGE_URL,
          :doc_url => LIB_HOMEPAGE_URL,
          :version => LIB_VERSION,
          :copyright_notice => 'This work is copyright (c) 2011 Angry amoeba ltd, and is released under an MIT license.' 
        })
    end
  end
end