const User = require('../database/models/User');
const userRepository = require('../repository/userRepository');
const { successResponse, errorResponse } = require('../util/response');

exports.getUsers = async (req, res) => {
  try {
    const users = await userRepository.getAllUsers();
    return successResponse(res, users, 'Users retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};