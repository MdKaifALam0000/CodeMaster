import { motion } from 'framer-motion';
import { Mail, Calendar, Award, Code, Github, Linkedin, MapPin } from 'lucide-react';

const ProfileSection = ({ profile, stats }) => {
  if (!profile) {
    return (
      <div className="text-center text-gray-400 py-12">
        <p>No profile data available</p>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-white mb-2">Profile Overview</h1>
        <p className="text-gray-400">View your account information and achievements</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700"
      >
        <div className="flex items-start space-x-6">
          {/* Profile Picture */}
          <div className="relative group">
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.firstName}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-600 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center border-4 border-blue-600 shadow-lg">
                <span className="text-white text-3xl font-bold">
                  {profile.firstName?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">
              {profile.firstName} {profile.lastName}
            </h2>
            <div className="flex items-center space-x-4 text-gray-400 text-sm mb-4">
              <div className="flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>{profile.emailId}</span>
              </div>
              {profile.age && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{profile.age} years old</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-300 mb-4 leading-relaxed">{profile.bio}</p>
            )}

            {/* Social Links */}
            <div className="flex items-center space-x-3">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span className="text-sm">GitHub</span>
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  <span className="text-sm">LinkedIn</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
              <Code className="w-5 h-5 text-blue-400" />
              <span>Skills</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-sm font-medium border border-blue-600/30"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      {stats && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-blue-200" />
              <span className="text-blue-200 text-sm font-medium">Solved</span>
            </div>
            <p className="text-white text-3xl font-bold">{stats.problemsSolved}</p>
            <p className="text-blue-200 text-sm mt-1">Problems</p>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-green-200" />
              <span className="text-green-200 text-sm font-medium">Accepted</span>
            </div>
            <p className="text-white text-3xl font-bold">{stats.acceptedSubmissions}</p>
            <p className="text-green-200 text-sm mt-1">Submissions</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-purple-200" />
              <span className="text-purple-200 text-sm font-medium">Total</span>
            </div>
            <p className="text-white text-3xl font-bold">{stats.totalSubmissions}</p>
            <p className="text-purple-200 text-sm mt-1">Submissions</p>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-orange-200" />
              <span className="text-orange-200 text-sm font-medium">Success</span>
            </div>
            <p className="text-white text-3xl font-bold">{stats.successRate}%</p>
            <p className="text-orange-200 text-sm mt-1">Rate</p>
          </div>
        </motion.div>
      )}

      {/* Account Info */}
      <motion.div
        variants={itemVariants}
        className="bg-gray-800 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-white font-semibold mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Member Since</p>
            <p className="text-white font-medium">
              {new Date(profile.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Role</p>
            <p className="text-white font-medium capitalize">{profile.role}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileSection;
