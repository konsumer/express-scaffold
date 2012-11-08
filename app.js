var path = require('path'),
    express = require('express'),
    config = require('./config'),
    mongoStore = require('connect-mongodb'),
    ejs = require('ejs-locals'),
    // connectAssets = require('connect-assets'),
    flash = require('connect-flash'),
    Recaptcha = require('recaptcha').Recaptcha,
    Mailgun = require('mailgun').Mailgun,
    mg = new Mailgun(config.mailgun);

var app = express();

app.configure('development', function(){
  app.use(express.logger('dev'));
  app.use(express.errorHandler());
});

app.configure(function(){
	app.use(express.methodOverride());
	app.use(express.cookieParser(Math.random().toString(36).substring(2)));

  app.use(express.session({
    secret: config.session,
    store: mongoStore(config.database)
  }));

	app.use(express.bodyParser());
  app.use(flash());
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');
  app.engine('ejs', ejs);
  app.use(express.compress());
  app.use(express.favicon(path.join(__dirname, 'assets', 'favicon.ico')));
  // app.use(connectAssets({buildDir:false}));
  app.use(express.static(path.join(__dirname, 'assets')));
  app.use(function(req,res,next){
    app.locals.flash = req.flash();
    app.locals.title = config.title;
    app.locals.analytics_id = config.analytics_id;
    app.locals.req= req;
    next();
  });
  app.use(app.router);
});


app.get('/', function(req, res){
  res.render('index');
});

app.get('/privacy', function(req, res){
  res.render('privacy');
});

app.get('/about', function(req, res){
  res.render('about');
});

app.get('/create', function(req, res){
  res.render('create');
});


app.get('/contact', function(req, res){
  var recaptcha = new Recaptcha(config.recaptcha.public, config.recaptcha.private);
  res.render('contact', {vals:{email:"", name:"", message:""}, recaptcha_form: recaptcha.toHTML()});
});


app.post('/contact', function(req, res){
  var data = {
    remoteip:  req.connection.remoteAddress,
    challenge: req.body.recaptcha_challenge_field,
    response:  req.body.recaptcha_response_field
  };
  var recaptcha = new Recaptcha(config.recaptcha.public, config.recaptcha.private, data);
  recaptcha.verify(function(success, error_code) {
    if (success) {
      mg.sendText(req.body.email,
         [config.admin_email],
         config.title + ' Feedback',
         req.body.message,
         function(err) { err && console.log(err) });

      req.flash('success', 'Thanks for the message.');
      res.redirect('/');
    }else{
      req.flash('error', 'Bad captcha. Are you human?');
      res.render('contact', {vals:req.body, recaptcha_form: recaptcha.toHTML()});
    }
  });
});


//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.status(404);
  res.render('404');
});

console.log('Running on http://localhost:' + config.localport);
app.listen(config.localport);