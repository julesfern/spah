/**
 * class Spah.DOM.Modifiers
 *
 * A module containing the default Spah document modifiers.
 **/
Spah.classCreate("Spah.DOM.Modifiers", {


	/**
	 * class Spah.DOM.Modifiers.Defaults.Show
	 *
	 * Handles showing/hiding elements using jQuery's show() and hide() methods.
	 **/
	"Show": {
		
		"actionName": function(element) {
			return "show";
		},
		"up": function(element) {
			element.show();
		},
		"down": function(element) {
			element.hide();
		}

	},

	"ClassName": {
		
		"actionName": function(element) {
			return "class";
		},
		"up": function(element, flags) {
			element.addClass(flags);
		},
		"down": function(element, flags) {
			element.removeClass(flags);
		}

	},

	"ElementId": {

		"actionName": function(element) {
			return "id";
		},
		"up": function(element, flags, state, $) {
			$("#"+flags).attr("id", null);
			element.attr("data-id-old", element.attr("id"));
			element.attr("id", flags);
		},
		"down": function(element, flags, state, $) {
			element.attr("id", element.attr("data-id-old"));
		}
		
	},

	"Stash": {

		"actionName": function(element) {
			return "show";
		},
		"up": function(element) {
			element.attr("data-stashed-content", element.html());
			element.html("");
		},
		"down": function(element) {
			element.html(element.attr("data-stashed-content"));
		}
		
	},

	"Populate": {

		"actionName": function(element) {
			return "show";
		},
		"up": function(element) {
			element.show();
		},
		"down": function(element) {
			element.hide();
		},
    "added": function(document) {
      
    },
    "removed": function(document) {
      
    }
		
	}

});