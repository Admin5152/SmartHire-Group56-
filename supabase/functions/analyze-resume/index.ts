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

    // Common tech terms and their variations (expanded)
    const skillVariations: Record<string, string[]> = {
      'JavaScript': ['javascript', 'js', 'ecmascript', 'es6', 'es2015', 'es2020', 'vanilla js'],
      'TypeScript': ['typescript', 'ts'],
      'React': ['react', 'reactjs', 'react.js', 'react native'],
      'Node.js': ['node', 'nodejs', 'node.js', 'express', 'expressjs'],
      'Python': ['python', 'py', 'django', 'flask', 'fastapi'],
      'Java': ['java', 'spring', 'spring boot', 'springboot', 'j2ee', 'jvm'],
      'C++': ['c++', 'cpp', 'c plus plus'],
      'C#': ['c#', 'csharp', 'c sharp', '.net', 'dotnet', 'asp.net'],
      'Go': ['golang', 'go lang', 'go programming'],
      'Rust': ['rust', 'rustlang'],
      'Ruby': ['ruby', 'rails', 'ruby on rails', 'ror'],
      'PHP': ['php', 'laravel', 'symfony', 'wordpress'],
      'Swift': ['swift', 'ios development', 'swiftui'],
      'Kotlin': ['kotlin', 'android development'],
      'SQL': ['sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'mssql', 'sql server', 'oracle db', 'database'],
      'MongoDB': ['mongodb', 'mongo', 'mongoose', 'nosql'],
      'AWS': ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'cloudfront', 'dynamodb', 'sqs', 'sns', 'ecs', 'eks'],
      'Azure': ['azure', 'microsoft azure', 'azure devops'],
      'GCP': ['gcp', 'google cloud', 'google cloud platform', 'bigquery', 'cloud run'],
      'Docker': ['docker', 'containerization', 'dockerfile', 'docker compose', 'container'],
      'Kubernetes': ['kubernetes', 'k8s', 'kubectl', 'helm'],
      'Git': ['git', 'github', 'gitlab', 'version control', 'bitbucket'],
      'REST': ['rest', 'restful', 'rest api', 'api development', 'api design'],
      'GraphQL': ['graphql', 'graph ql', 'apollo'],
      'HTML': ['html', 'html5', 'semantic html'],
      'CSS': ['css', 'css3', 'scss', 'sass', 'tailwind', 'tailwindcss', 'bootstrap', 'styled-components', 'less'],
      'Vue': ['vue', 'vuejs', 'vue.js', 'nuxt', 'vuex'],
      'Angular': ['angular', 'angularjs', 'angular.js', 'rxjs'],
      'Next.js': ['next', 'nextjs', 'next.js'],
      'Redux': ['redux', 'redux toolkit', 'rtk'],
      'PostgreSQL': ['postgresql', 'postgres', 'psql', 'pg'],
      'Redis': ['redis', 'caching'],
      'Linux': ['linux', 'ubuntu', 'centos', 'debian', 'unix', 'bash', 'shell'],
      'CI/CD': ['ci/cd', 'cicd', 'jenkins', 'github actions', 'gitlab ci', 'circleci', 'travis ci', 'continuous integration', 'continuous deployment'],
      'Agile': ['agile', 'scrum', 'kanban', 'sprint', 'jira', 'confluence'],
      'Machine Learning': ['machine learning', 'ml', 'deep learning', 'ai', 'artificial intelligence', 'neural network', 'nlp', 'natural language processing', 'computer vision'],
      'TensorFlow': ['tensorflow', 'tf', 'keras'],
      'PyTorch': ['pytorch', 'torch'],
      'Data Science': ['data science', 'data analysis', 'data analytics', 'pandas', 'numpy', 'scipy', 'matplotlib', 'jupyter'],
      'DevOps': ['devops', 'infrastructure', 'terraform', 'ansible', 'chef', 'puppet'],
      'Testing': ['testing', 'unit test', 'jest', 'mocha', 'cypress', 'selenium', 'pytest', 'tdd', 'test driven'],
      'Figma': ['figma', 'sketch', 'adobe xd', 'ui design', 'ux design'],
      'Firebase': ['firebase', 'firestore'],
      'Supabase': ['supabase'],
      'Elasticsearch': ['elasticsearch', 'elastic search', 'elk stack'],
      'RabbitMQ': ['rabbitmq', 'message queue', 'amqp'],
      'Kafka': ['kafka', 'apache kafka', 'event streaming'],
      'Nginx': ['nginx', 'reverse proxy', 'load balancer'],
      'Webpack': ['webpack', 'vite', 'rollup', 'bundler'],
    };

    techStack.forEach((tech) => {
      const techLower = tech.toLowerCase().trim();
      // Check built-in variations first
      const variations = skillVariations[tech] || skillVariations[Object.keys(skillVariations).find(k => k.toLowerCase() === techLower) || ''] || [techLower];
      
      const found = variations.some(variation => {
        // Use word boundary-like matching to avoid false positives
        const escapedVariation = variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?:^|[\\s,;.()\\-\\/])${escapedVariation}(?:[\\s,;.()\\-\\/]|$)`, 'i');
        return regex.test(resumeLower);
      });
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
    const experiencePatterns = [
      { pattern: /(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i, points: 5 },
      { pattern: /senior|lead|principal|architect|staff/i, points: 4 },
      { pattern: /managed|led\s+(a\s+)?team/i, points: 3 },
      { pattern: /bachelor|master|phd|degree|b\.?s\.?c|m\.?s\.?c/i, points: 3 },
      { pattern: /certified|certification/i, points: 2 },
      { pattern: /developed|built|created|designed|implemented|architected|deployed/i, points: 2 },
      { pattern: /contributed|maintained|optimized|improved|scaled/i, points: 2 },
      { pattern: /full[\s-]?stack|frontend|backend|devops|data\s*engineer/i, points: 2 },
      { pattern: /open[\s-]?source|github\.com|portfolio/i, points: 1 },
      { pattern: /award|hackathon|competition|published/i, points: 1 },
    ];
    
    experiencePatterns.forEach(({ pattern, points }) => {
      if (pattern.test(resumeLower)) {
        experienceBonus += points;
      }
    });

    // Calculate final score (capped at 100)
    const score = Math.min(Math.round(matchPercentage * 0.75 + experienceBonus * 1.5 + matchPercentage * 0.25), 100);

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
