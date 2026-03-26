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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { fileBase64, fileType, fileName, techStack }: AnalyzeRequest = await req.json();

    if (!fileBase64 || !fileName) {
      throw new Error('Missing file data');
    }

    // Determine MIME type
    let mimeType = 'application/pdf';
    if (fileType === 'application/pdf') {
      mimeType = 'application/pdf';
    } else if (fileType.startsWith('image/')) {
      mimeType = fileType;
    } else if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      mimeType = fileType;
    }

    console.log('Calling Lovable AI for resume text extraction...');

    // For PDFs, convert to image first won't work. Use the data URL approach with Gemini.
    // Gemini supports PDFs via the image_url field with data URIs.
    const dataUrl = `data:${mimeType};base64,${fileBase64}`;
    
    // Use Gemini via Lovable AI Gateway to extract text from the resume
    const extractionResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract ALL text from this resume/CV document. Return ONLY the raw text content, preserving the structure (headings, bullet points, sections). Do not add any commentary, analysis, or formatting beyond what is in the document. If you cannot read the document, return whatever text you can extract.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 8000,
      }),
    });

    if (!extractionResponse.ok) {
      const errorText = await extractionResponse.text();
      console.error('AI extraction error:', errorText);
      throw new Error(`AI text extraction failed: ${extractionResponse.status}`);
    }

    const extractionResult = await extractionResponse.json();
    const extractedText = extractionResult.choices?.[0]?.message?.content || '';

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text could be extracted from the resume');
    }

    console.log('Extracted text length:', extractedText.length);

    // Analyze resume against tech stack
    const resumeLower = extractedText.toLowerCase();
    const matchedSkills: string[] = [];

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

    const matchPercentage = techStack.length > 0
      ? (matchedSkills.length / techStack.length) * 100
      : 0;

    let experienceBonus = 0;
    const experienceIndicators = ['years of experience', 'worked at', 'developed', 'built', 'created', 'led', 'managed', 'senior', 'lead'];
    experienceIndicators.forEach(indicator => {
      if (resumeLower.includes(indicator)) {
        experienceBonus += 2;
      }
    });

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
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
