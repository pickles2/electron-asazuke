# marble Scraper

- GUIの実装は、javascriptのGUIフレームワークElectronを使っています。

## アプリケーションインストール
### (windows/osx)共通

1. コマンドラインツールのインストール  
設定タブのコマンドラインツールのインストールをクリックして下さい。  
「コマンドラインツールのインストールが完了しました」が表示されたらアプリを再起動します。  
⌘+q もしくはドックから終了を選択します。  
※コマンドラインツールのインストール先を変更する場合は、ファイル選択をクリックして
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
$ node release.js
```

### windows版とosx版の違い
- AsazukeConf.phpがシムリンク/実態ファイル
- setting.json内パス記述（パスセパレータの違いなど）
