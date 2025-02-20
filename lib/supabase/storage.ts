import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

// Upload a file to a specific bucket
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options = { upsert: false }
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, options);

  if (error) throw error;
  return data;
}

// Get a public URL for a file
export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

// Delete a file from a bucket
export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
}

// List all files in a bucket/folder
export async function listFiles(bucket: string, path?: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path);

  if (error) throw error;
  return data;
}

// Download a file
export async function downloadFile(bucket: string, path: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);

  if (error) throw error;
  return data;
}

// Create a signed URL for temporary access
export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 60 // seconds
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data;
}

// Move/Copy a file
export async function moveFile(
  bucket: string,
  fromPath: string,
  toPath: string
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .move(fromPath, toPath);

  if (error) throw error;
  return data;
}

// Copy a file
export async function copyFile(
  bucket: string,
  fromPath: string,
  toPath: string
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .copy(fromPath, toPath);

  if (error) throw error;
  return data;
} 