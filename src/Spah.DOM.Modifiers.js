Spah.classCreate("Spah.DOM.Modifiers", {

	/**
	 * class Spah.DOM.Modifiers.Show
	 *
	 * Handles showing/hiding elements using jQuery's show() and hide() methods.
	 **/
	"Show": {
		
    /**
     * Spah.DOM.Modifiers.Show.actionName(element) -> String
     *
     * The action name for this modifier is always "show"
     **/
		"actionName": function(element) {
			return "show";
		},
    /**
     * Spah.DOM.Modifiers.Show.up(element) -> void
     *
     * Shows the element using jQuery(element).show();
     **/
		"up": function(element) {
			element.show();
		},
    /**
     * Spah.DOM.Modifiers.Show.down(element) -> void
     *
     * Hides the element using jQuery(element).hide();
     **/
		"down": function(element) {
			element.hide();
		}

	},

  /**
   * class Spah.DOM.Modifiers.ClassName
   *
   * Handles adding/removing class names from elements.
   **/
	"ClassName": {
		
    /**
     * Spah.DOM.Modifiers.ClassName.actionName(element) -> String
     *
     * The action name for this modifier is always "class"
     **/
		"actionName": function(element) {
			return "class";
		},
    /**
     * Spah.DOM.Modifiers.ClassName.up(element, flags)
     *
     * Adds the flags as a single class using jQuery(element).addClass(flags)
     **/
		"up": function(element, flags) {
			element.addClass(flags);
		},
    /**
     * Spah.DOM.Modifiers.ClassName.down(element, flags)
     *
     * Removes the flags as a single class using jQuery(element).removeClass(flags)
     **/
		"down": function(element, flags) {
			element.removeClass(flags);
		}

	},

  /**
   * class Spah.DOM.Modifiers.ElementId
   *
   * Handles applying and removing element IDs.
   **/
	"ElementId": {

    /**
     * Spah.DOM.Modifiers.ElementId.actionName(element) -> String
     *
     * The action name is always "id" for this modifier.
     **/
		"actionName": function(element) {
			return "id";
		},
    /**
     * Spah.DOM.Modifiers.ElementId.up(element, flags)
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
     * Spah.DOM.Modifiers.ElementId.down(element, flags)
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
		"up": function(element) {
			function doPopulate() {
        
      }
      // Register change listener on client
		},
		"down": function(element) {
			
		},
    "added": function(document) {
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
       * templated content. E
       **/
      document.addTemplate = function(name, tmp, type) {
        
      }
    },
    "removed": function(document) {
      delete document.addTemplate;
      delete document.removeTemplate;
    },

    "Mustache": {
      "mimeType": "text/mustache"
    },
    "Handlebars": {
      "mimeType": "text/handlebars"
    }
		
	}

});