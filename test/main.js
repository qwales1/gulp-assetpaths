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

	var expectedStatic = new gutil.File({
		path: "test/expected/staticpaths.html",
		cwd: "test/",
		base: "test/expected",
		contents: fs.readFileSync("test/expected/staticpaths.html")
	});
	var expectedStaticNested = new gutil.File({
		path: "test/expected/nested/staticpaths.html",
		cwd: "test/",
		base: "test/expected",
		contents: fs.readFileSync("test/expected/nested/staticpaths.html")
	});
	var expectedDynamic = new gutil.File({
		path: "test/expected/staticpaths.html",
		cwd: "test/",
		base: "test/expected",
		contents: fs.readFileSync("test/expected/dynamicpaths.html")
	});
	var expectedTemplates = new gutil.File({
		path: "test/expected/templates.js",
		cwd: "test/",
		base: "test/expected",
		contents: fs.readFileSync("test/expected/templates.js")
	});
	var expectedNoJS = new gutil.File({
		path: "test/expected/nojs.html",
		cwd: "test/",
		base: "test/expected",
		contents: fs.readFileSync("test/expected/nojs.html")
	});
	var expectedNoCSS = new gutil.File({
		path: "test/expected/nocss.css",
		cwd: "test/",
		base: "test/expected",
		contents: fs.readFileSync("test/expected/nocss.css")
	});
  var oldDomainRel = new gutil.File({
		path: "test/expected/oldDomainRel.html",
		cwd: "test/",
		base: "test/expected",
		contents: fs.readFileSync("test/expected/oldDomainRel.html")
	});
	var expectedJSON = new gutil.File({
		path: "test/expected/test.json",
		cwd: "test/",
		base: "test/expected",
		contents: fs.readFileSync("test/expected/test.json")
	});
	it("should produce expected file via buffer static", function (done) {

		var srcFile = new gutil.File({
			path: "test/fixtures/staticpaths.html",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.readFileSync("test/fixtures/staticpaths.html")
		});

		var stream = assetpaths(
				{oldDomain : 'www.oldDomain.com',
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
	it("should produce expected file via buffer", function (done) {

		var srcFile = new gutil.File({
			path: "test/fixtures/nested/staticpaths.html",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.readFileSync("test/fixtures/nested/staticpaths.html")
		});

		var stream = assetpaths(
				{oldDomain : 'www.oldDomain.com',
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
	it("should produce expected file via buffer", function (done) {

		var srcFile = new gutil.File({
			path: "test/fixtures/dynamicpaths.html",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.readFileSync("test/fixtures/dynamicpaths.html")
		});

		var stream = assetpaths(
				{oldDomain : 'www.oldDomain.com',
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
	it("should produce expected file via buffer", function (done) {

		var srcFile = new gutil.File({
			path: "test/fixtures/nojs.html",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.readFileSync("test/fixtures/templates.js")
		});

		var stream = assetpaths(
				{oldDomain : 'www.oldDomain.com',
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
	it("should produce expected file via buffer", function (done) {

		var srcFile = new gutil.File({
			path: "test/fixtures/nocss.css",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.readFileSync("test/fixtures/nocss.css")
		});
		var stream = assetpaths(
				{oldDomain : 'www.oldDomain.com',
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
	it("should produce expected file via buffer", function (done) {

		var srcFile = new gutil.File({
			path: "test/fixtures/nojs.html",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.readFileSync("test/fixtures/nojs.html")
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
		var stream = assetpaths(
				{oldDomain : '../assets',
				 newDomain : '//www.newDomain.com',
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
		var stream = assetpaths(
				{oldDomain : 'https://www.oldDomain.com',
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
		var stream = assetpaths(
			    {oldDomain : 'www.oldDomain.com',
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





	/*
	it("should produce expected file via stream", function (done) {

		var srcFile = new gutil.File({
			path: "test/fixtures/hello.txt",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.createReadStream("test/fixtures/hello.txt")
		});

		var stream = pathAlter("World");

		stream.on("error", function(err) {
			should.exist(err);
			done();
		});

		stream.on("data", function (newFile) {

			should.exist(newFile);
			should.exist(newFile.contents);

			newFile.contents.pipe(es.wait(function(err, data) {
				should.not.exist(err);
				data.should.equal(String(expectedFile.contents));
				done();
			}));
		});

		stream.write(srcFile);
		stream.end();
	});
	*/
});
