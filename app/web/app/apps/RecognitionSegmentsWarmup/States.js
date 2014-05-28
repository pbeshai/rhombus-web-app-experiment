define([
	"framework/App",
	"framework/modules/common/Common",
	"framework/modules/StateApp/Module",

	"apps/RecognitionSegmentsWarmup/Base",
	"apps/RecognitionSegments/Module"
],
function (App, Common, StateApp, RecognitionSegmentsWarmup, RecognitionSegments) {

	var RecognitionSegmentsWarmupStates = {};

	// To be used in StateApps
	RecognitionSegmentsWarmupStates = {};

	RecognitionSegmentsWarmupStates.RepeatedPlay = StateApp.RepeatState.extend({
		name: "repeat",
		State: RecognitionSegments.States.Play,
		numRepeats: 10,
		streakRequired: 4,

		initialize: function () {
			StateApp.RepeatState.prototype.initialize.apply(this, arguments);
			this.correctStreak = 0;
		},

		stateOutput: function (output) {
			var currentIndex = this.currentState.options.stateIndex;
			var trialOutput = _.omit(output, ['participants', 'clone']);
			trialOutput.trial = currentIndex;

			// if we are in the last n where we need to keep track of the streak
			if (currentIndex >= this.numRepeats - this.streakRequired) {
				if (!output.correct) { // output incorrect so decrement streak and add in new states
					this.correctStreak = 0;
					this.setRepeats(1 + currentIndex + this.streakRequired);
				} else { // output correct so increment streak
					this.correctStreak++;
				}
			}

			return trialOutput;
		},
	});

	RecognitionSegmentsWarmupStates.Conclusion = StateApp.ViewState.extend({
		name: "conclusion",
		view: "RecognitionSegmentsWarmup::conclusion",
	});


	return RecognitionSegmentsWarmupStates;
});