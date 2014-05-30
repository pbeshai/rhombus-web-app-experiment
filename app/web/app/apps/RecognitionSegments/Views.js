define([
	"framework/App",
	"framework/modules/common/Common",

	"apps/RecognitionSegments/Base"
],
function (App, Common, RecognitionSegments) {

	var RecognitionSegmentsViews = {};

	RecognitionSegmentsViews.Play = {};

	RecognitionSegmentsViews.Play.Participant = Common.Views.ParticipantDisplay.extend({
		mainText: function (model) { },

		cssClass: function (model) { return "br-corner-message"; },

		overlay: function (model) {
			var classes = "fast-transition ";
			if (model.get("feedback")) {
				return classes + "green";
			} else if (model.get("feedback") === false) {
				return classes + "red";
			}
			return classes + "transparent";
		},


		beforeRender: function () {
			Common.Views.ParticipantDisplay.prototype.beforeRender.apply(this, arguments);

			this.setView(".message-text", new RecognitionSegmentsViews.Segment({ value: this.model.get("choice")}));
		}
	});

	/*
		_   top
   |_|  upper left, middle, upper right
   |_|  lower left, bottom, lower right
	*/
	RecognitionSegmentsViews.Segment = App.BaseView.extend({
		template: "app/apps/RecognitionSegments/templates/segment",
		valueToSegments: {
			"A": {
				bottom: false
			},
			"B": {
				top: false,
				upperRight: false
			},
			"C": {
				upperRight: false,
				middle: false,
				lowerRight: false
			},
			"D": {
				top: false,
				upperLeft: false
			},
			"E": {
				upperRight: false,
				lowerRight: false
			}
		},

		serialize: function () {
			return {
				segments: this.segments
			};
		},

		resetSegments: function () {
			this.segments = {
				top: true,
				middle: true,
				bottom: true,
				upperLeft: true,
				upperRight: true,
				lowerLeft: true,
				lowerRight: true
			};
		},

		segmentsFromValue: function (value) {
			this.resetSegments();
			_.extend(this.segments, this.valueToSegments[value]);
		},

		initialize: function (options) {
			this.resetSegments();
			if (this.options.value) {
				this.segmentsFromValue(this.options.value);
			}
		}
	});

	RecognitionSegmentsViews.Play.Layout = App.registerView("RecognitionSegments::play", App.BaseView.extend({
		template: "app/apps/RecognitionSegments/templates/grid",
		numRows: 5,
		numCols: 5,

		beforeRender: function () {
			this.$el.css('opacity', 0);

			if (!this.participants || this.participants.length === 0) return;
			var userLocation = this.options.userRow * this.numRows + this.options.userCol;
			var distractorLocation = this.options.distractorRow * this.numRows + this.options.distractorCol;
			for (var i = 0; i < this.numRows * this.numCols; i++) {
				if (i !== userLocation) {
					var userModel = new Backbone.Model({ alias: this.options.aliases[i]});
					if (i === distractorLocation) {
						this.distractor = userModel;
					}

					this.insertView(".grid-cell-" + i, new RecognitionSegmentsViews.Play.Participant({ model: userModel }));
				} else {
					this.insertView(".grid-cell-" + i, new RecognitionSegmentsViews.Play.Participant({ model: this.participants.at(0) }));
				}
			}
		},

		afterRender: function () {
			// initialize in the correct state
			var mode = this.options.mode, modeMeta = this.options.modeMeta;
			// TODO: render differently depending on value of mode
			// initial load -- fade in
			this.$el.animate({opacity: 1}, 800);
		},

		update: function (data) {

			var user = this.participants.at(0), distractor = this.distractor;

			if (data.mode === "revealChoices") {

				this.userStart = performance.now();
				this.distractorStart = performance.now();
				var userStart = performance.now();
				var distractorStart = performance.now();

				user.set("choice", this.options.userChoice);
				distractor.set("choice", this.options.distractorChoice);

				var userTime = data.modeMeta.userTime, distractorTime = data.modeMeta.distractorTime;

				console.log("user time = ", userTime, "distractor time = ", distractorTime);
				if (userTime === distractorTime) {
					console.log("same times");
					setTimeout(function () {
						console.log("user visible for", performance.now() - userStart);
						console.log("distractor visible for", performance.now() - distractorStart);
						user.set("choice", null);
						distractor.set("choice", null);

					}, userTime);
				} else {
					setTimeout(function () {
						console.log("user visible for", performance.now() - userStart);
						user.set("choice", null);
					}, userTime);

					setTimeout(function () {
						console.log("distractor visible for", performance.now() - distractorStart);
						distractor.set("choice", null);

					}, distractorTime);
				}
			} else {
				if (user) {
					distractor.set("choice", null);
					user.set("choice", null);
				}

				if (data.mode === "finished") {
					if (this.options.showDistractorFeedback) {
						distractor.set("feedback", data.modeMeta.distractorCorrect);
					}

					if (this.options.delayFinishFade) {
						setTimeout(function () { this.$el.animate({opacity: 0}, 400); }.bind(this), this.options.delayFinishFade);
					} else {
						this.$el.animate({opacity: 0}, 400);
					}
				}
			}
		},

		serialize: function () {
			return {
				participantReady: this.options.participants.length > 0,
				rows: this.numRows,
				columns: this.numCols
			};
		}
	}));


	RecognitionSegmentsViews.Conclusion = App.registerView("RecognitionSegments::conclusion", Backbone.View.extend({
		template: "app/apps/RecognitionSegments/templates/conclusion"
	}));

	RecognitionSegmentsViews.BlockComplete = App.registerView("RecognitionSegments::block-complete", Backbone.View.extend({
		template: "app/apps/RecognitionSegments/templates/block_complete",

		beforeRender: function () {
			this.setView(".big-timer", new Common.Views.Countdown({ endTime: this.options.endTime }));
		}
	}));

	return RecognitionSegmentsViews;
});