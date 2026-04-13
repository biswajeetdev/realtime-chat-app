// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react-native";

const rules = {
  /**
   * rooms: any signed-in user (including guests) can view and create rooms.
   * No one can update or delete a room after creation.
   */
  rooms: {
    allow: {
      view: "auth.id != null",
      create: "auth.id != null",
      update: "false",
      delete: "false",
    },
  },

  /**
   * messages: any signed-in user can view messages.
   * Only authenticated users can create a message, and the creatorId they
   * supply must match their own auth id (prevents impersonation).
   * Only the original creator can update or delete their own message.
   */
  messages: {
    allow: {
      view: "auth.id != null",
      create: "auth.id != null && auth.id == newData.creatorId",
      update: "isCreator",
      delete: "isCreator",
    },
    bind: {
      isCreator: "auth.id != null && auth.id == data.creatorId",
    },
  },

  /**
   * $users: any signed-in user can view basic user records (needed for
   * displaying sender names). Users can only update their own record.
   * No one can create or delete $users directly (managed by InstantDB auth).
   */
  $users: {
    allow: {
      view: "auth.id != null",
      create: "false",
      update: "isOwn",
      delete: "false",
    },
    bind: {
      isOwn: "auth.id != null && auth.id == data.id",
    },
  },
} satisfies InstantRules;

export default rules;
