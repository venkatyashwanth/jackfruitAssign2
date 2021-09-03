const express = require('express');
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "userInfo.db");
const app = express();
const port = 3200;
const cors = require("cors");
const { get } = require('https');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());

let datbase = null;

const initializeDbAndServer = async () => {
    try {
      database = await open({
        filename: databasePath,
        driver: sqlite3.Database, 
      });
      app.listen(port, () =>
        console.log("Server Running at http://localhost:3200/")
      );
    } catch (error) {
      console.log(`DB Error: ${error.message}`);
      process.exit(1);
    }
  };
  
  initializeDbAndServer();




app.get('/',cors(), async(req,res) => {
    res.send("This is working")
})

const calculateTax = (bas,lta,hra,fa,inv,rent,med,val) =>{
    bas = parseFloat(bas);
    lta = parseFloat(lta);
    hra = parseFloat(hra);
    fa = parseFloat(fa);
    inv = parseFloat(inv);
    rent = parseFloat(rent);
    me = parseFloat(med);
    val = Boolean(val);

    const salary = bas+lta+hra+fa;

    let a;
    let b;
    let c;

    if (val === true){
        a = bas * 0.5
        b = rent - (0.1 * bas)
        c = hra
    }else if(val === false){
        a = bas * 0.4
        b = rent - (0.1 * bas)
        c = hra
    }

    let appHra;

    if(a<b && a<c){
        appHra = a
    }
    else if(b<c){
        appHra = b
    }else{
        appHra = c
    }

    const TaxInc = salary-appHra-inv-med;
    return TaxInc
}

app.post("/post_name",async(req,res)=>{
    let {bas,lta,hra,fa,inv,rent,med,val} = req.body;
    let city;
    if(val === 'true'){
        city = 'Metro'
    }else if(val === 'false'){
        city = "Non Metro"
    }

    let tax = calculateTax(bas,lta,hra,fa,inv,rent,med,val);
    const postUserQuery = `
    INSERT INTO
      user(Bas, LTA, HRA, FA, Inv, Rent, Med, TaxInc, CityType)
    VALUES
      ('${bas}', '${lta}', '${hra}','${fa}','${inv}','${rent}','${med}','${tax}','${city}');`;
    const player = await database.run(postUserQuery);
})

app.get('/data',async(req,res)=>{
  const getData= `
  select 
  * 
  FROM 
  user;
  `;
  const data = await database.all(getData);

  let len = (data.length)-1;
  let output = data[len];
  let outData = String(output.TaxInc);
  res.send(outData);
})
