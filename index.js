 var gutil = require('gulp-util');
 var through = require('through2');

 module.exports = function(opts){

   'use strict';
    var rootRegEx;


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

   var filetypes = new RegExp('.' + opts.filetypes.join('|.'));
   var rootRegEx = setReplacementDomain(opts.oldDomain);
   var attrsAndProps = [
    { exp : /(<\s*)(.*?)\bhref\s*=\s*((["{0,1}|'{0,1}]).*?\4)(.*?)>/gi,
      captureGroup : 3,
      templateCheck : /((\bdownload)(?=(.*?)\bhref\s*=))|((\bhref\s*=)(?=(.*?)\bdownload))/
    },
    { exp : /((\bbackground|\bbackground-image)\s*:\s*?.*){0,1}\burl\s*((\(\s*[^\w]{0,1}(["{0,1}'{0,1}]{0,1})).*?\5\))/gi,
      captureGroup : 3,
      templateCheck : /((\bbackground|\bbackground-image)\s*:\s*?.*)\burl\s*\(.*?\)/
    },
    { exp : /((<\s*){0,1}\bscript)(.*?)\bsrc\s*=\s*((["{0,1}|'{0,1}]).*?\5)/gi,
      captureGroup : 4,
      templateCheck : /(<\s*){0,1}(\bscript)(.*?)\bsrc\s*=\s*/
    },
    { exp : /((<\s*){0,1}\bimg)(.*?)\bsrc\s*=\s*((["{0,1}|'{0,1}]).*?\5)/gi,
      captureGroup : 4,
      templateCheck : /(<\s*){0,1}(\bimg)(.*?)\bsrc\s*=\s*/
    },
    { exp: /(:\s*("(.*?)"))/gi,
      captureGroup : 2,
      templateCheck: false
    }];
 function setReplacementDomain(string){
  if(isRelative(opts.oldDomain)){
    return new RegExp('(((\\bhttp\|\\bhttps):){0,1}\\/\\/' + string + ')');
  } else {
    return new RegExp(string);
  }

 }
 function isRelative(string, insertIndex){
  return (string.indexOf('/') === -1 || string.indexOf('/') > insertIndex) ? true : false;
 }
 function getInsertIndex(string){
  if(string.search(/^.{0,1}\s*("|')/) !== -1){
     //check to see if template not using interpolated strings
     var nonInter = /["|']\s*[+|.][^.]/.exec(string);
     if(nonInter){
      return string.search(/"|'/) === nonInter.index ? nonInter.index : (nonInter.index-1)
     }
     return (string.search(/"|'/)+1);
  }
  return 1;
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
 function replacementCheck(cGroup, match, regEx){
    if(!opts.templates){
       return filetypes.test(cGroup);
    }
    if(regEx.templateCheck){
      return filetypes.test(cGroup) || regEx.templateCheck.test(match);
    } else {
      return filetypes.test(cGroup);
    }
 }
 function processLine(line, regEx, file){
     line = line.replace(regEx.exp, function(match){
       var cGroup = arguments[regEx.captureGroup];
       if(replacementCheck(cGroup, match, regEx)){
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
     if(!(/^\s*[\(]{0,1}\s*["|']{0,1}\s*[<|{|.|+][^.]/.test(string))){
       if(opts.docRoot){
         var currentPath = string.split("/");
         var relDirs = countRelativeDirs(currentPath);
         string = string.replace(/\.\.\//g,"");
         relDirs = relDirs > 0 ? relDirs : relDirs+1;
         var fullPath = file.path.split("/").reverse().slice(relDirs);

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
   var string = anchorToRoot(string, file);
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
