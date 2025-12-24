import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('student'); // Default role
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isRegister) {
                // Parse first and last name
                const names = fullName.trim().split(' ');
                const firstName = names[0] || '';
                const lastName = names.slice(1).join(' ') || '';

                if (!firstName || !lastName) {
                    throw new Error('Please enter your full name');
                }

                await register(email, password, role, firstName, lastName);
            } else {
                await login(email, password);
            }

            // Navigation is handled after login/register
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                switch (user.role) {
                    case 'admin':
                        navigate('/admin');
                        break;
                    case 'volunteer':
                        navigate('/volunteer');
                        break;
                    case 'student':
                        navigate('/student');
                        break;
                    default:
                        navigate('/');
                }
            } else {
                navigate('/');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || (isRegister ? 'Failed to create account.' : 'Invalid email or password.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="font-body text-white selection:bg-white/30 selection:text-white h-screen overflow-hidden w-full bg-[#0f172a]">
            {/* Background elements */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuBHrhq1iDv17ybsTisHjHuD4Mr38G8zRq12tFm2JpeSPum1paR7Li0NOWwTY5BGt1VJi2jt8vtYPrBvz32Bcp4N9YOLCbS4f51sTjrrStsZenC54N6vAXQPeON-SJPj7EZGYm7YaRjkn-FcaGDOxAcmeOuuO1fo4Y9BA7nKkL7EWLV72gBvU2UwH8rrqY1xKyqMiYOJ5RraASWy8tp3ihn5J81d-BQK8RA2dNYwgVeH-rjob6Mw0WecpQXqiaDXYL9AgeqIAU0DyP4g')] bg-cover bg-center opacity-80 scale-105 transform origin-center"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050511] via-[#0f172a]/80 to-[#0f172a]/40"></div>
            </div>

            <div className="relative z-10 flex flex-col h-full w-full max-w-md mx-auto px-6 py-8 justify-between">
                <div className="flex flex-col items-start w-full">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition-all duration-300 backdrop-blur-md"
                    >
                        <span className="material-symbols-outlined text-white/90 group-hover:text-white text-[20px]">arrow_back</span>
                    </button>
                    <div className="mt-10 space-y-1">
                        <div className="inline-flex items-center gap-2 mb-2">
                            <span className="h-px w-6 bg-white/40"></span>
                            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/60">VolunteerConnect x JPX</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-white leading-[1.1] drop-shadow-lg text-glow">
                            {isRegister ? (
                                <>Create <br /> Account</>
                            ) : (
                                <>Welcome <br /> Back</>
                            )}
                        </h1>
                    </div>
                </div>

                <div className="w-full glass-panel rounded-3xl overflow-hidden animate-fade-in-up">
                    <div className="p-2 pb-0">
                        <div className="flex p-1 rounded-2xl bg-black/20 border border-white/5">
                            <button
                                onClick={() => setIsRegister(false)}
                                className={`flex-1 py-3 rounded-xl font-display font-medium text-sm tracking-wide transition-all ${!isRegister ? 'bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10 text-white text-shadow-sm' : 'text-white/40 hover:text-white/80'}`}
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => setIsRegister(true)}
                                className={`flex-1 py-3 rounded-xl font-display font-medium text-sm tracking-wide transition-all ${isRegister ? 'bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10 text-white text-shadow-sm' : 'text-white/40 hover:text-white/80'}`}
                            >
                                Register
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 pt-8 flex flex-col gap-6">
                        {error && (
                            <div className="p-3 text-sm text-red-200 bg-red-500/20 border border-red-500/30 rounded-xl text-center">
                                {error}
                            </div>
                        )}

                        {isRegister && (
                            <div className="group glass-input rounded-2xl relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-white/40 group-focus-within:text-white/90 transition-colors text-[20px]">person</span>
                                </div>
                                <label className="absolute top-2 left-12 text-[10px] uppercase font-bold tracking-wider text-white/30 group-focus-within:text-white/60 transition-colors">Full Name</label>
                                <input
                                    className="block w-full bg-transparent border-0 rounded-2xl py-3 pl-12 pr-4 pt-7 text-white placeholder-transparent focus:ring-0 sm:text-sm sm:leading-6 font-medium tracking-wide"
                                    placeholder="John Doe"
                                    type="text"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    required={isRegister}
                                />
                            </div>
                        )}

                        <div className="group glass-input rounded-2xl relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-white/40 group-focus-within:text-white/90 transition-colors text-[20px]">mail</span>
                            </div>
                            <label className="absolute top-2 left-12 text-[10px] uppercase font-bold tracking-wider text-white/30 group-focus-within:text-white/60 transition-colors">Email Address</label>
                            <input
                                className="block w-full bg-transparent border-0 rounded-2xl py-3 pl-12 pr-4 pt-7 text-white placeholder-transparent focus:ring-0 sm:text-sm sm:leading-6 font-medium tracking-wide"
                                placeholder="name@example.com"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {isRegister && (
                            <div className="group glass-input rounded-2xl relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-white/40 group-focus-within:text-white/90 transition-colors text-[20px]">badge</span>
                                </div>
                                <label className="absolute top-2 left-12 text-[10px] uppercase font-bold tracking-wider text-white/30 group-focus-within:text-white/60 transition-colors">I am a...</label>
                                <select
                                    className="block w-full bg-transparent border-0 rounded-2xl py-3 pl-12 pr-4 pt-7 text-white focus:ring-0 sm:text-sm sm:leading-6 font-medium tracking-wide appearance-none"
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                    style={{ backgroundColor: 'transparent' }}
                                >
                                    <option value="student" className="bg-[#0f172a] text-white">Student</option>
                                    <option value="volunteer" className="bg-[#0f172a] text-white">Volunteer</option>
                                </select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="group glass-input rounded-2xl relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-white/40 group-focus-within:text-white/90 transition-colors text-[20px]">lock_open</span>
                                </div>
                                <label className="absolute top-2 left-12 text-[10px] uppercase font-bold tracking-wider text-white/30 group-focus-within:text-white/60 transition-colors">Password</label>
                                <input
                                    className="block w-full bg-transparent border-0 rounded-2xl py-3 pl-12 pr-12 pt-7 text-white placeholder-transparent focus:ring-0 sm:text-sm sm:leading-6 font-medium tracking-wide"
                                    placeholder="••••••••"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/30 hover:text-white transition-colors cursor-pointer" type="button">
                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                </button>
                            </div>
                            {!isRegister && (
                                <div className="flex justify-end px-1">
                                    <a className="text-xs text-white/40 hover:text-white transition-colors font-medium" href="#">Forgot Password?</a>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full h-14 mt-2 overflow-hidden rounded-2xl bg-white text-slate-900 font-display font-semibold text-[15px] tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 transform active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            <span className="relative flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <span className="spinner border-slate-900 border-t-transparent" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span>
                                ) : (
                                    <>
                                        {isRegister ? 'Sign Up' : 'Sign In'}
                                        <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </>
                                )}
                            </span>
                        </button>
                    </form>
                </div>

                <div className="text-center py-4 opacity-0 animate-[fadeIn_1s_ease-out_1s_forwards]">
                    <span className="text-[10px] font-display font-medium text-white/30 uppercase tracking-[0.2em]">Licensed to ITB ©2026 JPX</span>
                </div>
            </div>
        </div>
    );
};

export default Login;
