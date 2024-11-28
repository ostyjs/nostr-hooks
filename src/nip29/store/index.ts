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
