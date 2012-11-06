module.exports={
	"title": "App Title",
    "analytics_id": "UA-XXXXXXX-1", // from google
    "localport" : process.env.VCAP_APP_PORT || 3000,
    "recaptcha": {
      "public": "YOURS",
      "private": "YOURS"
    },
    // from mailgun: free low-volume outgoing mail!
    "mailgun": process.env.MAILGUN_API_KEY || "YOURS",
    "admin_email": "YOURS",
    "session":"YOUR SECRET",
    "database":{ // local, for dev
    	"dbname": "YOURS",
        "host": "YOURS",
        "port": 27017,
        "username": "YOURS",
        "password": "YOURS"
    }
};

// detect AppFog, and use mongodb settings
if (process.env.VCAP_SERVICES){
    try{
        var mongo = JSON.parse(process.env.VCAP_SERVICES)['mongodb-1.8'][0]['credentials'];
        mongo.dbname = mongo.db;
        mongo.host = mongo.hostname;
        module.exports.database = mongo;
    }catch(e){}

}