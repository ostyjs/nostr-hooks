export type Nip29GroupId = string | undefined;
export type Nip29Relay = string | undefined;

export interface Nip29GroupMetadata {
  name: string;
  picture: string;
  about: string;
  isPublic: boolean;
  isOpen: boolean;
}

export interface Nip29GroupRole {
  name: string;
  description?: string;
}

export interface Nip29GroupAdmin {
  pubkey: string;
  roles: string[];
}

export interface Nip29GroupMember {
  pubkey: string;
}

export interface Nip29GroupJoinRequest {
  id: string;
  pubkey: string;
  reason?: string;
  code?: string;
  timestamp: number;
}

export interface Nip29GroupLeaveRequest {
  id: string;
  pubkey: string;
  reason?: string;
  timestamp: number;
}

export interface Nip29GroupChat {
  id: string;
  pubkey: string;
  content: string;
  timestamp: number;
  parentId?: string | undefined;
}

export interface Nip29GroupThread {
  id: string;
  pubkey: string;
  content: string;
  subject: string;
  timestamp: number;
}

export interface Nip29GroupThreadComment {
  id: string;
  pubkey: string;
  content: string;
  timestamp: number;
  rootId: string;
}

export interface Nip29GroupReaction {
  id: string;
  pubkey: string;
  content: string;
  timestamp: number;
  targetId: string;
}

export interface Nip29Group {
  relay?: Nip29Relay;
  groupId?: Nip29GroupId;
  metadata?: Nip29GroupMetadata | undefined;
  admins?: Nip29GroupAdmin[] | undefined;
  members?: Nip29GroupMember[] | undefined;
  roles?: Nip29GroupRole[] | undefined;
  joinRequests?: Nip29GroupJoinRequest[] | undefined;
  leaveRequests?: Nip29GroupLeaveRequest[] | undefined;
  chats?: Nip29GroupChat[] | undefined;
  threads?: Nip29GroupThread[] | undefined;
  threadComments?: Nip29GroupThreadComment[] | undefined;
  reactions?: Nip29GroupReaction[] | undefined;
}
