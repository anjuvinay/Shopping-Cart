var express = require('express');
var router = express.Router();
const { render, response } =require('../app');
const productHelpers = require('../helpers/product-helpers');
var productHelper=require('../helpers/product-helpers')
const adminHelpers=require('../helpers/admin-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{
    console.log(products)
    res.render('admin/view-products',{admin:true, products})
  })
 
});

router.get('/add-product', function(req, res) {
  res.render('admin/add-product')
})

router.post('/add-product',(req,res)=>{
  console.log(req.body)
  console.log(req.files.Image)

  productHelpers.addProduct(req.body,(insertedId)=>{
    let image=req.files.Image
    
    image.mv('../SHOPPING CART/public/product-images/'+insertedId+'.jpg',(err,done)=>{
      if(!err){
        res.render("admin/add-product")
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
    res.redirect('/admin/')
  })
 
})

router.get('/edit-product/:id', async(req,res)=>{
  let product= await productHelpers.getProductDetails(req.params.id)
  res.render('admin/edit-product',{product})
})

router.post('/edit-product/:id',(req,res)=>{
  let insertedId=req.params.id
  productHelpers.updateProduct(req.params.id, req.body).then(()=>{
    res.redirect('/admin')

    if(req.files.Image){
      let image=req.files.Image
      image.mv('../SHOPPING CART/public/product-images/'+insertedId+'.jpg')
    }
  })
  
})

router.get('/log-in', function(req, res){
  res.render('admin/log-in',{admin:true})

})

router.get('/sign-up', function(req, res){
res.render('admin/sign-up',{admin:true})
})

router.post('/sign-up', function(req, res){
  adminHelpers.doSign_up(req.body).then((response)=>{
   console.log(response)
   productHelpers.getAllProducts().then((products)=>{
    res.render('admin/view-products',{admin:true, products})
  })
   
  })
 })

 router.post('/log-in',(req, res)=>{
  adminHelpers.doLog_in(req.body).then((response)=>{  
   console.log(response)
   productHelpers.getAllProducts().then((products)=>{
    res.render('admin/view-products',{admin:true, products})
  })
})
})


module.exports = router;
