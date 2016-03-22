gulpTItle = require('./package.json').name
##############################
# user variables
##############################
require('m-util')
# 注）ディレクトリ指定は"/"で終わること
SRC       = "./src/";   RESRC_SUB = ""; # サブディレクトリ設定、不要な場合は ""
DIST      = "./dist/";  DIST_SUB  = "resources/"; # サブディレクトリ設定、不要な場合は ""
# SRC       = "./";   RESRC_SUB = ""; # サブディレクトリ設定、不要な場合は ""
# DIST      = "./";   DIST_SUB  = "common/"; # サブディレクトリ設定、不要な場合は ""
VHOSTS_SRV= "localhost:49180"

isWin         = false;  # Windowsか否(条件分岐で使う予定)
isBrowserSync = false;  # BrowserSyncを使うか否
isConvertTo   = false;  convertTo = "cp932"; # 出力ソースの文字コード (utf-8|cp932|euc-jp)から選択 *cp932(shift_jisの拡張)
isStyleGuide  = false;  styleguideType = "hologram"; # (hologram|kss|styledocco|sc5styleguide)
hr            = "_".uRepeat(40);
checkStyleGuide = ->
  console.log(hr)
  console.log("\[checkStyleGuide\]")
  console.log("styleguide generate : " + isStyleGuide)
  console.log("styleguide type     : " + styleguideType)
checkStyleGuide()

## 画像パス
# IMG           = "#{DIST_SUB}img/#{RESRC_SUB}"
IMG           = "#{DIST_SUB}resources/img/"
## 変換先の指定 (To)
# DIST_HTML     = "#{DIST}#{DIST_SUB}"
DIST_HTML     = "#{DIST}"
DIST_JS       = "#{DIST}#{DIST_SUB}js/browser/#{RESRC_SUB}"
DIST_CSS      = "#{DIST}#{DIST_SUB}css/#{RESRC_SUB}"
DIST_IMG      = "#{DIST}#{IMG}"
## 変換元の指定 (from)src/
SRC_JS        = "#{SRC}resources/js/browser/#{RESRC_SUB}"
SRC_CSS       = "#{SRC}resources/css/#{RESRC_SUB}"
SRC_IMG       = "#{SRC}resources/img/"
###############################

# ファイルタイプごとに無視するファイルなどを設定
## ファイル名の拡張子を変更する、もしくは前に_(アンダーバー)をつけると除外させる設定
PATH_        = ""
# DISTPATH_    = "";
DISTPATH_    = "#{DIST}";
DISTIMGPATH_ = "";
JSONPATH_    = ""; jsonData     = ""; jsonFile="data.json"
paths =
  js:      ["#{SRC_JS}main.js","#{SRC_JS}main-sp.coffee"] # js CompileTarget
  coffeeW: ["#{SRC_JS}**/*.coffee" , "!#{SRC_JS}**/_**/*.coffee" , "!#{SRC_JS}**/_*.coffee"] # js Watch
  jsW:     ["#{SRC_JS}**/*.js" , "!#{SRC_JS}**/_**/*.js" , "!#{SRC_JS}**/_*.js"] # js Watch
  css:     ["#{SRC_CSS}**/*.styl"  , "!#{SRC_CSS}**/_**/*.styl"  , "!#{SRC_CSS}**/_*.styl", "!#{SRC_CSS}**/sprite*.styl"]
  cssW:    ["#{SRC_CSS}**/*.styl"  ,  "#{SRC_CSS}**/_**/*.styl"  , "#{SRC_CSS}**/_*.styl"] # css WatchTarget
  # img:     ["#{SRC_IMG}**/*.{png, jpg, gif}", "!#{SRC_IMG}**/sprite/**/*.png"]
  img:     ["#{SRC_IMG}**/*.png", "!#{SRC_IMG}sprite/**/*.png"] # 何故か拡張子複数条件が効かなくなった。
  html:    ["#{SRC}**/*.jade", "!#{SRC}**/_**/*.jade", "!#{SRC}**/_*.jade"]
  # sprite:  ["#{SRC}**/sprite/**/*.png"]
  #sprite:  ["#{SRC_IMG}**/sprite/sprite_*.png", "#{SRC_IMG}**/sprite/mainvisual/icon_*.png", "#{SRC_IMG}**/sprite/mobile/sprite_*.png"] # icon_*.png縛り
  sprite:  ["#{SRC_IMG}sprite/sprite_*.png"] # sprite_*.png縛り
  copy:    ["#{SRC}.htaccess",
            "#{SRC}resources/js/server/*.js",
            "#{SRC}resources/libs/**/*",
            "#{SRC_JS}libs/*.htc"]
  jsonW:   ["#{SRC}/@json/_mixin/*.json"]
  json:    ["#{SRC}/@json/"]
  clean:   ["#{DIST}**", "**/*.log", "!.git/**/*"]

checkPath = ->
  console.log(hr)
  console.log("\[checkPath\]")
  console.log("\(IMG\)")
  console.log("IMG     : " + "#{IMG}")
  console.log("\(DIST\)")
  console.log("DIST_JS : " + "#{DIST_JS}")
  console.log("DIST_CSS: " + "#{DIST_CSS}")
  console.log("DIST_IMG: " + "#{DIST_IMG}")
  console.log("\(SRC\)")
  console.log("SRC_JS  : " + "#{SRC_JS}")
  console.log("SRC_CSS : " + "#{SRC_CSS}")
  console.log("SRC_IMG : " + "#{SRC_IMG}")
  console.log()
checkPath()

#----------------------------------------------------------------------------------------
M               = require('m-require')                    # gulp require time
M.setText("load time")
console.log(hr)
# 30Sec 以上読み込みにかかるものは必要ところで読み込ませる (詳しくは"imagemin"を参照)
_               = M.require('underscore')
gulp            = M.require('gulp')
watch           = M.require('gulp-watch')                 # デフォルトのwatchだと新規ファイルをwatchしない @see http://goo.gl/Y9ALYd
os              = M.require('os')
path            = M.require('path')
gulpif          = M.require('gulp-if')
data            = M.require('gulp-data')
jade            = M.require('gulp-jade')
stylus          = M.require('gulp-stylus')
nib             = M.require('nib')                        # CSS3 extensions for Stylus
rename          = M.require('gulp-rename')                # ファイル名変更
browserify      = M.require('browserify')                 # 標準のbrowserify
transform       = M.require('vinyl-transform')
spritesmith     = M.require('gulp.spritesmith')           # sprite画像作成 ファイル名は半角英数記号（ピリオド・アンダーバー）
util            = M.require('gulp-util')
plumber         = M.require('gulp-plumber')               # エラーがあってもwatchを継続させる
pngquant        = M.require('imagemin-pngquant')          # png圧縮の為のオプティマイザ
pleeease        = M.require('gulp-pleeease')              # ベンダープレフィックスを自動補完
debug           = M.require('gulp-debug')                 # gulpデバッグ
shell           = M.require('gulp-shell')                 # コマンド実行
notify          = M.require('gulp-notify')                # デスクトップ通知 for Mac
browserSync     = M.require('browser-sync')             # ブラウザ間の同期
convertEncoding = M.require('gulp-convert-encoding')    # 文字コード変更
runSequence     = M.require('run-sequence')
through         = M.require('through2')                 # streamまわりのサポート @see http://goo.gl/nvNUVb ,http://goo.gl/IIQA4Q
if isStyleGuide
  if styleguideType == "hologram"
    hologram        = M.require('gulp-hologram')          # スタイルガイドジェネレーター(ruby ✕ html)
  if styleguideType == "kss"
    kss             = M.require('gulp-kss')               # スタイルガイドジェネレーター(ruby ✕ markdown)
  if styleguideType == "styledocco"
    styledocco      = M.require('gulp-styledocco');       # スタイルガイドジェネレーター(node ✕ html)
  if styleguideType == "sc5styleguide"
    sc5styleguide   = M.require('sc5-styleguide');        # スタイルガイドジェネレーター(node ✕ markdown)
#----------------------------------------------------------------------------------------

expand = (ext)-> rename (path) -> _.tap path, (p) -> p.extname = ".#{ext}"
mynotify = (filename) -> console.log(filename)

isWindows = ->
  platform = os.platform().toLowerCase()
  if !!platform.match('/darwin|linux/i')
    isWin = false
  else
    isWin = true

  console.log(hr);
  console.log("\[isWindows\]")
  console.log(uRpad("platform:") + platform);
  console.log(uRpad("isWin:") + isWin);
  console.log("");
  return isWin
isWindows()

handleError = (err)->
  if (err)
    util.log err.message
  else
    util.log 'handleError!'
  return

watch_hook = (path)->
  # PATH_ = (path).toString();
  PATH_ = path
  util.log(hr);
  util.log('PATH_',util.colors.yellow(PATH_));
  # err
  try
    if(isWin)
      aryPath = path.split('\\')
      # DISTPATH_ = aryPath.splice(0, (aryPath.length - 1)).join('\\')
      aryImgPath = [];
      if path.match('@images/') != null
        aryImgPath = path.split('@images\\')[1].split('\\')
    else
      aryPath = path.split('/')
      # DISTPATH_ = aryPath.splice(0, (aryPath.length - 1)).join('/')
      aryImgPath = [];
      if path.match('@images/') != null
        aryImgPath = path.split('@images/')[1].split('/')

    aryTmpImgPath = aryImgPath.splice(0, (aryImgPath.length - 1))
    imgPATH = aryTmpImgPath;
    if(aryTmpImgPath.length > 1)
      imgPATH = aryTmpImgPath.join('/')
    DISTIMGPATH_ = DIST_IMG + imgPATH + '/'
    util.log('DISTIMGPATH_',util.colors.yellow(DISTIMGPATH_));
  catch err
    console.log("watch_hook Warnning...", err)
  finally
    util.log('DISTPATH_',util.colors.yellow(DISTPATH_));

isArray = (obj) ->
  Object::toString.call(obj) == '[object Array]'

gulp.task 'title', ->
  gt = M.require('gulp-title')
  aryTitle = [
    gulpTItle
    'Doom'
    'bright_green'
  ]
  gtFnc = ->

  gt = new gt
  console.log gtFnc
  gt.go aryTitle, gtFnc
  return

gulp.task "jade-all", ->
  PATH_ = paths.html.concat(["!#{SRC}**/common-*.jade", "!./node_modules/**/*.jade"])
  gulp.start ["jade"]

gulp.task "jade", ->
  # console.log('jsonData', jsonData)
  # JSONPATH_ = path.resolve(paths.json + jsonFile)
  # console.log('JSONPATH_', JSONPATH_)
  target = PATH_
  if (!isArray(target) and PATH_.indexOf('common-') > -1)
    #  common-*.jadeの変更があった場合
    target = ["#{SRC}**/*.jade", "!#{SRC}**/common-*.jade", "!./node_modules/**/*.jade"]
  gulp.src target
  # gulp.src paths.html
  .pipe debug()
  .pipe(gulpif(!isWin, plumber({ errorHandler: notify.onError('<%= error.message %>')})))
  # .pipe(jsonData)
  # .pipe(data((file) ->
  #   delete(require.cache[JSONPATH_])
  #   require(JSONPATH_)
  # ))
  # .pipe jade pretty: true, basedir: 'src/'
  .pipe jade pretty: true, basedir: './'
  .pipe expand "html"
  .pipe(gulpif(isConvertTo, convertEncoding({to: convertTo})))
  # .pipe gulp.dest "#{DIST_HTML}"
  .pipe gulp.dest DISTPATH_
  .pipe(gulpif(isBrowserSync, browserSync.reload({stream: true})))

## for gulp-browserify
# gulp.task 'browserify', ->
#   # gulp.src paths.jsW
#   gulp.src paths.js
#     .pipe debug()
#     .pipe plumber({ errorHandler: notify.onError('<%= error.message %>')})
#     .pipe browserify
#         debug: false
#         transform: ['coffeeify', 'jadeify', 'stylify', 'debowerify']
#         extensions: ['.coffee'],
#     .pipe expand "js"
#     .pipe gulp.dest "#{DIST_JS}"


# for browserify
gulp.task "browserify", ->
  bundler = (options) ->
    transform (filename) ->
      b = browserify _.extend options, {}#watchify.args

      # watch
      #b = watchify b
      b.add filename

      # transform
      b.transform 'coffeeify'
      b.transform 'jadeify'
      b.transform 'stylify'
      b.transform 'debowerify'

      # events
      b.on 'bundle', mynotify.bind null, 'BUNDLE ' + filename
      # b.on 'bundle', mynotify.bind null, 'BUNDLE ' + filename
      b.on 'error', -> console.log "error"
      b.on 'log', -> console.log arguments
      b.on 'update', ->
        console.log "asdasd"
        bundle()
      b.bundle()

  bundle = ->
    # gulp.src paths.jsW
    gulp.src paths.js
      .pipe debug()
      .pipe(gulpif(!isWin, plumber({ errorHandler: notify.onError('<%= error.message %>')})))
      .pipe bundler extensions: ['.coffee']
      .pipe expand "js"
      .pipe gulp.dest "#{DIST_JS}"

  bundle()


gulp.task "stylus", ->
  target = paths.css
  isTargetOnly = true # 変更ファイルのみコンパイルするか否
  if (PATH_.indexOf('_mixin') > -1)
    #  css/_mixinの変更があった場合
    target = "#{SRC_CSS}*.styl"
  else if (isTargetOnly)
    target = PATH_

  # ターゲット固定
  target = "src/resources/css/index.styl";
  console.log("target", target)

  gulp.src target
    .pipe debug()
    .pipe(gulpif(!isWin, plumber({ errorHandler: notify.onError('<%= error.message %>')})))
    .pipe(stylus({use: nib(), errors: true, 'include css': true}))
    .pipe pleeease({
        minifier: false,
        fallbacks: {
            autoprefixer: ['last 4 versions']
        },
    })
    .pipe expand "css"
    .pipe gulp.dest "#{DIST_CSS}"
    # .pipe gulp.dest "#{DIST}styleguide/css/"
    # .pipe(gulpif(!isWin, shell(['chmod u+x RemoveComment.sh', './RemoveComment.sh'])))
    .pipe(gulpif(isBrowserSync, browserSync.reload({stream: true})))

gulp.task 'ple', ->
  return gulp.src '#{DIST_CSS}*.css'
    .pipe debug()
    .pipe pleeease({
        minifier: false,
        fallbacks: {
            autoprefixer: ['last 4 versions']
        },
    })
    .pipe(gulp.dest('#{DIST_CSS}'));

gulp.task "imagemin-all", ->
  PATH_ = paths.img.concat(["!./node_modules/**/*"])
  DISTIMGPATH_ = "#{DIST_IMG}"
  gulp.start ["imagemin"]

# 画像の最適化、データサイズの圧縮
imagemin = ""
gulp.task "imagemin", ->
  if imagemin == "" # <- require_once()
    imagemin = M.require('gulp-imagemin')
  target = PATH_
  gulp.src target
    .pipe debug()
    .pipe imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    })
    # .pipe gulp.dest "#{DIST_IMG}"
    .pipe gulp.dest DISTIMGPATH_
    # .pipe gulp.dest DISTPATH_
    # .pipe ifBrowserSyncReload

# imageminE = (option) ->
#   rescue imagemin(option)
# # :png
# gulp.task "imagemin-png", ->
#   gulp.src ["#{SRC_IMG}**/*.png", paths.img[1]]
#   .pipe debug()
#   .pipe imageminE(optimizationLevel: 7)
#   .pipe gulp.dest "#{DIST_IMG}"
# # :jpeg
# gulp.task "imagemin-jpeg", ->
#   gulp.src ["#{SRC_IMG}**/*.+(jpg|jpeg)", paths.img[1]]
#   .pipe debug()
#   .pipe imageminE(progressive: true)
#   .pipe gulp.dest "#{DIST_IMG}"
# # :gif
# gulp.task "imagemin-gif", ->
#   gulp.src ["#{SRC_IMG}**/*.gif", paths.img[1]]
#   .pipe debug()
#   .pipe imageminE(interlaced: false)
#   .pipe gulp.dest "#{DIST_IMG}"

# spriteに依存するタスク
gulp.task 'SpriteStylus', ['sprite'], ->
  # ファイルコピー完了後に実行される
  gulp.start ['stylus']
  return

gulp.task 'SpriteStylusCmq', ->
  runSequence('SpriteStylus', 'cmq')


# スプライト画像
gulp.task "sprite", (callback) ->
  # if isWin
  #   ifImageList = debug() # ファイル一覧表示
  # else
  #   ifImageList = shell(["chmod u+x sprite_test.sh", "./sprite_test.sh <%= file.path %>"]) # sprite画像の検証
  a = gulp.src(paths.sprite[0])
  .pipe spritesmith
    imgName: "sprite_main.png"               # 生成されるpng
    cssName: "sprite_main.styl"              # 生成されるstyl
    # imgPath: "/#{IMG}sprite_main.png"        # 生成されるstylに記載されるパス
    imgPath: "/common/images/sprite_main.png"        # 生成されるstylに記載されるパス
    algorithm: "binary-tree"
    cssFormat: "stylus"
    padding: 4
    # cssVarMap: (sprite) ->
    #   sprite.name = 'main-' + sprite.name;
    # cssOpts:
    #   prefixMixin: 'main'
  .on 'end', ->
    # callbackを実行してgulpにタスク完了を通知
    callback()
  .on 'error', ->
    callback()
  a.img.pipe gulp.dest "#{SRC_IMG}"            # imgNameで指定したスプライト画像の保存先
  a.css.pipe gulp.dest "#{SRC_CSS}"            # imgNameで指定したスプライトcssの保存先
# MainVisual用
# gulp.task "spriteMV", ->
#   if isWin
#     ifImageList = debug() # ファイル一覧表示
#   else
#     ifImageList = shell(["chmod u+x sprite_test.sh", "./sprite_test.sh <%= file.path %>"]) # sprite画像の検証
#   a = gulp.src(paths.sprite[1], {read: false})
#   .pipe ifImageList
#   .pipe spritesmith
#     imgName: "sprite_mainvisual.png"               # 生成されるpng
#     cssName: "sprite_mainvisual.styl"              # 生成されるstyl
#     imgPath: "/#{IMG}sprite_mainvisual.png"        # 生成されるstylに記載されるパス
#     algorithm: "binary-tree"
#     cssFormat: "stylus"
#     padding: 4
#     cssVarMap: (sprite) ->
#       sprite.name = "sp-" + sprite.name
#
#     cssOpts:
#       prefixMixin: "sp"
#   a.img.pipe gulp.dest "#{SRC_IMG}"            # imgNameで指定したスプライト画像の保存先
#   a.css.pipe gulp.dest "#{SRC_CSS}"            # imgNameで指定したスプライトcssの保存先
# # SP用
# gulp.task "spriteSP", ->
#   if true
#     ifImageList = debug() # ファイル一覧表示
#   else
#     ifImageList = shell(["chmod u+x sprite_test.sh", "./sprite_test.sh <%= file.path %>"]) # sprite画像の検証
#   a = gulp.src(paths.sprite[2], {read: false})
#   .pipe ifImageList
#   .pipe spritesmith
#     imgName: "sprite_mobile.png"               # 生成されるpng
#     cssName: "sprite_mobile.styl"              # 生成されるstyl
#     imgPath: "/#{IMG}sp/sprite_mobile.png"     # 生成されるstylに記載されるパス
#     algorithm: "binary-tree"                    # top-down|left-right|diagonal|alt-diagonal|binary-tree @see https://goo.gl/iGa7j7
#     cssFormat: "stylus"
#     padding: 4
#     cssVarMap: (sprite) ->
#       sprite.name = "sp-" + sprite.name
#       return false
#     cssOpts:
#       prefixMixin: "sp"
#   a.img.pipe gulp.dest "#{SRC_IMG}sp/"            # imgNameで指定したスプライト画像の保存先
#   a.css.pipe gulp.dest "#{SRC_CSS}"            # imgNameで指定したスプライトcssの保存先

gulp.task "cmq", ->
  cmq             = require 'gulp-combine-media-queries' # メディアクエリの整理
  gulp.src("#{DIST_CSS}*.css", {read: false})
  .pipe debug()
  .pipe cmq({
    log: true
  })
  .pipe gulp.dest "#{DIST_CSS}"


gulp.task "styleguide", ->
  if isStyleGuide
    if styleguideType == "hologram"
      gulp.src "config/hologram/hologram_config.yml"
        .pipe hologram()
    if styleguideType == "kss"
      gulp.src paths.css
        .pipe kss({
            overview: "config/kss/styleguide.md",
            template: 'config/kss/template/'
        })
        .pipe gulp.dest "#{DIST}styleguide/"
    if styleguideType == "styledocco"
      # 別途コマンドをインストール
      #npm i -fg styledocco
      gulp.src './dest/styleguide/css/*.css'
        .pipe styledocco({
          out: './dest/styledocco/',
          name: 'styleguide'
        })
    if styleguideType == "sc5styleguide"
      gulp.src paths.css
        .pipe sc5styleguide()


gulp.task "copy", ->
  gulp.src(paths.copy, {read: true, base: "#{SRC}"})
  .pipe debug()
  .pipe gulp.dest("#{DIST}")


gulp.task 'browser-sync', ->
  if isBrowserSync
    browserSync.init(null, {
      # proxy: 'localhost:49180' # Webアプリケーションが動作しているアドレス ※gulpサーバーでは静的なページしか扱えないので、PHPを動かしたい場合などはコレを指定する
      proxy: VHOSTS_SRV # Webアプリケーションが動作しているアドレス ※gulpサーバーでは静的なページしか扱えないので、PHPを動かしたい場合などはコレを指定する
    })
  return

gulp.task 'jsonConcat', ->
  extend     = require('gulp-extend')
  jsonFormat = require('gulp-json-format')
  # stream = gulp.src('./@json/_mixin/*.json')
  gulp.src('./@json/_mixin/*.json')
  .pipe(extend(jsonFile))
  .pipe(jsonFormat(4))
  .pipe(gulp.dest('./@json/'))

# 初期化 http://goo.gl/hihz9g
gulp.task "clean", ->
  gulp.src(paths.clean, {read: false})
  .pipe rimraf()


gulp.task "auto-reload", ->
  argv            = require('yargs').argv                  # for args parsing
  spawn           = require('child_process').spawn
  spawnChildren = (e) ->
    # kill previous spawned process
    p.kill()  if p
    # `spawn` a child `gulp` process linked to the parent `stdio`
    p = spawn("gulp", [ argv.task ],
      stdio: "inherit"
    )
  p = undefined
  gulp.watch "gulpfile.coffee", spawnChildren
  spawnChildren()

gulp.task 'watch', ->
#   watch [paths.jsW[0], "#{SRC_JS}**/*.coffee", "#{SRC_JS}**/*.js", "#{SRC}**/_*/*"],(e) -> watch_hook(e.path); gulp.start ["browserify"] # "#{SRC_JS}**/*.coffee" and ("_mixin/", "_theme/"...)
  watch paths.cssW ,                                            (e) -> watch_hook(e.path); gulp.start ["stylus", "styleguide"]
  # watch [paths.html[0], "#{SRC}**/_*.jade"],                  (e) -> watch_hook(e.path); gulp.start ["jade", "htmllint"]
  watch [paths.html[0], "#{SRC}**/_*.jade"],                    (e) -> watch_hook(e.path); gulp.start ["jade"]
  # watch paths.sprite[0] ,                                       (e) -> watch_hook(e.path); gulp.start ["sprite",   "stylus"]
  watch paths.sprite[0] ,                                       (e) -> watch_hook(e.path); gulp.start ["SpriteStylus"]
  # watch paths.sprite[1] ,                                       (e) -> watch_hook(e.path); gulp.start ["spriteMV", "stylus"]
  # watch paths.sprite[2] ,                                       (e) -> watch_hook(e.path); gulp.start ["spriteSP", "stylus"]
  watch paths.img ,                                             (e) -> watch_hook(e.path); gulp.start ["imagemin"]
  # watch paths.img ,                                             (e) -> watch_hook(e.path); gulp.start ["imagemin-png", "imagemin-jpeg", "imagemin-gif"]
  # watch "#{DIST_CSS}*.css" ,                                    (e) -> watch_hook(e.path); gulp.start ["ple"]
  watch paths.copy ,                                            (e) -> watch_hook(e.path); gulp.start ["copy"]
  watch paths.jsonW ,                                           (e) -> watch_hook(e.path); gulp.start ["jsonConcat"]
  # watch 'gulpfile.coffee' ,                                     (e) -> watch_hook(e.path); gulp.start ['auto-reload']

  # Task Kick
  gulp.watch("#{SRC}/+task/jade-all.tsk"     ,["jade-all"])
  gulp.watch("#{SRC}/+task/imagemin-all.tsk" ,["imagemin-all"])
  gulp.watch("#{SRC}/+task/build.tsk"        ,["build"])
  gulp.watch("#{SRC}/+task/copy.tsk"         ,["copy"])

# gulp.task "default",["title", "browser-sync", "watch"]
gulp.task "default",["title", "watch"]
# gulp.task "build", ["imagemin", "stylus", "browserify", "jade-all"]
# gulp.task "build", ["title", "SpriteStylusCmq", "browserify", "jade-all"]
gulp.task "build", ["title", "SpriteStylusCmq", "jade-all"]
# gulp.task 'concat', ['cmq']
# gulp.task 'upload', ['sftp-upload']
