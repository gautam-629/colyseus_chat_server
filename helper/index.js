// Define the formatMessage function
const formatMessage = (message) => {
    return {
        _id: message._id,
        conversation: message.conversation,
        content: message.content,
        sender: {
            _id: message.sender._id,
            username: message.sender.username
        },
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        read: message.read
    };
};

// Export formatMessage correctly
module.exports = formatMessage;
