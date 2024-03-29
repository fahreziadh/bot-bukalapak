'use strict'


const
    express=require('express'),
    bodyParser=require('body-parser'),
    request=require('request'),
    fs = require('fs'),
    PAGE_ACCESS_TOKEN="EAAFBxTpHwfABALRV2ZB8Qu8ZCERZAatrxT9xOIY1zIosZCLHhd1Y1sphQgYQzPzNxN4YeSA3AqrDxnHhvdIaYuMq93faiBDs4NDgAgwIOxFM6ens4WZAoRcNSqYjvikDfRy5ZBPNRNYkSgkrIRF8l1bdzzUPbF59R8DSsxYMZBkrSEzVv9XwRvnHPLy5bQjEBoZD",
    app=express().use(bodyParser.json());
    app.listen(1337,()=>console.log("Bot Bukalapak is listening on 1337"));

app.get('',(req,res)=>{
      res.send("Hi")
})

app.post('/webhook', (req, res) => {  

    let body = req.body;
    
    // Checks this is an event from a page subscription
    if (body.object === 'page') {
      // Iterates over each entry - there may be multiple if batched
      body.entry.forEach(function(entry) {
  
        // Gets the message. entry.messaging is an array, but 
        // will only ever contain one message, so we get index 0
        let webhook_event = entry.messaging[0];
        let message = String(webhook_event.message.text);
        let sender_psid = webhook_event.sender.id;
        
        if(message.substring(0,4)=="cari"||message.substring(0,4)=="Cari"){
             getProduct(sender_psid,message.substring(5))
              console.log("on request "+message);
        }else{
          let response;
            response = {
              "text": "Ketik 'Cari <Nama Barang>'"
            }
          callSendAPI(sender_psid, response);   
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
    let VERIFY_TOKEN = "EAAFBxTpHwfABALRV2ZB8Qu8ZCERZAatrxT9xOIY1zIosZCLHhd1Y1sphQgYQzPzNxN4YeSA3AqrDxnHhvdIaYuMq93faiBDs4NDgAgwIOxFM6ens4WZAoRcNSqYjvikDfRy5ZBPNRNYkSgkrIRF8l1bdzzUPbF59R8DSsxYMZBkrSEzVv9XwRvnHPLy5bQjEBoZD"

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

function getProduct(sender_psid,received_message){

    request('https://api.bukalapak.com/v2/products.json?keywords='+received_message+'&page=1&per_page=3',{json:'true'},(err,res,body)=>{
    let response;
      if(err){
        response = {
          "text": "Ada kesalahan mohon tunggu sebentar :)"
        }
       console.log(err);
      }

      // Call template
      
      let main_list = JSON.parse(fs.readFileSync('layout/main_list.json'));  
      let item_header = JSON.parse(fs.readFileSync('layout/item_header.json'));  
      let img_header;

      var item_list=body.products.map((product)=>{
          let item = JSON.parse(fs.readFileSync('layout/item_list.json'));  
          item.title=product.name   //Nama product
          item.image_url=product.images[0]    //Gambar product
          item.subtitle=convertToRupiah(product.price)    //harga product
          item.default_action.url=product.url    //Url product
          item.buttons[0].url=product.url    //Tombol product
          img_header=product.images[0]
          return item
        })

      item_header.title="Hasil Pencarian"
      item_header.subtitle=received_message
      item_header.image_url=img_header

      const list =main_list
      item_list.unshift(item_header)
      list.elements=item_list
      // console.log(item_list);
      
       response = {
         attachment:{
           type:"template",
           payload:list
         }
      }
    
    console.log("success to request "+received_message);
      callSendAPI(sender_psid, response);   
    })
}


 
function convertToRupiah(angka)
{
	var rupiah = '';		
	var angkarev = angka.toString().split('').reverse().join('');
	for(var i = 0; i < angkarev.length; i++) if(i%3 == 0) rupiah += angkarev.substr(i,3)+'.';
	return 'Rp. '+rupiah.split('',rupiah.length-1).reverse().join('');
}

function callSendAPI(sender_psid, response) {
    console.log({"sender_psid":sender_psid,"response":response});
    
    // Construct the message body
    let request_body = {
      recipient: {
        id: sender_psid
      },
      message: response
    }
    
  
    // Send the HTTP request to the Messenger Platform
    request({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": { "access_token": PAGE_ACCESS_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      console.log(body);
      if (!err) {
        console.log('message sent!')
      } else {
        console.error("Unable to send message:" + err);
      }
    }); 
}
