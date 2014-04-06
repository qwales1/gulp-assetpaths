 var gutil = require('gulp-util');
 var through = require('through2');

 module.exports = function(opts){

   'use strict';
   if (!opts) {
     throw new gutil.PluginError("gulp-assetpaths", "No parameters supplied");
   }
   if (!opts.filetypes || (!opts.filetypes instanceof Array)){
     throw new gutil.PluginError("gulp-assetpaths", "Missing parameter : filetypes");
   }
   if (!opts.newDomain){
     throw new gutil.PluginError("gulp-assetpaths", "Missing parameter : newDomain");
   }
   if (!opts.oldDomain){
     throw new gutil.PluginError("gulp-assetpaths", "Missing parameter : oldDomain");
   }
   if(!opts.docRoot){
     throw new gutil.PluginError("gulp-assetpaths", "Missing parameter : docRoot");
   }
   var rootRegEx  =  new RegExp('(((\\bhttp\|\\bhttps):){0,1}\\/\\/' + opts.oldDomain + ')');
   var filetypes = new RegExp('.' + opts.filetypes.join('|.'));
   //matches img tag
   var img = /(<\s*){0,1}(\bimg)/;
   //matches url in css
   var url = /((\bbackground|\bbackground-image)\s*:\s*?.*)\burl\s*\(.*?\)/;
   var attrsAndProps = [{ exp : /\bhref\s*=\s*((["{0,1}|'{0,1}]).*?\2)/gi, captureGroup : 1},
                        { exp : /((\bbackground|\bbackground-image)\s*:\s*?.*){0,1}\burl\s*((\(\s*[^\w]{0,1}(["{0,1}'{0,1}]{0,1})).*?\5\))/gi, captureGroup : 3},
                        { exp : /((<\s*){0,1}\bimg){0,1}\s*\bsrc\s*=\s*((["{0,1}|'{0,1}]).*?\4)/gi, captureGroup : 3}];

 function isRelative(string, insertIndex){
  return (string.indexOf('/') === -1 || string.indexOf('/') > insertIndex) ? true : false;
 }
 function getInsertIndex(string){
  return string.search(/^.{0,1}\s*("|')/) === -1 ? 1 : (string.search(/"|'/)+1);
 }
 function insertAtIndex(string, fragment, index){
  return [string.slice(0, index), fragment, string.slice(index)].join("");
 }
 function ignoreUrl(match){
   var regEx = /((\bhttp|\bhttps):){0,1}\/\//;
   if(regEx.test(match)){
     if((rootRegEx !== null) && (!rootRegEx.test(match))){
       return true;
     }
   }
   return false;
 }
 function processLine(line, regEx, file){
     line = line.replace(regEx.exp, function(match){
       var cGroup = arguments[regEx.captureGroup];
       if(filetypes.test(cGroup) || img.test(match) || url.test(match)){
         if(!ignoreUrl(cGroup)){
           return match.replace(cGroup, function(match){
             match = match.replace(rootRegEx, "").trim();
             return insertPath(match,file);
           });
         }
       }
       return match;
     });
     //pass back line if noop
     return line;
 }
 function countRelativeDirs(path){
    var relDirs = path.filter(function(dir){
        return dir.indexOf('..') !== -1 ? true : false;
    });
    return relDirs.length;
 }
 function anchorToRoot(string, file){
   var index = getInsertIndex(string);
   if(isRelative(string,index)){
     //if the path isn't being dynamically generated(i.e. server or in template)
     if(!(/^\s*[\(]{0,1}\s*["|']{0,1}\s*[<]/.test(string))){
       if(opts.docRoot){
         var currentPath = string.split("/");
         var relDirs = countRelativeDirs(currentPath);
         string = string.replace('../', "");             
         var fullPath = file.path.split("/").reverse().slice(1+relDirs);
         if(fullPath.indexOf(opts.docRoot) !== -1){
           while(fullPath[0] !== opts.docRoot){
             string = insertAtIndex(string, fullPath[0] + '/', index);
             fullPath = fullPath.slice(1); 
           }
         }
       }
     }
   }
   return string;
 }
 function insertPath(string, file){
   string = anchorToRoot(string, file);
   var index = getInsertIndex(string);
   if(isRelative(string, index)) {
       string = insertAtIndex(string, '/', index);
   }
   return insertAtIndex(string, opts.newDomain, index);
 }
 function assetpaths(file, enc, callback){
   // Do nothing if no contents
   if (file.isNull()) {
     this.push(file);
     return callback();
   }
   if (file.isStream()){
     return this.emit('error', new gutil.PluginError('gulp-assetpaths',  'Streaming not supported'));
   }
   if(file.isBuffer()){
     var outfileContents = '';
     var contents = file.contents.toString('utf8')
     var lineEnding = contents.search(/[\r\n]/) !== -1 ? "\r\n" : "\n";
     var lines = contents.split(lineEnding);
     lines.forEach(function(line){
       attrsAndProps.forEach(function(regEx){
         line = processLine(line, regEx, file);
       }, this);
       outfileContents += line;
     }, this);
     var outfile = file.clone();
     outfile.contents = new Buffer(outfileContents);
   }
   this.push(outfile);
   return callback();
 }
 return through.obj(assetpaths);
};
