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
				this.listenTo(this.participants, "change:choice update:choice add", function (eventParticipant, choice) {
					if (participant === eventParticipant) {
						console.log("choice ", choice, "by participant", participant);
					}
				});
			}
		},

		viewOptions: function () {
			var viewOptions = {
				participants: this.participants,
				config: this.config
			};

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
			participants.remove(participants.models);
			participants.newParticipants.length = 1; // only keep one
			participants.addNewParticipants();
			this.setParticipant(participants.at(0));
			if (render) {
				this.rerender();
			}
		},
	});

	return WarmupStates;
});