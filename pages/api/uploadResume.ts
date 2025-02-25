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
    contact: '',
    summary: ''
  };

  // Improved regex patterns - more flexible matching
  const skillsPattern = /\b(?:skills|technical skills|competencies|technologies|tools|programming languages)\b/i;
  const experiencePattern = /\b(?:experience|work experience|employment history|work history)\b/i;
  const educationPattern = /\b(?:education|academic|qualifications|degrees)\b/i;
  const projectsPattern = /\b(?:projects|personal projects|portfolio)\b/i;
  const contactPattern = /\b(?:contact|email|phone|address)\b/i;
  const summaryPattern = /\b(?:summary|profile|objective|about)\b/i;

  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  let currentSection = '';

  // Initialize summary with first few lines if they don't match any other section
  if (!lines[0]?.match(contactPattern)) {
    sections.summary = lines.slice(0, 3).join('\n');
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for section headers without requiring colons
    if (skillsPattern.test(line)) currentSection = 'skills';
    else if (experiencePattern.test(line)) currentSection = 'experience';
    else if (educationPattern.test(line)) currentSection = 'education';
    else if (projectsPattern.test(line)) currentSection = 'projects';
    else if (contactPattern.test(line)) currentSection = 'contact';
    else if (summaryPattern.test(line)) currentSection = 'summary';
    
    // Add content to current section if we're in a section
    if (currentSection && !line.match(/^[\s\t]*$/)) {
      sections[currentSection] += line + '\n';
    }
  }

  // Clean up sections by removing empty ones
  Object.keys(sections).forEach(key => {
    sections[key] = sections[key].trim();
  });

  // Debug log to help identify issues
  console.log('Processed sections:', sections);

  return sections;
};