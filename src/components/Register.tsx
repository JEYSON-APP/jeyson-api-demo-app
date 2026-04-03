import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/${import.meta.env.VITE_WORKSPACE_ID}/auth/register`,
        { email, password },
        { headers: { 'x-api-key': import.meta.env.VITE_API_KEY } }
      );

      if (res.data.token) {
        localStorage.setItem('jeyson_jwt', res.data.token);
        localStorage.setItem('jeyson_email', res.data.user?.email || email);
        toast.success("Account created successfully!");
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Registration failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  /* 
   * [OAUTH INTEGRATION: GOOGLE]
   * Google handles the authentication, verifying user legitimacy directly without passwords.
   * Upon generating their JWT, you parse the user email and map it to your internal SaaS
   * user account architecture. The exact same HTTP AaaS logic generates seamless auth tunnels.
   */
  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    
    try {
       setLoading(true);
       const decoded: any = jwtDecode(credentialResponse.credential);
       const userEmail = decoded.email;

       // Utilizing 'oauth' endpoint ensures if they exist, it logs them in safely, otherwise
       // it spins a brand new 'google' provider account seamlessly!
       const res = await axios.post(
         `${import.meta.env.VITE_API_BASE_URL}/${import.meta.env.VITE_WORKSPACE_ID}/auth/oauth`,
         { email: userEmail, provider: 'google' },
         { headers: { 'x-api-key': import.meta.env.VITE_API_KEY } }
       );

       if (res.data.token) {
         localStorage.setItem('jeyson_jwt', res.data.token);
         localStorage.setItem('jeyson_email', res.data.user?.email || userEmail);
         toast.success("Google Oauth creation success!");
         navigate('/dashboard');
       }
    } catch (error: any) {
       toast.error(error.response?.data?.error || "OAuth Gateway tunnel failed.");
    } finally {
       setLoading(false);
    }
  };

  /*
   * [OAUTH INTEGRATION: APPLE]
   * Same logic bridges here. You collect the email token from Apple's SSO SDK and map `{ provider: 'apple' }`.
   */
  const handleAppleSimulation = () => {
     toast.info("Apple Sign-Up pushes exactly like Google mapping identical schemas.");
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "dummy"}>
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-6">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Jeyson API</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create an Account</h2>
          <p className="mt-2 text-sm text-slate-600">
            End-to-End AaaS provided securely by <span className="font-semibold text-blue-600">SaaS Platform API</span>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="demo-customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm font-medium leading-6">
              <span className="bg-white px-6 text-slate-500">Sign up globally using Providers</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
             <div className="flex justify-center w-full">
               <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error("Google SSO interface closed natively.")}
                  text="signup_with"
                  theme="outline" size="large" width="100%"
               />
             </div>
             
             <button
                onClick={handleAppleSimulation}
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-md bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-slate-900 transition-colors"
                title="Apple OAuth follows identical API proxy structures"
             >
                <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V15.04H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63 1.562V12h2.773l-.443 3.04h-2.33v6.838C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/></svg>
                Sign up with Apple
             </button>
          </div>
        </div>

        <p className="text-center text-sm text-slate-600 mt-4">
           Already have an account? <Link to="/login" className="font-semibold text-slate-900 hover:text-slate-800">Login</Link>
        </p>
      </div>
    </div>
    </GoogleOAuthProvider>
  );
}
