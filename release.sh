# submodule更新
function submodule_update() {
  \rm -rfv node_modules/ace-func;
  \rm -rfv node_modules/app-conf;
  \rm -rfv node_modules/jquery-file-tree;
  \rm -rfv node_modules/smalltalk;
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
