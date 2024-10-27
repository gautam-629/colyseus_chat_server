const formatMessage = require('../helper/index'); // Adjust path if necessary

const { Room } = require('colyseus');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
class ChatRoom extends Room {
    onCreate(options) {
        this.conversationId = null;

        this.onMessage('message', async (client, message) => {
            try {
                const newMessage = new Message({
                    conversation: this.conversationId,
                    sender: message.senderId,
                    content: message.content
                });
                console.log(newMessage)
                await newMessage.save();

                // Populate the sender information
                await newMessage.populate('sender', '_id username');

                await Conversation.findByIdAndUpdate(this.conversationId, {
                    lastMessage: newMessage._id
                });

                // Format the message consistently before broadcasting
                const formattedMessage = formatMessage(newMessage);

                // Broadcast formatted message to all clients in the room
                this.broadcast('message', formattedMessage);
            } catch (err) {
                console.error('Error saving message:', err);
                client.send('error', { message: 'Failed to save message' });
            }
        });

        this.onMessage('typing', (client, data) => {
            this.broadcast('typing', {
                userId: data.userId,
                isTyping: data.isTyping
            }, { except: client });
        });
    }

    onJoin(client, options) {
        if (!this.conversationId && options.conversationId) {
            this.conversationId = options.conversationId;
        }

        client.userData = {
            userId: options.userId
        };

        this.broadcast('userJoined', {
            userId: options.userId,
            sessionId: client.sessionId
        }, { except: client });

        console.log(`Client ${client.sessionId} joined conversation ${this.conversationId}`);
    }

    onLeave(client, consented) {
        this.broadcast('userLeft', {
            userId: client.userData?.userId,
            sessionId: client.sessionId
        });

        console.log(`Client ${client.sessionId} left the room`);
    }

    onDispose() {
        console.log(`Room ${this.roomId} disposing...`);
    }
}

module.exports = ChatRoom;