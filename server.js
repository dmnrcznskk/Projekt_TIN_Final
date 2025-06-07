const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Serwujemy statycznie cały katalog główny (żeby HTML, CSS, JS i obrazki były dostępne "od ręki")
app.use(express.static(path.join(__dirname)));

// Zwraca listę wszystkich katalogów-miotów w /uploads
app.get('/api/mioty', (req, res) => {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    return res.json([]);
  }
  const litters = fs.readdirSync(uploadsDir)
    .filter(name => fs.statSync(path.join(uploadsDir, name)).isDirectory())
    .map(name => {
      const parts = name.split('_');
      const number = parts.length > 1 ? parts[1] : '';
      return { id: name, name: `Miot ${number.toUpperCase()}` };
    });
  res.json(litters);
});

// Zwraca szczegółowe dane wybranego miotu (nazwy kociąt i ścieżki do zdjęć)
app.get('/api/mioty/:id', (req, res) => {
  const litterId = req.params.id;
  const litterPath = path.join(__dirname, 'uploads', litterId);
  if (!fs.existsSync(litterPath)) {
    return res.status(404).json({ error: 'Miot nie istnieje' });
  }
  const kittens = fs.readdirSync(litterPath)
    .filter(name => fs.statSync(path.join(litterPath, name)).isDirectory())
    .map(kittenName => {
      const kittenPath = path.join(litterPath, kittenName);
      const photos = fs.readdirSync(kittenPath)
        .filter(file => file.match(/\.(jpg|jpeg|png|webp)$/i))
        .map(file => `/uploads/${litterId}/${kittenName}/${file}`);
      return { imie: kittenName, zdjecia: photos };
    });
  res.json({
    nazwa: `Miot ${litterId.split('_')[1].toUpperCase()}`,
    data: 'Brak daty',
    kociaki: kittens
  });
});

app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});
