var express = require('express');
var router = express.Router();
const { render, response } =require('../app');
const productHelpers = require('../helpers/product-helpers');
var productHelper=require('../helpers/product-helpers')
const adminHelpers=require('../helpers/admin-helpers')

const verifyLogiin = (req, res, next)=>{
  if(req.session.admin){
    next()
  }else{
    res.redirect('/admin/')
  }
}



router.get('/', function(req, res){
  let admin=req.session.admin
  if(req.session.admin){   
  res.redirect('admin/view-products')
}else{
  res.render('admin/log-in',{Admin:req.session.admin,admin:true,"loginErr":req.session.adminLoginErr})
  req.session.adminLoginErr=false
  
}

})

router.get('/add-product', function(req, res) {
  let admin=req.session.admin
  res.render('admin/add-product',{Admin:req.session.admin,admin})
})

router.post('/add-product',(req,res)=>{

  productHelpers.addProduct(req.body,(insertedId)=>{
    let image=req.files.Image
       
    image.mv('./public/product-images/'+insertedId+'.jpg',(err,done)=>{
      
      if(!err){
        res.redirect('/admin/view-products')
      }else{
        console.log(err)
      }
    })
    
  })
})


 

router.get('/delete-product/:id',(req,res)=>{
  let proId=req.params.id
  console.log(proId)
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/view-products')
  })
 
})

router.get('/edit-product/:id', async(req,res)=>{
  let product= await productHelpers.getProductDetails(req.params.id)
  res.render('admin/edit-product',{admin:true,product})
})

router.post('/edit-product/:id',(req,res)=>{
  let insertedId=req.params.id
  productHelpers.updateProduct(req.params.id, req.body).then(()=>{
    res.redirect('/admin/view-products')

    if(req.files.Image){
      let image=req.files.Image
      image.mv('./public/product-images/'+insertedId+'.jpg')
    }
  })
  
})



router.get('/sign-up', function(req, res){
res.render('admin/sign-up',{admin:true})
})

router.post('/sign-up', function(req, res){
  adminHelpers.doSign_up(req.body).then((response)=>{
   console.log(response)
   req.session.admin=response
   req.session.admin.loggedIn=true
   productHelpers.getAllProducts().then((products)=>{
    res.render('admin/view-products',{admin:true, products})
  })
   
  })
 })

 router.post('/log-in',(req, res)=>{  
  adminHelpers.doLog_in(req.body).then((response)=>{  
    if(response.status){ 
      req.session.admin=response.admin
      req.session.admin.loggedIn=true
      let  admin=req.session.admin;
  res.redirect('/admin/view-products')
    }else{
      req.session.adminLoginErr="Invalid username or Password"
      res.redirect('/admin/')
    }
   
})
})

router.get('/log-out',(req,res)=>{
  req.session.admin=null
  req.session.adminLoggedIn=false
  res.redirect('/admin/')
})

router.get('/all-orders',verifyLogiin,(req,res)=>{
  let  admin=req.session.admin;
  
  productHelpers.getAllOrders().then((orders) => {
    
    res.render('admin/all-orders', {Admin:req.session.admin,admin,orders})
  })
})

router.get('/all-users',verifyLogiin,(req,res)=>{
  let  admin=req.session.admin;
  
  productHelpers.getAllUsers().then((users) => {
    console.log(users);
    res.render('admin/all-users', {Admin:req.session.admin,admin,users})
  })
})

router.get('/view-products',verifyLogiin, function(req, res, next) {
  let admin=req.session.admin
  productHelpers.getAllProducts().then((products)=>{
    console.log(products)
    res.render('admin/view-products',{Admin:req.session.admin,admin,products})
  })
 
});

router.get('/shipped-status/:id',verifyLogiin, (req,res)=>{
  adminHelpers.changeShippingStatus(req.params.id).then(()=>{
    console.log(req.params.id)
    res.redirect('/admin/all-orders')
  })
})

router.get('/cancelled-status/:id',verifyLogiin, (req,res)=>{
  adminHelpers.changeCancelledStatus(req.params.id).then(()=>{
    res.redirect('/admin/all-orders')
  })
})



module.exports = router;
