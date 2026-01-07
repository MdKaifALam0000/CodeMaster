import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Camera, 
  Save, 
  Trash2, 
  Upload, 
  User, 
  Mail, 
  Calendar, 
  FileText,
  Code,
  Github,
  Linkedin,
  Loader
} from 'lucide-react';
import {
  updateUserProfile,
  getProfilePictureSignature,
  saveProfilePicture,
  deleteProfilePicture
} from '../../dashboardSlice';
import axios from 'axios';

const ProfileSettings = ({ profile }) => {
  const dispatch = useDispatch();
  const { uploadingPicture, loading } = useSelector((state) => state.dashboard);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    age: profile?.age || '',
    bio: profile?.bio || '',
    skills: profile?.skills?.join(', ') || '',
    githubUrl: profile?.githubUrl || '',
    linkedinUrl: profile?.linkedinUrl || ''
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile: ' + (error.error || error.message));
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Get upload signature from backend
      const signatureData = await dispatch(getProfilePictureSignature()).unwrap();

      // Prepare form data for Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signatureData.api_key);
      formData.append('timestamp', signatureData.timestamp);
      formData.append('signature', signatureData.signature);
      formData.append('public_id', signatureData.public_id);
      formData.append('transformation', 'c_fill,g_face,h_400,w_400');

      // Upload to Cloudinary
      const uploadResponse = await axios.post(
        signatureData.upload_url,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );

      // Save metadata to backend
      await dispatch(saveProfilePicture({
        cloudinaryPublicId: uploadResponse.data.public_id,
        secureUrl: uploadResponse.data.secure_url
      })).unwrap();

      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload profile picture: ' + (error.error || error.message));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    try {
      await dispatch(deleteProfilePicture()).unwrap();
      alert('Profile picture deleted successfully!');
    } catch (error) {
      alert('Failed to delete profile picture: ' + (error.error || error.message));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-gray-400">Update your profile information and preferences</p>
      </motion.div>

      {/* Profile Picture Section */}
      <motion.div
        variants={itemVariants}
        className="bg-gray-800 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-white font-semibold mb-4">Profile Picture</h3>
        <div className="flex items-center space-x-6">
          {/* Current Picture */}
          <div className="relative group">
            {profile?.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-600"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center border-4 border-blue-600">
                <User className="w-12 h-12 text-white" />
              </div>
            )}
            
            {/* Upload overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={isUploading}
            >
              <Camera className="w-8 h-8 text-white" />
            </button>
          </div>

          {/* Upload Controls */}
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              className="hidden"
            />
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload New Picture</span>
                    </>
                  )}
                </motion.button>

                {profile?.profilePicture && (
                  <motion.button
                    onClick={handleDeleteProfilePicture}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </motion.button>
                )}
              </div>

              {isUploading && (
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <p className="text-gray-400 text-sm">
                Recommended: Square image, at least 400x400px, max 5MB
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Form */}
      <motion.div
        variants={itemVariants}
        className="bg-gray-800 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-white font-semibold mb-4">Personal Information</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <User className="w-4 h-4 inline mr-2" />
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={profile?.emailId || ''}
              disabled
              className="w-full px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-gray-400 cursor-not-allowed"
            />
            <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
          </div>

          {/* Age */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              min="6"
              max="100"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows="4"
              maxLength="500"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
              placeholder="Tell us about yourself..."
            />
            <p className="text-gray-500 text-xs mt-1">
              {formData.bio.length}/500 characters
            </p>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              <Code className="w-4 h-4 inline mr-2" />
              Skills
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="JavaScript, Python, React, Node.js (comma separated)"
            />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <Github className="w-4 h-4 inline mr-2" />
                GitHub URL
              </label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="https://github.com/username"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <Linkedin className="w-4 h-4 inline mr-2" />
                LinkedIn URL
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <motion.button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProfileSettings;
