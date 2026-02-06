import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate, requireHR, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all jobs (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .order('posted_date', { ascending: false });

    if (error) throw error;
    res.json({ jobs: data || [] });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get single job (public)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json({ job: data });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Get jobs by creator (HR only)
router.get('/creator/me', authenticate, requireHR, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('created_by', req.user!.id)
      .order('posted_date', { ascending: false });

    if (error) throw error;
    res.json({ jobs: data || [] });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Create job (HR only)
router.post('/', authenticate, requireHR, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, department, location, type, tech_stack, requirements, is_external } = req.body;

    const { data, error } = await supabaseAdmin.from('jobs').insert({
      title,
      description,
      department,
      location,
      type: type || 'Full-time',
      tech_stack: tech_stack || [],
      requirements: requirements || [],
      created_by: req.user!.id,
      is_external: is_external || false,
    }).select().single();

    if (error) throw error;
    res.json({ job: data });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Update job (HR only, own jobs)
router.put('/:id', authenticate, requireHR, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, department, location, type, tech_stack, requirements } = req.body;

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from('jobs')
      .select('created_by')
      .eq('id', id)
      .single();

    if (!existing || existing.created_by !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to update this job' });
    }

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .update({
        title,
        description,
        department,
        location,
        type,
        tech_stack,
        requirements,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ job: data });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete job (HR only, own jobs)
router.delete('/:id', authenticate, requireHR, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from('jobs')
      .select('created_by')
      .eq('id', id)
      .single();

    if (!existing || existing.created_by !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to delete this job' });
    }

    const { error } = await supabaseAdmin
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

export default router;
