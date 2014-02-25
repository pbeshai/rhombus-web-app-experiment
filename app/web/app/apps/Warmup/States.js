define([
	"framework/App",
	"framework/modules/common/Common",
	"framework/modules/StateApp/Module",

	"apps/Warmup/Base",
	"apps/Warmup/Views"
],
function (App, Common, StateApp, Warmup) {

	var WarmupStates = {};

	// To be used in StateApps
	WarmupStates = {};

	var WarmupModel = Common.Models.ViewModel.extend({
		isCorrect: function () {
			var location = this.get("userLocation");
			var modeMeta = this.get("modeMeta");
			return !!modeMeta && (location === modeMeta.selectedRow * 5 + modeMeta.selectedCol);
		}
	});

	WarmupStates.Play = StateApp.ViewState.extend({
		name: "play",
		view: "warmup::play",
		modes: { discover: 'discover', selectRow: 'selectRow', selectCol: 'selectCol', selected: 'selected' },

		initialize: function () {
			StateApp.ViewState.prototype.initialize.apply(this, arguments);
			this.model = new WarmupModel({
				mode: this.modes.discover,
				modeMeta: null,
				userLocation: Math.floor(Math.random() * 25)
			});
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
			this.stopListening();
			if (participant) {
				this.listenTo(this.input.participants, "update:choice", function (eventParticipant, choice) {
					if (participant === eventParticipant) {
						this.handleInput(choice);
					}
				});
			}
		},

		handleInput: function (choice) {
			var mode = this.model.get("mode");
			// discover mode = A-D animate, E moves to next mode
			if (mode === this.modes.discover) {
				if (choice === "E") {
					this.model.set({ mode: this.modes.selectRow, modeMeta: null });
					this.model.save();
				}
			// select row = A-E choose row
			} else if (mode === this.modes.selectRow) {
				this.model.set({
					mode: this.modes.selectCol,
					modeMeta: {
						selectedRow: "ABCDE".indexOf(choice)
					}
				});
				this.model.save();
			// select col = A-E choose col
			} else if (mode === this.modes.selectCol) {
				var modeMeta = this.model.get("modeMeta");
				modeMeta.selectedCol = "ABCDE".indexOf(choice);
				this.model.set({
					mode: this.modes.selected,
					modeMeta: modeMeta
				});
				this.model.save();

				// the full location has been entered now, so transition to next state after some delay
				setTimeout(function () { this.stateApp.next(); }.bind(this), 2000);

			}
		},

		viewOptions: function () {
			var viewOptions = {
				participants: this.participants,
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
				correct: this.model.isCorrect()
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

	WarmupStates.RepeatedPlay = StateApp.RepeatState.extend({
		name: "repeat",
		State: WarmupStates.Play,
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
			return output.correct;
		}
	});

	WarmupStates.Conclusion = StateApp.ViewState.extend({
		name: "conclusion",
		view: "warmup::conclusion"
	});

	return WarmupStates;
});