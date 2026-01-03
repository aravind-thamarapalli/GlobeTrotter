import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
    const { register, handleSubmit, formState: { errors, onError } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const onSubmit = async (data) => {
        try {
            await login(data.email, data.password);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-md p-8 relative z-10"
            >
                <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                    Welcome Back
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-white/80">Email</label>
                        <input
                            {...register('email', { required: true })}
                            type="email"
                            className="glass-input w-full"
                            placeholder="you@example.com"
                        />
                        {errors.email && <span className="text-sm text-red-300">Email is required</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-white/80">Password</label>
                        <input
                            {...register('password', { required: true })}
                            type="password"
                            className="glass-input w-full"
                            placeholder="••••••••"
                        />
                        {errors.password && <span className="text-sm text-red-300">Password is required</span>}
                    </div>

                    <button type="submit" className="btn-primary w-full mt-6">
                        Log In
                    </button>
                </form>

                <p className="mt-6 text-center text-white/60">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary-light hover:text-white transition-colors font-medium">
                        Sign up
                    </Link>
                </p>
                <div className="mt-4 text-center text-xs text-white/40">
                    Admin: admin@example.com / admin123
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
