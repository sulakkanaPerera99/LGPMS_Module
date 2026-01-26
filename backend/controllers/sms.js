
const axios = require("axios");
// 
/* 

  Get your SMSLink / SMS Gateway Connection ID and Password from 
  https://www.smslink.ro/get-api-key/

*/

/*

  HTTPS API Endpoint:  https://secure.smslink.ro/sms/gateway/communicate/index.php
  HTTP API Endpoint:   http://www.smslink.ro/sms/gateway/communicate/index.php

*/
axios({
                    
    "method": "GET",
    "url": "https://msmsenterpriseapi.mobitel.lk/EnterpriseSMSV3/esmsproxyURL.php",
    "headers": {
      "content-type": "application/json",
      "useQueryString": true
    }, "params": {
      "username":"esmuser_13tn",
      "password":"Diss@#519",
      "from":"GA MATALE", 
      "to":"0774896810",
      "text":"messagetest%0Anewline",
      "mesageType":1 
  
      // "to": "0774896810",
      // "message": "My Test Message",
      // "connection_id": "esmuser_13tn",
      // "password": "Diss@#519"
    }
  })
    .then((response) => {
      console.log(response)
    })
    .catch((error) => {
      console.log(error)
    })