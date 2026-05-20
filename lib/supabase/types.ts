export type Plan = 'free' | 'starter' | 'pro' | 'expert'
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled'
export type ApplicationStatus = 'to_apply' | 'applied' | 'interview' | 'offer' | 'rejected' | 'accepted'
export type CvFormat = 'pdf' | 'docx'
export type Feature = 'cv_optimizer' | 'job_analyzer' | 'cover_letter' | 'job_search'
export type Language = 'en' | 'fr'

export interface User {
  id: string
  email: string
  full_name: string | null
  country: string | null
  language: Language
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: Plan
  attempts_remaining: number
  attempts_total: number
  renewal_date: string | null
  renewal_confirmed: boolean | null
  status: SubscriptionStatus
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

export interface Cv {
  id: string
  user_id: string
  filename: string
  format: CvFormat
  storage_path: string
  is_optimized: boolean
  original_cv_id: string | null
  ats_score: number | null
  created_at: string
}

export interface CoverLetter {
  id: string
  user_id: string
  content: string
  job_title: string | null
  company: string | null
  format: CvFormat | null
  storage_path: string | null
  created_at: string
}

export interface Application {
  id: string
  user_id: string
  job_title: string
  company: string
  job_url: string | null
  status: ApplicationStatus
  notes: string | null
  cv_id: string | null
  cover_letter_id: string | null
  applied_at: string | null
  created_at: string
  updated_at: string
}

export interface SavedJob {
  id: string
  user_id: string
  job_data: Record<string, unknown>
  saved_at: string
}

export interface UsageLog {
  id: string
  user_id: string
  feature: Feature
  refunded: boolean
  created_at: string
}

// Plan config helper
export const PLAN_CONFIG: Record<Plan, { attempts: number; label: string; price: number }> = {
  free:    { attempts: 4,   label: 'Free',   price: 0  },
  starter: { attempts: 25,  label: 'Starter', price: 2  },
  pro:     { attempts: 60,  label: 'Pro',     price: 5  },
  expert:  { attempts: 130, label: 'Expert',  price: 10 },
}
