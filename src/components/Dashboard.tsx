import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { LogOut, Send, Bot, Loader2, Sparkles, Image as ImageIcon, UserX } from 'lucide-react';

export default function Dashboard() {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('jeyson_email');
    if (savedEmail) setEmail(savedEmail);

    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('jeyson_jwt');
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/${import.meta.env.VITE_WORKSPACE_ID}/history?limit=10`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        if (res.data.status === 'success') {
          const mappedHistory = res.data.data.history.map((item: any) => ({
            schema: item.schema_code,
            result: item.response,
            prompt: item.prompt,
            tokenUsage: item.token_usage,
            timestamp: new Date(item.timestamp).toLocaleTimeString()
          }));
          setHistory(mappedHistory);
        }
      } catch (e) {
        console.error("Failed to load history", e);
      }
    };
    fetchHistory();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jeyson_jwt');
    localStorage.removeItem('jeyson_email');
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    
    setDeletingAccount(true);
    try {
      const token = localStorage.getItem('jeyson_jwt');
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/${import.meta.env.VITE_WORKSPACE_ID}/auth/me`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast.success("Account deleted successfully.");
      handleLogout();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to delete account");
    } finally {
      setDeletingAccount(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'text' | 'vision'>('text');

  const handleAnalyze = async () => {
    if (activeTab === 'text' && !prompt.trim()) return;
    if (activeTab === 'vision' && !imageFile) {
       toast.error("Please select an image for vision analysis.");
       return;
    }
    setLoading(true);
    setResult(null);

    const token = localStorage.getItem('jeyson_jwt');

    try {
      let res;
      if (activeTab === 'vision') {
        // Vision Mode (Multipart Form)
        const formData = new FormData();
        formData.append("image", imageFile!);
        formData.append("prompt", prompt || "Analyze this image.");
        
        res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/${import.meta.env.VITE_WORKSPACE_ID}/health-tracker`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        // Chat Mode (JSON Payload) - Sentiment Analysis
        res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/${import.meta.env.VITE_WORKSPACE_ID}/sentiment-analysis`,
          { prompt },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
      }

      if (res.data.status === 'success') {
        const responseData = res.data.data;
        setResult(responseData);
        setHistory(prev => [{
            schema: responseData.schema,
            result: responseData.result,
            prompt: prompt || (imageFile ? 'Image analyzed' : ''),
            tokenUsage: responseData.tokenUsage?.totalTokens || responseData.tokenUsage,
            timestamp: new Date().toLocaleTimeString()
        }, ...prev]);
        toast.success("Analysis completed!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process request. Check balance or token validity.");
      if (error.response?.status === 401) {
         handleLogout(); // Auto-logout on token expiration
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white px-4 py-3 sm:px-6 lg:px-8 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Sparkles className="w-6 h-6 text-blue-600" />
           <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Jeyson API</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500 hidden sm:block">Logged in as <span className="font-semibold text-slate-700">{email}</span></span>
          <button 
             onClick={handleDeleteAccount}
             disabled={deletingAccount}
             className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full disabled:opacity-50"
          >
             {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />} Delete
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
         <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2 mb-2">
               <Sparkles className="w-5 h-5" /> Sentinel Analysis & Vision AI (Demo)
            </h2>
            <p className="text-sm text-blue-800/80">
              Select a tab to test <strong>Sentiment Analysis</strong> via text, or switch to the <strong>Vision API</strong> to track calories by uploading a picture of your food!
            </p>
         </div>

         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-200">
               <button 
                  onClick={() => { setActiveTab('text'); setResult(null); }}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'text' ? 'bg-white border-b-2 border-blue-600 text-blue-600' : 'bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
               >
                  Text Sentiment Analysis
               </button>
               <button 
                  onClick={() => { setActiveTab('vision'); setResult(null); }}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'vision' ? 'bg-white border-b-2 border-blue-600 text-blue-600' : 'bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
               >
                  <ImageIcon className="w-4 h-4" /> Image Health Vision
               </button>
            </div>

            <div className="p-6">
                {activeTab === 'text' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Text to Analyze</label>
                    <textarea
                      className="w-full h-32 p-3 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none outline-none dark:bg-slate-50"
                      placeholder="I absolutely love the new features! But the pricing is completely unfair and customer support was terrible..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </div>
                )}

                {activeTab === 'vision' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Upload Food Image</label>
                      <div className="flex items-center gap-4">
                        <input 
                           type="file" 
                           id="imageUpload" 
                           accept="image/png, image/jpeg, image/jpg, image/webp" 
                           className="hidden" 
                           onChange={(e) => {
                             if (e.target.files && e.target.files.length > 0) {
                               setImageFile(e.target.files[0]);
                             }
                           }}
                        />
                        <label 
                           htmlFor="imageUpload" 
                           className={`flex items-center gap-2 px-6 py-4 rounded-xl border-2 border-dashed w-full justify-center transition-colors cursor-pointer ${imageFile ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100 hover:border-slate-400'}`}
                        >
                           <ImageIcon className="w-5 h-5" />
                           {imageFile ? imageFile.name : 'Click to select an image from your computer'}
                        </label>
                      </div>
                      {imageFile && (
                        <button onClick={() => setImageFile(null)} className="text-xs text-red-500 hover:underline mt-2 inline-block">Remove Image</button>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Custom Prompt (Optional)</label>
                      <input 
                         type="text"
                         className="w-full p-3 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-slate-50"
                         placeholder="Specific instructions for the AI e.g., 'What are the macros for this?'"
                         value={prompt}
                         onChange={(e) => setPrompt(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button 
                       onClick={handleAnalyze}
                       disabled={loading || (activeTab === 'text' && !prompt.trim()) || (activeTab === 'vision' && !imageFile)}
                       className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-all"
                    >
                       {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                       {loading ? 'Processing...' : (activeTab === 'vision' ? 'Analyze Image' : 'Analyze Text')}
                    </button>
                </div>
            </div>

            {result && (
              <div className="border-t border-slate-100 bg-slate-50 p-6">
                 <div className="flex items-center gap-2 mb-4">
                    <Bot className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-semibold text-slate-900">API Response Data</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {result.schema === 'health-tracker' ? (
                       <>
                         <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Detected Food</p>
                            <p className="text-lg font-bold text-slate-900 capitalize">{result.result?.food_item || "Unknown"}</p>
                         </div>
                         <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Estimated Calories</p>
                            <p className="text-lg font-bold text-slate-900">{result.result?.calories || 0} kcal</p>
                         </div>
                       </>
                    ) : (
                       <>
                         <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Detected Sentiment</p>
                            <p className={`text-lg font-bold capitalize ${
                              result.result?.sentiment === 'positive' ? 'text-emerald-600' : 
                              result.result?.sentiment === 'negative' ? 'text-red-600' : 'text-slate-700'
                            }`}>
                              {result.result?.sentiment || "Unknown"}
                            </p>
                         </div>
                         <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Confidence / Score</p>
                            <p className="text-lg font-bold text-slate-900">{result.result?.score || 0}/10</p>
                         </div>
                       </>
                    )}
                 </div>

                 {result.result?.key_topics && result.result.key_topics.length > 0 && (
                   <div className="mb-6 mb-4">
                     <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Key Topics Extracted</p>
                     <div className="flex flex-wrap gap-2">
                       {result.result.key_topics.map((topic: string, i: number) => (
                         <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-md font-medium">
                            {topic}
                         </span>
                       ))}
                     </div>
                   </div>
                 )}

                 <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto relative mt-4 shadow-inner">
                   <div className="absolute top-0 right-0 p-2 text-xs text-slate-500 font-mono">Raw JSON Payload</div>
                   <pre className="text-xs text-emerald-400 font-mono pt-4">
                     {JSON.stringify(result, null, 2)}
                   </pre>
                 </div>
              </div>
            )}
         </div>

         {/* History Section */}
         {history.length > 0 && (
           <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
               <Bot className="w-5 h-5 text-slate-500" /> Recent Analyses History
             </h3>
             <div className="space-y-4">
               {history.map((item, idx) => (
                 <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-2">
                         <span className="text-xs font-bold uppercase tracking-wide text-blue-600 bg-blue-50 px-2 py-1 rounded">
                           {item.schema === 'health-tracker' ? 'VISION API' : 'TEXT S.A'}
                         </span>
                         {item.tokenUsage && (
                           <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                             ⚡ {typeof item.tokenUsage === 'object' ? (item.tokenUsage.totalTokens || item.tokenUsage.total_tokens || 0) : item.tokenUsage} tokens
                           </span>
                         )}
                       </div>
                       <span className="text-xs text-slate-400 font-mono">{item.timestamp}</span>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Prompt / Input</p>
                      <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono">{item.prompt || "No prompt provided"}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Response JSON</p>
                      <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto shadow-inner">
                        <pre className="text-xs text-emerald-400 font-mono">
                          {JSON.stringify(item.result || { error: "No response body recorded." }, null, 2)}
                        </pre>
                      </div>
                    </div>
                 </div>
               ))}
             </div>
           </div>
         )}
      </main>
    </div>
  );
}
