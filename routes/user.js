const { response } = require('express');
var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const { getOrderProducts } = require('../helpers/user-helpers');
const userHelpers=require('../helpers/user-helpers')

const verifyLogin = (req, res, next)=>{
  console.log(req.session.user)
  if(req.session.user){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async function(req, res, next) {
  let user=req.session.user
  console.log(user)
  let cartCount=null
  let msgCount=null
  if(req.session.user){
    cartCount=await userHelpers.getCartCount(req.session.user._id)
    msgCount=await userHelpers.getMsgCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products)=>{
    res.render('user/view-products',{admin:false, products, user, cartCount, msgCount})
  })
 
});

router.get('/login', function(req, res){
  if(req.session.user){
    res.redirect('/')
  }else{
    res.render('user/login',{"loginErr":req.session.userLoginErr})
    req.session.userLoginErr=false
  }
})

router.get('/signup', function(req, res){
  res.render('user/signup')
})

router.post('/signup', function(req, res){
 userHelpers.doSignup(req.body).then((response)=>{
  console.log(response)
  req.session.user=response
  req.session.user.loggedIn=true
  res.redirect('/')
 })
})

router.post('/login',(req, res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){ 
      req.session.user=response.user
      req.session.user.loggedIn=true
      res.redirect('/')
    }else{
      req.session.userLoginErr="Invalid username or Password"
      res.redirect('/login')
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.user=null
  req.session.userLoggedIn=false
  res.redirect('/')
})

router.get('/cart',verifyLogin, async(req,res)=>{
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let totalValue=0
  if(products.length>0){
    totalValue=await userHelpers.getTotalAmount(req.session.user._id)
  }
  res.render('user/cart',{products,user:req.session.user, totalValue})
})

router.get('/add-to-cart/:id', verifyLogin, (req, res)=>{  
  userHelpers.addToCart(req.params.id, req.session.user._id).then(()=>{
   res.json({status:true})
  })
})

router.post('/change-product-quantity',(req,res,next)=>{
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userHelpers.getTotalAmount(req.body.user)
    res.json(response)    
  })
})

router.post('/remove-item',(req,res)=>{
  userHelpers.removeButton(req.body).then((response)=>{
    console.log("anju"+response)
    res.json(response)    
  })
})

router.get('/place-order',verifyLogin, async(req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total,user:req.session.user})
})

router.post('/place-order',async(req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body, products, totalPrice).then((orderId)=>{
    if(req.body['payment-method']==='COD'){
      res.json({codSuccess:true})
    }
    else{
      userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
        res.json(response)
      })
    }    

  })
  console.log(req.body)
})

router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})

router.get('/orders',async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/orders',{user:req.session.user,orders})
})

router.get('/view-order-products/:id',async(req,res)=>{
  let products=await userHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products',{user:req.session.user,products})
})

router.post('/verify-payment',(req,res)=>{
  console.log(req.body)
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true})
    })
  }).catch((err)=>{
    res.json({status:false,errMsg:''})
  })
})

router.get('/set-profile', function(req, res) {
  res.render('user/set-profile',{user:req.session.user})
})

router.post('/set-profile',(req,res)=>{
  
  userHelpers.addProfile(req.body,(insertedId)=>{
    let image=req.files.Image
       
    image.mv('./public/product-images/'+insertedId+'.jpg',(err,done)=>{
      
      if(!err){
        userHelpers.getProfile().then((profile)=>{
          res.render('user/profile',{user:req.session.user,profile})
        })
      }else{
        console.log(err)
      }
    })
    
  })
})

router.get('/profile',verifyLogin, function(req, res, next) {
  userHelpers.getProfile().then((profile)=>{
    res.render('user/profile',{user:req.session.user,profile})
  })
 
});

router.get('/edit-profile/:id', async(req,res)=>{
  let profile= await userHelpers.getProfileDetails(req.params.id)
  res.render('user/edit-profile',{user:req.session.user,profile})
})

router.post('/edit-profile/:id',(req,res)=>{
  let insertedId=req.params.id
  userHelpers.updateProfile(req.params.id, req.body).then(()=>{
    res.redirect('/profile')
   

    if(req.files.Image){
      let image=req.files.Image
      image.mv('./public/product-images/'+insertedId+'.jpg')
    }
  })
  
})

 router.get('/notifications',verifyLogin, async(req, res)=>{
   let user=req.session.user
   let orders=await userHelpers.getShippedOrder(req.session.user._id)
   res.render('user/notification',{user:req.session.user, orders})
 })

 


module.exports = router;
