import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface AnalyzeRequest {
  fileBase64: string;
  fileType: string;
  fileName: string;
  techStack: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OCR_API_KEY = Deno.env.get('OCR_API_KEY');
    if (!OCR_API_KEY) {
      throw new Error('OCR_API_KEY is not configured');
    }

    const { fileBase64, fileType, fileName, techStack }: AnalyzeRequest = await req.json();

    if (!fileBase64 || !fileName) {
      throw new Error('Missing file data');
    }

    // Determine the MIME type for the base64 data URL
    let mimeType = 'application/octet-stream';
    if (fileType === 'application/pdf') {
      mimeType = 'application/pdf';
    } else if (fileType === 'application/msword') {
      mimeType = 'application/msword';
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (fileType.startsWith('image/')) {
      mimeType = fileType;
    }

    // Determine file type for OCR.space API
    const ocrFileType = fileName.toLowerCase().endsWith('.pdf') ? 'PDF' : 'AUTO';
    
    // Call OCR.space API with proper base64 format
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
      throw new Error(`OCR API failed: ${ocrResponse.status}`);
    }

    const ocrResult = await ocrResponse.json();
    console.log('OCR API response received');

    if (ocrResult.IsErroredOnProcessing) {
      throw new Error(ocrResult.ErrorMessage?.[0] || 'OCR processing failed');
    }

    // Extract text from all parsed pages
    let extractedText = '';
    if (ocrResult.ParsedResults && ocrResult.ParsedResults.length > 0) {
      extractedText = ocrResult.ParsedResults
        .map((result: { ParsedText: string }) => result.ParsedText)
        .join('\n');
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text could be extracted from the resume');
    }

    console.log('Extracted text length:', extractedText.length);

    // Analyze resume against tech stack
    const resumeLower = extractedText.toLowerCase();
    const matchedSkills: string[] = [];

    // Common tech terms and their variations
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

    techStack.forEach((tech) => {
      const techLower = tech.toLowerCase();
      const variations = skillVariations[tech] || [techLower];
      
      const found = variations.some(variation => resumeLower.includes(variation));
      if (found) {
        matchedSkills.push(tech);
      }
    });

    // Calculate score based on matched skills
    const matchPercentage = techStack.length > 0 
      ? (matchedSkills.length / techStack.length) * 100 
      : 0;
    
    // Add bonus points for experience indicators
    let experienceBonus = 0;
    const experienceIndicators = ['years of experience', 'worked at', 'developed', 'built', 'created', 'led', 'managed', 'senior', 'lead'];
    experienceIndicators.forEach(indicator => {
      if (resumeLower.includes(indicator)) {
        experienceBonus += 2;
      }
    });

    // Calculate final score (capped at 100)
    const score = Math.min(Math.round(matchPercentage + experienceBonus), 100);

    console.log('Analysis complete. Score:', score, 'Matched skills:', matchedSkills);

    return new Response(
      JSON.stringify({
        success: true,
        extractedText,
        matchedSkills,
        score,
        totalSkillsRequired: techStack.length,
        skillsMatched: matchedSkills.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-resume function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
