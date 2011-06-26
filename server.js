#!/usr/bin/env node

var express = require('express');

// Spah development server - delivers static files only
var app = express.createServer();
app.use(express.static(__dirname));
app.listen(3000);