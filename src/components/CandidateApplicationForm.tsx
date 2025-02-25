"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { upsertVector } from '../lib/pinecone';
import { getTextEmbedding } from '../lib/textEmbedding';
// import Image from 'next/image';

const CandidateApplicationForm = ({ className = '' }) => {
    const [formData, setFormData] = useState<{
        name: string;
        email: string;
        linkedInUrl: string;
        resume: File | null;
        skillsExperience: string;
    }>({
        name: '',
        email: '',
        linkedInUrl: '',
        resume: null,
        skillsExperience: ''
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFormData({
                ...formData,
                resume: e.target.files[0]
            });
        }
    };

    const validate = (): { [key: string]: string } => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.linkedInUrl) newErrors.linkedInUrl = 'LinkedIn URL is required';
        if (!formData.resume) newErrors.resume = 'Resume is required';
        if (!formData.skillsExperience) newErrors.skillsExperience = 'Skills & Experience is required';
        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const validationErrors = validate();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      setIsSubmitting(true);
      setErrors({});
    
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          formDataToSend.append(key, value);
        }
      });
    
      try {
        const uploadResponse = await axios.post('/api/uploadResume', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
    
        if (uploadResponse.status !== 200) {
          throw new Error(uploadResponse.data.error || 'Upload failed');
        }
    
        const embedding = await getTextEmbedding(uploadResponse.data.resumeContent.fullText);
        const vectorId = `candidate_${Date.now()}`;
    
        const metadata = {
          name: formData.name,
          email: formData.email,
          linkedInUrl: formData.linkedInUrl,
          skillsExperience: formData.skillsExperience,
          resumeId: uploadResponse.data.file.id,
          timestamp: new Date().toISOString(),
          skills: uploadResponse.data.resumeContent.sections.skills,
          experience: uploadResponse.data.resumeContent.sections.experience,
          education: uploadResponse.data.resumeContent.sections.education,
          projects: uploadResponse.data.resumeContent.sections.projects,
          fullResumeText: uploadResponse.data.resumeContent.fullText
        };
    
        await upsertVector(vectorId, embedding, metadata);
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          linkedInUrl: '',
          resume: null,
          skillsExperience: ''
        });
      } catch (error: any) {
        console.error('Submission error:', error);
        setErrors({ submit: `Error: ${error.message || 'Something went wrong'}` });
      } finally {
        setIsSubmitting(false);
      }
    };

    if (submitSuccess) {
      return (
        <div className={`max-w-xl mx-auto p-8 bg-white rounded-xl shadow-lg ${className}`}>
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">Thank you for applying. We&#39;ll review your application and get back to you soon.</p>
            <button 
              onClick={() => setSubmitSuccess(false)} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      );
    }

    return (
        <div className={`bg-gradient-to-b from-gray-50 to-gray-100 py-8 ${className}`}>
          <div className="max-w-xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Candidate Application</h2>
                <p className="text-gray-600">Complete the form below to submit your application</p>
              </div>
              
              {errors.submit && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-600">{errors.submit}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="mb-5">
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="name">Full Name</label>
                  <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`shadow-sm appearance-none border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200`}
                      placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                
                <div className="mb-5">
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">Email Address</label>
                  <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`shadow-sm appearance-none border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200`}
                      placeholder="your.email@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                
                <div className="mb-5">
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="linkedInUrl">LinkedIn Profile</label>
                  <input
                      id="linkedInUrl"
                      type="url"
                      name="linkedInUrl"
                      value={formData.linkedInUrl}
                      onChange={handleChange}
                      className={`shadow-sm appearance-none border ${errors.linkedInUrl ? 'border-red-500' : 'border-gray-300'} rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200`}
                      placeholder="https://linkedin.com/in/yourprofile"
                  />
                  {errors.linkedInUrl && <p className="text-red-500 text-xs mt-1">{errors.linkedInUrl}</p>}
                </div>
                
                <div className="mb-5">
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="resume">Resume (PDF)</label>
                  <div className={`flex items-center justify-center w-full border-2 border-dashed ${errors.resume ? 'border-red-300' : 'border-gray-300'} rounded-lg p-6 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200`}>
                    <input
                        id="resume"
                        type="file"
                        name="resume"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <label htmlFor="resume" className="cursor-pointer text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        {formData.resume ? (
                          <p className="text-sm text-indigo-600 font-medium">{formData.resume.name}</p>
                        ) : (
                          <p className="text-sm text-gray-500">Click to upload your resume (PDF only)</p>
                        )}
                      </div>
                    </label>
                  </div>
                  {errors.resume && <p className="text-red-500 text-xs mt-1">{errors.resume}</p>}
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="skillsExperience">Skills & Experience</label>
                  <textarea
                      id="skillsExperience"
                      name="skillsExperience"
                      value={formData.skillsExperience}
                      onChange={handleChange}
                      className={`shadow-sm appearance-none border ${errors.skillsExperience ? 'border-red-500' : 'border-gray-300'} rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200`}
                      placeholder="Describe your key skills and experience..."
                      rows={5}
                  />
                  {errors.skillsExperience && <p className="text-red-500 text-xs mt-1">{errors.skillsExperience}</p>}
                </div>
                
                <div className="flex justify-center">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
    );
};

export default CandidateApplicationForm;