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


	WarmupStates.Play = StateApp.ViewState.extend({
		name: "play",
		view: "warmup::play",
		modes: { discover: 'discover', selectRow: 'selectRow', selectCol: 'selectCol', selected: 'selected' },

		initialize: function () {
			StateApp.ViewState.prototype.initialize.apply(this, arguments);
			this.model = new Common.Models.ViewModel({
				mode: this.modes.discover,
				modeMeta: null
			});
		},

		// this.input is a participant collection.
		beforeRender: function () {
			window.p = this.input.participants;
			// only work with a single participant.
			this.participants = this.input.participants; // need collection for ease of use with framework
			console.log("BEFORE RENDER");
			this.setParticipant(this.participants.at(0));
		},

		setParticipant: function (participant) {
			console.log("SETTING PARTICIPANT");
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
			}
		},

		viewOptions: function () {
			console.log("@@ calling viewOptions");
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
			return new StateApp.StateMessage({ participants: this.participants });
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

	return WarmupStates;
});