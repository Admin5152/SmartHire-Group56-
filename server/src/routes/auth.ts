import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// HR Admin credentials
const HR_ADMIN_EMAIL = 'Group56@gmail.com';
const HR_ADMIN_PASSWORD = 'Group56';

// Sign up
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    // Only allow HR signup with admin credentials
    if (role === 'hr') {
      if (email !== HR_ADMIN_EMAIL || password !== HR_ADMIN_PASSWORD) {
        return res.status(403).json({ error: 'HR accounts can only be created with admin credentials.' });
      }
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (data.user) {
      // Create profile
      const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        user_id: data.user.id,
        name,
        role,
      });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return res.status(500).json({ error: 'Failed to create user profile' });
      }
    }

    res.json({ success: true, user: data.user });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Sign in
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    // Check HR admin credentials
    if (role === 'hr') {
      if (email !== HR_ADMIN_EMAIL || password !== HR_ADMIN_PASSWORD) {
        return res.status(403).json({ error: 'Invalid HR admin credentials. Access denied.' });
      }
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    if (data.user) {
      // Verify user role matches requested role
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (profile && profile.role !== role) {
        return res.status(403).json({ 
          error: `This account is registered as ${profile.role}, not ${role}.` 
        });
      }

      res.json({
        user: {
          id: data.user.id,
          email: data.user.email,
          name: profile?.name || '',
          role: profile?.role || 'applicant',
        },
        session: data.session,
      });
    }
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Signin failed' });
  }
});

// Sign out
router.post('/signout', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.accessToken) {
      await supabaseAdmin.auth.admin.signOut(req.accessToken);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ error: 'Signout failed' });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// Refresh session
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;
    
    const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token });
    
    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({ session: data.session });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

export default router;
