# electron-asazuke (GUI-Asazuke)

- electron-asazukeはコマンドラインツール(Asazuke)のGUI操作を可能にします。  
- GUIの実装は、javascriptのGUIフレームワークElectronを使っています。

## アプリケーションインストール
### (widows/osx)共通

1. Asazuke(CLI)のインストール  
設定タブのAsazukeインストールをクリックして下さい。  
「Asazukeのインストールが完了しました」が表示されたらアプリを再起動します。  
⌘+q もしくはドックから終了を選択します。  
※Asazukeのインストール先を変更する場合は、ファイル選択をクリックして
新規ディレクトリを選択します。  
※ディレクトリの更新後は「パス確定」ボタンを押して下さい。

2. 対象サイトの設定  
新規プロジェクトボタンをおしてプロジェクトの設定ファイルを作成します。

3. 処理/実行  
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