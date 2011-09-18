/**
 * class Spah.DOM.Blueprint < Spah.DOM.Document
 *
 * A "blueprint" is a server-side representation of your application's layout. Blueprints are used during Spah's 
 * cold-rendering cycle, when a user is requesting a page via a regular non-ajax HTTP request.
 * 
 * The blueprint is *compiled* from a source HTML file, and a list of mustache template files that should be injected
 * into the blueprint. At any time you may have the blueprint render the correct output for any given UI state.
 **/

Spah.classExtend("Spah.DOM.Blueprint", Spah.DOM.Document, {
  
  // SINGLETONS
  
  /**
   * Spah.DOM.Blueprint.compile(docPath, templatePathMask, callback) -> void
   * - docPath (String): The path to the HTML prototype document that will be prepared.
   * - templatePathMask (String, Array): A path mask or array of path masks from which Mustache template files will be read.
   * - callback (Function): The function to call once the document has been compiled. Receives two arguments (error, blueprintInstance).
   *
   * (Server-side only) Creates a new HTML5 blueprint document to work with. Parses the file specified in the <code>docPath</code> argument
   * into a JSDOM environment, and then reads all Mustache files within the templatePathMask into the blueprint,
   * inserting them into script tags at the bottom of the document body.
   *
   * GOTCHA: If your markup is not valid (for instance, opening a tag that expects to be closed, then never closing it)
   * you run the risk of leaving unanswered callbacks from jsdom, which can result in a node process that does not exit
   * properly.
   * 
   **/
  "compile": function(htmlPath, templateBasePath, templatePathMask, callback) {
    var glob = require('glob');
    var fs = require('fs');
    var jsdom = require('jsdom');
    
    
    // Prepare the event chain
    var html, extractedDocType;
    var readBlueprintFile = function() {
      fs.readFile(htmlPath, function(fsHTTMLErr, fsHTMLData) {
        if(fsHTTMLErr) return callback(fsHTTMLErr);
        
        // Get file content
        var bufferContent = fsHTMLData.toString("utf-8");
        Spah.log("Loaded raw markup from "+htmlPath, "\n\r---------\n\r"+bufferContent+"\n\r---------\n\r");
        html = bufferContent;

        // Also extract docType for later rendering
        var docTypeRegexp = /<!DOCTYPE [^>]*>/m;
        var docTypeMatch = html.match(docTypeRegexp);
        if(docTypeMatch && (html.indexOf("<!DOCTYPE") < html.indexOf("<html"))) {
          // There is a doctype declared before the opening tag
          extractedDocType = docTypeMatch[0];
        }

        readTemplateGlob();
      });
    };
    
    var templateGlobMasks = (typeof templatePathMask == "string")? [templatePathMask] : templatePathMask;
    var templateGlobIndex = 0;
    var templatePaths = [];
    var readTemplateGlob = function() {
      // Exit if we're at the end of the queue
      if(templateGlobIndex >= templateGlobMasks.length) {
        Spah.log("Done finding template files.");
        return readTemplateFiles();
      }
      
      // Glob this queue item and move the queue forwards
      Spah.log("Finding files in base path '"+templateBasePath+"' matching masks: ", templateGlobMasks);
      var mask = templateBasePath+templateGlobMasks[templateGlobIndex];
      glob.glob(mask, function(globErr, globList) {
        templateGlobIndex++;
        if(globErr) return callback(globErr);
        templatePaths = templatePaths.concat(globList);
        readTemplateGlob();
      });
    }
    
    var templateMap = {};
    var templatePathIndex = 0;
    var readTemplateFiles = function() {
      // Exit if done with list
      if(templatePathIndex >= templatePaths.length) {
        Spah.log("Done loading templates.");
        return createWindowContext();
      }
      
      // Read this file and then move on to the next one
      var templatePath = templatePaths[templatePathIndex];
      Spah.log("Loading template", templatePath);
      fs.readFile(templatePath, function(templateErr, templateData) {
        templatePathIndex++;
        if(templateErr) return callback(templateErr);
        templateMap[templatePath.replace(templateBasePath, "")] = templateData.toString("utf-8");
        readTemplateFiles();
      });
    };
    
    var contextWindow;
    var jQueryPath = './lib/jquery-1.6.2.min.js';
    var createWindowContext = function() {
      Spah.log("Loading blueprint markup and template payload into DOM context...");
      jsdom.env(html, [jQueryPath], function(jsdomErr, jsdomWindow) {
        if(jsdomErr) return callback(jsdomErr);
        contextWindow = jsdomWindow;
        prepareDocument();
      })
    };
    
    var prepareDocument = function() {
      Spah.log("Preparing document...");
      
      // Extract jQ context
      var $ = contextWindow.jQuery;
      
      // Remove injected jQuery tag
      Spah.log("Stripping jsdom jquery injection...");
      $("script[src='"+jQueryPath+"']").remove();
      
      // Inject templates
      for(var t in templateMap) {
        Spah.log("Injecting template "+t+"...");
        $("body").append('<script type="text/mustache" id="'+t+'">'+templateMap[t]+'</script>');
      }
            
      Spah.log("Done. Instantiating new Blueprint and triggering callback.");
      return callback(null, new Spah.DOM.Blueprint($, contextWindow, extractedDocType));
    }
    
    // Spring into action
    Spah.log("Beginning blueprint compilation");
    return readBlueprintFile();
  }
  
}, {
  
  // INSTANCE METHODS
  
  /**
   * Spah.DOM.Blueprint#render(state, callback) -> void
   * -> state (Spah.SpahQL.QueryResult): The state object that will be used to render the document's markup
   * -> callback (Function): A callback function that will receive (err, markup) as arguments, where 'markup' is the full generated markup to be rendered on the client.
   *
   * Renders markup for the given state
   **/
  "render": function(state, callback) {
    this.run(state, function(doc) {
      callback(null, doc.toString())
    });
  },

  /**
   * Spah.DOM.Blueprint#toString() -> String
   *
   * Returns a string representation of the document's current markup.
   **/
  "toString": function() {
    return this.docType+this.window.document.innerHTML;
  }
  
});