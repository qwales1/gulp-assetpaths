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
                      filetypes : ['jpg','jpeg','png','ico','gif','js','css']
                     }))
                    .pipe(gulp.dest('../dist'));
        });
        
### options.newDomain 

the new domain

### options.oldDomain 

the old domain to replace if it was a full path. Anything that doesn't match this domain will be ignored so if you use CDNs for third party code those paths will not be changed.

### options.docRoot

this will anchor all relative paths to the document root of your project. An example would be in your css file you include 
``url(images/example.png)`` in a selector. All the directories up to the document root will be prepended to the images/example.png path giving you:
``url(http://www.thenewdomain.com/css/images/example.png)``


### options.filetypes

Array of filetypes to change the path for.

## Use

I used this to convert websites to start serving their static assets from a CDN. 

NOTE: This plugin assumes that any paths in a database or other other data sources are relative to the root directory if you are using server side or client side templating. Full paths in the database will give you the wrong path.

``/assets/images/image.png - OK``

``http://www.oldDomain.com/assets/images/image.png - FAIL``

``assets/images/image.png - FAIL``

Again that is only for dynamically generated paths. All of those examples in code will be replaced correctly.

