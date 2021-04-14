# Voicemail to LINE

留守番電話のメッセージを音声認識して、文字として LINE に通知する

## 準備

事前に以下の準備をしておいてください。

- Twilio アカウント（まだ作成していない方は、[こちら](https://cloudapi.kddi-web.com/signup)から作成できます）
- Twilio CLI のインストール（[こちらの記事](https://qiita.com/mobilebiz/items/456ce8b455f6aa84cc1e)を参考にしてください）
- Twilio CLI サーバーレスプラグインのインストール（[こちらの記事](https://qiita.com/mobilebiz/items/fb4439bf162098e345ae)を参考にしてください）
- LINE デベロッパーアカウント（まだ作成していない方は[こちら](https://account.line.biz/signup)から作成できます）

## ソースコードの準備

今回のプログラムは、すでに GitHub 上に公開されていますので、そちらを使って作業をしていきましょう。

- 適当な作業ディレクトリに移動します。
- 以下のコマンドでプログラムを取得します。

```sh
git clone https://github.com/mobilebiz/voicemail-to-line.git
```

- 設定情報を設定しますので、以下のコマンドをつかって設定情報のサンプルをコピーします。

```sh
cd voicemail-to-line
cp .env.sample .env
```

- コピーした`.env`をエディタで開き、以下の内容で更新します。

| 項目名            | 内容                                           |
| :---------------- | :--------------------------------------------- |
| ACCOUNT_SID       | Twilio のアカウント SID（AC から始まる文字列） |
| AUTH_TOKEN        | 同じく Auth Token                              |
| LINE_ACCESS_TOKEN | 後ほど更新します                               |
| LINE_USER_ID      | 後ほど更新します                               |

## LINE チャンネルの作成

- LINE デベロッパーコンソールに[ログイン](https://account.line.biz/login)します。
- 新しいプロバイダーを作成します（名前はなんでもよいです）。
- プロバイダーが作成できたら、Messaging API チャンネルを作成します。
- **チャンネル名**は、「留守電くん」とします。
- **チャンネル説明**には、適当な説明文を入力します。
- **大分類**と**中分類**を適当に選択します。
- 利用規約の同意にチェックをして、**作成**ボタンを押します。
- さらにダイアログが２回表示されますので、それぞれに応答してチャンネルを作成します。

## チャンネルアクセストークンを発行

- **Messaging API** タブに移動します。
- 画面をスクロールしていき、**チャンネルアクセストークン**セクションで、**発行**ボタンを押します。
- 発行されたチャンネルアクセストークンをコピーし、先程の`.env`ファイルの`LINE_ACCESS_TOKEN`の値として記載します。

## デプロイ

<font color='red'>デプロイするときは、Twilio CLI プロファイルが対象の Twilio プロジェクトのものであることを確認してください。</font>  
違うプロファイルでデプロイをすると、間違ったプロジェクト内に Functions ができてしまいます。プロファイルを切り替えるときは、`twilio profiles:use プロファイル名`で行います。

- 以下のコマンドを使って、プログラムをデプロイします。

```sh
twilio serverless:deploy --force
```

- 以下のような感じでデプロイがされれば成功です。

```sh
Deploying functions & assets to the Twilio Runtime

Account         ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Token           28e7****************************
Service Name    VoiceMailtoLINE
Environment     dev
Root Directory  /Users/katsumi/Documents/workspace/line/VoiceMailtoLINE
Dependencies    @line/bot-sdk, twilio
Env Variables   LINE_ACCESS_TOKEN, LINE_USER_ID
Runtime         undefined

✔ Serverless project successfully deployed

Deployment Details
Domain: voicemailtoline-XXXX-dev.twil.io
Service:
   VoiceMailtoLINE (ZS9fe72361dc5e9ef94062dd7ec743ee44)
Environment:
   dev (ZE57897798875dbaef2d85f2c44b8953a4)
Build SID:
   ZB0f6fe70c169bf0028c604ed55f43378d
Runtime:
   node12
View Live Logs:
   https://www.twilio.com/console/assets/api/ZS9fe72361dc5e9ef94062dd7ec743ee44/environment/ZE57897798875dbaef2d85f2c44b8953a4
Functions:
   https://voicemailtoline-XXXX-dev.twil.io/send-to-line
   https://voicemailtoline-XXXX-dev.twil.io/user
Assets:

```

最後の方に表示される`Functions:`の URL（ https://voicemailtoline-XXXX-dev.twil.io/user ）を控えておいてください（XXXX のところに数字が入ります）。

## LINE チャンネルの Webhook を設定

- LINE デベロッパーコンソールの **Messaging API** の中にある、**Webhook URL** の **編集** ボタンを押します。
- 先程控えておいた URL を入力して、**更新**ボタンを押します。
- **Webhook の利用** を有効にします。

## LINE チャンネルの友達登録

- LINE デベロッパーコンソールの **Messaging API** の中にある QR コードを使って、このチャンネルを友達登録します。

## LINE のユーザ ID を調べる

メッセージを通知するために、自分の LINE ユーザ ID を調べましょう。

- Twilio の管理コンソールに[ログイン](https://jp.twilio.com/login/kddi-web)します。
- 左側のサービスアイコン（ドットが３つ表示されているアイコン）を押して、スライドメニューから **Functions** を選択します。
- **Service** を選択します。
- **VoiceMailtoLINE** を選択します。
- 画面右下の方にある、**Enable live logs** をクリックして、ログを有効化します（表示が **Disable live logs** になればログが有効です）。
- 先程友達登録した **留守電くん** で何かメッセージを入力してみます。
- Twilio 側のログに、`userId` が表示されるので、これをコピーして、`.env` ファイルの `LINE_USER_ID` の値として記載します。

## 再度デプロイ

環境変数を更新したため、再度 Twilio 上にデプロイが必要です。

- 以下のコマンドを使って、プログラムをデプロイします。

```sh
twilio serverless:deploy --force
```

## 録音フローを作成

今回は、Twilio Studio を使ってメッセージを取得します。なお、音声を文字にする部分については、\<Gather>動詞を使っていきます。

- Twilio 管理コンソールのサービスアイコンを押して、Studio メニューを開きます。
- **Create new Flow**ボタンを押します。
- **FLOW NAME** 欄に「Voicemail to LINE」と入力して **Next** ボタンを押します。
- テンプレートの一覧から **Import from JSON**　を選択して、**Next** ボタンを押します。
- すでに入力されている `{}` を削除し、以下の JSON を貼り付けます。

```json
{
  "description": "Voicemail to LINE",
  "states": [
    {
      "name": "Trigger",
      "type": "trigger",
      "transitions": [
        {
          "event": "incomingMessage"
        },
        {
          "next": "gather_1",
          "event": "incomingCall"
        },
        {
          "event": "incomingRequest"
        }
      ],
      "properties": {
        "offset": {
          "x": 0,
          "y": 0
        }
      }
    },
    {
      "name": "gather_1",
      "type": "gather-input-on-call",
      "transitions": [
        {
          "event": "keypress"
        },
        {
          "next": "function_1",
          "event": "speech"
        },
        {
          "event": "timeout"
        }
      ],
      "properties": {
        "voice": "Polly.Mizuki",
        "speech_timeout": "auto",
        "offset": {
          "x": 50,
          "y": 270
        },
        "loop": 1,
        "finish_on_key": "#",
        "say": "お電話ありがとうございます。只今のお時間は留守番電話にてご用件を伺っております。お手数ですが、メッセージを３０秒以内に残してください。\nそれではどうぞ。",
        "language": "ja-JP",
        "stop_gather": true,
        "gather_language": "ja-JP",
        "profanity_filter": "true",
        "timeout": 5
      }
    },
    {
      "name": "function_1",
      "type": "run-function",
      "transitions": [
        {
          "event": "success"
        },
        {
          "event": "fail"
        }
      ],
      "properties": {
        "service_sid": "",
        "environment_sid": "",
        "offset": {
          "x": 50,
          "y": 580
        },
        "function_sid": "",
        "parameters": [
          {
            "value": "{{widgets.gather_1.SpeechResult}}",
            "key": "message"
          },
          {
            "value": "{{trigger.call.From}}",
            "key": "from"
          }
        ],
        "url": "https://voicemailtoline-xxxx-dev.twil.io/send-to-line"
      }
    }
  ],
  "initial_state": "Trigger",
  "flags": {
    "allow_concurrent_calls": true
  }
}
```

- **Next** ボタンを押します。
- **function_1** ウィジェットを選択して、プロパティページを開きます。
- **SERVICE** のプルダウンから「VoiceMailtoLINE」を選択します。
- **ENVIRONMENT** のプルダウンから「dev-environment」を選択します。
- **FUNCTION** のプルダウンから「/send-to-line」を選択します。
- **Save** ボタンを押します。

フローをパブリッシュします。

- 画面上部にある **Publish** ボタンを押します。
- 確認のダイアログが表示されるので、**Publish** ボタンを押します。

## 電話番号の購入

日本の番号を購入するためには、事前に Bundles の登録が必要です。なお、登録してから購入できるまで、数日かかります。  
Bundles の登録方法については、以下の記事をご覧ください。

[Twilio で Bundles（本人認証）の設定を行う（個人編）](https://qiita.com/mobilebiz/items/579d1920a8b0bca96459)  
[Twilio で Bundles（本人認証）の設定を行う（法人編）](https://qiita.com/mobilebiz/items/4d09a15a355ae5df3d24)

すでに番号を購入済みの方は、ここはスキップしても構いません。

- Twilio 管理コンソールのサービスアイコンを押して、**Phone Numbers** メニューを開きます。
- **番号を購入**メニューを選択します。
- **COUNTRY** に `Japan` が選択されていることを確認して、**検索**ボタンを押します。
- リストの中から、`+8150` から始まる番号を一つ選択して、**購入**ボタンを押します。
- この番号を使ってできる機能の一覧（ Voice / Fax ）が表示されますので、**Next** ボタンを押します。
- Bundles を法人で作成した方は、**Business**、個人で作成した方は **Individual** を選択して、**Next** ボタンを押します。
- **ASSIGN APPROVED JAPAN NATIONAL INDIVIDUAL BUNDLE**と、**ASSIGN ADDRESS** のプルダウンから、登録済みの Bundles 情報を選択します。
- **Buy +8150xxxxxxxx** ボタンを押します。

## フローの割り当て

購入した番号の設定を行います。

- 番号を設定画面の **A CALL COMES IN** を以下のように変更します。
- プルダウンから「Studio Flow」を選択します。
- その右のプルダウンで、先程作成した「Voicemail to LINE」を選択します。
- **Save** ボタンを押して、設定を保存します。

## テスト

以上でセットアップは終了です。  
あとは実際に 050 番号に電話をして、メッセージを吹き込むことで LINE に通知が届くことを確認しましょう。

## まとめ

今回は、Twilio の \<Gather> による音声認識を利用しましたが、もし外部の音声認識サービスを使いたい場合は、\<Record> を使って音声を録音し、その音声データを外部のサービスを使って認識させることもできます。  
また、今回のように自前で作るのは大変という方には、すでにサービスとして稼働している [TRANSREC](https://www.transrec.net) もありますので、ぜひご検討ください（PR）。
