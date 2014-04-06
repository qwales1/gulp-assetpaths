gulp-assetpaths
===============

Change paths of assets from one environment to another
Works for anything included with href, src, or url attributes

      var assetpaths = require('gulp-assetpaths');
        gulp.task('path-alter', function(){
            return gulp.src(['./*.html'])
                    .pipe(assetpaths({
                      newDomain: 'www.thenewdomain.com',
                      oldDomain : 'www.theolddomain.com',
                      docRoot : 'public_html',
                      filetypes : ['jpg','jpeg','png','pdf', 'js', 'css']
                     }))
                    .pipe(gulp.dest('../dist'));
        });
        
### options.newDomain 

the new environment path

### options.oldDomain 

the old path to replace. 

### options.docRoot

this will anchor all relative paths to the document root of the project. An example would be in css you might include 
``url(images/example.png)`` in a selector. By setting the docRoot property all the directories up to the document root will be prepended to the images/example.png path giving you:
``url(http://www.thenewdomain.com/css/images/example.png)``


### options.filetypes

Array of filetypes to change the path for.
