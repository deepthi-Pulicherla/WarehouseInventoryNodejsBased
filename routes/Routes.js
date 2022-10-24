const express = require("express")
const router = express.Router();
const fs = require('fs');
const productRoutes = require('./product.js') // import account route
router.use(productRoutes) // use account route


const prodPath = './details/products.json'
const invPath = './details/inventory.json'



const saveProductsData = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync(prodPath, stringifyData)
}

const saveInventoryData = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync(invPath, stringifyData)
}

const getProducts = () => {
    const jsonData = fs.readFileSync(prodPath)
    return JSON.parse(jsonData)
}

const getInventory = () => {
    const jsonData = fs.readFileSync(invPath)
    return JSON.parse(jsonData)
}

const replaceWithOriginal = (data) => {
      return data
}

const getProductDetails = () => {
    const products = getProducts()
    const inventories = getInventory()
    let obj1
    let obj2

    for(var i=0; i<products['products'].length;i++)
    {

           if(products['products'][i]['name']==='Dining Chair')
           {
               var finalObj1 ="\"articlesAndQuantity\":["

               for(var j=0; j<inventories['inventory'].length;j++)
               {

                   for(var k=0;k<products['products'][i]['contain_articles'].length;k++)
                   {
                       if(products['products'][i]['contain_articles'][k]['art_id']===inventories['inventory'][j]['art_id'])
                       {
                               finalObj1 = finalObj1 + "{" + '\"articalName\"'+':'+'"'+inventories['inventory'][j]['name'] +'"'+ "," + '\"quantity\"'+':'+'"'+products['products'][i]['contain_articles'][k]['amount_of']+'"' + "},";
                           }

                       }
                   }

               obj1 = replaceWithOriginal("{\n" +
                   "  \"products\": [\n" +
                   "    {\n" +
                   "      \"name\": \"Dining Chair\","+"\"price\": \"1000\","+finalObj1.replace(/,$/,"")+"]}")

               }

        if(products['products'][i]['name']==='Dinning Table')
        {
            var finalObj2 ="\"articlesAndQuantity\":["

            for(var j=0; j<inventories['inventory'].length;j++)
            {

                for(var k=0;k<products['products'][i]['contain_articles'].length;k++)
                {
                    if(products['products'][i]['contain_articles'][k]['art_id']===inventories['inventory'][j]['art_id'])
                    {
                        finalObj2 = finalObj2 + "{" + '\"articalName\"'+':'+'"'+inventories['inventory'][j]['name'] +'"'+ "," + '\"quantity\"'+':'+'"'+products['products'][i]['contain_articles'][k]['amount_of']+'"' + "},";
                    }

                }
            }

            obj2 = replaceWithOriginal("," +
                "    {\n" +
                "      \"name\": \"Dinning Table\","+"\"price\": \"2000\","+finalObj2.replace(/,$/,"")+"]}");
        }
    }
    return obj1+obj2
}

const updateInventory = (data) => {
    var invData = getInventory()
    for( var i=0; i<data.length;i++)
    {
        for(var j=0; j<invData['inventory'].length;j++)
        {
          if(invData['inventory'][j]['art_id'] === data[i]['art_id'])
          {
            invData['inventory'][j]['stock'] = invData['inventory'][j]['stock'] - data[i]['amount_of']
              console.log(invData['inventory'][j]['stock'])
              saveInventoryData(invData)
          }
        }
    }
}

//Shows up the products.json file

productRoutes.get('/warehouse/getAllProducts', (req, res) => {
    const products = getProducts()
    console.log(products)
    res.send(products)
})


//api which shows the complete details of all the products

productRoutes.get('/warehouse/getProductDetails', (req, res) => {
    res.send(getProductDetails())
})


//Inventory loaded as default page once the server is started

productRoutes.get('/', (req, res) => {
    const inventory = getInventory()
    res.send(inventory)
})


//Inventory updated after the product is sold

productRoutes.delete('/warehouse/product/sell/:prod', (req, res) => {
    fs.readFile(prodPath, 'utf8', (err, data) => {
        var existAccounts = getProducts()
        const prodId = req.params['prod'];
        for( var i=0; i<existAccounts['products'].length;i++)
        {
          if(existAccounts['products'][i]['name']===prodId)
          {
              updateInventory(existAccounts['products'][i]['contain_articles'])
             delete existAccounts['products'][i];
             saveProductsData(existAccounts)
          }

        }
        res.send(`accounts with id ${prodId} has been deleted`)
    }, true);
})



module.exports = router;