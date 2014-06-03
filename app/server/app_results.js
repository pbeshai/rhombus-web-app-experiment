module.exports = {
	initialize: initialize
};

var fs = require('fs'),
	_ = require('lodash'),
	logger = require("../../log/logger");

function initialize(site) {
	site.post("/api/apps/q/log", questionResults);
	site.post("/api/apps/warmup/log", warmupResults);
	site.post("/api/apps/RecognitionSegments/log", recognitionResults);
	site.post("/api/apps/RecognitionSegmentsWarmup/log", recognitionResults);
}


function z(str) { // add leading zero
	return ("0"+str).slice(-2);
}

function filenameFormat(date) {
	return date.getFullYear()+z(date.getMonth()+1)+z(date.getDate())+"_"+z(date.getHours())+z(date.getMinutes())+z(date.getSeconds());
}

function recognitionResults(req, res) {
	var now = new Date();
	var config = req.body.config;
	var version = req.body.version;

	var flags = req.body.flags;
	var warmup = flags && flags.warmup;

	var appId = warmup ? "RecognitionSegmentsWarmup" : "RecognitionSegments";
	var stream;
	var trialOutputs = req.body.trialOutputs;


	if (flags && flags.trial !== undefined && flags.trial !== false) {

		stream = fs.createWriteStream("log/" +appId + "/trials/trial_results." + filenameFormat(now) + ".csv");
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

			var prevTrials = trialOutputs.previous || [];

			_.each(prevTrials.concat(trialOutputs.current), function (results) {
				output(serializeResults(trialOutputs.block, results));
			});

			res.send(200);
		});
	} else {
		stream = fs.createWriteStream("log/" + appId + "/results." + filenameFormat(now) + ".csv");
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

function warmupResults(req, res) {
	var flags = req.body.flags;

	if (flags && flags.trial !== undefined && flags.trial !== false) {
		console.log("Trial ", flags.trial);
	} else {
		console.log("Not trial");
	}

	res.send(200);
}

function questionResults(req, res) {
	var now = new Date();
	var results = req.body.results;
	var config = req.body.config;
	var version = req.body.version;
	var questions = config.questions;
	if (!questions) {
		logger.warn("log Questions with no questions.");
		res.send(200);
		return;
	}

	var stream = fs.createWriteStream("log/q/results." + filenameFormat(now) + ".csv");
	stream.once('open', function(fd) {
		function output (str) {
			logger.info(str);
			stream.write(str + "\n");
		}
		output("Question Results (v" + version + ")");
		output(now.toString());
		if (config.message) {
			output(config.message);
		}

		var allResults = {};
		var allAnswerCounts = [];
		// output each question
		_.each(questions, function (q, i) {
			output("");
			output("");
			output("Question " + (i + 1) + "," + q.question);
			output("-----------");

			var results = req.body["question " + (i + 1)];
			var answerCount = { A: 0, B: 0, C: 0, D: 0, E: 0 };
			_.each(results, function (result) {
				answerCount[result.choice] = (answerCount[result.choice] || 0) + 1;
			});
			allAnswerCounts.push(answerCount);

			// output answers and counts
			output("");
			output("Count,Answer");
			_.each(_.keys(q.answers), function (key) {
				output((answerCount[key] || 0) + "," + key + " - " + q.answers[key]);
			});

			// output results
			output("");
			output("Alias,Answer");
			_.each(results, function (result) {
				output(result.alias + "," + result.choice);

				// save for summary
				if (allResults[result.alias] === undefined) {
					allResults[result.alias] = [];
				}
				allResults[result.alias][i] = result.choice;
			});
		});

		output("");
		output("");
		output("Alias Summary Table");
		output("-------------------");
		var header = "Alias";
		_.each(questions, function (q, i) {
			header += ",Q" + (i + 1);
		});
		output(header);
		_.each(_.keys(allResults), function (alias) {
			output(alias + "," + allResults[alias].join(","));
		});

		output("");
		output("");
		output("Question Summary Table");
		output("----------------------");
		output("#,Question,A,B,C,D,E");
		_.each(questions, function (q, i) {
			output((i + 1) + "," + q.question + "," + _.values(allAnswerCounts[i]).join(","));
		});

		stream.end();
	});

	res.send(200);
}