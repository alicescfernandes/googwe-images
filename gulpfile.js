const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const terser = require('gulp-terser');
const rename = require("gulp-rename")

sass.compiler = require('node-sass');
const sassOptions = {outputStyle: 'compressed'};
const autoPrefixerOptions = {
    cascade:false
}

const terserOptions = {
  mangle: true
}


const svgoOptions = 
{
  "comment": "This is the settings file for the SVGO Compressor Plugin. For more info, please check <https://github.com/BohemianCoding/svgo-compressor>",
  "pretty": false,
  "indent": 2,
  "floatPrecision": 8,
  "plugins": [
    {
      "name": "removeDoctype",
      "enabled": true
    },
    {
      "name": "removeXMLProcInst",
      "enabled": true
    },
    {
      "name": "removeComments",
      "enabled": true
    },
    {
      "name": "removeMetadata",
      "enabled": true
    },
    {
      "name": "removeXMLNS",
      "enabled": false
    },
    {
      "name": "removeEditorsNSData",
      "enabled": true
    },
    {
      "name": "cleanupAttrs",
      "enabled": true
    },
    {
      "name": "inlineStyles",
      "enabled": true
    },
    {
      "name": "minifyStyles",
      "enabled": true
    },
    {
      "name": "convertStyleToAttrs",
      "enabled": true
    },
    {
      "name": "cleanupIDs",
      "enabled": true
    },
    {
      "name": "prefixIds",
      "enabled": false
    },
    {
      "name": "removeRasterImages",
      "enabled": true
    },
    {
      "name": "removeUselessDefs",
      "enabled": true
    },
    {
      "name": "cleanupNumericValues",
      "enabled": true
    },
    {
      "name": "cleanupListOfValues",
      "enabled": true
    },
    {
      "name": "convertColors",
      "enabled": true
    },
    {
      "name": "removeUnknownsAndDefaults",
      "enabled": true
    },
    {
      "name": "removeNonInheritableGroupAttrs",
      "enabled": true
    },
    {
      "name": "removeUselessStrokeAndFill",
      "enabled": true
    },
    {
      "name": "removeViewBox",
      "enabled": false
    },
    {
      "name": "cleanupEnableBackground",
      "enabled": true
    },
    {
      "name": "removeHiddenElems",
      "enabled": false
    },
    {
      "name": "removeEmptyText",
      "enabled": true
    },
    {
      "name": "convertShapeToPath",
      "enabled": true
    },
    {
      "name": "moveElemsAttrsToGroup",
      "enabled": true
    },
    {
      "name": "moveGroupAttrsToElems",
      "enabled": true
    },
    {
      "name": "collapseGroups",
      "enabled": true
    },
    {
      "name": "convertPathData",
      "enabled": true
    },
    {
      "name": "convertTransform",
      "enabled": true
    },
    {
      "name": "removeEmptyAttrs",
      "enabled": true
    },
    {
      "name": "removeEmptyContainers",
      "enabled": true
    },
    {
      "name": "mergePaths",
      "enabled": true
    },
    {
      "name": "removeUnusedNS",
      "enabled": true
    },
    {
      "name": "sortAttrs",
      "enabled": true
    },
    {
      "name": "removeTitle",
      "enabled": true
    },
    {
      "name": "removeDesc",
      "enabled": true,
      "params": {
        "removeAny": true
      }
    },
    {
      "name": "removeDimensions",
      "enabled": true
    },
    {
      "name": "removeAttrs",
      "enabled": false
    },
    {
      "name": "removeElementsByAttr",
      "enabled": true
    },
    {
      "name": "addClassesToSVGElement",
      "enabled": false
    },
    {
      "name": "removeStyleElement",
      "enabled": true
    },
    {
      "name": "removeScriptElement",
      "enabled": true
    },
    {
      "name": "addAttributesToSVGElement",
      "enabled": false
    }
  ]
}
gulp.task('default', function () {
    return gulp.src('./src/scss/**/*.scss')
    .pipe(autoprefixer(autoPrefixerOptions))
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(gulp.dest('./css'));
});

gulp.task('js',function() {

    return gulp.src('src/js/*.js')
      .pipe(terser(terserOptions))
      .pipe(rename({
        suffix: ".min",
        extname: ".js"
      }))
      .pipe(gulp.dest('js'))
  
  
});

gulp.watch(['src/**'], gulp.parallel(["default","js"]));