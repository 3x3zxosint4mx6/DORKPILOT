import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

const BriefingVideo: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateVideo = async () => {
    if (!prompt.trim() && !image) return;
    
    setIsGenerating(true);
    setStatus('Initializing Veo Engine...');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const config: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt.trim() || 'A professional cinematic intelligence briefing video.',
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      };

      if (image) {
        config.image = {
          imageBytes: image.split(',')[1],
          mimeType: 'image/png'
        };
      }

      let operation = await ai.models.generateVideos(config);

      setStatus('Generating Video Frames (may take a few minutes)...');
      
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': process.env.GEMINI_API_KEY || '',
          },
        });
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
        setStatus('Generation Complete');
      } else {
        setStatus('Error: No video link returned');
      }
    } catch (error) {
      console.error(error);
      setStatus('Error: Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2 flex items-center gap-3">
          <i className="fas fa-video text-emerald-400"></i>
          Briefing Video
        </h1>
        <p className="text-slate-400">Generate professional cinematic intelligence briefing videos from your findings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <i className="fas fa-pen-nib text-emerald-400"></i>
              Briefing Prompt
            </h3>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe the briefing scene (e.g., 'A cinematic intelligence briefing showing a map of Toronto with data overlays and network nodes connecting...')"
              className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
            />

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-image text-emerald-400"></i>
                Reference Image (Optional)
              </h3>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${image ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'}`}
              >
                {image ? (
                  <img src={image} alt="Reference" className="w-full h-full object-contain p-2" />
                ) : (
                  <>
                    <i className="fas fa-cloud-arrow-up text-2xl text-slate-600 mb-2"></i>
                    <span className="text-xs text-slate-500">Upload a map, chart, or reference photo</span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>
              {image && (
                <button 
                  onClick={() => setImage(null)}
                  className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove Image
                </button>
              )}
            </div>

            <button
              onClick={generateVideo}
              disabled={isGenerating || (!prompt.trim() && !image)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/20"
            >
              {isGenerating ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Generating...
                </>
              ) : (
                <>
                  <i className="fas fa-wand-magic-sparkles"></i> Generate Briefing Video
                </>
              )}
            </button>
          </div>

          {status && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${status.includes('Error') ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'}`}>
              <i className={`fas ${status.includes('Error') ? 'fa-circle-exclamation' : 'fa-circle-info'}`}></i>
              <span className="text-xs font-medium">{status}</span>
            </div>
          )}
        </div>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 flex flex-col items-center justify-center min-h-[400px] relative">
          {videoUrl ? (
            <div className="w-full space-y-4">
              <video 
                src={videoUrl} 
                controls 
                className="w-full rounded-xl shadow-2xl border border-slate-700"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Generated via Veo 3.1</span>
                <a 
                  href={videoUrl} 
                  download="briefing-video.mp4"
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-2"
                >
                  <i className="fas fa-download"></i> Download Video
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-700">
                <i className="fas fa-film text-2xl text-slate-700"></i>
              </div>
              <div className="space-y-2">
                <h4 className="text-slate-300 font-bold">No Video Generated</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Your briefing video will appear here after generation. This can be used for final reporting or team presentations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BriefingVideo;
