import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Skill variations for matching
const skillVariations: Record<string, string[]> = {
  'JavaScript': ['javascript', 'js', 'ecmascript'],
  'TypeScript': ['typescript', 'ts'],
  'React': ['react', 'reactjs', 'react.js'],
  'Node.js': ['node', 'nodejs', 'node.js'],
  'Python': ['python', 'py'],
  'Java': ['java'],
  'C++': ['c++', 'cpp'],
  'C#': ['c#', 'csharp', 'c sharp'],
  'Go': ['golang', 'go lang'],
  'Rust': ['rust', 'rustlang'],
  'SQL': ['sql', 'mysql', 'postgresql', 'postgres'],
  'MongoDB': ['mongodb', 'mongo'],
  'AWS': ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
  'Docker': ['docker', 'containerization'],
  'Kubernetes': ['kubernetes', 'k8s'],
  'Git': ['git', 'github', 'gitlab', 'version control'],
  'REST': ['rest', 'restful', 'rest api'],
  'GraphQL': ['graphql', 'graph ql'],
  'HTML': ['html', 'html5'],
  'CSS': ['css', 'css3', 'scss', 'sass', 'tailwind'],
  'Vue': ['vue', 'vuejs', 'vue.js'],
  'Angular': ['angular', 'angularjs'],
  'Next.js': ['next', 'nextjs', 'next.js'],
  'Redux': ['redux'],
  'PostgreSQL': ['postgresql', 'postgres', 'psql'],
  'Redis': ['redis'],
  'Linux': ['linux', 'ubuntu', 'centos', 'debian'],
  'CI/CD': ['ci/cd', 'cicd', 'jenkins', 'github actions', 'gitlab ci'],
  'Agile': ['agile', 'scrum', 'kanban'],
  'Machine Learning': ['machine learning', 'ml', 'deep learning', 'ai'],
  'TensorFlow': ['tensorflow', 'tf'],
  'PyTorch': ['pytorch'],
};

// Analyze resume with OCR
router.post('/analyze', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fileBase64, fileType, fileName, techStack } = req.body;

    if (!fileBase64 || !fileName) {
      return res.status(400).json({ error: 'Missing file data' });
    }

    const OCR_API_KEY = process.env.OCR_API_KEY;
    if (!OCR_API_KEY) {
      return res.status(500).json({ error: 'OCR API key not configured' });
    }

    // Determine MIME type
    let mimeType = 'application/octet-stream';
    if (fileType === 'application/pdf') {
      mimeType = 'application/pdf';
    } else if (fileType === 'application/msword') {
      mimeType = 'application/msword';
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (fileType?.startsWith('image/')) {
      mimeType = fileType;
    }

    const ocrFileType = fileName.toLowerCase().endsWith('.pdf') ? 'PDF' : 'AUTO';

    // Call OCR.space API
    const formData = new FormData();
    formData.append('base64Image', `data:${mimeType};base64,${fileBase64}`);
    formData.append('apikey', OCR_API_KEY);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('filetype', ocrFileType);
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');
    formData.append('isCreateSearchablePdf', 'false');
    formData.append('isTable', 'true');

    console.log('Calling OCR.space API...');

    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    if (!ocrResponse.ok) {
      const errorText = await ocrResponse.text();
      console.error('OCR API error:', errorText);
      return res.status(500).json({ error: `OCR API failed: ${ocrResponse.status}` });
    }

    const ocrResult = await ocrResponse.json();
    console.log('OCR API response received');

    if (ocrResult.IsErroredOnProcessing) {
      return res.status(500).json({ 
        error: ocrResult.ErrorMessage?.[0] || 'OCR processing failed' 
      });
    }

    // Extract text from all parsed pages
    let extractedText = '';
    if (ocrResult.ParsedResults && ocrResult.ParsedResults.length > 0) {
      extractedText = ocrResult.ParsedResults
        .map((result: { ParsedText: string }) => result.ParsedText)
        .join('\n');
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'No text could be extracted from the resume' });
    }

    console.log('Extracted text length:', extractedText.length);

    // Analyze resume against tech stack
    const resumeLower = extractedText.toLowerCase();
    const matchedSkills: string[] = [];

    (techStack || []).forEach((tech: string) => {
      const techLower = tech.toLowerCase();
      const variations = skillVariations[tech] || [techLower];
      const found = variations.some(variation => resumeLower.includes(variation));
      if (found) {
        matchedSkills.push(tech);
      }
    });

    // Calculate score
    const matchPercentage = (techStack?.length || 0) > 0
      ? (matchedSkills.length / techStack.length) * 100
      : 0;

    // Add experience bonus
    let experienceBonus = 0;
    const experienceIndicators = ['years of experience', 'worked at', 'developed', 'built', 'created', 'led', 'managed', 'senior', 'lead'];
    experienceIndicators.forEach(indicator => {
      if (resumeLower.includes(indicator)) {
        experienceBonus += 2;
      }
    });

    const score = Math.min(Math.round(matchPercentage + experienceBonus), 100);

    console.log('Analysis complete. Score:', score, 'Matched skills:', matchedSkills);

    res.json({
      success: true,
      extractedText,
      matchedSkills,
      score,
      totalSkillsRequired: techStack?.length || 0,
      skillsMatched: matchedSkills.length,
    });
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

export default router;
