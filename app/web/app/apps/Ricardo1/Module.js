define([
	"framework/App",

	"apps/Ricardo1/Base",
	"apps/Ricardo1/Views",
	"apps/Ricardo1/States",
],
function (App, Base, Views, States) {
	return _.extend({
		Views: Views,
		States: States
	}, Base);
});