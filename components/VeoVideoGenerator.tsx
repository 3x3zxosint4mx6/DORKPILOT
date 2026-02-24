
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const VeoVideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');

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
    if (!image || isGenerating) return;

    setIsGenerating(true);
    setStatus('Initializing Veo engine...');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const base64Data = image.split(',')[1];
      
      setStatus('Uploading reference frame...');
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Animate this investigative scene with subtle motion',
        image: {
          imageBytes: base64Data,
          mimeType: 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      setStatus('Veo is rendering your video (this may take a few minutes)...');
      
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
        setStatus('Generation complete!');
      }
    } catch (error) {
      console.error("Veo Error:", error);
      setStatus('Error: Video generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-xl">
      <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-100 mb-4">
        <i className="fas fa-video text-purple-400"></i>
        Investigative Storytelling (Veo)
      </h2>
      
      <p className="text-sm text-slate-400 mb-6">
        Animate evidence photos or scene reconstructions for investigative reports.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center">
            {image ? (
              <div className="relative group">
                <img src={image} alt="Reference" className="max-h-48 mx-auto rounded" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block py-8">
                <i className="fas fa-image text-3xl text-slate-600 mb-2"></i>
                <p className="text-xs text-slate-500">Upload reference photo (PNG/JPG)</p>
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
              </label>
            )}
          </div>

          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe how to animate this scene..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-purple-500 focus:outline-none min-h-[100px]"
          />

          <button 
            onClick={generateVideo}
            disabled={!image || isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <i className="fas fa-circle-notch animate-spin"></i>
                Generating...
              </>
            ) : (
              <>
                <i className="fas fa-wand-magic-sparkles"></i>
                Animate with Veo
              </>
            )}
          </button>
          
          {status && (
            <p className="text-[10px] text-center text-slate-500 italic">{status}</p>
          )}
        </div>

        <div className="bg-slate-950 rounded-lg border border-slate-700 flex items-center justify-center min-h-[300px]">
          {videoUrl ? (
            <video src={videoUrl} controls className="w-full h-full rounded-lg" />
          ) : (
            <div className="text-center p-8">
              <i className="fas fa-film text-4xl text-slate-800 mb-4"></i>
              <p className="text-sm text-slate-600 italic">Generated video will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VeoVideoGenerator;
