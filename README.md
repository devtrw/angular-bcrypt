angular-bcrypt
===

This wraps [dcodeIO/bcrypt.js](https://github.com/dcodeIO/bcrypt.js) with an angular module
and provides a service for easy integration into an AngularJS environment.


Installation
===

1. Install the source files using bower: `bower install angular-bcrypt`
2. Include either source file in `dist/`
  
  __Note:__ _Both files have the same content however one has a hash of the file appended to 
  the filename and will change with each version. The revisioned filename is referenced in 
  the `main` section of the contained `bower.json` for use with automated build tools._
3. Require the `dtrw.bcrypt` module in your Angular app
4. Inject the `bcrypt` service anywhere needed using Angular's dependency injection


Usage
===

See the [decodeIO/bcrypt.js](https://github.com/dcodeIO/bcrypt.js) repository for 
API documentation.

License
===
See the included LICENSE file
