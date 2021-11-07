const chatGroupsJSONFile = './data/chatGroups.json';
const chatGroupUsersJSONFile = './data/chatGroupUsers.json';
const messagesJSONFile = './data/messages.json';
const usersJSONFile = './data/users.json';

import { formatDistanceToNowStrict } from 'date-fns';
import fs from 'fs';

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

function loadMessagesJSON() {
  if (fs.existsSync(messagesJSONFile)) {
    messages = JSON.parse(fs.readFileSync(messagesJSONFile));
  } else {
    messages = [];
  }
}

function loadUsersJSON() {
  if (fs.existsSync(usersJSONFile)) {
    users = JSON.parse(fs.readFileSync(usersJSONFile));
  } else {
    users = [];
  }
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
        },
      };
    }
  }
  return {};
}

export function getChatGroupMessages(chatGroupID) {
  loadMessagesJSON();

  const list = [];
  for (const message of messages) {
    if (message.chatGroupID === chatGroupID) {
      list.push({
        text: message.text,
        author: getUserInfo(message.authorID),
        timestamp: message.timestamp,
      });
    }
  }
  list.sort((a, b) => a.timestamp - b.timestamp);
  return list;
}

export function getMessageInfo(messageID) {
  loadMessagesJSON();

  return messages.find((message) => message.id === messageID);
}

export function getUserInfo(userID) {
  loadUsersJSON();

  return users.find((user) => user.id === userID);
}
