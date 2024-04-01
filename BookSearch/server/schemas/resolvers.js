const { User, Book } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");

const resolvers = {
  Query: {
    users: async () => {
      return User.find().populate("savedBooks");
    },

    user: async (parent, { username }) => {
      return User.findOne({ username }).populate("savedBooks");
    },
    thoughts: async (parent, { username }) => {
      const params = username ? { username } : {};
      return Book.find(params);
    },
    thought: async (parent, { bookId }) => {
      return Book.findOne({ _id: bookId });
    },

    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate("savedBooks");
      }
      throw AuthenticationError;
    },
  },

  Mutation: {
    addUser: async (parent, { name, email, password }) => {
      const user = await User.create({ name, email, password });
      const token = signToken(user);

      return { token, user };
    },
    loginUser: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError;
      }

      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (parent, { userId, skill }, context) => {
      //TO REVIEW WITH WESLEY
      if (context.user) {
        return user.findOneAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: { savedBooks: book._id },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      // If user attempts to execute this mutation and isn't logged in, throw an error
      throw AuthenticationError;
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const book = await Book.findOneAndDelete({
          bookId: bookId,
        });

        await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: bookId } }
        );
      }
      throw AuthenticationError;
    },
  },
};

module.exports = resolvers;
