import { createClient } from '@supabase/supabase-js'

// TODO: 아래 값을 실제 프로젝트의 Supabase URL/키로 교체하세요!
const supabaseUrl = 'https://yrrmtcvviactkmxibodu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlycm10Y3Z2aWFjdGtteGlib2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDA4MjYsImV4cCI6MjA2NzAxNjgyNn0.K1ZxrtCWKCLLpPNJf0CkR0H7LRNsvMb07Uy2TuFXwh0';

export const getSupabase = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase 환경변수가 누락되었습니다.')
  }
  return createClient(supabaseUrl, supabaseAnonKey)
} 