-- Migration: Add void/refund support to transactions table
-- Run this in your Supabase SQL Editor

-- Add status column with default 'COMPLETED'
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'COMPLETED' 
CHECK (status IN ('COMPLETED', 'VOIDED', 'REFUNDED'));

-- Add void tracking columns
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS voided_by text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS void_reason text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS voided_at timestamp with time zone;

-- Create index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
