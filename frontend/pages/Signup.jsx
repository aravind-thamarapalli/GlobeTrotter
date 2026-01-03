import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Signup = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const onSubmit = async (data) => {
        try {
            await signup(data);
            navigate('/dashboard');
        } catch (err) {
            setError('Signup failed. Email usage?');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-md p-8 relative z-10"
            >
                <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                    Join GlobeTrotter
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-white/80">Full Name</label>
                        <input
                            {...register('name', { required: true })}
                            className="glass-input w-full"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-white/80">Email</label>
                        <input
                            {...register('email', { required: true })}
                            type="email"
                            className="glass-input w-full"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-white/80">Password</label>
                        <input
                            {...register('password', { required: true, minLength: 6 })}
                            type="password"
                            className="glass-input w-full"
                            placeholder="••••••••"
                        />
                        {errors.password && <span className="text-sm text-red-300">Min 6 chars</span>}
                    </div>

                    <button type="submit" className="btn-primary w-full mt-6">
                        Sign Up
                    </button>
                </form>

                <p className="mt-6 text-center text-white/60">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-light hover:text-white transition-colors font-medium">
                        Log in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Signup;
