/**
 * class Spah.DOM.Actions
 *
 * A collection of built-in modifier scripts to be applied during state deltas.
 **/


/**
 * class Spah.DOM.Actions.Show
 *
 * Handles showing/hiding elements using jQuery's show() and hide() methods.
 **/
Spah.classCreate("Spah.DOM.Actions", {

	"Show": {
		
    /**
     * Spah.DOM.Actions.Show.actionName(element) -> String
     *
     * The action name for this modifier is always "show"
     **/
		"actionName": function(element) {
			return "show";
		},
    /**
     * Spah.DOM.Actions.Show.up(element) -> void
     *
     * Shows the element using jQuery(element).show();
     **/
		"up": function(element) {
			element.show();
		},
    /**
     * Spah.DOM.Actions.Show.down(element) -> void
     *
     * Hides the element using jQuery(element).hide();
     **/
		"down": function(element) {
			element.hide();
		}

	},

  /**
   * class Spah.DOM.Actions.ClassName
   *
   * Handles adding/removing class names from elements.
   **/
	"ClassName": {
		
    /**
     * Spah.DOM.Actions.ClassName.actionName(element) -> String
     *
     * The action name for this modifier is always "class"
     **/
		"actionName": function(element) {
			return "class";
		},
    /**
     * Spah.DOM.Actions.ClassName.up(element, flags) -> void
     * 
     * Adds the flags as a single class using jQuery(element).addClass(flags)
     **/
		"up": function(element, flags) {
			element.addClass(flags);
		},
    /**
     * Spah.DOM.Actions.ClassName.down(element, flags) -> void
     *
     * Removes the flags as a single class using jQuery(element).removeClass(flags)
     **/
		"down": function(element, flags) {
			element.removeClass(flags);
		}

	},

  /**
   * class Spah.DOM.Actions.ElementId
   *
   * Handles applying and removing element IDs.
   **/
	"ElementId": {

    /**
     * Spah.DOM.Actions.ElementId.actionName(element) -> String
     *
     * The action name is always "id" for this modifier.
     **/
		"actionName": function(element) {
			return "id";
		},
    /**
     * Spah.DOM.Actions.ElementId.up(element, flags) -> void
     *
     * Removes the id specified by the flags from any existing elements that have it, 
     * applies the id specified by the flags to this element, and stashes the element's
     * old id in the data-id-old attribute so that the modification may be reversed later.
     **/
		"up": function(element, flags, state, $) {
			$("#"+flags).removeAttr("id");
			element.attr("data-id-old", element.attr("id"));
			element.attr("id", flags);
		},
    /**
     * Spah.DOM.Actions.ElementId.down(element, flags) -> void
     *
     * Re-applies the previously stashed ID to this element, if it had one. 
     * Otherwise the id is removed.
     **/
		"down": function(element, flags, state, $) {
			element.attr("id", element.attr("data-id-old"));
		}
		
	},

	"Stash": {

		"actionName": function(element) {
			return "stash";
		},
		"up": function(element) {
			element.attr("data-stashed-content", element.html());
			element.html("");
		},
		"down": function(element) {
			if(element.attr("data-stashed-content")) {
        element.html(element.attr("data-stashed-content"));
        element.removeAttr("data-stashed-content");
      }
		}
		
	},

	"Populate": {
    
		"actionName": function(element) {
			return "populate";
		},
		"up": function(element, flags, state, $) {

      var e = element,
          f = flags,
          s = state,
          j = $;
			var doPopulate = function() {
        
      }
      // Register change listener on client
      if(Spah.inBrowser() || flags=="live") {
        
      }
		},
		"down": function(element, flags, state, $) {
			
		},
    "added": function(document) {
      var popMod = this;

      /**
       * Spah.DOM.Document#addTemplate(name, body, type) -> void
       * name (String): A unique name for this template
       * body (String): The template itself
       * type (String): The rendering engine that should be used to render this template. Underscore, Mustache and Handlebars templates are all supported. The default type is "Mustache" - pass "Handlebars" if you want to use Handlebars for rendering this template.
       *
       * This method is only present if the "Populate" modifier is registered on the document
       * (this is enabled by default.)
       *
       * Adds a template to the document, ready to be used by the Populate modifier when rendering
       * templated content.
       **/
      document.addTemplate = function(name, tmp, type) {
        // Add the template node to the end of the document body
        this.jQ("body").append(
          this.jQ("<script></script>").attr({
            "type": popMod.TemplateEngines[type]["mimeType"], 
            "id": "template-"+name
          }).html(tmp)
        );
      };
      /**
       * Spah.DOM.Document#removeTemplate(name) -> void
       * name (String): The unique name of the template to be removed
       *
       * This method is only present if the "Populate" modifier is registered on the document
       * (this is enabled by default.)
       *
       * Removes a template previously added with #addTemplate.
       **/
      document.removeTemplate = function(name) {
        this.jQ("script#template-"+name).remove();
      };
    },
    "removed": function(document) {
      delete document.addTemplate;
      delete document.removeTemplate;
    },

    "TemplateEngines": {
      "mustache": {
        "mimeType": "text/mustache"
      },
      "underscore": {
        "mimeType": "text/underscore"
      }  
    }
    
	}

});