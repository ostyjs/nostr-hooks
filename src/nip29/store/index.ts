import { produce } from 'immer';
import { create } from 'zustand';

import {
  Nip29Group,
  Nip29GroupAdmin,
  Nip29GroupChat,
  Nip29GroupJoinRequest,
  Nip29GroupLeaveRequest,
  Nip29GroupMember,
  Nip29GroupMetadata,
  Nip29GroupReaction,
  Nip29GroupRole,
  Nip29GroupThread,
  Nip29GroupThreadComment,
} from '../types';

type Nip29State = {
  groups: Record<string, Record<string, Nip29Group>>;
};

type Nip29Actions = {
  updateGroupMetadata: (
    subId: string | undefined,
    groupId: string | undefined,
    metadata: Nip29GroupMetadata
  ) => void;
  updateGroupAdmins: (
    subId: string | undefined,
    groupId: string | undefined,
    admins: Nip29GroupAdmin[]
  ) => void;
  updateGroupMembers: (
    subId: string | undefined,
    groupId: string | undefined,
    members: Nip29GroupMember[]
  ) => void;
  updateGroupRoles: (
    subId: string | undefined,
    groupId: string | undefined,
    roles: Nip29GroupRole[]
  ) => void;

  addGroupJoinRequest: (
    subId: string | undefined,
    groupId: string | undefined,
    joinRequest: Nip29GroupJoinRequest
  ) => void;
  addGroupLeaveRequest: (
    subId: string | undefined,
    groupId: string | undefined,
    leaveRequest: Nip29GroupLeaveRequest
  ) => void;
  addGroupChat: (
    subId: string | undefined,
    groupId: string | undefined,
    chat: Nip29GroupChat
  ) => void;
  addGroupThread: (
    subId: string | undefined,
    groupId: string | undefined,
    thread: Nip29GroupThread
  ) => void;
  addGroupThreadComment: (
    subId: string | undefined,
    groupId: string | undefined,
    threadComment: Nip29GroupThreadComment
  ) => void;
  addGroupReaction: (
    subId: string | undefined,
    groupId: string | undefined,
    reaction: Nip29GroupReaction
  ) => void;

  removeGroupChat: (
    subId: string | undefined,
    groupId: string | undefined,
    chat: Nip29GroupChat
  ) => void;
  removeGroupThread: (
    subId: string | undefined,
    groupId: string | undefined,
    thread: Nip29GroupThread
  ) => void;
  removeGroupThreadComment: (
    subId: string | undefined,
    groupId: string | undefined,
    threadComment: Nip29GroupThreadComment
  ) => void;
  removeGroupReaction: (
    subId: string | undefined,
    groupId: string | undefined,
    reaction: Nip29GroupReaction
  ) => void;
};

export const useNip29Store = create<Nip29State & Nip29Actions>()((set) => ({
  groups: {},

  updateGroupMetadata: (subId, groupId, metadata) => {
    if (!subId || !groupId) return;

    set(
      produce((state: Nip29State) => {
        if (state.groups[subId]) {
          if (state.groups[subId][groupId]) {
            state.groups[subId][groupId].metadata = metadata;
          } else {
            state.groups[subId][groupId] = { metadata };
          }
        } else {
          state.groups[subId] = { [groupId]: { metadata } };
        }
      })
    );
  },

  updateGroupAdmins: (subId, groupId, admins) => {
    if (!subId || !groupId) return;

    set(
      produce((state: Nip29State) => {
        if (state.groups[subId]) {
          if (state.groups[subId][groupId]) {
            state.groups[subId][groupId].admins = admins;
          } else {
            state.groups[subId][groupId] = { admins };
          }
        } else {
          state.groups[subId] = { [groupId]: { admins } };
        }
      })
    );
  },

  updateGroupMembers: (subId, groupId, members) => {
    if (!subId || !groupId) return;

    set(
      produce((state: Nip29State) => {
        if (state.groups[subId]) {
          if (state.groups[subId][groupId]) {
            state.groups[subId][groupId].members = members;
          } else {
            state.groups[subId][groupId] = { members };
          }
        } else {
          state.groups[subId] = { [groupId]: { members } };
        }
      })
    );
  },

  updateGroupRoles: (subId, groupId, roles) => {
    if (!subId || !groupId) return;

    set(
      produce((state: Nip29State) => {
        if (state.groups[subId]) {
          if (state.groups[subId][groupId]) {
            state.groups[subId][groupId].roles = roles;
          } else {
            state.groups[subId][groupId] = { roles };
          }
        } else {
          state.groups[subId] = { [groupId]: { roles } };
        }
      })
    );
  },

  addGroupChat: (subId, groupId, chat) => {
    if (!subId || !groupId) return;

    set(
      produce((state: Nip29State) => {
        if (state.groups[subId]) {
          if (state.groups[subId][groupId]) {
            if (state.groups[subId][groupId].chats) {
              state.groups[subId][groupId].chats = [...state.groups[subId][groupId].chats, chat]
                .filter(
                  (thread, index, self) => self.findIndex((t) => t.id === thread.id) === index
                )
                .sort((a, b) => a.timestamp - b.timestamp);
            } else {
              state.groups[subId][groupId].chats = [chat];
            }
          } else {
            state.groups[subId][groupId] = { chats: [chat] };
          }
        } else {
          state.groups[subId] = { [groupId]: { chats: [chat] } };
        }
      })
    );
  },

  addGroupJoinRequest: (subId, groupId, joinRequest) => {
    if (!subId || !groupId) return;

    set(
      produce((state: Nip29State) => {
        if (state.groups[subId]) {
          if (state.groups[subId][groupId]) {
            if (state.groups[subId][groupId].joinRequests) {
              state.groups[subId][groupId].joinRequests = [
                ...state.groups[subId][groupId].joinRequests,
                joinRequest,
              ]
                .filter(
                  (thread, index, self) => self.findIndex((t) => t.id === thread.id) === index
                )
                .sort((a, b) => a.timestamp - b.timestamp);
            } else {
              state.groups[subId][groupId].joinRequests = [joinRequest];
            }
          } else {
            state.groups[subId][groupId] = { joinRequests: [joinRequest] };
          }
        } else {
          state.groups[subId] = { [groupId]: { joinRequests: [joinRequest] } };
        }
      })
    );
  },

  addGroupLeaveRequest: (subId, groupId, leaveRequest) => {
    if (!subId || !groupId) return;

    set(
      produce((state: Nip29State) => {
        if (state.groups[subId]) {
          if (state.groups[subId][groupId]) {
            if (state.groups[subId][groupId].leaveRequests) {
              state.groups[subId][groupId].leaveRequests = [
                ...state.groups[subId][groupId].leaveRequests,
                leaveRequest,
              ]
                .filter(
                  (thread, index, self) => self.findIndex((t) => t.id === thread.id) === index
                )
                .sort((a, b) => a.timestamp - b.timestamp);
            } else {
              state.groups[subId][groupId].leaveRequests = [leaveRequest];
            }
          } else {
            state.groups[subId][groupId] = { leaveRequests: [leaveRequest] };
          }
        } else {
          state.groups[subId] = { [groupId]: { leaveRequests: [leaveRequest] } };
        }
      })
    );
  },

  addGroupThread: (subId, groupId, thread) => {
    if (!subId || !groupId) return;

    set(
      produce((state: Nip29State) => {
        if (state.groups[subId]) {
          if (state.groups[subId][groupId]) {
            if (state.groups[subId][groupId].threads) {
              state.groups[subId][groupId].threads = [
                ...state.groups[subId][groupId].threads,
                thread,
              ]
                .filter(
                  (thread, index, self) => self.findIndex((t) => t.id === thread.id) === index
                )
                .sort((a, b) => a.timestamp - b.timestamp);
            } else {
              state.groups[subId][groupId].threads = [thread];
            }
          } else {
            state.groups[subId][groupId] = { threads: [thread] };
          }
        } else {
          state.groups[subId] = { [groupId]: { threads: [thread] } };
        }
      })
    );
  },

  addGroupThreadComment: (subId, groupId, threadComment) => {
    if (!subId || !groupId) return;

    set(
      produce((state: Nip29State) => {
        if (state.groups[subId]) {
          if (state.groups[subId][groupId]) {
            if (state.groups[subId][groupId].threadComments) {
              state.groups[subId][groupId].threadComments = [
                ...state.groups[subId][groupId].threadComments,
                threadComment,
              ]
                .filter(
                  (thread, index, self) => self.findIndex((t) => t.id === thread.id) === index
                )
                .sort((a, b) => a.timestamp - b.timestamp);
            } else {
              state.groups[subId][groupId].threadComments = [threadComment];
            }
          } else {
            state.groups[subId][groupId] = { threadComments: [threadComment] };
          }
        } else {
          state.groups[subId] = { [groupId]: { threadComments: [threadComment] } };
        }
      })
    );
  },

  addGroupReaction: (subId, groupId, reaction) => {
    if (!subId || !groupId) return;

    set(
      produce((state: Nip29State) => {
        if (state.groups[subId]) {
          if (state.groups[subId][groupId]) {
            if (state.groups[subId][groupId].reactions) {
              state.groups[subId][groupId].reactions = [
                ...state.groups[subId][groupId].reactions,
                reaction,
              ]
                .filter(
                  (reaction, index, self) => self.findIndex((t) => t.id === reaction.id) === index
                )
                .sort((a, b) => a.timestamp - b.timestamp);
            } else {
              state.groups[subId][groupId].reactions = [reaction];
            }
          } else {
            state.groups[subId][groupId] = { reactions: [reaction] };
          }
        } else {
          state.groups[subId] = { [groupId]: { reactions: [reaction] } };
        }
      })
    );
  },

  removeGroupChat: (subId, groupId, chat) => {
    if (!subId || !groupId) return;

    set(
      produce((state: Nip29State) => {
        if (!state.groups[subId]) return;
        if (!state.groups[subId][groupId]) return;
        if (!state.groups[subId][groupId].chats) return;

        state.groups[subId][groupId].chats = state.groups[subId][groupId].chats.filter(
          (c: Nip29GroupChat) => c.id !== chat.id
        );
      })
    );
  },

  removeGroupThread: (subId, groupId, thread) => {
    if (!subId || !groupId) return;

    set(
      produce((state: Nip29State) => {
        if (!state.groups[subId]) return;
        if (!state.groups[subId][groupId]) return;
        if (!state.groups[subId][groupId].threads) return;

        state.groups[subId][groupId].threads = state.groups[subId][groupId].threads.filter(
          (t: Nip29GroupChat) => t.id !== thread.id
        );
      })
    );
  },

  removeGroupThreadComment: (subId, groupId, threadComment) => {
    if (!subId || !groupId) return;

    set(
      produce((state: Nip29State) => {
        if (!state.groups[subId]) return;
        if (!state.groups[subId][groupId]) return;
        if (!state.groups[subId][groupId].threadComments) return;

        state.groups[subId][groupId].threadComments = state.groups[subId][
          groupId
        ].threadComments.filter((c: Nip29GroupChat) => c.id !== threadComment.id);
      })
    );
  },

  removeGroupReaction: (subId, groupId, reaction) => {
    if (!subId || !groupId) return;

    set(
      produce((state: Nip29State) => {
        if (!state.groups[subId]) return;
        if (!state.groups[subId][groupId]) return;
        if (!state.groups[subId][groupId].reactions) return;

        state.groups[subId][groupId].reactions = state.groups[subId][groupId].reactions.filter(
          (r: Nip29GroupChat) => r.id !== reaction.id
        );
      })
    );
  },
}));
