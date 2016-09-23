/*global describe, it*/
"use strict";

var fs = require("fs"),
	es = require("event-stream"),
	should = require("should");
    require("mocha");

delete require.cache[require.resolve("../")];

var gutil = require("gulp-util"),
	assetpaths = require("../");

describe("gulp-assetpaths", function () {

	it("should replace static paths", function (done) {

		var srcFile = new gutil.File({
			path: "test/fixtures/staticpaths.html",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.readFileSync("test/fixtures/staticpaths.html")
		});

		var expectedStatic = new gutil.File({
			path: "test/expected/staticpaths.html",
			cwd: "test/",
			base: "test/expected",
			contents: fs.readFileSync("test/expected/staticpaths.html")
		});

		var stream = assetpaths({
			oldDomain : 'www.oldDomain.com',
			newDomain : 'https://www.newDomain.com',
			docRoot : 'test',
			filetypes : ['jpg', 'png', 'js', 'css'],
			templates : true
		});

		stream.on("error", function(err) {
			should.exist(err);
			done(err);
		});

		stream.on("data", function (newFile) {

			should.exist(newFile);
			should.exist(newFile.contents);
			String(newFile.contents).should.equal(String(expectedStatic.contents));
			done();
		});
		stream.write(srcFile);
		stream.end();
	});
	it("should replace nested static paths", function (done) {

		var srcFile = new gutil.File({
			path: "test/fixtures/nested/staticpaths.html",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.readFileSync("test/fixtures/nested/staticpaths.html")
		});

		var expectedStaticNested = new gutil.File({
			path: "test/expected/nested/staticpaths.html",
			cwd: "test/",
			base: "test/expected",
			contents: fs.readFileSync("test/expected/nested/staticpaths.html")
		});

		var stream = assetpaths({
			oldDomain : 'www.oldDomain.com',
			newDomain : 'https://www.newDomain.com',
			docRoot : 'test',
			filetypes : ['jpg', 'png', 'js', 'css'],
			templates : true
		});

		stream.on("error", function(err) {
			should.exist(err);
			done(err);
		});

		stream.on("data", function (newFile) {
			should.exist(newFile);
			should.exist(newFile.contents);
			String(newFile.contents).should.equal(String(expectedStaticNested.contents));
			done();
		});
		stream.write(srcFile);
		stream.end();
	});
	
	it('should remove a prefix by passing an empty string for newDomain and docRoot', function(done){

		var srcFile = new gutil.File({
			path: "test/fixtures/removeprefix.html",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.readFileSync("test/fixtures/removeprefix.html")
		});

		var expectedRemovePrefix = new gutil.File({
			path: "test/expected/removeprefix.html",
			cwd: "test/",
			base: "test/expected",
			contents: fs.readFileSync("test/expected/removeprefix.html")
		});

		var stream = assetpaths({
			oldDomain : 'http://www.somedomain.com/prefix',
			newDomain : '',
			docRoot : '',
			filetypes : ['jpg', 'png', 'js', 'css'],
			templates : true
		});

		stream.on("error", function(err) {
			should.exist(err);
			done(err);
		});
		stream.on("data", function (newFile) {
			should.exist(newFile);
			should.exist(newFile.contents);
			String(newFile.contents).should.equal(String(expectedRemovePrefix.contents));
			done();
		});
		stream.write(srcFile);
		stream.end();
		
	});
	it("should replace dynamic paths", function (done) {

		var srcFile = new gutil.File({
			path: "test/fixtures/dynamicpaths.html",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.readFileSync("test/fixtures/dynamicpaths.html")
		});

		var expectedDynamic = new gutil.File({
			path: "test/expected/staticpaths.html",
			cwd: "test/",
			base: "test/expected",
			contents: fs.readFileSync("test/expected/dynamicpaths.html")
		});

		var stream = assetpaths({
			oldDomain : 'www.oldDomain.com',
			newDomain : 'https://www.newDomain.com',
			docRoot : 'test',
			filetypes : ['jpg', 'png', 'css'],
			templates : true
		});

		stream.on("error", function(err) {
			should.exist(err);
			done(err);
		});

		stream.on("data", function (newFile) {
			should.exist(newFile);
			should.exist(newFile.contents);
			String(newFile.contents).should.equal(String(expectedDynamic.contents));
			done();
		});

		stream.write(srcFile);
		stream.end();
	});
	it("should replace paths in compiled templates", function (done) {

		var srcFile = new gutil.File({
			path: "test/fixtures/nojs.html",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.readFileSync("test/fixtures/templates.js")
		});

		var expectedTemplates = new gutil.File({
			path: "test/expected/templates.js",
			cwd: "test/",
			base: "test/expected",
			contents: fs.readFileSync("test/expected/templates.js")
		});

		var stream = assetpaths({
			oldDomain : 'www.oldDomain.com',
			newDomain : 'https://www.newDomain.com',
			docRoot : 'test',
			filetypes : ['jpg', 'png', 'css'],
			templates : true
		});

		stream.on("error", function(err) {
			should.exist(err);
			done(err);
		});

		stream.on("data", function (newFile) {

			should.exist(newFile);
			should.exist(newFile.contents);
			String(newFile.contents).should.equal(String(expectedTemplates.contents));
			done();
		});

		stream.write(srcFile);
		stream.end();
	});
	it("should not replace excluded css file type", function (done) {

		var srcFile = new gutil.File({
			path: "test/fixtures/nocss.css",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.readFileSync("test/fixtures/nocss.css")
		});

		var expectedNoCSS = new gutil.File({
			path: "test/expected/nocss.css",
			cwd: "test/",
			base: "test/expected",
			contents: fs.readFileSync("test/expected/nocss.css")
		});

		var stream = assetpaths({
			oldDomain : 'www.oldDomain.com',
			newDomain : 'https://www.newDomain.com',
			docRoot : 'test',
			filetypes : ['jpg', 'png', 'js'],
			noTemplates : true
		});

		stream.on("error", function(err) {
			should.exist(err);
			done(err);
		});

		stream.on("data", function (newFile) {

			should.exist(newFile);
			should.exist(newFile.contents);
			String(newFile.contents).should.equal(String(expectedNoCSS.contents));
			done();
		});

		stream.write(srcFile);
		stream.end();
	});

	it("should not replace excluded js file type", function (done) {

		var srcFile = new gutil.File({
			path: "test/fixtures/nojs.html",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.readFileSync("test/fixtures/nojs.html")
		});

		var expectedNoJS = new gutil.File({
			path: "test/expected/nojs.html",
			cwd: "test/",
			base: "test/expected",
			contents: fs.readFileSync("test/expected/nojs.html")
		});

		var stream = assetpaths(
				{oldDomain : 'www.oldDomain.com',
				 newDomain : 'https://www.newDomain.com',
				 docRoot : 'test',
				 filetypes : ['jpg', 'png', 'css'],
				 noTemplates : true
				});

		stream.on("error", function(err) {
			should.exist(err);
			done(err);
		});

		stream.on("data", function (newFile) {

			should.exist(newFile);
			should.exist(newFile.contents);
			String(newFile.contents).should.equal(String(expectedNoJS.contents));
			done();
		});

		stream.write(srcFile);
		stream.end();
	});

	it("should allow relative path in oldDomain option", function (done) {

		var srcFile = new gutil.File({
			path: "test/fixtures/oldDomainRel.html",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.readFileSync("test/fixtures/oldDomainRel.html")
		});

		var oldDomainRel = new gutil.File({
			path: "test/expected/oldDomainRel.html",
			cwd: "test/",
			base: "test/expected",
			contents: fs.readFileSync("test/expected/oldDomainRel.html")
		});

		var stream = assetpaths({
			oldDomain : '../assets',
			newDomain : '//www.newDomain.com',
			docRoot : 'test',
			filetypes : ['jpg', 'png', 'css'],
			templates : true
		});

		stream.on("error", function(err) {
			should.exist(err);
			done(err);
		});

		stream.on("data", function (newFile) {
			should.exist(newFile);
			should.exist(newFile.contents);
			String(newFile.contents).should.equal(String(oldDomainRel.contents));
			done();
		});

		stream.write(srcFile);
		stream.end();
	});
	it("should change the paths in a json file", function (done) {

		var srcFile = new gutil.File({
			path: "test/fixtures/test.json",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.readFileSync("test/fixtures/test.json")
		});

		var expectedJSON = new gutil.File({
			path: "test/expected/test.json",
			cwd: "test/",
			base: "test/expected",
			contents: fs.readFileSync("test/expected/test.json")
		});

		var stream = assetpaths({
			oldDomain : 'https://www.oldDomain.com',
			newDomain : 'https://www.newDomain.com',
			docRoot : 'test',
			filetypes : ['jpg', 'png', 'css'],
			templates : true
		});

		stream.on("error", function(err) {
			should.exist(err);
			done(err);
		});

		stream.on("data", function (newFile) {
			should.exist(newFile);
			should.exist(newFile.contents);
			String(newFile.contents).should.equal(String(expectedJSON.contents));
			done();
		});

		stream.write(srcFile);
		stream.end();
	});

	it("should error on stream", function (done) {

		var srcFile = new gutil.File({
			path: "test/fixtures/dynamicpaths.html",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.createReadStream("test/fixtures/dynamicpaths.html")
		});

		var stream = assetpaths({
			oldDomain : 'www.oldDomain.com',
			newDomain : 'https://www.newDomain.com',
			docRoot : 'test',
			filetypes : ['jpg', 'png', 'js', 'css']
		});

		stream.on("error", function(err) {
			should.exist(err);
			done();
		});

		stream.on("data", function (newFile) {
			newFile.contents.pipe(es.wait(function(err, data) {
				done(err);
			}));
		});

		stream.write(srcFile);
		stream.end();
	});

	it('should replace custom attributes', function(done){

		var srcFile = new gutil.File({
			path: "test/fixtures/customattrs.html",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.readFileSync("test/fixtures/customattrs.html")
		});

		var expected = new gutil.File({
			path: "test/expected/customattrs.html",
			cwd: "test/",
			base: "test/expected",
			contents: fs.readFileSync("test/expected/customattrs.html")
		});

		var stream = assetpaths({
			oldDomain : 'www.oldDomain.com',
			newDomain : 'https://www.newDomain.com',
			docRoot : 'test',
			filetypes : ['jpg', 'png', 'js', 'css'],
			templates: true,
			customAttributes: ['data-custom']
		});

		stream.on("error", function(err) {
			should.exist(err);
			done(err);
		});

		stream.on("data", function (newFile) {
			should.exist(newFile);
			should.exist(newFile.contents);
			String(newFile.contents).should.equal(String(expected.contents));
			done();
		});

		stream.write(srcFile);
		stream.end();
	});
});
