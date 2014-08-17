module.exports = {
	init: init
};

var fs = require('fs'),
	_ = require('lodash'),
	logger = require("../../../../../../log/logger"),
	util = require("../../../../../../framework/server/api/util");

function init(site, initConfig) {
	site.post("/api/apps/warmup/log", warmupResults);
}

function warmupResults(req, res) {
	var flags = req.body.flags;

	if (flags && flags.trial !== undefined && flags.trial !== false) {
		console.log("Trial ", flags.trial);
	} else {
		console.log("Not trial");
	}

	res.send(200);
}