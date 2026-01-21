const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// API Endpoint untuk TempBan
app.post('/api/tempban', async (req, res) => {
  try {
    const { countryCode, phoneNumber, adminKey } = req.body;
    
    // Validasi input
    if (!countryCode || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Harap masukkan kode negara dan nomor telepon'
      });
    }
    
    // Validasi admin key (ganti dengan logika autentikasi yang sesuai)
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya administrator yang diizinkan.'
      });
    }
    
    const fullNumber = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
    
    // Logika TempBan (simulasi)
    const results = [];
    const totalAttempts = 50;
    let successCount = 0;
    
    for (let i = 0; i < totalAttempts; i++) {
      // Simulasi pengiriman kode registrasi
      const isSuccess = Math.random() > 0.1; // 90% success rate
      
      if (isSuccess) {
        successCount++;
        const pawPrefix = Math.floor(Math.random() * 999);
        const pawSuffix = Math.floor(Math.random() * 999);
        const registerCode = `${pawPrefix}-${pawSuffix}`;
        
        results.push({
          attempt: i + 1,
          status: 'success',
          code: registerCode,
          message: `Kode registrasi berhasil dikirim: ${registerCode}`
        });
      } else {
        results.push({
          attempt: i + 1,
          status: 'error',
          message: 'Gagal mengirim kode registrasi'
        });
      }
      
      // Delay simulasi
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return res.json({
      success: true,
      message: `Proses TempBan selesai untuk nomor +${fullNumber}`,
      target: fullNumber,
      results: results,
      summary: {
        totalAttempts: totalAttempts,
        successCount: successCount,
        failureCount: totalAttempts - successCount,
        successRate: Math.round((successCount / totalAttempts) * 100)
      }
    });
    
  } catch (error) {
    console.error('Error in tempban API:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan internal server'
    });
  }
});

// Endpoint untuk status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    service: 'TempBan API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

// Export untuk Vercel
module.exports = app;

// Untuk running lokal
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
