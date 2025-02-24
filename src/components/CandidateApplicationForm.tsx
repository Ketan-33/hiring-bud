"use client";

import React, { useState } from 'react';
import axios from 'axios';

const CandidateApplicationForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        linkedInUrl: '',
        resume: null,
        skillsExperience: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            resume: e.target.files[0]
        });
    };

    const validate = () => {
        const newErrors = {};
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }
      
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('linkedInUrl', formData.linkedInUrl);
        formDataToSend.append('resume', formData.resume);
        formDataToSend.append('skillsExperience', formData.skillsExperience);
      
        try {
          console.log('Sending form data...');
          const response = await axios.post('/api/uploadResume', formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            validateStatus: (status) => status < 500,
          });
      
          if (response.status !== 200) {
            throw new Error(response.data.error || 'Upload failed');
          }
      
          console.log('Upload successful:', response.data);
          // Handle success (e.g., show success message, reset form)
        } catch (error) {
          console.error('Upload error:', error);
          // Handle error (e.g., show error message to user)
        }
      };

    return (
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md">
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                {errors.name && <span className="text-red-500 text-xs italic">{errors.name}</span>}
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                {errors.email && <span className="text-red-500 text-xs italic">{errors.email}</span>}
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">LinkedIn URL:</label>
                <input
                    type="url"
                    name="linkedInUrl"
                    value={formData.linkedInUrl}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                {errors.linkedInUrl && <span className="text-red-500 text-xs italic">{errors.linkedInUrl}</span>}
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Resume (PDF):</label>
                <input
                    type="file"
                    name="resume"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                {errors.resume && <span className="text-red-500 text-xs italic">{errors.resume}</span>}
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Skills & Experience:</label>
                <textarea
                    name="skillsExperience"
                    value={formData.skillsExperience}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                {errors.skillsExperience && <span className="text-red-500 text-xs italic">{errors.skillsExperience}</span>}
            </div>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Submit</button>
        </form>
    );
};

export default CandidateApplicationForm;