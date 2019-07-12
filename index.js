'use strict'


const
    express=require('express'),
    bodyParser=require('body-parser'),
    request=require('request'),
    PAGE_ACCESS_TOKEN="EAAFBxTpHwfABALRV2ZB8Qu8ZCERZAatrxT9xOIY1zIosZCLHhd1Y1sphQgYQzPzNxN4YeSA3AqrDxnHhvdIaYuMq93faiBDs4NDgAgwIOxFM6ens4WZAoRcNSqYjvikDfRy5ZBPNRNYkSgkrIRF8l1bdzzUPbF59R8DSsxYMZBkrSEzVv9XwRvnHPLy5bQjEBoZD",
    app=express().use(bodyParser.json());
    app.listen(1337,()=>console.log("Bot Bukalapak is listening on 1337"));

app.get('',(req,res)=>{
      res.send("Hi")
})

app.post('/webhook', (req, res) => {  
 
    let body = req.body;
    console.log(body);
    
    // Checks this is an event from a page subscription
    if (body.object === 'page') {
      // Iterates over each entry - there may be multiple if batched
      body.entry.forEach(function(entry) {
  
        // Gets the message. entry.messaging is an array, but 
        // will only ever contain one message, so we get index 0
        let webhook_event = entry.messaging[0];
        let message = webhook_event.message.toString();
        let sender_psid = webhook_event.sender.id;
        console.log(webhook_event);
        
        if(message.substring(0,4)=="cari"||message.substring(0,4)=="Cari"){
          handleMessage(sender_psid,message)
        }else{
          console.log("Ketik 'Cari <Nama Barang>'");
        }
      });
  
      // Returns a '200 OK' response to all requests
      res.status(200).send('EVENT_RECEIVED');
    } else {
      // Returns a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
  
  });

app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "EAAFBxTpHwfABAM6cUM9orHaRRTwTe8xLNZAf8eNuDzHCjwbSPhSW8MQ1sjPMBgsQP2ZBfjRaPA1MTuljEqEyZC33ZA4wpAL3ZBzoN9VWH2yzDPUwOE0UlFWhk83qi52zc7PCZCA6ZCzNNA21IPGZBPZBLT6sALftpesVkHgNHVC8WKkRhHZC2KxEKkKXX4RtZCC0lMZD"

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
      
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
    
      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        
        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);      
      }
    }
  });

function getProduct(sender_psid,item){
    request('https://api.bukalapak.com/v2/products.json?keywords='+item+'&page=2&per_page=20',{json:'true'},(err,res,body)=>{
      let response;
      if (received_message.text) {    
    
        response = {
          "text": body
        }
      }  
      
      callSendAPI(sender_psid, response);   
    })
}

  function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response
    }
  
    // Send the HTTP request to the Messenger Platform
    request({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": { "access_token": PAGE_ACCESS_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log('message sent!')
      } else {
        console.error("Unable to send message:" + err);
      }
    }); 
  }

  
function handleMessage(sender_psid, received_message) {
  getProduct(sender_psid,received_message.substring(5))
}

function handlePostback(sender_psid, received_postback) {
  
}

function callSendAPI(sender_psid, response) {
  
}