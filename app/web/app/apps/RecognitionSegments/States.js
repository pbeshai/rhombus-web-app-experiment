define([
	"framework/App",
	"framework/modules/common/Common",
	"framework/modules/StateApp/Module",

	"apps/RecognitionSegments/Base",
	"apps/RecognitionSegments/Views"
],
function (App, Common, StateApp, RecognitionSegments) {

	var RecognitionSegmentsStates = {};

	// To be used in StateApps
	RecognitionSegmentsStates = {};

	var RecognitionSegmentsModel = Common.Models.ViewModel.extend({
		isCorrect: function () {
			return this.get("guessedUserChoice") === this.get("userChoice");
		}
	});

	function randomChoice() {
		return "ABCDE".charAt(Math.floor(Math.random() * 5));
	}

	RecognitionSegmentsStates.Play = StateApp.ViewState.extend({
		name: "trial",
		view: "RecognitionSegments::play",
		modes: {
			waiting: 'waiting', initialDelay: 'initialDelay', revealChoices: 'revealChoices',
			recognizeUser: 'recognizeUser', userFeedback: 'userFeedback',
			recognizeDistractor: 'recognizeDistractor', finished: 'finished'
		},
		aliasList: ["leo", "martha", "jordan", "zooey", "angie", "perry", "stiller", "pink", "halle", "lopez", "marilyn", "spears", "aniston", "spock", "freeman", "pitt", "will", "lucy", "rihanna", "cera", "swift", "depp", "adele", "gosling", "jackson", "keanu", "potter", "cruise", "arnie", "diaz", "murray", "cruz", "bee", "leia", "hova", "scarjo", "audrey", "elvis", "deniro", "stark", "holmes", "timber", "gates", "yeezy", "jobs", "fey", "owen", "whoopi", "portman", "julia", "alba", "liz", "maddy", "vaughn", "oprah", "gaga", "ellen", "marley", "ford", "bruce", "carrey", "bond", "samuel", "mila"],
		initialDelayTime: 800,
		feedbackTime: 750,
		finishDelayTime: 1000,
		speeds: [ 400, 125, 50 ], // slow, optimal, fast

		initialize: function () {
			StateApp.ViewState.prototype.initialize.apply(this, arguments);
			var trialConfig = this.getTrialConfig();
			var distractorPosition = this.getDistractorPosition(trialConfig.distractorLocation);
			this.model = new RecognitionSegmentsModel({
				mode: this.modes.waiting,
				modeMeta: null,
				userRow: 2, // middle
				userCol: 2,
				distractorRow: distractorPosition.row,
				distractorCol: distractorPosition.col,
				timing: {},
				discoverChoices: [],
				userChoice: trialConfig.userChoice,
				distractorChoice: trialConfig.distractorChoice,
				distractorSpeed: trialConfig.distractorSpeed,
				userSpeed: this.options.parentOptions.userSpeed
			});

			this.aliases = _.shuffle(this.aliasList); // provide the aliases for the extra grid places

			this.listenTo(this.model, "change", function (model) {
				if (model.hasChanged('mode')) {
					this.modeChanged();
				}
			}, this);
		},

		getTrialConfig: function () {
			var index = this.options.stateIndex;
			return {
				distractorLocation: this.config.distractorLocations[index],
				distractorSpeed: this.config.distractorSpeeds[index],
				distractorChoice: this.config.distractorChoices[index],
				userChoice: this.config.userChoices[index],
			};
		},

		// returns the position of a distractor
		getDistractorPosition: function (index) {
			// outside corners and midpoints
			var outsidePositions = [
				{ row: 0, col: 0 },
				{ row: 0, col: 2 },
				{ row: 0, col: 4 },
				{ row: 2, col: 0 },
				{ row: 2, col: 4 },
				{ row: 4, col: 0 },
				{ row: 4, col: 2 },
				{ row: 4, col: 4 }
			];

			var insidePositions = [
				{ row: 1, col: 1 },
				{ row: 1, col: 2 },
				{ row: 1, col: 3 },
				{ row: 2, col: 1 },
				{ row: 2, col: 3 },
				{ row: 3, col: 1 },
				{ row: 3, col: 2 },
				{ row: 3, col: 3 },
			];

			var allPositions = outsidePositions.concat(insidePositions);
			return allPositions[index];
			// return outsidePositions[Math.floor(Math.random() * outsidePositions.length)];
			// return insidePositions[Math.floor(Math.random() * insidePositions.length)];
		},

		changeMode: function (mode, modeMeta) {
			this.model.set({ mode: mode, modeMeta: modeMeta });
			this.model.save();
		},

		modeChanged: function () {
			var model = this.model;
			var timing = model.get("timing");
			var mode = this.model.get("mode");
			var now = new Date().getTime();

			switch(mode) {
				case this.modes.revealChoices:
					timing.start = now;
					break;
				case this.modes.recognizeUser:
					timing.recognizeUserStart = now - timing.start;
					break;
				case this.modes.userFeedback:
					timing.userFeedback = now - timing.start;
					break;
				case this.modes.recognizeDistractor:
					timing.recognizeDistractorStart = now;
					break;
				case this.modes.finished:
					timing.recognizeDistractorEnd = now;
					timing.total = now - timing.start;
					break;
			}
			console.log(timing);
		},

		// this.input is a participant collection.
		beforeRender: function () {
			// only work with a single participant.
			this.participants = this.input.participants; // need collection for ease of use with framework
			this.setParticipant(this.participants.at(0));

			console.log("user", this.model.get("userChoice"), "distractor", this.model.get("distractorChoice"));
		},

		setParticipant: function (participant) {
			this.participant = participant;
			// listen for choices
			this.stopListening(this.input.participants);
			if (participant) {
				participant.reset();
				this.listenTo(this.input.participants, "update:choice", function (eventParticipant, choice) {
					if (participant === eventParticipant) {
						this.handleInput(choice);
					}
				});

				// no longer waiting
				this.startTrial();

			}
		},

		startTrial: function () {
			this.changeMode(this.modes.initialDelay);
			setTimeout(this.doRevealChoices.bind(this), this.initialDelayTime);
		},

		doRevealChoices: function () {
			this.changeMode(this.modes.revealChoices, { user: true, distractor: true });
			// this.participant.set("choice", this.model.get("userChoice"));
			var model = this.model;
			var userSpeed = this.model.get("userSpeed"), distractorSpeed = this.model.get("distractorSpeed");

			if (userSpeed === distractorSpeed) {
				// user and distractor stay up same amount of time
				this.distractorRevealTimer = this.userRevealTimer = setTimeout(function () {
					this.userRevealTimer = null;
					var timing = model.get("timing");
					timing.userRevealTime = new Date().getTime() - timing.start;
					timing.distractorRevealTime = new Date().getTime() - timing.start;

					this.changeMode(this.modes.recognizeUser);
					this.participant.set("choice", null);
				}.bind(this), this.speeds[userSpeed]);

			} else if (userSpeed < distractorSpeed) {
				// user stays up longer
				this.distractorRevealTimer = setTimeout(function () {
					this.distractorRevealTimer = null;
					var timing = model.get("timing");
					timing.distractorRevealTime = new Date().getTime() - timing.start;

					this.changeMode(this.modes.revealChoices, { user: true, distractor: false });

				}.bind(this), this.speeds[distractorSpeed]);

				this.userRevealTimer = setTimeout(function () {
					this.userRevealTimer = null;
					var timing = model.get("timing");
					timing.userRevealTime = new Date().getTime() - timing.start;

					this.changeMode(this.modes.recognizeUser);
					this.participant.set("choice", null);
				}.bind(this), this.speeds[userSpeed]);

			} else {
				// distractor stays up longer
				this.userRevealTimer = setTimeout(function () {
					this.userRevealTimer = null;
					var timing = model.get("timing");
					timing.userRevealTime = new Date().getTime() - timing.start;

					this.participant.set("choice", null);
					this.changeMode(this.modes.revealChoices, { user: false, distractor: true });
				}.bind(this), this.speeds[userSpeed]);

				this.distractorRevealTimer = setTimeout(function () {
					this.distractorRevealTimer = null;
					var timing = model.get("timing");
					timing.distractorRevealTime = new Date().getTime() - timing.start;


					this.changeMode(this.modes.recognizeUser);
				}.bind(this), this.speeds[distractorSpeed]);
			}
		},

		doUserFeedback: function (choice) {
			// move to your feedback mode to show the participant if they entered the right choice
			var feedback = (choice === this.model.get("userChoice"));
			this.model.set("guessedUserChoice", choice);
			this.changeMode(this.modes.userFeedback, feedback);
			this.participant.set({
				"choice": null,
				"feedback": feedback
			});

			setTimeout(function () {
				console.log("check mode", this.mode);
				if (this.model.get("mode") === this.modes.userFeedback) { // ensure multiple button presses haven't jumped us ahead
					this.changeMode(this.modes.recognizeDistractor);
					this.participant.set({"feedback": null});
				}
			}.bind(this), this.feedbackTime);
		},

		handleInput: function (choice) {
			var mode = this.model.get("mode");
			console.log("mode is", mode);

			if (mode === this.modes.initialDelay || mode === this.modes.distractorDelay) {
				// ignore user input
				this.participant.set("choice", null);

			} else if (mode === this.modes.revealChoices || mode === this.modes.recognizeUser) {
				clearTimeout(this.userRevealTimer);
				clearTimeout(this.distractorRevealTimer);
				this.userRevealTimer = null;
				this.distractorRevealTimer = null;

				// ensure we have timings for these.
				var timing = this.model.get("timing");
				var now = new Date().getTime();
				timing.userRevealTime = timing.userRevealTime || now - timing.start;
				timing.distractorRevealTime = timing.distractorRevealTime || now - timing.start;
				timing.recognizeUserStart = timing.recognizeUserStart || now - timing.start;

				this.doUserFeedback(choice);

			} else if (mode === this.modes.userFeedback || mode === this.modes.recognizeDistractor) {
				this.model.set("guessedDistractorChoice", choice);
				this.changeMode(this.modes.finished);

				this.participant.set("choice", null); // ignore any choices here

				// trial over, so transition to next state after some delay
				if (this.finalTimer == null) { // ensure we only do this once
					this.finalTimer = setTimeout(function () {
						this.finalTimer = null;
						if (this.participant.get("feedback") != null) { // in case we skipped cleaning up feedback, clear it here
							this.participant.set({"feedback": null});
						}
						this.stateApp.next();
					}.bind(this), this.finishDelayTime);
				}
			}
		},

		viewOptions: function () {
			var viewOptions = {
				participants: this.participants,
				aliases: this.aliases,
				config: this.config,
			};

			_.extend(viewOptions, this.model.attributes);

			if (this.options.round != null) {
				viewOptions.round = this.options.round;
			}

			return viewOptions;
		},

		onExit: function () {
			return new StateApp.StateMessage({
				participants: this.participants,
				correct: this.model.isCorrect(),
				guessedUserChoice: this.model.get("guessedUserChoice"),
				userChoice: this.model.get("userChoice"),
				guessedDistractorChoice: this.model.get("guessedDistractorChoice"),
				distractorChoice: this.model.get("distractorChoice"),
				timing: this.model.get("timing"),
			});
		},

		addNewParticipants: function (render) {
			var participants = this.input.participants;
			if (participants.newParticipants.length > 0) {
				participants.remove(participants.models);
				participants.newParticipants.length = 1; // only keep one
				participants.addNewParticipants();
				this.setParticipant(participants.at(0));
			}
			if (render) {
				this.rerender();
			}
		},
	});

	RecognitionSegmentsStates.RepeatedPlay = StateApp.RepeatState.extend({
		name: "repeat",
		State: RecognitionSegmentsStates.Play,
		numRepeats: 2,

		stateOutput: function (output) {
			console.log("@@ STATE OUTPUTS");
			var currentIndex = this.currentState.options.stateIndex;
			var trialOutput = _.omit(output, ['participants', 'clone']);
			trialOutput.trial = currentIndex;
			this.log(this.logTrial(trialOutput), { trial: currentIndex + 1 });

			return trialOutput;
		},

		logTrial: function (trialOutput) {
			return {
        trialOutputs: {
          "block": this.name,
          "current": trialOutput,
          "previous": this.stateOutputs.slice()
        }
      };
		}
	});

	RecognitionSegmentsStates.Conclusion = StateApp.ViewState.extend({
		name: "conclusion",
		view: "RecognitionSegments::conclusion",

		afterRender: function () {
      this.log(this.logResults());
    },

		logResults: function () {
			console.log("@@ log results in CONCLUSION", this.input);
      var logData = {};
      var block = this.options.block;
      logData[block] = {
        results: this.input.stateOutputs,
        config: this.config
      };
      return logData;
    }
	});

	RecognitionSegmentsStates.BlockComplete = StateApp.ViewState.extend({
		name: "block-complete",
		view: "RecognitionSegments::block-complete",
		breakDuration: 180000,
		minimumBreak: 60000,

		beforeRender: function () {
			this.options.endTime = new Date().getTime() + this.breakDuration;
			this.options.startTime = new Date().getTime();
		},

		afterRender: function () {
      this.log(this.logResults());

      this.stopListening();
      this.listenTo(this.input.participants, "update:choice", function (eventParticipant, choice) {
					var now = new Date().getTime();

					if (now - this.options.startTime >= this.minimumBreak) {
						console.log("activating click, it's been a minute of break");
						var breakDuration = now - this.options.startTime;
						var logBreak = {};
						logBreak["break-" + this.options.block] = breakDuration;
						this.log(logBreak);
						this.stateApp.next();
					}
			});
    },

    viewOptions: function () {
			return {
				endTime: this.options.endTime
			};
		},

		logResults: function () {
			var logData = {};
      var block = this.options.block;
      logData[block] = {
        results: this.input.stateOutputs,
        config: this.config
      };
      return logData;
    }
	});

	return RecognitionSegmentsStates;
});