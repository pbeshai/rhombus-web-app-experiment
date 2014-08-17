module.exports = {
	init: init
};

var fs = require('fs'),
	_ = require('lodash'),
	logger = require("../../../../../../log/logger"),
	util = require("../../../../../../framework/server/api/util"),
	recognitionResults = require("../../RecognitionSegments/server/api").recognitionResults;

function init(site, initConfig) {
		site.post("/api/apps/RecognitionSegmentsWarmup/log", recognitionResults);
}