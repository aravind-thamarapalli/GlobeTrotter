import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import api from '../lib/api';
import { motion } from 'framer-motion';

const CreateTrip = () => {
    const { register, control, handleSubmit } = useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            if (data.start_date) formData.append('start_date', new Date(data.start_date).toISOString());
            if (data.end_date) formData.append('end_date', new Date(data.end_date).toISOString());

            if (selectedFile) {
                formData.append('cover_photo', selectedFile);
            } else if (data.cover_photo_url) {
                formData.append('cover_photo_url', data.cover_photo_url); // Fallback to URL if typed
            }

            const res = await api.post('/trips', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate(`/trip/${res.data.id}`);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Plan a New Trip</h1>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-white/80">Trip Title</label>
                        <input
                            {...register('title', { required: true })}
                            className="glass-input w-full text-lg"
                            placeholder="e.g., Summer in Italy"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Start Date</label>
                            <Controller
                                control={control}
                                name="start_date"
                                render={({ field }) => (
                                    <DatePicker
                                        selected={field.value}
                                        onChange={(date) => field.onChange(date)}
                                        className="glass-input w-full"
                                        placeholderText="Select start date"
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">End Date</label>
                            <Controller
                                control={control}
                                name="end_date"
                                render={({ field }) => (
                                    <DatePicker
                                        selected={field.value}
                                        onChange={(date) => field.onChange(date)}
                                        className="glass-input w-full"
                                        placeholderText="Select end date"
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-white/80">Cover Photo</label>
                        <div className="flex gap-4 items-center">
                            <input
                                type="file"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                className="glass-input w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                accept="image/*"
                            />
                        </div>
                        <p className="text-xs text-white/40 mt-1">Upload an image or it will auto-generate one.</p>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-lg mt-4">
                        {loading ? 'Creating...' : 'Create Trip'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default CreateTrip;
