const crypto = require('crypto');
const dotenv = require('dotenv');
const url = require('url');
const querystring = require('querystring');
const xml2js = require('xml2js');
const WebSocket = require('ws');

dotenv.config();

let userChatHistory = {};
let userLastChatTime = {};
let userStashMsg = {};
let userHasAnswerIng = {};
const statsNames = {
  "郭聪": "郭聪",
  "郭甜": "郭甜",
  "刘晓芳": "刘晓芳",
  "周坤": "周坤",
  "周娟": "周娟",
  "周阳": "周阳",
  "周建": "周建",
  "周林": "周林",
  "周振": "周振",
  "周士杰": "周士杰",
  "周岚": "周岚",
  "周家人": "周家人",
  "林秀娟": "林秀娟"
}
const emojiObj = {
  "/::)": "微笑",
  "/::~": "伤心",
  "/::B": "心动",
  "/::|": "发呆",
  "/:8-)": "得意",
  "/::<": "哭",
  "/::$": "害羞",
  "/::X": "闭嘴",
  "/::Z": "睡",
  "/::’(": "哭",
  "/::-|": "囧",
  "/::@": "发怒",
  "/::P": "调皮",
  "/::D": "笑",
  "/::O": "惊讶",
  "/::(": "难过",
  "/::+": "酷",
  "/:–b": "流汗",
  "/::Q": "抓狂",
  "/::T": "呕吐",
  "/:,@P": "偷笑",
  "/:,@-D": "幸福的笑",
  "/::d": "事不关己",
  "/:,@o": "撇嘴",
  "/::g": "饿",
  "/:|-)": "又累又困",
  "/::!": "惊恐",
  "/::L": "流汗黄豆",
  "/::>": "高兴",
  "/::,@": "悠闲",
  "/:,@f": "努力",
  "/::-S": "咒骂",
  "/:?": "疑问",
  "/:,@x": "嘘！小声点",
  "/:,@@": "晕了",
  "/::8": "我要疯了",
  "/:,@!": "太倒霉了",
  "/:!!!": "太吓人了",
  "/:xx": "打你",
  "/:bye": "拜拜",
  "/:wipe": "不带这么玩的",
  "/:dig": "不屑",
  "/:handclap": "好啊好啊",
  "/:&-(": "糗大了",
  "/:B-)": "坏笑",
  "/:<@": "不理你",
  "/:@>": "不理你",
  "/::-O": "有点累了",
  "/:>-|": "鄙视你",
  "/:P-(": "好委屈",
  "/::’|": "快哭了",
  "/:X-)": "坏笑",
  "/::*": "么么哒",
  "/:@x": "震惊",
  "/:8*": "可怜",
  "/:pd": "你太过分了",
  "/:<W>": "水果",
  "/:beer": "啤酒",
  "/:basketb": "篮球",
  "/:oo": "乒乓",
  "/:coffee": "咖啡",
  "/:eat": "美食",
  "/:pig": "可爱小猪",
  "/:rose": "送你一朵花",
  "/:fade": "难过",
  "/:showlove": "亲亲",
  "/:heart": "爱心",
  "/:break": "心裂开了",
  "/:cake": "蛋糕",
  "/:li": "闪电劈你",
  "/:strong": "点赞"
};
const keywordAutoReply = JSON.parse(process.env.KEYWORD_REPLAY);
module.exports = async function (request, response) {
  const method = request.method;
  const timestamp = request.query.timestamp;
  const nonce = request.query.nonce;
  const signature = request.query.signature;
  const echostr = request.query.echostr;

  if (method === 'GET') {
    const token = process.env.WX_TOKEN;
    const tmpArr = [token, timestamp, nonce].sort();
    const tmpStr = tmpArr.join('');
    const hash = crypto.createHash('sha1').update(tmpStr).digest('hex');
    if (hash === signature) {
      response.status(200).send(echostr);
      return;
    } else {
      response.status(200).send("failed");
      return;
    }
  }

  const xml = request.read().toString();
  const parser = new xml2js.Parser();
  const textMsg = await parser.parseStringPromise(xml);
  // console.log(textMsg);
  const ToUserName = textMsg.xml.ToUserName[0];
  const FromUserName = textMsg.xml.FromUserName[0];
  const CreateTime = textMsg.xml.CreateTime[0];
  const MsgType = textMsg.xml.MsgType[0];
  console.log("收到消息类型：" + MsgType);
  let Content;
  const timeNow = Math.floor(Date.now() / 1000);
  if (MsgType === 'text') {
    Content = textMsg.xml.Content[0];
    console.log("收到文本消息：" + Content)
    if (Object.hasOwnProperty.call(emojiObj, Content)) {
      //用户发送了微信自带表情
      Content = '给你一个表情：' + emojiObj[Content] + '，你自己体会'
    }
    if(isName(Content))
    {
      Content = '搜索全国最出名的名字叫' + Content + '的生平简历，用50个字来形容'
    }
    if (Object.hasOwnProperty.call(statsNames, Content) || Content.indexOf('郭聪') != -1 || Content.indexOf('郭甜') != -1  || Content.indexOf('周坤') != -1  || Content.indexOf('刘晓芳') != -1  || Content.indexOf('林秀娟') != -1  ) {
      //用户发送了特定字符
     if(statsNames[Content]=== '郭聪'|| Content.indexOf('郭聪') != -1 )
     {
        resSt = '郭聪是个大美女，现在就读于淅川县第五高级中学高二年级，人见人爱，花见花开，车见车爆胎，沉鱼落雁，闭月羞花，跟芙蓉姐姐有的一拼 /:,@P /:,@P'
     }else  if(statsNames[Content]=== '郭甜' || Content.indexOf('郭甜') != -1  )
     {
       resSt = '郭甜很可爱，现在就读于淅川县第五高级中学高一年级，是凤姐的头号粉丝，羁傲不逊的眼镜代表着她的态度，向天再接五百年，她一定会好好学习考上淅川一高 /:,@P /:,@P'
     }else if(statsNames[Content]=== '周坤' || Content.indexOf('周坤') != -1)
     {
       resSt = '哇，你问我的老板？我老板可帅了，比肩刘德华，帅比吴彦祖 /:,@P /:,@P'
     }else if(statsNames[Content]=== '刘晓芳' || Content.indexOf('刘晓芳') != -1)
     {
       resSt = '她是老板娘啦，沉鱼落雁闭月羞花，那是你高攀不起的人，不要瞎打听了  /:,@P /:,@P'
     }else if(statsNames[Content]=== '林秀娟' || Content.indexOf('林秀娟') != -1 )
     {
       resSt = '听说她想找男朋友，5555   可以上清华大学看一看，那里很多优秀小伙子  /:,@P /:,@P'
     }else
     {
       resSt = '想必你就是老板的亲戚吧，你想问什么，直接问老板吧，不会没有他微信吧，瞅你那损样  WX:hfanss9064 /:,@P /:,@P'
     }
       response.status(200).send(formatReply(
            FromUserName,
            ToUserName,
            timeNow,
            resSt
        ));
        return;
    }
    
    console.log("关键词配置：", keywordAutoReply, "文本内容：" + Content, "匹配结果：", Object.hasOwnProperty.call(keywordAutoReply, Content));
    if (Object.hasOwnProperty.call(keywordAutoReply, Content)) {
      //关键词自动回复
      console.log("触发关键词自动回复");
      response.status(200).send(formatReply(
        FromUserName,
        ToUserName,
        timeNow,
        keywordAutoReply[Content]
      ));
      return;

    }
  }


  if (MsgType === 'event') {
    const Event = textMsg.xml.Event[0];
    if (Event === 'subscribe') {
      response.status(200).send(formatReply(
        FromUserName,
        ToUserName,
        timeNow,
        process.env.SUBSCRIBE_REPLY
      ));
      return;
    } else {
      return response.status(200).send('');
    }
  }
   if (MsgType === 'voice') {
       console.log('用户发送了语音信息，提前返回');
       response.status(200).send(formatReply(
            FromUserName,
            ToUserName,
            timeNow,
            '哎哟，语音信息暂时不支持哟，请重新发送文字消息！/::Q'
        ));
        return;
   }

  if (userHasAnswerIng[FromUserName]) {
    response.status(200).send(formatReply(
      FromUserName,
      ToUserName,
      timeNow,
      '哎哟，问的问题有点深度哟！！请等我思考一下，稍后回复任意文字尝试获取回复。比如数字 1。'
    ));
    return;
  }

  if (userStashMsg[FromUserName]) {
    console.log('用户有暂存数据，返回暂存数据');
    let tmp = userStashMsg[FromUserName];
    userStashMsg[FromUserName] = '';
    response.status(200).send(formatReply(
      FromUserName,
      ToUserName,
      timeNow,
      tmp
    ));
    return;
  }
  console.log("当前时间：", timeNow, "上次时间：", userLastChatTime[FromUserName])
  if (
    userLastChatTime[FromUserName] &&
    timeNow - userLastChatTime[FromUserName] >= 300
  ) {
    userChatHistory[FromUserName] = [];
  }
  userLastChatTime[FromUserName] = timeNow;
  if (!userChatHistory[FromUserName]) {
    userChatHistory[FromUserName] = [];
  }
  userChatHistory[FromUserName].push({ Role: 'user', Content });
  console.log("会话历史：", userChatHistory);
  const data = genParams(userChatHistory[FromUserName]);

  const connect = await getConnect();
  connect.send(JSON.stringify(data));

  let answer = '';
  let timeout;
  const done = new Promise((resolve) => {
    connect.on('message', (msg) => {
      const data = JSON.parse(msg);
      const payload = data.payload;
      const choices = payload.choices;
      const header = data.header;
      const code = header.code;

      if (code !== 0) {
        console.log(payload);
        return;
      }

      const status = choices.status;
      const text = choices.text;
      const content = text[0].content;
      if (status !== 2) {
        answer += content;
      } else {
        answer += content;
        console.log('收到最终结果：', answer);
        const usage = payload.usage;
        const temp = usage.text;
        const totalTokens = temp.total_tokens;
        console.log('total_tokens:', totalTokens);
        userHasAnswerIng[FromUserName] = false;
        userChatHistory[FromUserName].push({
          Role: 'assistant',
          Content: answer,
        });
        const timeNow2 = Math.floor(Date.now() / 1000);
        if (timeNow2 - timeNow > 3) {
          userStashMsg[FromUserName] = answer;
        }
        clearTimeout(timeout);
        resolve();
      }
    });
  });

  const timeoutPromise = new Promise((resolve) => {
    timeout = setTimeout(() => {
      userHasAnswerIng[FromUserName] = true;
      console.log('执行超过4s，提前返回');
      resolve(
        formatReply(
          FromUserName,
          ToUserName,
          timeNow,
          '哎哟，问的问题有点深度哟！！请等我思考一下，稍后回复任意文字尝试获取回复。比如数字 1。'
        )
      );
    }, 4000);
  });

  const result = await Promise.race([done, timeoutPromise]);
  if (result) {
    response.status(200).send(result);
    return;
  }
  response.status(200).send(formatReply(FromUserName, ToUserName, timeNow, answer));
  return
};

function formatReply(ToUserName, FromUserName, CreateTime, Content) {
  return `<xml>
        <ToUserName><![CDATA[${ToUserName}]]></ToUserName>
        <FromUserName><![CDATA[${FromUserName}]]></FromUserName>
        <CreateTime>${CreateTime}</CreateTime>
        <MsgType><![CDATA[text]]></MsgType>
        <Content><![CDATA[${Content}]]></Content>
    </xml>`;
}

function genParams(messages) {
  return {
    header: {
      app_id: process.env.APPID,
    },
    parameter: {
      chat: {
        domain: process.env.SPARK_DOMAIN,
        temperature: 0.8,
        top_k: 6,
        max_tokens: 2048,
        auditing: 'default',
      },
    },
    payload: {
      message: {
        text: messages,
      },
    },
  };
}
async function getConnect() {
  const authUrl = assembleAuthUrl1();
  const ws = new WebSocket(authUrl);
  await new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
  });
  return ws;
}

function assembleAuthUrl1() {
  const hostUrl = process.env.HOST_URL;
  const apiKey = process.env.API_KEY;
  const apiSecret = process.env.API_SECRET;
  const ul = url.parse(hostUrl);
  const date = new Date().toUTCString();
  const signString = `host: ${ul.host}\ndate: ${date}\nGET ${ul.pathname} HTTP/1.1`;
  const sha = hmacWithShaTobase64('hmac-sha256', signString, apiSecret);
  const authUrl = `hmac username="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${sha}"`;
  const authorization = Buffer.from(authUrl).toString('base64');
  const v = querystring.stringify({
    host: ul.host,
    date: date,
    authorization: authorization,
  });
  return hostUrl + '?' + v;
}

function hmacWithShaTobase64(algorithm, data, key) {
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(data);
  const encodeData = hmac.digest();
  return Buffer.from(encodeData).toString('base64');
}

function isName(text) {
  const regex = /^[a-zA-Z\u4e00-\u9fa5]+( [a-zA-Z\u4e00-\u9fa5]+)+$/;
  return regex.test(text);
}
