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
			return true;
		},

		logDiscoverChoice: function (choice) {
			var choices = this.get("discoverChoices");
			var now = new Date().getTime();
			var start = this.get("timing").start;

			choices.push([choice, now - start]);

			console.log("new choices", choices);
		}
	});

	function randomChoice() {
		return "ABCDE".charAt(Math.floor(Math.random() * 5));
	}

	RecognitionSegmentsStates.Play = StateApp.ViewState.extend({
		name: "play",
		view: "RecognitionSegments::play",
		modes: {
			waiting: 'waiting', initialDelay: 'initialDelay', revealChoices: 'revealChoices',
			recognizeYours: 'recognizeYours', yourFeedback: 'yourFeedback',
			recognizeDistractor: 'recognizeDistractor', finished: 'finished'
		},
		aliasList: ["leo", "martha", "jordan", "zooey", "angie", "perry", "stiller", "pink", "halle", "lopez", "marilyn", "spears", "aniston", "spock", "freeman", "pitt", "will", "lucy", "rihanna", "cera", "swift", "depp", "adele", "gosling", "jackson", "keanu", "potter", "cruise", "arnie", "diaz", "murray", "cruz", "bee", "leia", "hova", "scarjo", "audrey", "elvis", "deniro", "stark", "holmes", "timber", "gates", "yeezy", "jobs", "fey", "owen", "whoopi", "portman", "julia", "alba", "liz", "maddy", "vaughn", "oprah", "gaga", "ellen", "marley", "ford", "bruce", "carrey", "bond", "samuel", "mila"],
		initialDelayTime: 800,
		revealTime: 200,
		feedbackTime: 1000,
		finishDelayTime: 1000,

		initialize: function () {
			StateApp.ViewState.prototype.initialize.apply(this, arguments);
			var distractorPosition = this.randomDistractorPosition();
			this.model = new RecognitionSegmentsModel({
				mode: this.modes.waiting,
				modeMeta: null,
				userRow: 2, // middle
				userCol: 2,
				distractorRow: distractorPosition.row,
				distractorCol: distractorPosition.col,
				timing: {},
				discoverChoices: [],
				yourChoice: randomChoice(),
				distractorChoice: randomChoice()
			});

			this.aliases = _.shuffle(this.aliasList); // provide the aliases for the extra grid places

			this.listenTo(this.model, "change", function (model) {
				console.log("model changed", model.changed);
				if (model.hasChanged('mode')) {
					this.modeChanged();
				}
			}, this);
		},

		// returns the position of a distractor
		randomDistractorPosition: function () {
			// outside corners
			var outsidePositions = [
				{ row: 0, col: 0 },
				{ row: 0, col: 2 },
				{ row: 0, col: 4 },
				{ row: 2, col: 0 },
				{ row: 2, col: 4 },
				{ row: 4, col: 0 },
				{ row: 4, col: 2 },
				{ row: 4, col: 4 }
			]
			return outsidePositions[Math.floor(Math.random() * outsidePositions.length)];
		},

		changeMode: function (mode, modeMeta) {
			this.model.set({ mode: mode, modeMeta: modeMeta });
			this.model.save();
		},

		// TODO: implement this for timing
		modeChanged: function () {
			var model = this.model;
			var timing = model.get("timing");
			var mode = this.model.get("mode");
			var now = new Date().getTime();

			switch(mode) {
				case this.modes.discover:
					timing.start = now;
					break;
				case this.modes.selectRow:
					timing.discover = now - timing.start;
					break;
				case this.modes.selectCol:
					timing.selectRow = now - timing.start - timing.discover;
					break;
				case this.modes.selected:
					timing.end = now;
					timing.selectCol = now - timing.start - timing.discover - timing.selectRow;
					timing.total = now - timing.start;
					break;
			}
			// console.log("NEW TIMING", timing);
		},

		// this.input is a participant collection.
		beforeRender: function () {
			// only work with a single participant.
			this.participants = this.input.participants; // need collection for ease of use with framework
			this.setParticipant(this.participants.at(0));
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
			window.p = this.participant;
			this.changeMode(this.modes.initialDelay);
			setTimeout(this.doRevealChoices.bind(this), this.initialDelayTime);
		},

		doRevealChoices: function () {
			this.changeMode(this.modes.revealChoices);
			this.participant.set("choice", this.model.get("yourChoice"));

			// hide the choice and wait for input to indicate recognition
			this.revealTimer = setTimeout(function () {
				this.revealTimer = null;
				this.changeMode(this.modes.recognizeYours);
				this.participant.set("choice", null);
			}.bind(this), this.revealTime);
		},

		doYourFeedback: function (choice) {
			// move to your feedback mode to show the participant if they entered the right choice
			var feedback = (choice === this.model.get("yourChoice"));
			this.changeMode(this.modes.yourFeedback, feedback);
			this.participant.set({
				"choice": null,
				"feedback": feedback
			});

			setTimeout(function () {
				console.log("moving to recognize distractor mode");
				this.changeMode(this.modes.recognizeDistractor);
				this.participant.set({"feedback": null});
			}.bind(this), this.feedbackTime);
		},

		handleInput: function (choice) {
			var mode = this.model.get("mode");
			console.log("mode is", mode);

			if (mode === this.modes.initialDelay || mode === this.modes.yourFeedback || mode === this.modes.distractorDelay) {
				// do nothing (perhaps log this? not sure)
				console.log("should ignore user input", choice);
				this.participant.set("choice", null);

			} else if (mode === this.modes.revealChoices || mode === this.modes.recognizeYours) {
				clearTimeout(this.revealTimer);
				this.revealTimer = null;

				this.doYourFeedback(choice);
			} else if (mode === this.modes.recognizeDistractor) {
				this.changeMode(this.modes.finished);

				this.participant.set("choice", null); // ignore any choices here

				// trial over, so transition to next state after some delay
				setTimeout(function () { this.stateApp.next(); }.bind(this), this.finishDelayTime);
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

		// outputs a participant participants
		onExit: function () {
			return new StateApp.StateMessage({
				participants: this.participants,
				correct: this.model.isCorrect(),
				userRow: this.model.get("userRow"),
				userCol: this.model.get("userCol"),
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
		numRepeats: 5,
		streakRequired: 4,

		initialize: function () {
			StateApp.RepeatState.prototype.initialize.apply(this, arguments);
			this.correctStreak = 0;
		},

		stateOutput: function (output) {
			console.log("got state output", output);
			var currentIndex = this.currentState.options.stateIndex;
			// if we are in the last n where we need to keep track of the streak
			if (currentIndex >= this.numRepeats - this.streakRequired) {
				if (!output.correct) { // output incorrect so decrement streak and add in new states
					this.correctStreak = 0;
					this.setRepeats(1 + currentIndex + this.streakRequired);
				} else { // output correct so increment streak
					this.correctStreak++;
				}
			}

			this.log(this.logTrial(output), { trial: currentIndex });

			return output;
		},

		logTrial: function (trialOutput) {
			return _.omit(trialOutput, ['participants', 'clone']);
		}
	});

	RecognitionSegmentsStates.Conclusion = StateApp.ViewState.extend({
		name: "conclusion",
		view: "RecognitionSegments::conclusion"
	});

	return RecognitionSegmentsStates;
});