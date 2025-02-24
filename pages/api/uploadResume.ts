import { createRouter } from 'next-connect';
import multer from 'multer';
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Only PDF files are allowed!'), false);
    } else {
      cb(null, true);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

router
  .use(async (req, res, next) => {
    console.log('Processing upload request...');
    try {
      await new Promise((resolve, reject) => {
        upload.single('resume')(req, res, (err) => {
          if (err) {
            console.error('Upload error:', err);
            reject(err);
          }
          resolve(void 0);
        });
      });
      next();
    } catch (error) {
      console.error('Middleware error:', error);
      res.status(500).json({ error: error.message });
    }
  })
  .post(async (req, res) => {
    try {
      if (!req.file) {
        throw new Error('No file uploaded');
      }
      
      console.log('File received:', {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      res.status(200).json({ 
        message: 'File uploaded successfully',
        file: {
          filename: req.file.filename,
          size: req.file.size
        }
      });
    } catch (error) {
      console.error('Upload handler error:', error);
      res.status(500).json({ error: error.message });
    }
  });

export default router.handler({
  onError: (err, req, res) => {
    console.error('Router error:', err);
    res.status(500).json({ error: err.message });
  }
});

export const config = {
  api: {
    bodyParser: false,
  }
};