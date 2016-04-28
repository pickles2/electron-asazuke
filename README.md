# electron-asazuke (GUI-Asazuke)

- electron-asazukeはコマンドラインツール(Asazuke)のGUI操作を可能にします。  
- GUIの実装は、javascriptのGUIフレームワークElectronを使っています。

## アプリケーションインストール
### (windows/osx)共通

1. Asazuke(CLI)のインストール  
設定タブのAsazukeインストールをクリックして下さい。  
「Asazukeのインストールが完了しました」が表示されたらアプリを再起動します。  
⌘+q もしくはドックから終了を選択します。  
※Asazukeのインストール先を変更する場合は、ファイル選択をクリックして
新規ディレクトリを選択します。  
※ディレクトリの更新後は「パス確定」ボタンを押して下さい。

2. 対象サイトの設定  
新規プロジェクトボタンをおしてプロジェクトの設定ファイルを作成します。

3. サイトマップCSVの定義の設定
AsazukeConfCsvCols.phpがCSVの設定になります。左側に表示されるファイルを選択して  
CSVの設定をサイトに合う形で修正して下さい。CSSセレクタを使っています。  
変更した内容を反映させるにはCtrl+s or Command+s を押すことで保存されます。

4. 処理/実行  
サイトスキャン、HTMLダウンロード、サイトマップCSV作成、WEBスクレイピングが実行できます。
 

## 開発者向け実行方法
- 実行
```
 $ npm i -g electron-prebuilt
 $ electron .
```

 
- ビルド
```
$ node release.js [(win|mac),(ia32|x64)]
```

### windows版とosx版の違い
- AsazukeConf.phpがシムリンク/実態ファイル
- setting.json内パス記述（パスセパレータの違いなど）

- 設定ファイルが展開されるディレクトリ(setting.json)  　

|setting.jsonの保存先||
|:--|:--|
|windows|%userprofile%\AppData\Roaming\electron-asazuke\setting.json|  
|osx|~"/Library/Application Support/electron-asazuke/setting.json"|  


### npmコマンド

|コマンド|説明|
|:--|:--|
|npm i(install)|npm モジュールインストール|
|npm start| electron実行|
|npm run up| electron実行(サブモジュールの再インストール)|
|npm run submodule_update | サブモジュール更新 |

## 更新履歴 - Change log

### v0.0.4 (2016年4月28日)
- Asazukeのタスク起動方法変更、`php index.php ~`に変更
- SiteScanの見た目まわりの調整
- ページ切り替えると中断しているように見える問題などへの対応

(過去バージョンとのv0.0.3以前と互換性がありません）

## ライセンス - License

MIT License


## 作者 - Author

- Misaki Shibata <misaki.pink@gmail.com>