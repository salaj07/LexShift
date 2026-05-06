/**
 * @file src/features/converter/api/converterApi.js
 * @description Axios API layer for document conversion operations.
 *
 * Uses withCredentials so the httpOnly JWT cookie is automatically
 * sent with every request (same as authApi.js).
 */

import axios from 'axios';

const converterAxios = axios.create({
  baseURL: 'http://localhost:3000/docs',
  withCredentials: true, // send httpOnly cookie automatically
});

/**
 * Upload a PDF file for conversion.
 * @param {File} file - The PDF file selected by the user
 * @returns {Promise} - { docId } of the newly created job
 */
export const uploadDocument = (file) => {
  const formData = new FormData();
  formData.append('document', file); // 'document' must match multer field name on backend

  return converterAxios.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Poll the conversion status of a document.
 * @param {string} docId - The document ID returned from upload
 * @returns {Promise} - { status: 'Uploading' | 'Extracting' | 'Converting' | 'Completed' | 'Failed' }
 */
export const getConversionStatus = (docId) =>
  converterAxios.get(`/status/${docId}`);

/**
 * Download the converted PDF.
 * Uses responseType: 'blob' so we receive binary PDF data.
 * @param {string} docId - The document ID of the completed conversion
 */
export const downloadConvertedPDF = async (docId) => {
  const response = await converterAxios.get(`/result/${docId}`, {
    responseType: 'blob', // receive PDF as binary blob, not JSON
  });

  // Create a temporary download link and trigger it
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `converted-${docId}.pdf`);
  document.body.appendChild(link);
  link.click();

  // Cleanup
  link.remove();
  window.URL.revokeObjectURL(url);
};
