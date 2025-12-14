-- Migration: Add customer_name and notes to transactions table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS notes text;
