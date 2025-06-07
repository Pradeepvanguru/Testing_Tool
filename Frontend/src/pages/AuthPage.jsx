
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/services/api';
import { Code } from 'lucide-react';

const AuthPage = ({ mode = 'login' }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let response;
      if (mode === 'login') {
        response = await api.loginUser({ email, password });
      } else {
        response = await api.signupUser({ username, email, password });
      }
      login(response.token, response.user);
      toast({ title: mode === 'login' ? 'Login Successful' : 'Signup Successful', description: 'Redirecting...' });
      navigate('/');
    } catch (error) {
      toast({ title: 'Authentication Error', description: error.message, variant: 'destructive' });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1e1e1e] p-4 vs-code-theme">
      <div className="w-full max-w-md space-y-6 p-8 rounded-lg shadow-xl bg-[#2d2d30] border border-[#3e3e42]">
        <div className="flex flex-col items-center">
          <Code className="w-12 h-12 text-[#007ACC] mb-3" />
          <h1 className="text-2xl font-bold text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm text-gray-400">
            {mode === 'login' ? 'Sign in to continue to Testing Tool' : 'Join us and start testing!'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <Label htmlFor="username" className="text-sm font-medium text-white">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input-field mt-1"
                placeholder="Choose a username"
              />
            </div>
          )}
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-white">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field mt-1"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-white">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field mt-1"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
            {isLoading ? 'Processing...' : (mode === 'login' ? 'Log In' : 'Sign Up')}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-400">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <Link to={mode === 'login' ? '/signup' : '/login'} className="font-medium text-[#007ACC] hover:underline">
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
