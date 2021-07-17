var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var querySchema = mongoose.Schema({
    question: String,
    profession: String,
    description: String
});

querySchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("query", querySchema);