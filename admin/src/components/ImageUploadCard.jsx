import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUploadCard = ({ 
  selectedImage, 
  setSelectedImage, 
  imageUrl, 
  setImageUrl,
  isUploading,
  setIsUploading 
}) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleImageChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);
    } else {
      alert('Please select a valid image file');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto mt-8">
      {/* Header */}
      <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
        <div className="bg-purple-100 p-3 rounded-lg mr-4">
          <Camera className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Parking Spot Image</h2>
          <p className="text-sm text-gray-500 mt-1">Upload a clear image of your parking spot to attract more customers.</p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="space-y-4">
        {!imageUrl ? (
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
              ${dragActive 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
              }
            `}
            onDrop={handleDrop}
            onDragOver={handleDrag}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onClick={triggerFileInput}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className={`
                p-4 rounded-full transition-all duration-200
                ${dragActive ? 'bg-purple-100' : 'bg-gray-100'}
              `}>
                <Upload className={`
                  h-8 w-8 transition-all duration-200
                  ${dragActive ? 'text-purple-600' : 'text-gray-400'}
                `} />
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-700">
                  {dragActive ? 'Drop your image here' : 'Upload Parking Spot Image'}
                </p>
                <p className="text-sm text-gray-500">
                  Drag and drop your image here, or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG, JPEG up to 5MB
                </p>
              </div>
              
              <button
                type="button"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium"
              >
                Choose File
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Image Preview */}
            <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
              <img
                src={imageUrl}
                alt="Parking spot preview"
                className="w-full h-64 object-cover"
              />
              
              {/* Remove button */}
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
              
              {/* Upload overlay when uploading */}
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-4 flex items-center space-x-3">
                    <svg className="animate-spin h-5 w-5 text-purple-600" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="text-purple-600 font-medium">Uploading...</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Image info */}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <ImageIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {selectedImage?.name || 'Uploaded Image'}
                </span>
                {selectedImage && (
                  <span className="text-xs text-gray-500">
                    ({(selectedImage.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                )}
              </div>
            </div>
            
            {/* Replace button */}
            <button
              type="button"
              onClick={triggerFileInput}
              className="mt-3 w-full py-2 px-4 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-200 font-medium"
            >
              Replace Image
            </button>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Tips for better images:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Take photos during daylight for better visibility</li>
          <li>• Show clear parking boundaries and accessibility</li>
          <li>• Include nearby landmarks for easy identification</li>
          <li>• Ensure the image is clear and well-focused</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUploadCard;