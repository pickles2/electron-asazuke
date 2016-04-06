# submodule更新
function submodule_update() {
  for dirname in `ls submodules`; do
    \rm -rfv node_modules/${dirname};
  done
  npm i;
}
function copy_shareDir() {
#   \rm -rfv /Users/mac/share/bin
#  dir="/Users/mac/share/`date +'%Y%m%d-%H%M%S'`/"
#   echo ${dir}
#  mkdir ${dir}
#  cp -Rfpav bin ${dir}
  exit 0;
}
function build_all(){
  node release.js win32 x64;
  node release.js win32 ia32;
  node release.js mac x64;
}
