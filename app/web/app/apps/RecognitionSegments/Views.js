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

	RecognitionSegmentsViews.Play.LayoutOrig = App.registerView("RecognitionSegments::play", App.BaseView.extend({
		template: "app/apps/RecognitionSegments/templates/grid",
		numRows: 5,
		numCols: 5,

		beforeRender: function () {
			this.$el.css('opacity', 0);

			if (!this.participants || this.participants.length === 0) return;

			var userLocation = this.options.userRow * this.numRows + this.options.userCol;
			for (var i = 0; i < this.numRows * this.numCols; i++) {
				if (i !== userLocation) {
					this.insertView(".grid-cell-" + i, new RecognitionSegmentsViews.Play.Participant({ model: new Backbone.Model({ alias: this.options.aliases[i]}) }));
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
			this.$el.animate({opacity: 1}, 500);
		},

		update: function (data) {
			if (data.mode === "recognizeYours") {
				this.triggerDistractor();
			} else if (data.mode === "recognizeDistractor") {
				this.triggerNext();
			}
		},

		// button pressed should have been the one that matched yours, cause distractor to go off
		triggerDistractor: function () {

		},

		// button pressed should have been the one that matched the distractor, should go ot next state really...
		triggerNext: function () {

		},

		serialize: function () {
			return {
				participantReady: this.options.participants.length > 0,
				rows: this.numRows,
				columns: this.numCols,
			};
		}
	}));


	RecognitionSegmentsViews.Conclusion = App.registerView("RecognitionSegments::conclusion", Backbone.View.extend({
		template: "app/apps/RecognitionSegments/templates/conclusion"
	}));

	return RecognitionSegmentsViews;
});