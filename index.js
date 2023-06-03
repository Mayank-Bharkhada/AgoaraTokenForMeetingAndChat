const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const {RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole} = require('agora-access-token')
const agoraToken = require('agora-token');
const port = process.env.PORT;

const { ChatTokenBuilder } = agoraToken;


const appIdForConferance = '3b0b38080efd46a28c8b75387c66e8ff';
const appCertificateForConferance = '519bb07086534c219a44dfb8e9fa2809';


// app.use(cors())
app.use(bodyParser.json());



app.post('/access_token_for_Meeeting', (req, res) => {
    // res.header("Acess-Control-Allow-Origin", "*");
    const ChannelName = req.body.ChannelName;
    if(!ChannelName){
        return res.status(500).json("Error no chanal name");

    }

    let uid = req.body.uid;
    
    if(!uid || uid == ''){
        uid= 0;
    }
    

    let role = RtcRole.SUBSCRIBER;  
    if(req.body.role == 'publisher'){
        role = RtcRole.PUBLISHER;
    }

    // let expireTime = req.query.expireTime;
    // if(!expireTime || expireTime == ''){
        expireTime= 86400 * 30 ;
    // }else{
    //     expireTime = parseInt(expireTime, 10);
    // }

    const currentTime = Math.floor(Date.now()/1000);
    const privillegeExpireTime = currentTime + expireTime;


    const token = RtcTokenBuilder.buildTokenWithUid(appIdForConferance,appCertificateForConferance,ChannelName,uid,role,privillegeExpireTime);

    return res.json({'token' : token});
}
)

// Get the appId and appCertificate from the agora console
const appIdForChat = "f9d18293a9c7422a9f477cc19808ba55";
const appCertificateForChat = "182e399681f94b659e2ebc230af9582d";
// Token expire time, hardcode to 86400 seconds = 1 day
const expirationInSeconds = 86400 * 30;




// Get the RestApiHost, OrgName and AppName from the chat feature in agora console
const chatRegisterURL = "https://a41.chat.agora.io/41951683/1112484/users"


app.post('/login', async (req, res) => {
    const userName = req.body.userName; 
    const userUuid = req.body.userUuid; 
    // const chatPassword = req.body.chatPassword;

    if (userName && userUuid) {
      const userToken = ChatTokenBuilder.buildUserToken(appIdForChat, appCertificateForChat, userUuid , expirationInSeconds);
      res
        .status(200)
        .json({
          code: "RES_OK",
          expireTimestamp: expirationInSeconds,
          chatUsername: userName,
          accessToken: userToken // agorachatAuthToken
        })
    } else {
      res.status(401).json({
        message: 'You account or password is wrong'
      })
    }
  })

  
app.post('/register_token', async (req, res) => {
  
    const userName = req.body.userName;
    const chatPassword = req.body.chatPassword; 
    const ChatNickname = req.body.ChatNickname; 

    // const userId = req.body.userId;

    const body = {'username': userName, 'password': chatPassword, 'nickname': ChatNickname};
    const appToken = ChatTokenBuilder.buildAppToken(appIdForChat, appCertificateForChat, expirationInSeconds);
    try {
    const response = await fetch(chatRegisterURL , {
      method: 'post',
      headers: {
        'content-type': 'application/json',
        'Authorization': 'Bearer '+appToken,
      },
      body: JSON.stringify(body)
    })
    const result = await response.json()
    if (response.status != 200 ) {
      res.status(400).json({ success: false, data: result })
      return
    }

    console.log(result);
    
    res.json({
        "success" : true,
        "userName": userName,
        "password": chatPassword,
        "chatUsername": ChatNickname,
        "userUuid": result.entities[0].uuid
      })

    //   res.status(200).json({ success: true, message: "User Registered Sucessfully !", "code": "RES_OK" })
    } catch (error) {
      console.log(error)
      res.status(400).json({ success: false })
    }
  
  })




app.listen(port, () => {
  console.log('Server running on port 3000');
});
