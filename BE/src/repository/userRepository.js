const User = require('../database/models/User');

const userRepository = {
    // Get all users
    getAllUsers: async () => {
        return await User.find();
    },

    // Create new user
    createUser: async (userData) => {
        return await User.create(userData);
    },

    // Find user by email with password
    findUserByEmail: async (email) => {
        return await User.findOne({ email }).select('+password');
    },

    // Get user by ID
    getUserById: async (userId) => {
        return await User.findById(userId);
    },

    // Validate user credentials
    validateCredentials: async (user, password) => {
        if (!user) {
            throw new Error('Invalid credentials');
        }
        
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        
        return user;
    },

    // Check if user is admin
    isAdmin: (user) => {
        return user.role === 'admin';
    }
};

module.exports = userRepository;