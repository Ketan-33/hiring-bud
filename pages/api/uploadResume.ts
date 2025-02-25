import { createRouter } from 'next-connect';
import multer from 'multer';
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

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

      // Read the uploaded file
      const filePath = path.join(process.cwd(), 'uploads', req.file.filename);
      const fileBuffer = fs.readFileSync(filePath);

      // Extract text from the PDF
      const pdfData = await pdfParse(fileBuffer);
      const extractedText = pdfData.text;

      // Process the extracted text to identify key sections
      const processedText = processResumeText(extractedText);

      res.status(200).json({ 
        message: 'File uploaded successfully',
        file: {
          filename: req.file.filename,
          size: req.file.size,
          id: req.file.filename // Adding id for reference
        },
        resumeContent: {
          fullText: extractedText,
          sections: processedText
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

// Function to process extracted resume text
const processResumeText = (text: string) => {
  const sections = {
    skills: '',
    experience: '',
    education: '',
    projects: '',
    contact: '', // Added contact section
    summary: ''  // Added summary section
  };

  // Enhanced regex patterns
  const skillsPattern = /(?:skills|technical skills|competencies|technologies|tools|programming languages)[:]\s*/i;
  const experiencePattern = /(?:experience|work experience|employment history|work history)[:]\s*/i;
  const educationPattern = /(?:education|academic|qualifications|degrees)[:]\s*/i;
  const projectsPattern = /(?:projects|personal projects|portfolio)[:]\s*/i;
  const contactPattern = /(?:contact|email|phone|address)[:]\s*/i;
  const summaryPattern = /(?:summary|profile|objective|about)[:]\s*/i;

  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  let currentSection = '';

  // Initialize summary with first few lines if no summary section is found
  sections.summary = lines.slice(0, 3).join('\n');

  lines.forEach(line => {
    // Check for section headers
    if (skillsPattern.test(line)) currentSection = 'skills';
    else if (experiencePattern.test(line)) currentSection = 'experience';
    else if (educationPattern.test(line)) currentSection = 'education';
    else if (projectsPattern.test(line)) currentSection = 'projects';
    else if (contactPattern.test(line)) currentSection = 'contact';
    else if (summaryPattern.test(line)) currentSection = 'summary';

    // Add line to current section
    if (currentSection) {
      sections[currentSection] += line + '\n';
    }
  });

  return sections;
};