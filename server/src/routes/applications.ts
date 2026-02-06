import { Router, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate, requireHR, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all applications (HR only)
router.get('/', authenticate, requireHR, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('applications')
      .select('*')
      .order('ai_score', { ascending: false });

    if (error) throw error;
    res.json({ applications: data || [] });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get applications by applicant
router.get('/my', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('applicant_id', req.user!.id)
      .order('applied_date', { ascending: false });

    if (error) throw error;
    res.json({ applications: data || [] });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get applications by job (HR only)
router.get('/job/:jobId', authenticate, requireHR, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { jobId } = req.params;
    const { data, error } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('job_id', jobId)
      .order('ai_score', { ascending: false });

    if (error) throw error;
    res.json({ applications: data || [] });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Create application (applicant)
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      job_id,
      applicant_name,
      applicant_email,
      resume_file_name,
      resume_text,
      ai_score,
      matched_skills,
    } = req.body;

    // Check if already applied
    const { data: existing } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('job_id', job_id)
      .eq('applicant_id', req.user!.id)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Already applied for this job' });
    }

    const { data, error } = await supabaseAdmin.from('applications').insert({
      job_id,
      applicant_id: req.user!.id,
      applicant_name,
      applicant_email,
      resume_file_name,
      resume_text,
      ai_score: ai_score || 0,
      matched_skills: matched_skills || [],
      status: 'pending',
    }).select().single();

    if (error) throw error;
    res.json({ application: data });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// Update application status (HR only)
router.patch('/:id/status', authenticate, requireHR, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewing', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data, error } = await supabaseAdmin
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ application: data });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// Get ranked applicants for dashboard (HR only)
router.get('/ranked', authenticate, requireHR, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const { data, error } = await supabaseAdmin
      .from('applications')
      .select('*')
      .order('ai_score', { ascending: false })
      .limit(Number(limit));

    if (error) throw error;
    res.json({ applications: data || [] });
  } catch (error) {
    console.error('Error fetching ranked applicants:', error);
    res.status(500).json({ error: 'Failed to fetch ranked applicants' });
  }
});

export default router;
