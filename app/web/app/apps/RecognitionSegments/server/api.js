module.exports = {
	init: init,
	recognitionResults: recognitionResults
};

var fs = require('fs'),
	_ = require('lodash'),
	logger = require("../../../../../../log/logger"),
	util = require("../../../../../../framework/server/api/util");

function init(site, initConfig) {
	site.post("/api/apps/RecognitionSegments/log", recognitionResults);
}


function recognitionResults(req, res, onset) {
	var now = new Date();
	var config = req.body.config;
	var version = req.body.version;

	var flags = req.body.flags;
	var warmup = flags && flags.warmup;
	var appId;

	if (onset !== true) {
		appId = warmup ? "RecognitionSegmentsWarmup" : "RecognitionSegments";
	} else {
		appId = warmup ? "RecognitionOnsetSegmentsWarmup" : "RecognitionOnsetSegments";
	}
	var stream;
	var trialOutputs = req.body.trialOutputs;

	if (!fs.existsSync("log/" + appId)) {
		fs.mkdirSync("log/" + appId); // ensure the directory exists
	}
	if (!fs.existsSync("log/" + appId + "/trials")) {
		fs.mkdirSync("log/" + appId + "/trials"); // ensure the directory exists
	}

	if (flags && flags.trial !== undefined && flags.trial !== false) {

		stream = fs.createWriteStream("log/" +appId + "/trials/trial_results." + util.filenameFormat(now) + ".csv");
		stream.once('open', function(fd) {
			function output (str) {
				logger.info(str);
				stream.write(str + "\n");
			}
			output(appId + " Intermediate Trial Results (v" + version + ")");
			output(now.toString());
			output("");

			var header = "Block,Trial,UserCorrect,DistractorCorrect,UserSpeed,DistractorSpeed,DistractorRow,DistractorCol,DistractorOuter,DistractorCorner,UserChoice,DistractorChoice,UserGuess,DistractorGuess,TotalTime,Start,UserRevealTime,DistractorRevealTime,RecognizeUserStart,UserFeedbackShown,RecognizeDistractorStart,RecognizeDistractorEnd"
			output(header);
			if (trialOutputs) {
				var prevTrials = trialOutputs.previous || [];

				_.each(prevTrials.concat(trialOutputs.current), function (results) {
					output(serializeResults(trialOutputs.block, results));
				});
			}
			stream.end();

			res.send(200);
		});
	} else {
		stream = fs.createWriteStream("log/" + appId + "/results." + util.filenameFormat(now) + ".csv");
		stream.once('open', function(fd) {
			function output (str) {
				logger.info(str);
				stream.write(str + "\n");
			}
			output(appId + " Results (v" + version + ")");
			output(now.toString());
			output("");


			var header = "Block,Trial,UserCorrect,DistractorCorrect,UserSpeed,DistractorSpeed,DistractorRow,DistractorCol,DistractorOuter,DistractorCorner,UserChoice,DistractorChoice,UserGuess,DistractorGuess,TotalTime,Start,UserRevealTime,DistractorRevealTime,RecognizeUserStart,UserFeedbackShown,RecognizeDistractorStart,RecognizeDistractorEnd"

			// output slow, medium, fast
			if (warmup) {
				output(header);
				outputBlock("warmup");
			} else {
				summaryStats();

				output(header);
				outputBlock("slow");
				outputBlock("medium");
				outputBlock("fast");
			}
			function summaryStats() {
        /*         TotalTime Acorrect  Bcorrect  Ccorrect  Dcorrect  Ecorrect
				ADisCorrect BDisCorrec  CDisCorrect DDisCorrect EDiscCorrect  UserCorrect
				DisCorrect  DSlowDisCorrect DMedDisCorrect  DFastDisCorrect
				*/

				var blocks = {
					slow: blockStats("slow"),
					medium: blockStats("medium"),
					fast: blockStats("fast")
				};

				var stats = {
					userCorrect: blockSum("userCorrect"),
					disCorrect: blockSum("disCorrect"),
					dSlowDisCorrect: blockSum("dSlowDisCorrect"),
					dMedDisCorrect: blockSum("dMedDisCorrect"),
					dFastDisCorrect: blockSum("dFastDisCorrect"),
					disOuterCorrect: blockSum("disOuterCorrect"),
					disInnerCorrect: blockSum("disInnerCorrect"),
					aCorrect: blockSum("aCorrect"),
					bCorrect: blockSum("bCorrect"),
					cCorrect: blockSum("cCorrect"),
					dCorrect: blockSum("dCorrect"),
					eCorrect: blockSum("eCorrect"),
					aDisCorrect: blockSum("aDisCorrect"),
					bDisCorrect: blockSum("bDisCorrect"),
					cDisCorrect: blockSum("cDisCorrect"),
					dDisCorrect: blockSum("dDisCorrect"),
					eDisCorrect: blockSum("eDisCorrect"),
					trials: blockSum("trials"),
					avgTimeTotal: 0,
				};

				stats.avgTimeTotal = (blocks.slow.avgTimeTotal * blocks.slow.trials + blocks.medium.avgTimeTotal * blocks.medium.trials + blocks.fast.avgTimeTotal * blocks.fast.trials) / stats.trials;

				function blockSum(stat) {
					return blocks.slow[stat] + blocks.medium[stat] + blocks.fast[stat];
				}

				// output stats
				var keys = _.keys(stats), slowKeys = _.keys(blocks.slow), mediumKeys = _.keys(blocks.medium), fastKeys = _.keys(blocks.fast);
				var slowKeyHeaders = _.map(slowKeys, function (key) { return "slow_" + key; });
				var mediumKeyHeaders = _.map(mediumKeys, function (key) { return "med_" + key; });
				var fastKeyHeaders = _.map(fastKeys, function (key) { return "fast_" + key; });
				output(keys.join(",") + "," + slowKeyHeaders.join(",") + "," + mediumKeyHeaders.join(",") + "," + fastKeyHeaders.join(","));
				// do this explicitly to ensure same order as _.keys (instead of using _.values since I'm not sure)
				var values = _.map(keys, function (key) { return stats[key]; });
				var slowValues = _.map(slowKeys, function (key) { return blocks.slow[key]; });
				var mediumValues = _.map(mediumKeys, function (key) { return blocks.medium[key]; });
				var fastValues = _.map(fastKeys, function (key) { return blocks.fast[key]; });
				output(values.join(",") + "," + slowValues.join(",") + "," + mediumValues.join(",") + "," + fastValues.join(","));
				output("");
		}

			function outputBlock(block) {
				if (!req.body[block]) {
					console.log("Block " + block + " not found.");
					return;
				}
				var resultsArray = req.body[block].results;
				_.each(resultsArray, function (results) {
					output(serializeResults(block, results));
				});
			}

			function blockStats(block) {
				if (!req.body[block]) {
					console.log("blockStats: " + block + " not found.");
					return;
				}

        /*         SlowCorrect SlowDisCorrect  SlowDSlowCorrect  SlowDMedCorrect
				SlowDFastCorrect  SlowDSlowDisCorrect SlowDMedDisCorrect  SlowDFastDisCorrect
				SlowTotalTime SlowTimeUserFeedback  SlowTimeUserValue SlowTimeDisValue
				*/
				var resultsArray = req.body[block].results;
				var stats = {
					userCorrect: 0,
					disCorrect: 0,
					dSlowCorrect: 0,
					dMedCorrect: 0,
					dFastCorrect: 0,
					dSlowDisCorrect: 0,
					dMedDisCorrect: 0,
					dFastDisCorrect: 0,
					disOuterCorrect: 0,
					disInnerCorrect: 0,
					aCorrect: 0,
					bCorrect: 0,
					cCorrect: 0,
					dCorrect: 0,
					eCorrect: 0,
					aDisCorrect: 0,
					bDisCorrect: 0,
					cDisCorrect: 0,
					dDisCorrect: 0,
					eDisCorrect: 0,
					avgTimeTotal: 0,
					avgTimeUserFeedback: 0,
					avgTimeUserValue: 0,
					avgTimeDisValue: 0,
					trials: resultsArray.length
				};

				_.each(resultsArray, function (results) {
					var userCorrect = results.userChoice === results.guessedUserChoice ? 1 : 0;
					var disCorrect = results.distractorChoice === results.guessedDistractorChoice ? 1 : 0;
					var disSpeed = parseInt(results.distractorSpeed, 10);
					var timing = results.timing || {};
					var userChoice = results.userChoice, disChoice = results.distractorChoice;
					var row = parseInt(results.distractorRow, 10), col = parseInt(results.distractorCol, 10);

					// save the stats for correctness of user value
					if (userCorrect) {
						stats.userCorrect += 1;
						if (disSpeed === 0) {
							stats.dSlowCorrect += 1;
						} else if (disSpeed === 1) {
							stats.dMedCorrect += 1;
						} else if (disSpeed === 2) {
							stats.dFastCorrect += 1;
						}

						if (userChoice === "A") {
							stats.aCorrect += 1;
						} else if (userChoice === "B") {
							stats.bCorrect += 1;
						} else if (userChoice === "C") {
							stats.cCorrect += 1;
						} else if (userChoice === "D") {
							stats.dCorrect += 1;
						} else if (userChoice === "E") {
							stats.eCorrect += 1;
						}
					}

					// save the stats for correctness of distractor value
					if (disCorrect) {
						stats.disCorrect += 1;
						if (disSpeed === 0) {
							stats.dSlowDisCorrect += 1;
						} else if (disSpeed === 1) {
							stats.dMedDisCorrect += 1;
						} else if (disSpeed === 2) {
							stats.dFastDisCorrect += 1;
						}

						if (disChoice === "A") {
							stats.aDisCorrect += 1;
						} else if (disChoice === "B") {
							stats.bDisCorrect += 1;
						} else if (disChoice === "C") {
							stats.cDisCorrect += 1;
						} else if (disChoice === "D") {
							stats.dDisCorrect += 1;
						} else if (disChoice === "E") {
							stats.eDisCorrect += 1;
						}

						if (row === 0 || row === 4 || col === 0 || col === 4) {
							stats.disOuterCorrect += 1;
						} else {
							stats.disInnerCorrect += 1;
						}
					}

					// compute time totals to be divided later
					stats.avgTimeTotal += parseFloat(timing.total);
					stats.avgTimeUserFeedback += parseFloat(timing.userFeedback);
					stats.avgTimeUserValue += parseFloat(timing.userFeedback) - parseFloat(timing.recognizeUserStart);
					stats.avgTimeDisValue += parseFloat(timing.recognizeDistractorEnd) - parseFloat(timing.recognizeDistractorStart);
				});

// output break duration
				if (block === "slow" || block === "medium") {
					stats["break"] = req.body["break-" + block] || 0;
				}

				// compute averages by dividing by num trials
				stats.avgTimeTotal /= stats.trials;
				stats.avgTimeUserFeedback /= stats.trials;
				stats.avgTimeUserValue /= stats.trials;
				stats.avgTimeDisValue /= stats.trials;

				return stats;
			}
			stream.end();
			res.send(200);
		});
	}



	function serializeResults(block, results) {
		var row = parseInt(results.distractorRow, 10), col = parseInt(results.distractorCol, 10);
		var distractorOuter = (row === 0 || row === 4 || col === 0 || col === 4) ? 1 : 0;
		var distractorCorner = ((row === 0 && (col === 0 || col === 4)) || (row === 4 && (col === 0 || col === 4))) ? 1 : 0;
		var timing = results.timing || {};
		var data = [ block,
			results.trial,
			results.userChoice === results.guessedUserChoice ? 1 : 0,
			results.distractorChoice === results.guessedDistractorChoice ? 1 : 0,
			results.userSpeed,
			results.distractorSpeed,
			results.distractorRow,
			results.distractorCol,
			distractorOuter,
			distractorCorner,
			results.userChoice,
			results.distractorChoice,
			results.guessedUserChoice,
			results.guessedDistractorChoice,
			timing.total,
			timing.start,
			timing.userRevealTime,
			timing.distractorRevealTime,
			timing.recognizeUserStart,
			timing.userFeedback,
			timing.recognizeDistractorStart,
			timing.recognizeDistractorEnd,
		];

		return data.join(",");
	}
}