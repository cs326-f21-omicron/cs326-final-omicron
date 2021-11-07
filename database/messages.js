const chatGroupsJSONFile = './data/chatGroups.json';
const chatGroupUsersJSONFile = './data/chatGroupUsers.json';
const messagesJSONFile = './data/messages.json';
const usersJSONFile = './data/users.json';

import { formatDistanceToNowStrict } from 'date-fns';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

let chatGroups = [];
let chatGroupUsers = [];
let messages = [];
let users = [];

function loadChatGroups() {
  if (fs.existsSync(chatGroupsJSONFile)) {
    chatGroups = JSON.parse(fs.readFileSync(chatGroupsJSONFile));
  } else {
    chatGroups = [];
  }
}

function loadChatGroupUsers() {
  if (fs.existsSync(chatGroupUsersJSONFile)) {
    chatGroupUsers = JSON.parse(fs.readFileSync(chatGroupUsersJSONFile));
  } else {
    chatGroupUsers = [];
  }
}

function loadMessages() {
  if (fs.existsSync(messagesJSONFile)) {
    messages = JSON.parse(fs.readFileSync(messagesJSONFile));
  } else {
    messages = [];
  }
}

function loadUsers() {
  if (fs.existsSync(usersJSONFile)) {
    users = JSON.parse(fs.readFileSync(usersJSONFile));
  } else {
    users = [];
  }
}

function saveMessages() {
  fs.writeFileSync(messagesJSONFile, JSON.stringify(messages));
}

function saveChatGroups() {
  fs.writeFileSync(chatGroupsJSONFile, JSON.stringify(chatGroups));
}

export function getChatGroupsIDListFromUserID(userID) {
  loadChatGroupUsers();

  const list = [];
  for (const elem of chatGroupUsers) {
    if (elem.userID === userID) {
      list.push(elem.chatGroupID);
    }
  }
  return list;
}

export function getChatGroupsInfoListFromUserID(userID) {
  const list = [];
  const IDsList = getChatGroupsIDListFromUserID(userID);
  for (const id of IDsList) {
    list.push(getChatGroupInfo(id));
  }
  list.sort((a, b) => b.lastMessage?.timestamp - a.lastMessage?.timestamp);
  return list;
}

export function getChatGroupInfo(chatGroupID) {
  loadChatGroups();

  for (const chatGroup of chatGroups) {
    if (chatGroup.id === chatGroupID) {
      const { id, type, name, lastMessageID } = chatGroup;
      const lastMessage = getMessageInfo(lastMessageID);
      return {
        id,
        type,
        name,
        lastMessage: {
          text: lastMessage.text,
          author: getUserInfo(lastMessage.authorID),
          timeDifference: formatDistanceToNowStrict(
            new Date(lastMessage.timestamp),
            { roundingMethod: 'floor' }
          ),
          timestamp: lastMessage.timestamp,
        },
      };
    }
  }
  return {};
}

export function getChatGroupMessages(chatGroupID) {
  loadMessages();

  const list = [];
  for (const message of messages) {
    if (message.chatGroupID === chatGroupID) {
      list.push({
        id: message.id,
        text: message.text,
        author: getUserInfo(message.authorID),
        timestamp: message.timestamp,
      });
    }
  }
  list.sort((a, b) => b.timestamp - a.timestamp);
  return list;
}

export function getMessageInfo(messageID) {
  loadMessages();

  return messages.find((message) => message.id === messageID);
}

export function getUserInfo(userID) {
  loadUsers();

  return users.find((user) => user.id === userID);
}

function insertMessage(data) {
  loadMessages();

  data.id = uuidv4();
  messages.push(data);

  saveMessages();

  return data;
}

function updateChatGroup(chatGroupID, data) {
  loadChatGroups();

  for (let i = 0; i < chatGroups.length; i++) {
    if (chatGroups[i].id === chatGroupID) {
      chatGroups[i] = { ...chatGroups[i], ...data };
      break;
    }
  }

  saveChatGroups();
}

export function newMessage(chatGroupID, authorID, text) {
  const data = insertMessage({
    text,
    chatGroupID,
    authorID,
    timestamp: Date.now(),
  });

  updateChatGroup(chatGroupID, { lastMessageID: data.id });

  return data;
}
