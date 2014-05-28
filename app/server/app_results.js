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

	if (flags && flags.trial !== undefined && flags.trial !== false) {

		var stream = fs.createWriteStream("log/RecognitionSegments/trials/trial_results." + filenameFormat(now) + ".csv");
		stream.once('open', function(fd) {
			function output (str) {
				logger.info(str);
				stream.write(str + "\n");
			}
			output("RecognitionSegments Intermediate Trial Results (v" + version + ")");
			output(now.toString());
			output("");

			var trialOutputs = req.body.trialOutputs;

			var header = "Block,Trial,UserCorrect,DistractorCorrect,UserChoice,DistractorChoice,UserGuess,DistractorGuess,TotalTime,Start,UserRevealTime,DistractorRevealTime,RecognizeUserStart,UserFeedbackShown,RecognizeDistractorStart,RecognizeDistractorEnd"
			output(header);

			var prevTrials = trialOutputs.previous || [];

			_.each(prevTrials.concat(trialOutputs.current), function (results) {
				var timing = results.timing || {};
				var data = [ trialOutputs.block,
					results.trial,
					results.userChoice === results.guessedUserChoice ? 1 : 0,
					results.distractorChoice === results.guessedDistractorChoice ? 1 : 0,
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

				output(data.join(","));
			});

			res.send(200);
		});
	} else {
		var stream = fs.createWriteStream("log/RecognitionSegments/results." + filenameFormat(now) + ".csv");
		stream.once('open', function(fd) {
			function output (str) {
				logger.info(str);
				stream.write(str + "\n");
			}
			output("RecognitionSegments Results (v" + version + ")");
			output(now.toString());
			output("");

			var trialOutputs = req.body.trialOutputs;
			// output slow, medium, fast
			outputBlock("slow");
			outputBlock("medium");
			outputBlock("fast");

			function outputBlock(block) {
				var header = "Block,Trial,UserCorrect,DistractorCorrect,UserChoice,DistractorChoice,UserGuess,DistractorGuess,TotalTime,Start,UserRevealTime,DistractorRevealTime,RecognizeUserStart,UserFeedbackShown,RecognizeDistractorStart,RecognizeDistractorEnd"
				output(header);
				var resultsArray = req.body[block].results;
				_.each(resultsArray, function (results) {
					var timing = results.timing || {};
					var data = [ block,
						results.trial,
						results.userChoice === results.guessedUserChoice ? 1 : 0,
						results.distractorChoice === results.guessedDistractorChoice ? 1 : 0,
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

					output(data.join(","));
				});

				var breakDuration = req.body["break-" + block];
				if (breakDuration) {
					output("");
					output("Break," + breakDuration);
				}

				output("");
				output("");
			}

			res.send(200);
		});
	}
}

function warmupResults(req, res) {
	var flags = req.body.flags;

	if (flags && flags.trial !== undefined && flags.trial !== false) {
		console.log("Trial ", flags.trial);
	} else {
		console.log("Not trial");
	}
	console.log(req.body);

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