#!/usr/bin/env node

/*
	(Introduction) Spah - Example Express application
	=================================================

	This script is intended to be a heavily-commented example of Spah used in anger to drive a miniature webapp.
	It requires no database connection - instead, mock data is retrieved by the app from a local JSON file.

	We're going to implement a basic tool for browsing Spah's source code and documentation in a nice
	single-page fashion.

	Depends on the following node modules:
	- express
	- spah (for sanity's sake, the "edge" development version of Spah is required)
*/

/*
	(Chapter 1) Basic application boilerplate
	=========================================
*/

// Load Express. You don't need Express to use Spah, 
// but since Express gives us an extremely brief
// syntax for simple HTTP communication I'm going to
// use it for this example app so as to better focus
// on showing how to use Spah.
var express = require('express');
// Load Spah. We'll load the non-minified version
// so this example will use the bleeding-edge code.
var spah = require(__dirname+"/../src/_Spah-edge");
// We're writing a documentation tool, so we want to load 
// all the documentation from the docs folder.


/*
	(Chapter 2) Configure Spah
	==========================
*/

// Configuring Spah is fairly simple. We're just going 
// to establish some defaults for the view state.
//
// I've put the default configuration for our app inline,
// but you're free to stash it it elsewhere - in a JSON
// file somewhere in your file system, in Mongo, whatever.
//
// What we're doing here is creating an instance of StateServer,
// which the app is going to use to vend new states to clients
// and to handle merging state updates from clients.
var stateDefaults = {
	"document": "index.html"
};
var stateServer = new spah.stateServer();

// Now, since we're dealing with model objects, and we'll
// be shunting models down to the client as part of the state,
// we're going to configure the state expander here.
// 
// In brief, Spah provides both a state reducer and a state
// expander. The reducer lives on the client, and the
// expander lives on the server. Since each request made
// by the Spah client has the current UI state attached to it,
// if we sent up the entire view state including all model
// attributes on each request then we'd be badly impacting
// performance. Plus, you're likely going to have pages that
// need to pull in a variety of model types, and that controller
// code can get very messy if we're not careful.
//
// As a solution, the Spah client can be told precisely how to
// reduce models to the bare essentials needed to identify them
// (usually just type and ID), and the Spah server can be told
// how to expand a reduced model. This gives you the ability to
// add security checks to the state expander to ensure that
// your user hasn't simply snuck in a request for an object
// they're not permitted to view. Typically, the state expander
// is only needed when the view needs to be cold-rendered as HTML.
//
// Here we'll tell the state server how to flesh out a page model.
// This means creating a rule for the expander to follow, giving it
// a pattern to match and a function which can be used to expand the
// model.
//
// The first argument, the pattern to match, is a SpahQL query to match
// collapsed objects.
//
// The second argument, the expander function, contains the code
// for retrieving the model and ensuring that the user has 
// permissions to access it. It gets called once with the entire set
// of results matched by the first argument, allowing you to 
// flesh out a batch of models in one go if your data model permits it.
//
// Expansion is asynchronous. At the end of your expander function, 
// call the "done" function.
stateServer.addExpander(
	// The filter query. Match everything with type='page'
	{path: "//type == 'page'"}, 
	// The expander callback. Comes with a promise, the set of
	// results returned by the filter query, and the request
	// and response objects.
	function(results, root, attachments, strategy) {
		// do work
		resultSet[0].update(Page.find(1)); // update the state in-place
		return strategy.done();
	}
);

// The final step is to set up the templates for our app.
// We'll create a Blueprint, which can be modified by applying
// the user's UI state and then returned as static HTML for
// cold requests.
// 
// There's nothing stopping you from creating multiple blueprints
// but I'd recommend you make each blueprint compatible with the
// same state schema otherwise you might as well be writing two
// apps.
//
// You can stash your templates anywhere you like - for this example
// we'll pull them from the file system. A synchronous read is fine
// as we're only doing this once, on startup.

var fs = require('fs');
// Grab the layout
var appHTML = fs.readSync(__dirname+"/views/layouts/application.html");
// Grab the templates

// Now lets create a blueprint, with the default modifiers.
//
// Modifiers are scripts that can run against your markup
// in response to changes in the state. This is the Spah
// server's main mechanism for rendering markup for cold 
// requests, and the Spah client's mechanism for updating
// the UI when it receives updated state from the server.
//
// See the README for more detail on the built-in modifiers
// and for guidance on creating your own.
var appBlueprint = spah.dom.bluePrint.compile();

// Create a responder for Spah requests. This can be used
// to discern between cold and warm requests:
//
// **warm** requests simply pack down the state as JSON
// **cold** requests expand the state and apply it to the 
// blueprint before shipping the raw HTML down the wire.

/*
	(Chapter 3) Specify our application's actions
	=============================================
*/

var app = express.createServer();

app.get("/", function(request, response) {
	// Get the inbound state from the user
	var clientState = request.params("state");
	// Ask the state server to give us a new state
	// taking the existing user state and restoring
	// any values that have changed from the default.
	var state = stateServer.stateWith(clientState);
	state.updateWith(stateServer.defaults());
		// above takes a state and applies the defaults to it
		// also:
		// stateServer.stateWith(clientState).updateWith(modifications)
	// Pass the response off to the state server.
	stateServer.respond(request, response, appBlueprint, state);
});

app.get("/search", function(request, response) {
	stateServer.instruct("")
});